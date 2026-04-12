using LesiBuy.Domain.Entities;

namespace LesiBuy.Application.Services
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}