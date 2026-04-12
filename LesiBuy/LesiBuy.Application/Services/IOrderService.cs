using System.Collections.Generic;
using System.Threading.Tasks;
using LesiBuy.Application.Dtos;
using LesiBuy.Domain.Entities;

namespace LesiBuy.Application.Services
{
    public interface IOrderService
    {
        Task<Order> CreateOrderAsync(CreateOrderDto dto, int? userId = null);
        Task<IReadOnlyList<OrderDto>> GetAllOrdersAsync();
        Task<IReadOnlyList<OrderDto>> GetOrdersByUserIdAsync(int userId);
        Task<OrderDto?> GetOrderByIdAsync(int id);

    }
}
