using System.Threading.Tasks;
using LesiBuy.Application.Dtos;

namespace LesiBuy.Application.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
    }
}