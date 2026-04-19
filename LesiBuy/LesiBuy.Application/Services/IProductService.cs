using LesiBuy.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LesiBuy.Application.Services
{
    public interface IProductService
    {
        Task<IReadOnlyList<Product>> GetAllProductsAsync();
        Task<Product?> GetProductByIdAsync(int id);
        Task<Product> AddProductAsync(Product product);
        Task UpdateProductAsync(Product product);
        Task DeleteProductAsync(int id);
        
    }
}
