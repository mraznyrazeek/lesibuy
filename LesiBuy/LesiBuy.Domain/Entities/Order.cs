using System;
using System.Collections.Generic;

namespace LesiBuy.Domain.Entities
{
    public class Order
    {
        public int Id { get; set; }

        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string City { get; set; } = null!;
        public string PostalCode { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;

        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; }

        public int? UserId { get; set; }
        public User? User { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}