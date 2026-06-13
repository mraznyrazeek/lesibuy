using System.Threading.Tasks;
using LesiBuy.Application.Services;
using Microsoft.Extensions.Logging;

namespace LesiBuy.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;

        public EmailService(ILogger<EmailService> logger)
        {
            _logger = logger;
        }

        public Task SendPasswordResetEmailAsync(
            string recipientEmail,
            string recipientName,
            string resetLink)
        {
            _logger.LogInformation(
                """
                PASSWORD RESET EMAIL

                Name: {RecipientName}
                Email: {RecipientEmail}
                Reset link: {ResetLink}
                """,
                recipientName,
                recipientEmail,
                resetLink
            );

            return Task.CompletedTask;
        }
    }
}