using LesiBuy.Domain.Entities;
using LesiBuy.Domain.Interfaces.LesiBuy.Domain.Interfaces;
using System;
using System.Threading.Tasks;

namespace LesiBuy.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Product> Products { get; } // “basket” just for Products
        Task<int> CompleteAsync(); // “stamp and save” everything together
    }
}

