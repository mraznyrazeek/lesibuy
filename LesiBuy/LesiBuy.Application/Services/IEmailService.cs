namespace LesiBuy.Application.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(
            string recipientEmail,
            string recipientName,
            string resetLink);
    }
}