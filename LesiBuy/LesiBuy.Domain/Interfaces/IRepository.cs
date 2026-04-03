using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LesiBuy.Domain.Interfaces
{
    namespace LesiBuy.Domain.Interfaces
    {
        public interface IRepository<T> where T : class
        {
            Task<T?> GetByIdAsync(int id);
            Task<IReadOnlyList<T>> ListAllAsync();
            Task AddAsync(T entity);
            void Update(T entity);
            void Delete(T entity);
        }
    }
}
