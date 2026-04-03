using LesiBuy.Application.Services;
using LesiBuy.Domain.Entities;
using LesiBuy.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LesiBuy.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _uow;
        public ProductService(IUnitOfWork uow) => _uow = uow;

        public async Task<IReadOnlyList<Product>> GetAllProductsAsync() =>
            await _uow.Products.ListAllAsync();

        public async Task<Product?> GetProductByIdAsync(int id) =>
            await _uow.Products.GetByIdAsync(id);

        public async Task<Product> AddProductAsync(Product product)
        {
            await _uow.Products.AddAsync(product);
            await _uow.CompleteAsync();
            return product;
        }

        public async Task UpdateProductAsync(Product product)
        {
            _uow.Products.Update(product);
            await _uow.CompleteAsync();
        }

        public async Task DeleteProductAsync(int id)
        {
            var entity = await _uow.Products.GetByIdAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"Product {id} not found.");

            _uow.Products.Delete(entity);
            await _uow.CompleteAsync();
        }

    }
}
