using LesiBuy.Domain.Entities;
using LesiBuy.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LesiBuy.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _uow;

        public ProductService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<IReadOnlyList<Product>> GetAllProductsAsync()
        {
            return await _uow.Repository<Product>()
                .Query()
                .Include(p => p.Category)
                .ToListAsync();
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _uow.Repository<Product>()
                .Query()
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product> AddProductAsync(Product product)
        {
            await _uow.Repository<Product>().AddAsync(product);
            await _uow.CompleteAsync();
            return product;
        }

        public async Task UpdateProductAsync(Product product)
        {
            _uow.Repository<Product>().Update(product);
            await _uow.CompleteAsync();
        }

        public async Task DeleteProductAsync(int id)
        {
            var entity = await _uow.Repository<Product>()
                .Query()
                .FirstOrDefaultAsync(p => p.Id == id);

            if (entity == null)
                throw new KeyNotFoundException($"Product {id} not found.");

            _uow.Repository<Product>().Delete(entity);
            await _uow.CompleteAsync();
        }
    }
}