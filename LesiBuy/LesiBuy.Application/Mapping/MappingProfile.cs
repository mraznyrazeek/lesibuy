using AutoMapper;
using LesiBuy.Application.Dtos;
using LesiBuy.Domain.Entities;

namespace LesiBuy.Application.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Entity → DTO
            CreateMap<Product, ProductDto>();
            // DTO → Entity
            CreateMap<ProductDto, Product>();
        }
    }
}
