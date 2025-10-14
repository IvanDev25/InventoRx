using Api.Entity.Account;
using System.Collections.Generic;
using System.Threading.Tasks;
using Api.Web.Response;

namespace Api.Interface
{
    public interface ICustomMedicineSupplierServiceAsync
    {
        Task<Response<string>> CreateMedicineSupplier(MedicineSupplier medicineSupplierDto);
        Task<MedicineSupplier> GetMedicineSupplierById(int id);
        Task<List<MedicineSupplier>> GetAllMedicineSuppliers();
        Task<Response> UpdateMedicineSupplier(MedicineSupplier medicineSupplierDto);
        Task<Response> DeleteMedicineSupplier(int id);
    }
}
