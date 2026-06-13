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
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.SubTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PasswordResetToken>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.TokenHash)
                    .IsRequired()
                    .HasMaxLength(64);

                entity.HasIndex(x => x.TokenHash)
                    .IsUnique();

                entity.HasOne(x => x.User)
                    .WithMany(x => x.PasswordResetTokens)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}