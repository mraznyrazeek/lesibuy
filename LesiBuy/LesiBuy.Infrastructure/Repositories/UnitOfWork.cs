using System;
using System.Collections;
using System.Threading.Tasks;
using LesiBuy.Domain.Entities;
using LesiBuy.Domain.Interfaces;
using LesiBuy.Infrastructure.Data;

namespace LesiBuy.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly LesiBuyContext _context;
        private Hashtable? _repositories;

        public UnitOfWork(LesiBuyContext context)
        {
            _context = context;
        }

        public IRepository<Product> Products => Repository<Product>();

        public IRepository<T> Repository<T>() where T : class
        {
            _repositories ??= new Hashtable();

            var type = typeof(T).Name;

            if (!_repositories.ContainsKey(type))
            {
                var repositoryInstance = new EfRepository<T>(_context);
                _repositories.Add(type, repositoryInstance);
            }

            return (IRepository<T>)_repositories[type]!;
        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
