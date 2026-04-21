using System.Collections.Generic;
using System.Threading.Tasks;
using LesiBuy.Application.Dtos;

namespace LesiBuy.Application.Services
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(CreateOrderDto dto, int? userId = null);
        Task<IReadOnlyList<OrderDto>> GetAllOrdersAsync();
        Task<IReadOnlyList<OrderDto>> GetOrdersByUserIdAsync(int userId);
        Task<OrderDto?> GetOrderByIdAsync(int id);
        Task<OrderDto?> UpdateOrderStatusAsync(int orderId, string status);
        Task<bool> CancelOrderAsync(int orderId, int userId);
    }
}