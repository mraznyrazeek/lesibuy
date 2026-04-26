using System;
using System.Collections.Generic;

namespace LesiBuy.Domain.Entities
{
    public class Order
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string ShippingCity { get; set; } = string.Empty;
        public string ShippingPostalCode { get; set; } = string.Empty;
        public bool BillingSameAsShipping { get; set; } = true;
        public string? BillingAddress { get; set; }
        public string? BillingCity { get; set; }
        public string? BillingPostalCode { get; set; }
        public string PaymentMethod { get; set; } = "Cash on Delivery";
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = "Pending";
        public int UserId { get; set; }
        public User? User { get; set; }
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}