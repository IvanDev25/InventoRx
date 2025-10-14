using Api.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data;
using Api.Constant;
using Api.Entity.Account;
using Dapper;
using Api.Web.Response;
using System.Linq;
using System;

namespace Api.Services
{
    public class CustomMedicineSupplierServiceAsync : ICustomMedicineSupplierServiceAsync
    {
        private readonly IDapperServiceAsync _dapperServiceAsync;

        public CustomMedicineSupplierServiceAsync(IDapperServiceAsync dapperServiceAsync)
        {
            _dapperServiceAsync = dapperServiceAsync;
        }

        public async Task<Response<string>> CreateMedicineSupplier(MedicineSupplier medicineSupplierDto)
        {
            if (medicineSupplierDto == null)
                return new Response<string>(null, "Medicine supplier data is required.");

            var insertQuery = @"
                INSERT INTO MedicineSuppliers (SupplierName)
                VALUES (@SupplierName)";

            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@SupplierName", medicineSupplierDto.SupplierName);

                var result = await _dapperServiceAsync.ExecuteAsync(
                    insertQuery,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (result <= 0)
                    return new Response<string>(null, "Failed to add medicine supplier.");

                return new Response<string>("Medicine supplier added successfully.");
            }
            catch (Exception ex)
            {
                return new Response<string>(null, $"An error occurred: {ex.Message}");
            }
        }

        public async Task<MedicineSupplier> GetMedicineSupplierById(int id)
        {
            try
            {
                // Get supplier
                string supplierQuery = @"
                    SELECT Id, SupplierName
                    FROM MedicineSuppliers 
                    WHERE Id = @Id";

                var parameters = new DynamicParameters();
                parameters.Add("@Id", id);

                var supplier = await _dapperServiceAsync.Get<MedicineSupplier>(
                    supplierQuery,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (supplier == null)
                    return null;

                // Get all medicines belonging to this supplier
                string medicinesQuery = @"
                    SELECT Id, GenericName, Issuance, Price, Stock, ExpirationDate, [Return], MedicineSupplierId
                    FROM Medicines
                    WHERE MedicineSupplierId = @SupplierId";

                var medicineParams = new DynamicParameters();
                medicineParams.Add("@SupplierId", supplier.Id);

                var medicines = await _dapperServiceAsync.GetAll<Medicine>(
                    medicinesQuery,
                    Connection.LoveBoracayDB,
                    medicineParams,
                    CommandType.Text
                );

                supplier.Medicines = medicines?.ToList() ?? new List<Medicine>();

                return supplier;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving medicine supplier: {ex.Message}");
            }
        }

        public async Task<List<MedicineSupplier>> GetAllMedicineSuppliers()
        {
            try
            {
                string supplierQuery = @"SELECT Id, SupplierName FROM MedicineSuppliers";

                var suppliers = await _dapperServiceAsync.GetAll<MedicineSupplier>(
                    supplierQuery,
                    Connection.LoveBoracayDB,
                    null,
                    CommandType.Text
                );

                if (suppliers == null || !suppliers.Any())
                    return new List<MedicineSupplier>();

                // For each supplier, attach their medicines
                foreach (var supplier in suppliers)
                {
                    string medicinesQuery = @"
                        SELECT Id, GenericName, Issuance, Price, Stock, ExpirationDate, [Return], MedicineSupplierId
                        FROM Medicines
                        WHERE MedicineSupplierId = @SupplierId";

                    var medicineParams = new DynamicParameters();
                    medicineParams.Add("@SupplierId", supplier.Id);

                    var medicines = await _dapperServiceAsync.GetAll<Medicine>(
                        medicinesQuery,
                        Connection.LoveBoracayDB,
                        medicineParams,
                        CommandType.Text
                    );

                    supplier.Medicines = medicines?.ToList() ?? new List<Medicine>();
                }

                return suppliers.ToList();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving medicine suppliers: {ex.Message}");
            }
        }

        public async Task<Response> UpdateMedicineSupplier(MedicineSupplier medicineSupplierDto)
        {
            if (medicineSupplierDto == null)
                return new Response("Medicine supplier data is required.");

            try
            {
                string query = @"
                    UPDATE MedicineSuppliers 
                    SET SupplierName = @SupplierName
                    WHERE Id = @Id";

                var parameters = new DynamicParameters();
                parameters.Add("@Id", medicineSupplierDto.Id);
                parameters.Add("@SupplierName", medicineSupplierDto.SupplierName);

                var result = await _dapperServiceAsync.ExecuteAsync(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (result <= 0)
                    return new Response("Failed to update medicine supplier.");

                return new Response(); // Success
            }
            catch (Exception ex)
            {
                return new Response($"Error: {ex.Message}");
            }
        }

        public async Task<Response> DeleteMedicineSupplier(int id)
        {
            try
            {
                string query = @"DELETE FROM MedicineSuppliers WHERE Id = @Id;";
                var parameters = new DynamicParameters();
                parameters.Add("@Id", id);

                await _dapperServiceAsync.Delete<MedicineSupplier>(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                return new Response(); // Success
            }
            catch (Exception ex)
            {
                return new Response($"Error: {ex.Message}");
            }
        }
    }
}
