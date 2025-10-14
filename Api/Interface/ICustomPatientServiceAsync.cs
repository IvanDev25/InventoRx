using Api.Entity.Account;
using System.Collections.Generic;
using System.Threading.Tasks;
using Api.Web.Response;

namespace Api.Interface
{
    public interface ICustomPatientServiceAsync
    {
        Task<Response<string>> CreatePatient(Patient patientDto);
        Task<Patient> GetPatientById(int id);
        Task<List<Patient>> GetAllPatients();
        Task<Response> UpdatePatient(Patient patientDto);
        Task<Response> DeletePatient(int id);
        Task<Response<string>> AssignMedicinesToPatient(int patientId, List<int> medicineIds);
        Task<Response<string>> RemoveMedicinesFromPatient(int patientId, List<int> medicineIds);
        Task<List<Medicine>> GetAssignedMedicines(int patientId);
        Task<List<Medicine>> GetUnassignedMedicines(int patientId);
        Task<Response<string>> ReplacePatientMedicines(int patientId, List<int> medicineIds);
        Task<Response<string>> UpdatePatientMedicineQuantity(int patientId, int medicineId, int quantityChange, string operation);
        Task<Response<string>> UpdatePatientAdmissionStatus(int patientId, bool isAdmitted);
    }
}
