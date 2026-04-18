namespace LesiBuy.Application.Dtos
{
    public class AuthResponseDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }

        public string Role { get; set; } = string.Empty;

        public string Token { get; set; } = string.Empty;
    }
}