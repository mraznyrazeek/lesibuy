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
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IMapper _mapper;

        public ProductsController(IProductService productService, IMapper mapper)
        {
            _productService = productService;
            _mapper = mapper;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetProducts()
        {
            var products = await _productService.GetAllProductsAsync();
            var dtos = _mapper.Map<IReadOnlyList<ProductDto>>(products);
            return Ok(dtos);
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return NotFound();

            var dto = _mapper.Map<ProductDto>(product);
            return Ok(dto);
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] ProductDto dto)
        {
            var entity = _mapper.Map<Product>(dto);
            var created = await _productService.AddProductAsync(entity);
            var result = _mapper.Map<ProductDto>(created);

            return CreatedAtAction(nameof(GetProduct),
                                   new { id = result.Id },
                                   result);
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductDto dto)
        {
            if (id != dto.Id) return BadRequest();

            var entity = _mapper.Map<Product>(dto);
            await _productService.UpdateProductAsync(entity);
            return NoContent();
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            await _productService.DeleteProductAsync(id);
            return NoContent();
        }
    }
}
