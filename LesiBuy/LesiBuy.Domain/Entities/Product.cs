using System;

namespace LesiBuy.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        public string Description { get; set; } = null!;

        public decimal Price { get; set; }

        public string ImageUrl { get; set; } = null!;

        public int CategoryId { get; set; }

        public string Condition { get; set; } = null!;

        public string Specifications { get; set; } = null!;

        public bool IsAvailable { get; set; } = true;

        public string SellerType { get; set; } = "Admin";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

