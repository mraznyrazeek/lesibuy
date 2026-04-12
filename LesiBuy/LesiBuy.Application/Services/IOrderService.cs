using System.Collections.Generic;
using System.Threading.Tasks;
using LesiBuy.Application.Dtos;
using LesiBuy.Domain.Entities;

namespace LesiBuy.Application.Services
{
    public interface IOrderService
    {
        Task<Order> CreateOrderAsync(CreateOrderDto dto);
        Task<IReadOnlyList<OrderDto>> GetAllOrdersAsync();
        Task<OrderDto?> GetOrderByIdAsync(int id);
    }
}
