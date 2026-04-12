using System;

namespace LesiBuy.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? City { get; set; }

        public string? PostalCode { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}