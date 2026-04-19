using AutoMapper;
using LesiBuy.Application.Dtos;
using LesiBuy.Domain.Entities;

namespace LesiBuy.Application.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));

            CreateMap<ProductDto, Product>();

            CreateMap<Category, CategoryDto>().ReverseMap();
        }
    }
}