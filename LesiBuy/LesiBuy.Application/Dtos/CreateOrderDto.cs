using System.Collections.Generic;

namespace LesiBuy.Application.Dtos
{
    public class CreateOrderDto
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;

        public string ShippingAddress { get; set; } = null!;
        public string ShippingCity { get; set; } = null!;
        public string ShippingPostalCode { get; set; } = null!;

        public bool BillingSameAsShipping { get; set; } = true;
        public string? BillingAddress { get; set; }
        public string? BillingCity { get; set; }
        public string? BillingPostalCode { get; set; }

        public string PaymentMethod { get; set; } = null!;
        public List<CreateOrderItemDto> Items { get; set; } = new();
    }
}