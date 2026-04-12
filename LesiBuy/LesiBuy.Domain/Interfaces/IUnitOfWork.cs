using System.Threading.Tasks;
using LesiBuy.Domain.Entities;

namespace LesiBuy.Domain.Interfaces
{
    public interface IUnitOfWork
    {
        IRepository<Product> Products { get; }

        IRepository<T> Repository<T>() where T : class;

        Task<int> CompleteAsync();
    }
}

