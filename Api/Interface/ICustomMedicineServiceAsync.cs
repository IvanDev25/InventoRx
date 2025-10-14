using Api.Entity.Account;
using System.Collections.Generic;
using System.Threading.Tasks;
using Api.Web.Response;

namespace Api.Interface
{
    public interface ICustomMedicineServiceAsync
    {
        Task<Response<string>> CreateMedicine(Medicine medicineDto);
        Task<Response<string>> CreateMedicines(List<Medicine> medicinesDto);
        Task<Medicine> GetMedicineById(int id);
        Task<List<Medicine>> GetAllMedicines();
        Task<Response> UpdateMedicine(Medicine medicineDto);
        Task<Response> UpdateMedicines(List<Medicine> medicinesDto);
        Task<Response> DeleteMedicine(int id);
        Task<Response<string>> RefillMedicine(int id, int quantity);
    }
}
