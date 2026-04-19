using System;

namespace LesiBuy.Application.Dtos
{
    public class ProductDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        public string Description { get; set; } = null!;

        public decimal Price { get; set; }

        public string ImageUrl { get; set; } = null!;

        public int CategoryId { get; set; }

        public string Condition { get; set; } = null!;

        public string Specifications { get; set; } = null!;

        public bool IsAvailable { get; set; }

        public string SellerType { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public string? CategoryName { get; set; }
    }
}