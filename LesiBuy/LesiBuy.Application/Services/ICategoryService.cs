using LesiBuy.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LesiBuy.Application.Services
{
    public interface ICategoryService
    {
        Task<IReadOnlyList<Category>> GetAllCategoriesAsync();
        Task<Category?> GetCategoryByIdAsync(int id);
        Task<Category> AddCategoryAsync(Category category);
        Task<Category> UpdateCategoryAsync(Category category);
        Task DeleteCategoryAsync(int id);
    }
}