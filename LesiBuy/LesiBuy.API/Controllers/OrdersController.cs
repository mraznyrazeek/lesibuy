using System.Security.Claims;
using System.Threading.Tasks;
using LesiBuy.Application.Dtos;
using LesiBuy.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LesiBuy.API.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace LesiBuy.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public OrdersController(
            IOrderService orderService,
            IHubContext<NotificationHub> hubContext)
        {
            _orderService = orderService;
            _hubContext = hubContext;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? userId = null;

            if (!string.IsNullOrWhiteSpace(userIdClaim) && int.TryParse(userIdClaim, out var parsedUserId))
            {
                userId = parsedUserId;
            }

            var order = await _orderService.CreateOrderAsync(dto, userId);
            return Ok(order);
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var orders = await _orderService.GetOrdersByUserIdAsync(userId);
            return Ok(orders);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);

            if (order == null)
                return NotFound();

            return Ok(order);
        }

        [Authorize]
        [HttpPut("admin/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
                return BadRequest(new { message = "Status is required." });

            var updatedOrder = await _orderService.UpdateOrderStatusAsync(id, dto.Status);

            if (updatedOrder == null)
                return NotFound(new { message = "Order not found." });

            await _hubContext.Clients
                .Group($"user-{updatedOrder.UserId}")
                .SendAsync("OrderStatusUpdated", new
                {
                    id = 0,
                    userId = updatedOrder.UserId,
                    orderId = updatedOrder.Id,
                    status = updatedOrder.Status,
                    title = "Order status updated",
                    message = $"Your order #{updatedOrder.Id} is now {updatedOrder.Status}.",
                    createdAt = DateTime.UtcNow
                });

            return Ok(updatedOrder);
        }

        [Authorize]
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var success = await _orderService.CancelOrderAsync(id, userId);

            if (!success)
                return BadRequest(new { message = "Only pending orders can be cancelled." });

            return Ok(new { message = "Order cancelled successfully." });
        }

        [Authorize]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllOrdersForAdmin()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [Authorize]
        [HttpGet("admin/unseen-count")]
        public async Task<IActionResult> GetUnseenOrderCount()
        {
            var count = await _orderService.GetUnseenOrderCountAsync();
            return Ok(count);
        }

        [Authorize]
        [HttpPut("admin/{id}/mark-seen")]
        public async Task<IActionResult> MarkOrderAsSeen(int id)
        {
            var success = await _orderService.MarkOrderAsSeenAsync(id);

            if (!success)
                return NotFound(new { message = "Order not found." });

            return Ok(new { message = "Order marked as seen." });
        }


    }
}