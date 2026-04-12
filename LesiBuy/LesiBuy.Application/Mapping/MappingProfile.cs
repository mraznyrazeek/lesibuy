using AutoMapper;
using LesiBuy.Application.Dtos;
using LesiBuy.Domain.Entities;

namespace LesiBuy.Application
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDto>().ReverseMap();
        }
    }
}