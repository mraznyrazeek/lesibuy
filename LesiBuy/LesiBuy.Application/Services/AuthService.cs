using System;
using System.Threading.Tasks;
using BCrypt.Net;
using LesiBuy.Application.Dtos;
using LesiBuy.Domain.Entities;
using LesiBuy.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LesiBuy.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _uow;
        private readonly ITokenService _tokenService;

        public AuthService(IUnitOfWork uow, ITokenService tokenService)
        {
            _uow = uow;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            if (dto.Password != dto.ConfirmPassword)
                throw new Exception("Passwords do not match.");

            var existingUser = await _uow.Repository<User>()
                .Query()
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (existingUser != null)
                throw new Exception("Email is already registered.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                CreatedAt = DateTime.UtcNow
            };

            await _uow.Repository<User>().AddAsync(user);
            await _uow.CompleteAsync();

            return new AuthResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Token = _tokenService.CreateToken(user)
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _uow.Repository<User>()
                .Query()
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (user == null)
                throw new Exception("Invalid email or password.");

            var validPassword = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!validPassword)
                throw new Exception("Invalid email or password.");

            return new AuthResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Token = _tokenService.CreateToken(user)
            };
        }
    }
}