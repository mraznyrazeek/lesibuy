using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LesiBuy.Application.Dtos;
using LesiBuy.Domain.Entities;
using LesiBuy.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LesiBuy.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _uow;

        public OrderService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto, int? userId = null)
        {
            var billingAddress = dto.BillingSameAsShipping ? dto.ShippingAddress : dto.BillingAddress;
            var billingCity = dto.BillingSameAsShipping ? dto.ShippingCity : dto.BillingCity;
            var billingPostalCode = dto.BillingSameAsShipping ? dto.ShippingPostalCode : dto.BillingPostalCode;

            var order = new Order
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,

                ShippingAddress = dto.ShippingAddress,
                ShippingCity = dto.ShippingCity,
                ShippingPostalCode = dto.ShippingPostalCode,

                BillingSameAsShipping = dto.BillingSameAsShipping,
                BillingAddress = billingAddress,
                BillingCity = billingCity,
                BillingPostalCode = billingPostalCode,

                PaymentMethod = dto.PaymentMethod,
                CreatedAt = DateTime.UtcNow,
                TotalAmount = 0,
                UserId = userId ?? 0,
                Status = "Pending",
                Items = new List<OrderItem>()
            };

            decimal total = 0;

            foreach (var item in dto.Items)
            {
                var product = await _uow.Products.GetByIdAsync(item.ProductId);

                if (product == null)
                    throw new Exception($"Product with ID {item.ProductId} not found.");

                var subTotal = product.Price * item.Quantity;

                order.Items.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ProductDescription = product.Description,
                    ProductImageUrl = product.ImageUrl,
                    ProductCondition = product.Condition,
                    SellerType = product.SellerType,
                    Specifications = product.Specifications,
                    UnitPrice = product.Price,
                    Quantity = item.Quantity,
                    SubTotal = subTotal
                });

                total += subTotal;
            }

            order.TotalAmount = total;

            await _uow.Repository<Order>().AddAsync(order);
            await _uow.CompleteAsync();

            return MapOrderToDto(order);
        }

        public async Task<IReadOnlyList<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _uow.Repository<Order>()
                .Query()
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapOrderToDto).ToList();
        }

        public async Task<IReadOnlyList<OrderDto>> GetOrdersByUserIdAsync(int userId)
        {
            var orders = await _uow.Repository<Order>()
                .Query()
                .Where(o => o.UserId == userId)
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapOrderToDto).ToList();
        }

        public async Task<OrderDto?> GetOrderByIdAsync(int id)
        {
            var order = await _uow.Repository<Order>()
                .Query()
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return null;

            return MapOrderToDto(order);
        }

        public async Task<bool> CancelOrderAsync(int orderId, int userId)
        {
            var order = await _uow.Repository<Order>()
                .Query()
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null)
                return false;

            if (!string.Equals(order.Status, "Pending", StringComparison.OrdinalIgnoreCase))
                return false;

            order.Status = "Cancelled";
            await _uow.CompleteAsync();

            return true;
        }

        private static OrderDto MapOrderToDto(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                FullName = order.FullName,
                Email = order.Email,
                Phone = order.Phone,

                ShippingAddress = order.ShippingAddress,
                ShippingCity = order.ShippingCity,
                ShippingPostalCode = order.ShippingPostalCode,

                BillingSameAsShipping = order.BillingSameAsShipping,
                BillingAddress = order.BillingAddress,
                BillingCity = order.BillingCity,
                BillingPostalCode = order.BillingPostalCode,

                PaymentMethod = order.PaymentMethod,
                TotalAmount = order.TotalAmount,
                CreatedAt = order.CreatedAt,
                Status = order.Status,

                Items = order.Items.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    ProductDescription = i.ProductDescription,
                    ProductImageUrl = i.ProductImageUrl,
                    ProductCondition = i.ProductCondition,
                    SellerType = i.SellerType,
                    Specifications = i.Specifications,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    SubTotal = i.SubTotal
                }).ToList()
            };
        }
    }
}