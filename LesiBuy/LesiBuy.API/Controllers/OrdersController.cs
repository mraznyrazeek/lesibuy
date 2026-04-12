using LesiBuy.Application.Dtos;
using LesiBuy.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace LesiBuy.API.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);

            if (order == null)
            {
                return NotFound(new { message = $"Order with ID {id} was not found." });
            }

            return Ok(order);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            if (dto == null || dto.Items.Count == 0)
            {
                return BadRequest(new
                {
                    message = "Order data is invalid."
                });
            }

            var order = await _orderService.CreateOrderAsync(dto);

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, new
            {
                order.Id,
                order.TotalAmount,
                order.CreatedAt
            });
        }
    }
}