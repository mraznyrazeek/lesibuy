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

        public async Task<Order> CreateOrderAsync(CreateOrderDto dto, int? userId = null)
        {
            var order = new Order
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                City = dto.City,
                PostalCode = dto.PostalCode,
                PaymentMethod = dto.PaymentMethod,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            decimal total = 0;

            foreach (var item in dto.Items)
            {
                var product = await _uow.Products.GetByIdAsync(item.ProductId);

                if (product == null)
                    throw new Exception($"Product with ID {item.ProductId} not found.");

                var subTotal = product.Price * item.Quantity;

                order.OrderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UnitPrice = product.Price,
                    Quantity = item.Quantity,
                    SubTotal = subTotal
                });

                total += subTotal;
            }

            order.TotalAmount = total;

            await _uow.Repository<Order>().AddAsync(order);
            await _uow.CompleteAsync();

            return order;
        }

        public async Task<IReadOnlyList<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _uow.Repository<Order>()
                .Query()
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapOrderToDto).ToList();
        }

        public async Task<IReadOnlyList<OrderDto>> GetOrdersByUserIdAsync(int userId)
        {
            var orders = await _uow.Repository<Order>()
                .Query()
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapOrderToDto).ToList();
        }

        public async Task<OrderDto?> GetOrderByIdAsync(int id)
        {
            var order = await _uow.Repository<Order>()
                .Query()
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return null;

            return MapOrderToDto(order);
        }

        private static OrderDto MapOrderToDto(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                FullName = order.FullName,
                Email = order.Email,
                Phone = order.Phone,
                Address = order.Address,
                City = order.City,
                PostalCode = order.PostalCode,
                PaymentMethod = order.PaymentMethod,
                TotalAmount = order.TotalAmount,
                CreatedAt = order.CreatedAt,
                Items = order.OrderItems.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    SubTotal = i.SubTotal
                }).ToList()
            };
        }
    }
}