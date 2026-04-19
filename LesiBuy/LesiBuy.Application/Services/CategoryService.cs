using LesiBuy.Domain.Entities;
using LesiBuy.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LesiBuy.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _uow;

        public CategoryService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<IReadOnlyList<Category>> GetAllCategoriesAsync()
        {
            return await _uow.Repository<Category>()
                .Query()
                .ToListAsync();
        }

        public async Task<Category?> GetCategoryByIdAsync(int id)
        {
            return await _uow.Repository<Category>()
                .Query()
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Category> AddCategoryAsync(Category category)
        {
            await _uow.Repository<Category>().AddAsync(category);
            await _uow.CompleteAsync();
            return category;
        }

        public async Task DeleteCategoryAsync(int id)
        {
            var category = await GetCategoryByIdAsync(id);
            if (category == null) return;

            _uow.Repository<Category>().Delete(category);
            await _uow.CompleteAsync();
        }
    }
}