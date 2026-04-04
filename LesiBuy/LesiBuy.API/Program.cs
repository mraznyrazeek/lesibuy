using AutoMapper;
using LesiBuy.Application.Mapping;
using LesiBuy.Application.Services;
using LesiBuy.Domain.Interfaces;
//using LesiBuy.Domain.Interfaces.LesiBuy.Domain.Interfaces;
using LesiBuy.Infrastructure.Data;
using LesiBuy.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

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

// AutoMapper
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<MappingProfile>();
});

// Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();     
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseRouting();                

app.UseCors("AllowAll");        

app.UseHttpsRedirection();

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
