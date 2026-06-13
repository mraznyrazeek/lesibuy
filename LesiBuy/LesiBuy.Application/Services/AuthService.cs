using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using LesiBuy.Application.Dtos;
using LesiBuy.Domain.Entities;
using LesiBuy.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace LesiBuy.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _uow;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public AuthService(
            IUnitOfWork uow,
            ITokenService tokenService,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _uow = uow;
            _tokenService = tokenService;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FullName))
                throw new Exception("Full name is required.");

            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new Exception("Email is required.");

            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new Exception("Password is required.");

            if (dto.Password != dto.ConfirmPassword)
                throw new Exception("Passwords do not match.");

            var normalizedEmail = dto.Email
                .Trim()
                .ToLowerInvariant();

            var existingUser = await _uow.Repository<User>()
                .Query()
                .FirstOrDefaultAsync(
                    x => x.Email.ToLower() == normalizedEmail
                );

            if (existingUser != null)
                throw new Exception("Email is already registered.");

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Customer",
                CreatedAt = DateTime.UtcNow,
                Phone = null,
                Address = null,
                City = null,
                PostalCode = null
            };

            await _uow.Repository<User>().AddAsync(user);
            await _uow.CompleteAsync();

            return MapToAuthResponse(user);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new Exception("Email is required.");

            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new Exception("Password is required.");

            var normalizedEmail = dto.Email
                .Trim()
                .ToLowerInvariant();

            var user = await _uow.Repository<User>()
                .Query()
                .FirstOrDefaultAsync(
                    x => x.Email.ToLower() == normalizedEmail
                );

            if (user == null)
                throw new Exception("Invalid email or password.");

            var validPassword = BCrypt.Net.BCrypt.Verify(
                dto.Password,
                user.PasswordHash
            );

            if (!validPassword)
                throw new Exception("Invalid email or password.");

            return MapToAuthResponse(user);
        }

        public async Task<AuthResponseDto> GetMeAsync(int userId)
        {
            var user = await _uow.Repository<User>()
                .Query()
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new Exception("User not found.");

            return MapToAuthResponse(user);
        }

        public async Task<AuthResponseDto> UpdateProfileAsync(
            int userId,
            UpdateProfileDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FullName))
                throw new Exception("Full name is required.");

            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new Exception("Email is required.");

            var user = await _uow.Repository<User>()
                .Query()
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new Exception("User not found.");

            var normalizedEmail = dto.Email
                .Trim()
                .ToLowerInvariant();

            var existingUserWithEmail = await _uow.Repository<User>()
                .Query()
                .FirstOrDefaultAsync(
                    x =>
                        x.Email.ToLower() == normalizedEmail &&
                        x.Id != userId
                );

            if (existingUserWithEmail != null)
            {
                throw new Exception(
                    "Email is already in use by another account."
                );
            }

            user.FullName = dto.FullName.Trim();
            user.Email = normalizedEmail;

            user.Phone = string.IsNullOrWhiteSpace(dto.Phone)
                ? null
                : dto.Phone.Trim();

            user.Address = string.IsNullOrWhiteSpace(dto.Address)
                ? null
                : dto.Address.Trim();

            user.City = string.IsNullOrWhiteSpace(dto.City)
                ? null
                : dto.City.Trim();

            user.PostalCode = string.IsNullOrWhiteSpace(dto.PostalCode)
                ? null
                : dto.PostalCode.Trim();

            _uow.Repository<User>().Update(user);
            await _uow.CompleteAsync();

            return MapToAuthResponse(user);
        }

        public async Task ChangePasswordAsync(
            int userId,
            ChangePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                throw new Exception("Current password is required.");

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                throw new Exception("New password is required.");

            if (dto.NewPassword.Length < 8)
            {
                throw new Exception(
                    "New password must contain at least 8 characters."
                );
            }

            if (dto.NewPassword != dto.ConfirmNewPassword)
                throw new Exception("New passwords do not match.");

            var user = await _uow.Repository<User>()
                .Query()
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new Exception("User not found.");

            var validPassword = BCrypt.Net.BCrypt.Verify(
                dto.CurrentPassword,
                user.PasswordHash
            );

            if (!validPassword)
                throw new Exception("Current password is incorrect.");

            user.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            _uow.Repository<User>().Update(user);
            await _uow.CompleteAsync();
        }

        public async Task ForgotPasswordAsync(
            ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return;

            var normalizedEmail = request.Email
                .Trim()
                .ToLowerInvariant();

            var user = await _uow.Repository<User>()
                .Query()
                .FirstOrDefaultAsync(
                    x => x.Email.ToLower() == normalizedEmail
                );

            /*
             * Do not throw an error when the email does not exist.
             * The controller should always return the same message.
             */
            if (user == null)
                return;

            /*
             * Invalidate any previous active reset tokens belonging
             * to this user.
             */
            var activeTokens = await _uow
                .Repository<PasswordResetToken>()
                .Query()
                .Where(x =>
                    x.UserId == user.Id &&
                    x.UsedAt == null &&
                    x.ExpiresAt > DateTime.UtcNow
                )
                .ToListAsync();

            foreach (var activeToken in activeTokens)
            {
                activeToken.UsedAt = DateTime.UtcNow;

                _uow.Repository<PasswordResetToken>()
                    .Update(activeToken);
            }

            var rawToken = GenerateSecureToken();
            var tokenHash = HashResetToken(rawToken);

            var passwordResetToken = new PasswordResetToken
            {
                UserId = user.Id,
                TokenHash = tokenHash,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(30),
                UsedAt = null
            };

            await _uow.Repository<PasswordResetToken>()
                .AddAsync(passwordResetToken);

            await _uow.CompleteAsync();

            var frontendUrl =
                _configuration["FrontendUrl"]?.TrimEnd('/')
                ?? "http://localhost:4200";

            var resetLink =
                $"{frontendUrl}/reset-password" +
                $"?email={Uri.EscapeDataString(user.Email)}" +
                $"&token={Uri.EscapeDataString(rawToken)}";

            await _emailService.SendPasswordResetEmailAsync(
                user.Email,
                user.FullName,
                resetLink
            );
        }

        public async Task ResetPasswordAsync(
            ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new Exception("Email is required.");

            if (string.IsNullOrWhiteSpace(request.Token))
                throw new Exception("Reset token is required.");

            if (string.IsNullOrWhiteSpace(request.NewPassword))
                throw new Exception("New password is required.");

            if (request.NewPassword.Length < 8)
            {
                throw new Exception(
                    "Password must contain at least 8 characters."
                );
            }

            var normalizedEmail = request.Email
                .Trim()
                .ToLowerInvariant();

            var user = await _uow.Repository<User>()
                .Query()
                .FirstOrDefaultAsync(
                    x => x.Email.ToLower() == normalizedEmail
                );

            if (user == null)
            {
                throw new Exception(
                    "The password reset link is invalid or has expired."
                );
            }

            var tokenHash = HashResetToken(request.Token);

            var resetToken = await _uow
                .Repository<PasswordResetToken>()
                .Query()
                .FirstOrDefaultAsync(x =>
                    x.UserId == user.Id &&
                    x.TokenHash == tokenHash &&
                    x.UsedAt == null
                );

            if (resetToken == null)
            {
                throw new Exception(
                    "The password reset link is invalid or has already been used."
                );
            }

            if (resetToken.ExpiresAt <= DateTime.UtcNow)
            {
                throw new Exception(
                    "The password reset link has expired."
                );
            }

            user.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            resetToken.UsedAt = DateTime.UtcNow;

            _uow.Repository<User>().Update(user);

            _uow.Repository<PasswordResetToken>()
                .Update(resetToken);

            await _uow.CompleteAsync();
        }

        private static string GenerateSecureToken()
        {
            var tokenBytes = RandomNumberGenerator.GetBytes(32);

            return Convert
                .ToBase64String(tokenBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');
        }

        private static string HashResetToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return string.Empty;

            var tokenBytes = Encoding.UTF8.GetBytes(token);
            var hashBytes = SHA256.HashData(tokenBytes);

            return Convert.ToHexString(hashBytes);
        }

        private AuthResponseDto MapToAuthResponse(User user)
        {
            return new AuthResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                City = user.City,
                PostalCode = user.PostalCode,
                Role = user.Role,
                Token = _tokenService.CreateToken(user)
            };
        }
    }
}