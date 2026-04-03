using LesiBuy.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LesiBuy.Infrastructure.Data
{
    public class LesiBuyContext : DbContext
    {
        public LesiBuyContext(DbContextOptions<LesiBuyContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; } = null!;
    }
}
