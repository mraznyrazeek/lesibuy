using AutoMapper;
using LesiBuy.Application.Dtos;
using LesiBuy.Application.Services;
using LesiBuy.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LesiBuy.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
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
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetProducts()
        {
            var products = await _productService.GetAllProductsAsync();
            var productDtos = _mapper.Map<IReadOnlyList<ProductDto>>(products);

            return Ok(productDtos);
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);

            if (product == null)
            {
                return NotFound(new
                {
                    message = $"Product with ID {id} was not found."
                });
            }

            var productDto = _mapper.Map<ProductDto>(product);
            return Ok(productDto);
        }

        // POST: api/products
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] ProductDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new
                {
                    message = "Product data is required."
                });
            }

            var product = _mapper.Map<Product>(dto);
            var createdProduct = await _productService.AddProductAsync(product);
            var createdDto = _mapper.Map<ProductDto>(createdProduct);

            return CreatedAtAction(
                nameof(GetProduct),
                new { id = createdDto.Id },
                createdDto
            );
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductDto dto)
        {
            if (dto == null)
            {
                return BadRequest(new
                {
                    message = "Product data is required."
                });
            }

            if (id != dto.Id)
            {
                return BadRequest(new
                {
                    message = "Product ID mismatch."
                });
            }

            var product = _mapper.Map<Product>(dto);
            await _productService.UpdateProductAsync(product);

            return NoContent();
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var existingProduct = await _productService.GetProductByIdAsync(id);

            if (existingProduct == null)
            {
                return NotFound(new
                {
                    message = $"Product with ID {id} was not found."
                });
            }

            await _productService.DeleteProductAsync(id);
            return NoContent();
        }
    }
}