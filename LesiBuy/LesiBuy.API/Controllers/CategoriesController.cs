using AutoMapper;
using LesiBuy.Application.Dtos;
using LesiBuy.Application.Services;
using LesiBuy.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LesiBuy.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly IMapper _mapper;

        public CategoriesController(ICategoryService categoryService, IMapper mapper)
        {
            _categoryService = categoryService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(_mapper.Map<IReadOnlyList<CategoryDto>>(categories));
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CategoryDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Category name is required." });
            }

            var category = _mapper.Map<Category>(dto);
            var created = await _categoryService.AddCategoryAsync(category);

            return Ok(_mapper.Map<CategoryDto>(created));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var existing = await _categoryService.GetCategoryByIdAsync(id);

            if (existing == null)
            {
                return NotFound(new { message = "Category not found." });
            }

            await _categoryService.DeleteCategoryAsync(id);
            return NoContent();
        }
    }
}