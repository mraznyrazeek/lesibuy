using LesiBuy.Domain.Entities;
using LesiBuy.Domain.Interfaces;
using LesiBuy.Domain.Interfaces.LesiBuy.Domain.Interfaces;
using LesiBuy.Infrastructure.Data;

namespace LesiBuy.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly LesiBuyContext _context;
        public UnitOfWork(LesiBuyContext context) => _context = context;

        private EfRepository<Product>? _products;
        public IRepository<Product> Products
            => _products ??= new EfRepository<Product>(_context);

        public async Task<int> CompleteAsync() =>
            await _context.SaveChangesAsync();

        public void Dispose() => _context.Dispose();
    }
}
