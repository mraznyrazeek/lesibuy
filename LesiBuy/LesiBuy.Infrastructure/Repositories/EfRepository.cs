using LesiBuy.Domain.Interfaces;
//using LesiBuy.Domain.Interfaces.LesiBuy.Domain.Interfaces;
using LesiBuy.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LesiBuy.Infrastructure.Repositories
{
    public class EfRepository<T> : IRepository<T> where T : class
    {
        private readonly LesiBuyContext _context;

        public EfRepository(LesiBuyContext context) => _context = context;

        public async Task<T?> GetByIdAsync(int id) =>
            await _context.Set<T>().FindAsync(id);

        public async Task<IReadOnlyList<T>> ListAllAsync() =>
            await _context.Set<T>().ToListAsync();

        public async Task AddAsync(T entity) =>
            await _context.Set<T>().AddAsync(entity);

        public void Update(T entity) =>
            _context.Set<T>().Update(entity);

        public void Delete(T entity) =>
            _context.Set<T>().Remove(entity);
    }
}
