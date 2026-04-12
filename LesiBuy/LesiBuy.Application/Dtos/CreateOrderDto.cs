using System.Collections.Generic;

namespace LesiBuy.Application.Dtos
{
    public class CreateOrderDto
    {
        public string FullName { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string Phone { get; set; } = null!;

        public string Address { get; set; } = null!;

        public string City { get; set; } = null!;

        public string PostalCode { get; set; } = null!;

        public string PaymentMethod { get; set; } = null!;

        public List<CreateOrderItemDto> Items { get; set; } = new();
    }
}