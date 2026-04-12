using AutoMapper;
using LesiBuy.Application;
using LesiBuy.Application.Services;
using LesiBuy.Domain.Interfaces;
//using LesiBuy.Domain.Interfaces.LesiBuy.Domain.Interfaces;
using LesiBuy.Infrastructure.Data;
using LesiBuy.Infrastructure.Repositories;
using LesiBuy.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Define a named CORS policy ("AllowAll")
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod()
    );
});

// EF Core DbContext
builder.Services.AddDbContext<LesiBuyContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Repositories & Unit of Work
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Application services
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddAutoMapper(typeof(MappingProfile));
builder.Services.AddSwaggerGen();

// Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();     
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseRouting();                

app.UseCors("AllowAll");        

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "LesiBuy API V1");
    });
}

app.UseAuthorization();

app.MapControllers();

app.MapGet("/weatherforecast", () =>
    Enumerable.Range(1, 5).Select(i => new
    {
        Date = DateOnly.FromDateTime(DateTime.Now.AddDays(i)),
        Summary = new[] { "Freezing", "Bracing", "Chilly", "Cool" }[i % 4]
    })
).WithName("GetWeatherForecast");

app.Run();


//dotnet build
//dotnet run --project LesiBuy.API
