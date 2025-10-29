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
using Microsoft.IdentityModel.Tokens;

namespace Api.Services
{
    public class CustomPatientServiceAsync : ICustomPatientServiceAsync
    {
        private readonly IDapperServiceAsync _dapperServiceAsync;

        public CustomPatientServiceAsync(IDapperServiceAsync dapperServiceAsync)
        {
            _dapperServiceAsync = dapperServiceAsync;
        }

        public async Task<Response<string>> CreatePatient(Patient patientDto)
        {
            if (patientDto == null)
            {
                return new Response<string>(null, "Patient data is required.");
            }

            if (string.IsNullOrWhiteSpace(patientDto.PatientName))
            {
                return new Response<string>(null, "Patient name is required.");
            }

            var insertQuery = @"
                INSERT INTO Patients (PatientName, DateCreated, IsAdmitted)
                VALUES (@PatientName, @DateCreated, @IsAdmitted)";

            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("@PatientName", patientDto.PatientName);
                parameters.Add("@DateCreated", patientDto.DateCreated);
                parameters.Add("@IsAdmitted", patientDto.IsAdmitted);

                var result = await _dapperServiceAsync.ExecuteAsync(
                    insertQuery,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (result <= 0)
                {
                    return new Response<string>(null, "Failed to add patient.");
                }

                return new Response<string>("Patient added successfully.");
            }
            catch (Exception ex)
            {
                return new Response<string>(null, $"An error occurred: {ex.Message}");
            }
        }

        public async Task<Patient> GetPatientById(int id)
        {
            try
            {
                string query = @"
                    SELECT p.Id, p.PatientName, p.DateCreated, p.IsAdmitted
                    FROM Patients p
                    WHERE p.Id = @Id";

                var parameters = new DynamicParameters();
                parameters.Add("@Id", id);

                var patient = await _dapperServiceAsync.Get<Patient>(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (patient != null)
                {
                    // Get PatientMedicine records for this patient
                    string patientMedicinesQuery = @"
                        SELECT Id, PatientId, MedicineId, Quantity
                        FROM PatientMedicines 
                        WHERE PatientId = @PatientId";

                    var patientMedicinesParameters = new DynamicParameters();
                    patientMedicinesParameters.Add("@PatientId", id);

                    var patientMedicines = await _dapperServiceAsync.GetAll<PatientMedicine>(
                        patientMedicinesQuery,
                        Connection.LoveBoracayDB,
                        patientMedicinesParameters,
                        CommandType.Text
                    );

                    // Get the actual medicine details for each PatientMedicine
                    foreach (var pm in patientMedicines)
                    {
                        string medicineQuery = @"
                            SELECT m.Id, m.GenericName, m.Issuance, m.Price, m.Stock, m.ExpirationDate, m.`Return`, m.Refill, m.MedicineSupplierId,
                                   ms.Id as MedicineSupplier_Id, ms.SupplierName as MedicineSupplier_SupplierName
                            FROM Medicines m
                            LEFT JOIN MedicineSuppliers ms ON m.MedicineSupplierId = ms.Id
                            WHERE m.Id = @MedicineId";

                        var medicineParameters = new DynamicParameters();
                        medicineParameters.Add("@MedicineId", pm.MedicineId);

                        var medicineData = await _dapperServiceAsync.QuerySingleAsync<dynamic>(
                            medicineQuery,
                            Connection.LoveBoracayDB,
                            medicineParameters,
                            CommandType.Text
                        );

                        if (medicineData != null)
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
                                Refill = medicineData.Refill ?? 0,
                                MedicineSupplierId = medicineData.MedicineSupplierId,
                                MedicineSupplier = medicineData.MedicineSupplier_Id != null ? new MedicineSupplier
                                {
                                    Id = medicineData.MedicineSupplier_Id,
                                    SupplierName = medicineData.MedicineSupplier_SupplierName
                                } : null
                            };
                            pm.Medicine = medicine;
                        }
                    }

                    patient.PatientMedicines = patientMedicines.ToList();
                }

                return patient;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving patient: {ex.Message}");
            }
        }

        public async Task<List<Patient>> GetAllPatients()
        {
            try
            {
                string query = @"
                    SELECT p.Id, p.PatientName, p.DateCreated, p.IsAdmitted
                    FROM Patients p
                    ORDER BY p.DateCreated DESC";

                var patients = await _dapperServiceAsync.GetAll<Patient>(
                    query,
                    Connection.LoveBoracayDB,
                    null,
                    CommandType.Text
                );

                var patientList = patients.ToList();

                // Get medicines for each patient through junction table
                foreach (var patient in patientList)
                {
                    // Get PatientMedicine records for this patient
                    string patientMedicinesQuery = @"
                        SELECT Id, PatientId, MedicineId, Quantity
                        FROM PatientMedicines 
                        WHERE PatientId = @PatientId";

                    var patientMedicinesParameters = new DynamicParameters();
                    patientMedicinesParameters.Add("@PatientId", patient.Id);

                    var patientMedicines = await _dapperServiceAsync.GetAll<PatientMedicine>(
                        patientMedicinesQuery,
                        Connection.LoveBoracayDB,
                        patientMedicinesParameters,
                        CommandType.Text
                    );

                    // Get the actual medicine details for each PatientMedicine
                    foreach (var pm in patientMedicines)
                    {
                        string medicineQuery = @"
                            SELECT m.Id, m.GenericName, m.Issuance, m.Price, m.Stock, m.ExpirationDate, m.`Return`, m.Refill, m.MedicineSupplierId,
                                   ms.Id as MedicineSupplier_Id, ms.SupplierName as MedicineSupplier_SupplierName
                            FROM Medicines m
                            LEFT JOIN MedicineSuppliers ms ON m.MedicineSupplierId = ms.Id
                            WHERE m.Id = @MedicineId";

                        var medicineParameters = new DynamicParameters();
                        medicineParameters.Add("@MedicineId", pm.MedicineId);

                        var medicineData = await _dapperServiceAsync.QuerySingleAsync<dynamic>(
                            medicineQuery,
                            Connection.LoveBoracayDB,
                            medicineParameters,
                            CommandType.Text
                        );

                        if (medicineData != null)
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
                                Refill = medicineData.Refill ?? 0,
                                MedicineSupplierId = medicineData.MedicineSupplierId,
                                MedicineSupplier = medicineData.MedicineSupplier_Id != null ? new MedicineSupplier
                                {
                                    Id = medicineData.MedicineSupplier_Id,
                                    SupplierName = medicineData.MedicineSupplier_SupplierName
                                } : null
                            };
                            pm.Medicine = medicine;
                        }
                    }

                    patient.PatientMedicines = patientMedicines.ToList();
                }

                return patientList;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving patients: {ex.Message}");
            }
        }

        public async Task<Response> UpdatePatient(Patient patientDto)
        {
            if (patientDto == null)
            {
                return new Response("Patient data is required.");
            }

            if (string.IsNullOrWhiteSpace(patientDto.PatientName))
            {
                return new Response("Patient name is required.");
            }

            try
            {
                string query = @"
                    UPDATE Patients 
                    SET PatientName = @PatientName, IsAdmitted = @IsAdmitted
                    WHERE Id = @Id";

                var parameters = new DynamicParameters();
                parameters.Add("@Id", patientDto.Id);
                parameters.Add("@PatientName", patientDto.PatientName);
                parameters.Add("@IsAdmitted", patientDto.IsAdmitted);

                var result = await _dapperServiceAsync.ExecuteAsync(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (result <= 0)
                {
                    return new Response("Failed to update patient.");
                }

                return new Response(); // Success
            }
            catch (Exception ex)
            {
                return new Response($"Error: {ex.Message}");
            }
        }

        public async Task<Response> DeletePatient(int id)
        {
            try
            {
                string query = @"DELETE FROM Patients WHERE Id = @Id;";
                var parameters = new DynamicParameters();
                parameters.Add("@Id", id);

                await _dapperServiceAsync.Delete<Patient>(
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

        public async Task<Response<string>> AssignMedicinesToPatient(int patientId, List<int> medicineIds)
        {
            if (medicineIds == null || medicineIds.Count == 0)
            {
                return new Response<string>(null, "At least one medicine must be selected.");
            }

            try
            {
                // First, verify the patient exists
                var patient = await GetPatientById(patientId);
                if (patient == null)
                {
                    return new Response<string>(null, "Patient not found.");
                }

                int assignedCount = 0;
                var errors = new List<string>();

                foreach (var medicineId in medicineIds)
                {
                    try
                    {
                        // Check if this medicine is already assigned to this patient and get existing quantity
                        string checkQuery = @"
                            SELECT Id, Quantity FROM PatientMedicines 
                            WHERE PatientId = @PatientId AND MedicineId = @MedicineId";

                        var checkParameters = new DynamicParameters();
                        checkParameters.Add("@PatientId", patientId);
                        checkParameters.Add("@MedicineId", medicineId);

                        var existingAssignment = await _dapperServiceAsync.QuerySingleAsync<dynamic>(
                            checkQuery,
                            Connection.LoveBoracayDB,
                            checkParameters,
                            CommandType.Text
                        );

                        if (existingAssignment != null)
                        {
                            // Medicine already assigned - preserve existing quantity
                            errors.Add($"Medicine ID {medicineId} is already assigned to this patient with quantity {existingAssignment.Quantity}.");
                            continue;
                        }

                        // Insert new assignment with quantity 0 (new assignment)
                        string insertQuery = @"
                            INSERT INTO PatientMedicines (PatientId, MedicineId, Quantity)
                            VALUES (@PatientId, @MedicineId, 0)";

                        var insertParameters = new DynamicParameters();
                        insertParameters.Add("@PatientId", patientId);
                        insertParameters.Add("@MedicineId", medicineId);

                        var result = await _dapperServiceAsync.ExecuteAsync(
                            insertQuery,
                            Connection.LoveBoracayDB,
                            insertParameters,
                            CommandType.Text
                        );

                        if (result > 0)
                        {
                            assignedCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Error assigning medicine ID {medicineId}: {ex.Message}");
                    }
                }

                if (assignedCount == 0)
                {
                    return new Response<string>(null, $"No medicines were assigned. Errors: {string.Join(", ", errors)}");
                }

                var message = $"Successfully assigned {assignedCount} medicine(s) to patient.";
                if (errors.Count > 0)
                {
                    message += $" Warnings: {string.Join(", ", errors)}";
                }

                return new Response<string>(message);
            }
            catch (Exception ex)
            {
                return new Response<string>(null, $"An error occurred: {ex.Message}");
            }
        }

        public async Task<Response<string>> RemoveMedicinesFromPatient(int patientId, List<int> medicineIds)
        {
            if (medicineIds == null || medicineIds.Count == 0)
            {
                return new Response<string>(null, "At least one medicine must be selected.");
            }

            try
            {
                // First, verify the patient exists
                var patient = await GetPatientById(patientId);
                if (patient == null)
                {
                    return new Response<string>(null, "Patient not found.");
                }

                // Get current quantities before removal for logging
                string getQuantitiesQuery = @"
                    SELECT pm.MedicineId, pm.Quantity, m.GenericName
                    FROM PatientMedicines pm
                    INNER JOIN Medicines m ON pm.MedicineId = m.Id
                    WHERE pm.PatientId = @PatientId AND pm.MedicineId IN @MedicineIds";

                var getQuantitiesParameters = new DynamicParameters();
                getQuantitiesParameters.Add("@PatientId", patientId);
                getQuantitiesParameters.Add("@MedicineIds", medicineIds);

                var quantitiesToRemove = await _dapperServiceAsync.GetAll<dynamic>(
                    getQuantitiesQuery,
                    Connection.LoveBoracayDB,
                    getQuantitiesParameters,
                    CommandType.Text
                );

                // Remove medicines from the patient by deleting from junction table
                string deleteQuery = @"
                    DELETE FROM PatientMedicines 
                    WHERE PatientId = @PatientId AND MedicineId IN @MedicineIds";

                var parameters = new DynamicParameters();
                parameters.Add("@PatientId", patientId);
                parameters.Add("@MedicineIds", medicineIds);

                var result = await _dapperServiceAsync.ExecuteAsync(
                    deleteQuery,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (result <= 0)
                {
                    return new Response<string>(null, "No medicines were removed. The medicines may not be assigned to this patient.");
                }

                // Create detailed message about what was removed
                var removedDetails = quantitiesToRemove.Select(q => 
                    $"{q.GenericName} (Qty: {q.Quantity})").ToList();

                var message = $"Successfully removed {result} medicine(s) from patient: {string.Join(", ", removedDetails)}. " +
                            "Quantities of remaining assigned medicines have been preserved.";

                return new Response<string>(message);
            }
            catch (Exception ex)
            {
                return new Response<string>(null, $"An error occurred: {ex.Message}");
            }
        }

        public async Task<List<Medicine>> GetAssignedMedicines(int patientId)
        {
            try
            {
                // Verify patient exists
                var patient = await GetPatientById(patientId);
                if (patient == null)
                {
                    return new List<Medicine>();
                }

                string query = @"
                    SELECT m.Id, m.GenericName, m.Issuance, m.Price, m.Stock, m.ExpirationDate, m.`Return`, m.Refill, m.MedicineSupplierId,
                           ms.Id as MedicineSupplier_Id, ms.SupplierName as MedicineSupplier_SupplierName
                    FROM Medicines m
                    INNER JOIN PatientMedicines pm ON m.Id = pm.MedicineId
                    LEFT JOIN MedicineSuppliers ms ON m.MedicineSupplierId = ms.Id
                    WHERE pm.PatientId = @PatientId";

                var parameters = new DynamicParameters();
                parameters.Add("@PatientId", patientId);

                var medicines = await _dapperServiceAsync.GetAll<Medicine>(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                return medicines.ToList();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving assigned medicines: {ex.Message}");
            }
        }

        public async Task<List<Medicine>> GetUnassignedMedicines(int patientId)
        {
            try
            {
                // Verify patient exists
                var patient = await GetPatientById(patientId);
                if (patient == null)
                {
                    return new List<Medicine>();
                }

                string query = @"
                    SELECT m.Id, m.GenericName, m.Issuance, m.Price, m.Stock, m.ExpirationDate, m.`Return`, m.Refill, m.MedicineSupplierId,
                           ms.Id as MedicineSupplier_Id, ms.SupplierName as MedicineSupplier_SupplierName
                    FROM Medicines m
                    LEFT JOIN MedicineSuppliers ms ON m.MedicineSupplierId = ms.Id
                    WHERE m.Id NOT IN (
                        SELECT pm.MedicineId 
                        FROM PatientMedicines pm 
                        WHERE pm.PatientId = @PatientId
                    )";

                var parameters = new DynamicParameters();
                parameters.Add("@PatientId", patientId);

                var medicines = await _dapperServiceAsync.GetAll<Medicine>(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                return medicines.ToList();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving unassigned medicines: {ex.Message}");
            }
        }

        public async Task<Response<string>> ReplacePatientMedicines(int patientId, List<int> medicineIds)
        {
            try
            {
                // Verify patient exists
                var patient = await GetPatientById(patientId);
                if (patient == null)
                {
                    return new Response<string>(null, "Patient not found.");
                }

                // Get current assignments before replacement for logging
                string getCurrentAssignmentsQuery = @"
                    SELECT pm.MedicineId, pm.Quantity, m.GenericName
                    FROM PatientMedicines pm
                    INNER JOIN Medicines m ON pm.MedicineId = m.Id
                    WHERE pm.PatientId = @PatientId";

                var getCurrentParameters = new DynamicParameters();
                getCurrentParameters.Add("@PatientId", patientId);

                var currentAssignments = await _dapperServiceAsync.GetAll<dynamic>(
                    getCurrentAssignmentsQuery,
                    Connection.LoveBoracayDB,
                    getCurrentParameters,
                    CommandType.Text
                );

                // Start transaction-like operations
                // First, remove all existing assignments
                string deleteQuery = @"
                    DELETE FROM PatientMedicines 
                    WHERE PatientId = @PatientId";

                var deleteParameters = new DynamicParameters();
                deleteParameters.Add("@PatientId", patientId);

                await _dapperServiceAsync.ExecuteAsync(
                    deleteQuery,
                    Connection.LoveBoracayDB,
                    deleteParameters,
                    CommandType.Text
                );

                // If no medicines provided, just return success (all assignments removed)
                if (medicineIds == null || medicineIds.Count == 0)
                {
                    var removedDetails = currentAssignments.Select(a => 
                        $"{a.GenericName} (Qty: {a.Quantity})").ToList();
                    var message = $"All medicine assignments removed successfully: {string.Join(", ", removedDetails)}";
                    return new Response<string>(message);
                }

                // Add new assignments
                int assignedCount = 0;
                var errors = new List<string>();

                foreach (var medicineId in medicineIds)
                {
                    try
                    {
                        string insertQuery = @"
                            INSERT INTO PatientMedicines (PatientId, MedicineId, Quantity)
                            VALUES (@PatientId, @MedicineId, 0)";

                        var insertParameters = new DynamicParameters();
                        insertParameters.Add("@PatientId", patientId);
                        insertParameters.Add("@MedicineId", medicineId);

                        var result = await _dapperServiceAsync.ExecuteAsync(
                            insertQuery,
                            Connection.LoveBoracayDB,
                            insertParameters,
                            CommandType.Text
                        );

                        if (result > 0)
                        {
                            assignedCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Error assigning medicine ID {medicineId}: {ex.Message}");
                    }
                }

                var removedDetailsList = currentAssignments.Select(a => 
                    $"{a.GenericName} (Qty: {a.Quantity})").ToList();

                var successMessage = $"Successfully replaced medicine assignments. " +
                            $"Removed: {string.Join(", ", removedDetailsList)}. " +
                            $"Assigned {assignedCount} new medicine(s).";
                
                if (errors.Count > 0)
                {
                    successMessage += $" Warnings: {string.Join(", ", errors)}";
                }

                return new Response<string>(successMessage);
            }
            catch (Exception ex)
            {
                return new Response<string>(null, $"An error occurred: {ex.Message}");
            }
        }

        public async Task<Response<string>> UpdatePatientMedicineQuantity(int patientId, int medicineId, int quantityChange, string operation)
        {
            try
            {
                // Verify the patient-medicine relationship exists
                string checkQuery = @"
                    SELECT Id, Quantity FROM PatientMedicines 
                    WHERE PatientId = @PatientId AND MedicineId = @MedicineId";

                var checkParameters = new DynamicParameters();
                checkParameters.Add("@PatientId", patientId);
                checkParameters.Add("@MedicineId", medicineId);

                var existingAssignment = await _dapperServiceAsync.QuerySingleAsync<dynamic>(
                    checkQuery,
                    Connection.LoveBoracayDB,
                    checkParameters,
                    CommandType.Text
                );

                if (existingAssignment == null)
                {
                    return new Response<string>(null, "Medicine is not assigned to this patient.");
                }

                // Get current medicine stock
                string stockQuery = @"
                    SELECT Stock FROM Medicines 
                    WHERE Id = @MedicineId";

                var stockParameters = new DynamicParameters();
                stockParameters.Add("@MedicineId", medicineId);

                var medicineStock = await _dapperServiceAsync.QuerySingleAsync<int>(
                    stockQuery,
                    Connection.LoveBoracayDB,
                    stockParameters,
                    CommandType.Text
                );

                // Calculate new quantities based on operation
                int currentPatientQuantity = existingAssignment.Quantity ?? 0;
                int newPatientQuantity = operation.ToLower() == "issuance" 
                    ? currentPatientQuantity + quantityChange 
                    : currentPatientQuantity - quantityChange;

                // Calculate new stock based on operation
                int newStock = operation.ToLower() == "issuance" 
                    ? medicineStock - quantityChange 
                    : medicineStock + quantityChange;

                // Ensure quantities don't go negative
                if (newPatientQuantity < 0)
                {
                    return new Response<string>(null, $"Insufficient patient quantity. Current: {currentPatientQuantity}, Requested: {quantityChange}");
                }

                if (newStock < 0)
                {
                    return new Response<string>(null, $"Insufficient stock. Current: {medicineStock}, Requested: {quantityChange}");
                }

                // Update both PatientMedicine quantity and Medicine stock in a transaction-like manner
                string updatePatientQuery = @"
                    UPDATE PatientMedicines 
                    SET Quantity = @NewPatientQuantity
                    WHERE PatientId = @PatientId AND MedicineId = @MedicineId";

                string updateStockQuery = @"
                    UPDATE Medicines 
                    SET Stock = @NewStock
                    WHERE Id = @MedicineId";

                var updatePatientParameters = new DynamicParameters();
                updatePatientParameters.Add("@PatientId", patientId);
                updatePatientParameters.Add("@MedicineId", medicineId);
                updatePatientParameters.Add("@NewPatientQuantity", newPatientQuantity);

                var updateStockParameters = new DynamicParameters();
                updateStockParameters.Add("@MedicineId", medicineId);
                updateStockParameters.Add("@NewStock", newStock);

                // Update patient quantity
                var patientResult = await _dapperServiceAsync.ExecuteAsync(
                    updatePatientQuery,
                    Connection.LoveBoracayDB,
                    updatePatientParameters,
                    CommandType.Text
                );

                // Update medicine stock
                var stockResult = await _dapperServiceAsync.ExecuteAsync(
                    updateStockQuery,
                    Connection.LoveBoracayDB,
                    updateStockParameters,
                    CommandType.Text
                );

                if (patientResult <= 0 || stockResult <= 0)
                {
                    return new Response<string>(null, "Failed to update patient medicine quantity and stock.");
                }

                string operationText = operation.ToLower() == "issuance" ? "issued" : "returned";
                return new Response<string>($"Medicine {operationText} successfully. Patient quantity: {newPatientQuantity}, Stock: {newStock}");
            }
            catch (Exception ex)
            {
                return new Response<string>(null, $"Error updating patient medicine quantity: {ex.Message}");
            }
        }

        public async Task<Response<string>> UpdatePatientAdmissionStatus(int patientId, bool isAdmitted)
        {
            try
            {
                // Verify the patient exists
                var patient = await GetPatientById(patientId);
                if (patient == null)
                {
                    return new Response<string>(null, "Patient not found.");
                }

                string query = @"
                    UPDATE Patients 
                    SET IsAdmitted = @IsAdmitted
                    WHERE Id = @Id";

                var parameters = new DynamicParameters();
                parameters.Add("@Id", patientId);
                parameters.Add("@IsAdmitted", isAdmitted);

                var result = await _dapperServiceAsync.ExecuteAsync(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                if (result <= 0)
                {
                    return new Response<string>(null, "Failed to update patient admission status.");
                }

                string statusText = isAdmitted ? "admitted" : "discharged";
                return new Response<string>($"Patient admission status updated successfully. Patient is now {statusText}.");
            }
            catch (Exception ex)
            {
                return new Response<string>(null, $"Error updating patient admission status: {ex.Message}");
            }
        }
    }
}
