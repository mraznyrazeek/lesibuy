using AutoMapper;
using LesiBuy.Application;
using LesiBuy.Application.Services;
using LesiBuy.Domain.Interfaces;
using LesiBuy.Infrastructure.Data;
using LesiBuy.Infrastructure.Repositories;
using LesiBuy.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using LesiBuy.Application.Mapping;
using Microsoft.Extensions.FileProviders;
using LesiBuy.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.WithOrigins(
                "http://localhost:4200",
                "http://localhost:55119"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

// DbContext
builder.Services.AddDbContext<LesiBuyContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Repositories / Unit of Work
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Services
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// AutoMapper
// AutoMapper
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<MappingProfile>();
});

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

// JWT Auth
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new Exception("JWT Key is missing in appsettings.json");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.IncludeErrorDetails = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        RoleClaimType = ClaimTypes.Role,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var authHeader = context.Request.Headers["Authorization"].ToString();
            var accessToken = context.Request.Query["access_token"].ToString();

            if (string.IsNullOrWhiteSpace(authHeader) && !string.IsNullOrWhiteSpace(accessToken))
            {
                context.Token = accessToken;
                context.Response.Headers["X-Debug-Auth-Header"] = "TOKEN_FROM_QUERY";
            }
            else
            {
                context.Response.Headers["X-Debug-Auth-Header"] =
                    string.IsNullOrWhiteSpace(authHeader) ? "NO_HEADER" : "HEADER_PRESENT";
            }

            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            context.Response.Headers["X-Debug-Auth"] = "TOKEN_VALIDATED";

            var userIdClaim =
                context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? context.Principal?.FindFirst("nameid")?.Value
                ?? "NO_NAMEID";

            context.Response.Headers["X-Debug-UserId"] = userIdClaim;
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            context.Response.Headers["X-Debug-Auth"] = "AUTH_FAILED";
            context.Response.Headers["X-Debug-Auth-Error"] = context.Exception.Message;
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            context.Response.Headers["X-Debug-Challenge"] = "CHALLENGE_TRIGGERED";
            context.Response.Headers["X-Debug-Challenge-Error"] = context.Error ?? "NO_ERROR";
            context.Response.Headers["X-Debug-Challenge-Description"] = context.ErrorDescription ?? "NO_DESCRIPTION";
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "LesiBuy API V1");
    });
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("AllowAll");

// Serve files from wwwroot if needed
app.UseStaticFiles();

// Serve files from uploads folder
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");

if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/weatherforecast", () =>
    Enumerable.Range(1, 5).Select(i => new
    {
        Date = DateOnly.FromDateTime(DateTime.Now.AddDays(i)),
        Summary = new[] { "Freezing", "Bracing", "Chilly", "Cool" }[i % 4]
    })
).WithName("GetWeatherForecast");

app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();