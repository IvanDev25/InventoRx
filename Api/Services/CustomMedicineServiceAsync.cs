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
    public class CustomMedicineServiceAsync : ICustomMedicineServiceAsync
    {
        private readonly IDapperServiceAsync _dapperServiceAsync;

        public CustomMedicineServiceAsync(IDapperServiceAsync dapperServiceAsync)
        {
            _dapperServiceAsync = dapperServiceAsync;
        }

        public async Task<Response<string>> CreateMedicine(Medicine medicineDto)
        {
            if (medicineDto == null)
                return new Response<string>(null, "Medicine data is required.");

            var insertQuery = @"
                INSERT INTO Medicines 
                (GenericName, Issuance, Price, Stock, ExpirationDate, [Return], Refill, MedicineSupplierId)
                VALUES (@GenericName, @Issuance, @Price, @Stock, @ExpirationDate, @Return, @Refill, @MedicineSupplierId)";

            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@GenericName", medicineDto.GenericName);
                parameters.Add("@Issuance", medicineDto.Issuance);
                parameters.Add("@Price", medicineDto.Price);
                parameters.Add("@Stock", medicineDto.Stock);
                parameters.Add("@ExpirationDate", medicineDto.ExpirationDate);
                parameters.Add("@Return", medicineDto.Return);
                parameters.Add("@Refill", medicineDto.Refill);
                parameters.Add("@MedicineSupplierId", medicineDto.MedicineSupplierId);

                var result = await _dapperServiceAsync.ExecuteAsync(
                    insertQuery,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (result <= 0)
                    return new Response<string>(null, "Failed to add medicine.");

                return new Response<string>("Medicine added successfully.");
            }
            catch (Exception ex)
            {
                return new Response<string>(null, $"An error occurred: {ex.Message}");
            }
        }

        public async Task<Response<string>> CreateMedicines(List<Medicine> medicinesDto)
        {
            if (medicinesDto == null || medicinesDto.Count == 0)
                return new Response<string>(null, "No medicines to add.");

            var insertQuery = @"
                INSERT INTO Medicines 
                (GenericName, Issuance, Price, Stock, ExpirationDate, [Return], MedicineSupplierId)
                VALUES (@GenericName, @Issuance, @Price, @Stock, @ExpirationDate, @Return, @MedicineSupplierId)";

            try
            {
                var result = await _dapperServiceAsync.ExecuteAsync(
                    insertQuery,
                    Connection.LoveBoracayDB,
                    medicinesDto.Select(medicine => new
                    {
                        medicine.GenericName,
                        medicine.Issuance,
                        medicine.Price,
                        medicine.Stock,
                        medicine.ExpirationDate,
                        medicine.Return,
                        medicine.MedicineSupplierId
                    }).ToList(),
                    CommandType.Text
                );

                if (result <= 0)
                    return new Response<string>(null, "Failed to add medicines.");

                return new Response<string>($"{result} medicines added successfully.");
            }
            catch (Exception ex)
            {
                return new Response<string>(null, $"An error occurred: {ex.Message}");
            }
        }

        public async Task<Medicine> GetMedicineById(int id)
        {
            try
            {
                string query = @"
                    SELECT m.Id, m.GenericName, m.Issuance, m.Price, m.Stock, m.ExpirationDate, m.[Return], m.Refill, m.MedicineSupplierId,
                           ms.Id as MedicineSupplier_Id, ms.SupplierName as MedicineSupplier_SupplierName
                    FROM Medicines m
                    LEFT JOIN MedicineSuppliers ms ON m.MedicineSupplierId = ms.Id
                    WHERE m.Id = @Id";

                var parameters = new DynamicParameters();
                parameters.Add("@Id", id);

                var medicineData = await _dapperServiceAsync.QuerySingleAsync<dynamic>(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (medicineData != null)
                {
                    var result = new Medicine
                    {
                        Id = medicineData.Id,
                        GenericName = medicineData.GenericName,
                        Issuance = medicineData.Issuance,
                        Price = medicineData.Price,
                        Stock = medicineData.Stock,
                        ExpirationDate = medicineData.ExpirationDate,
                        Return = medicineData.Return,
                        Refill = medicineData.Refill,
                        MedicineSupplierId = medicineData.MedicineSupplierId,
                        MedicineSupplier = medicineData.MedicineSupplier_Id != null ? new MedicineSupplier
                        {
                            Id = medicineData.MedicineSupplier_Id,
                            SupplierName = medicineData.MedicineSupplier_SupplierName
                        } : null
                    };
                    return result;
                }

                return null;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving medicine: {ex.Message}");
            }
        }

        public async Task<List<Medicine>> GetAllMedicines()
        {
            try
            {
                string query = @"
                    SELECT m.Id, m.GenericName, m.Issuance, m.Price, m.Stock, m.ExpirationDate, m.[Return], m.Refill, m.MedicineSupplierId,
                           ms.Id as MedicineSupplier_Id, ms.SupplierName as MedicineSupplier_SupplierName
                    FROM Medicines m
                    LEFT JOIN MedicineSuppliers ms ON m.MedicineSupplierId = ms.Id";

                var medicineDataList = await _dapperServiceAsync.GetAll<dynamic>(
                    query,
                    Connection.LoveBoracayDB,
                    null,
                    CommandType.Text
                );

                var result = new List<Medicine>();
                foreach (var medicineData in medicineDataList)
                {
                    var medicine = new Medicine
                    {
                        Id = medicineData.Id,
                        GenericName = medicineData.GenericName,
                        Issuance = medicineData.Issuance,
                        Price = medicineData.Price,
                        Stock = medicineData.Stock,
                        ExpirationDate = medicineData.ExpirationDate,
                        Return = medicineData.Return,
                        Refill = medicineData.Refill,
                        MedicineSupplierId = medicineData.MedicineSupplierId,
                        MedicineSupplier = medicineData.MedicineSupplier_Id != null ? new MedicineSupplier
                        {
                            Id = medicineData.MedicineSupplier_Id,
                            SupplierName = medicineData.MedicineSupplier_SupplierName
                        } : null
                    };
                    result.Add(medicine);
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving medicines: {ex.Message}");
            }
        }

        public async Task<Response> UpdateMedicine(Medicine medicineDto)
        {
            if (medicineDto == null)
                return new Response("Medicine data is required.");

            try
            {
                // First, get the current medicine to calculate new stock
                var current = await GetMedicineById(medicineDto.Id);
                if (current == null)
                    return new Response("Medicine not found.");

                // Calculate new stock: current stock - issuance + return
                int newStock = current.Stock - medicineDto.Issuance + medicineDto.Return;

                string query = @"
                    UPDATE Medicines 
                    SET GenericName = @GenericName, 
                        Price = @Price, 
                        Stock = @Stock, 
                        ExpirationDate = @ExpirationDate, 
                        [Return] = 0,
                        Issuance = 0,
                        MedicineSupplierId = @MedicineSupplierId
                    WHERE Id = @Id";

                var parameters = new DynamicParameters();
                parameters.Add("@Id", medicineDto.Id);
                parameters.Add("@GenericName", medicineDto.GenericName);
                parameters.Add("@Price", medicineDto.Price);
                parameters.Add("@Stock", newStock);
                parameters.Add("@ExpirationDate", medicineDto.ExpirationDate);
                parameters.Add("@MedicineSupplierId", medicineDto.MedicineSupplierId);

                var result = await _dapperServiceAsync.ExecuteAsync(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (result <= 0)
                    return new Response("Failed to update medicine.");

                return new Response(); // Success
            }
            catch (Exception ex)
            {
                return new Response($"Error: {ex.Message}");
            }
        }

        public async Task<Response> UpdateMedicines(List<Medicine> medicinesDto)
        {
            if (medicinesDto == null || medicinesDto.Count == 0)
                return new Response("No medicines to update.");

            try
            {
                string query = @"
                    UPDATE Medicines 
                    SET GenericName = @GenericName, 
                        Stock = @Stock, 
                        Price = @Price, 
                        ExpirationDate = @ExpirationDate, 
                        [Return] = 0, 
                        Issuance = 0,
                        MedicineSupplierId = @MedicineSupplierId
                    WHERE Id = @Id";

                var updateList = new List<object>();

                foreach (var medicine in medicinesDto)
                {
                    var current = await GetMedicineById(medicine.Id);
                    if (current == null)
                        continue;

                    int newStock = current.Stock - medicine.Issuance + medicine.Return;

                    updateList.Add(new
                    {
                        Id = medicine.Id,
                        GenericName = medicine.GenericName,
                        Stock = newStock,
                        Price = medicine.Price,
                        ExpirationDate = medicine.ExpirationDate,
                        MedicineSupplierId = medicine.MedicineSupplierId
                    });
                }

                var result = await _dapperServiceAsync.ExecuteAsync(
                    query,
                    Connection.LoveBoracayDB,
                    updateList,
                    CommandType.Text
                );

                if (result <= 0)
                    return new Response("Failed to update medicines.");

                return new Response(); // Success
            }
            catch (Exception ex)
            {
                return new Response($"Error: {ex.Message}");
            }
        }

        public async Task<Response> DeleteMedicine(int id)
        {
            try
            {
                string query = @"DELETE FROM Medicines WHERE Id = @Id;";
                var parameters = new DynamicParameters();
                parameters.Add("@Id", id);

                await _dapperServiceAsync.Delete<Medicine>(
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

        public async Task<Response<string>> RefillMedicine(int id, int quantity)
        {
            if (quantity <= 0)
                return new Response<string>(null, "Refill quantity must be greater than 0.");

            try
            {
                // First, get the current medicine
                var medicine = await GetMedicineById(id);
                if (medicine == null)
                    return new Response<string>(null, "Medicine not found.");

                // Update the medicine using the AddRefill method
                medicine.AddRefill(quantity);

                // Update the database
                string query = @"
                    UPDATE Medicines 
                    SET Stock = @Stock, 
                        Refill = @Refill
                    WHERE Id = @Id";

                var parameters = new DynamicParameters();
                parameters.Add("@Id", id);
                parameters.Add("@Stock", medicine.Stock);
                parameters.Add("@Refill", medicine.Refill);

                var result = await _dapperServiceAsync.ExecuteAsync(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (result <= 0)
                    return new Response<string>(null, "Failed to refill medicine.");

                return new Response<string>($"Medicine refilled successfully. New stock: {medicine.Stock}");
            }
            catch (Exception ex)
            {
                return new Response<string>(null, $"Error: {ex.Message}");
            }
        }
    }
}
