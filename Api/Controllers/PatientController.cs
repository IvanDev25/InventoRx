using Api.Interface;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Api.Entity.Account;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly ICustomPatientServiceAsync _customPatientServiceAsync;

        public PatientController(ICustomPatientServiceAsync customPatientServiceAsync)
        {
            _customPatientServiceAsync = customPatientServiceAsync;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePatient([FromBody] Patient patientDto)
        {
            try
            {
                var result = await _customPatientServiceAsync.CreatePatient(patientDto);

                if (result.HasError)
                {
                    return BadRequest(result.ErrorMessage);
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPatientById(int id)
        {
            try
            {
                var result = await _customPatientServiceAsync.GetPatientById(id);
                if (result == null)
                    return NotFound("Patient not found");

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPatients()
        {
            try
            {
                var result = await _customPatientServiceAsync.GetAllPatients();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdatePatient([FromBody] Patient patientDto)
        {
            try
            {
                var result = await _customPatientServiceAsync.UpdatePatient(patientDto);
                if (result.HasError)
                    return BadRequest(result.ErrorMessage);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatientById(int id, [FromBody] Patient patientDto)
        {
            try
            {
                // Ensure the ID in the URL matches the ID in the body
                patientDto.Id = id;
                var result = await _customPatientServiceAsync.UpdatePatient(patientDto);
                if (result.HasError)
                    return BadRequest(result.ErrorMessage);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            try
            {
                var response = await _customPatientServiceAsync.DeletePatient(id);
                if (response.HasError)
                    return NotFound(response.ErrorMessage);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("{patientId}/assign-medicines")]
        public async Task<IActionResult> AssignMedicinesToPatient(int patientId, [FromBody] List<int> medicineIds)
        {
            try
            {
                var result = await _customPatientServiceAsync.AssignMedicinesToPatient(patientId, medicineIds);

                if (result.HasError)
                {
                    return BadRequest(result.ErrorMessage);
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{patientId}/remove-medicines")]
        public async Task<IActionResult> RemoveMedicinesFromPatient(int patientId, [FromBody] List<int> medicineIds)
        {
            try
            {
                var result = await _customPatientServiceAsync.RemoveMedicinesFromPatient(patientId, medicineIds);

                if (result.HasError)
                {
                    return BadRequest(result.ErrorMessage);
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{patientId}/assigned-medicines")]
        public async Task<IActionResult> GetAssignedMedicines(int patientId)
        {
            try
            {
                var result = await _customPatientServiceAsync.GetAssignedMedicines(patientId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{patientId}/unassigned-medicines")]
        public async Task<IActionResult> GetUnassignedMedicines(int patientId)
        {
            try
            {
                var result = await _customPatientServiceAsync.GetUnassignedMedicines(patientId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{patientId}/replace-medicines")]
        public async Task<IActionResult> ReplacePatientMedicines(int patientId, [FromBody] List<int> medicineIds)
        {
            try
            {
                var result = await _customPatientServiceAsync.ReplacePatientMedicines(patientId, medicineIds);

                if (result.HasError)
                {
                    return BadRequest(result.ErrorMessage);
                }

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{patientId}/medicines/{medicineId}/quantity")]
        public async Task<IActionResult> UpdatePatientMedicineQuantity(int patientId, int medicineId, [FromBody] UpdateQuantityRequest request)
        {
            try
            {
                var result = await _customPatientServiceAsync.UpdatePatientMedicineQuantity(patientId, medicineId, request.QuantityChange, request.Operation);

                if (result.HasError)
                {
                    return BadRequest(new { message = result.ErrorMessage });
                }

                return Ok(new { message = result.Data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{patientId}/admission-status")]
        public async Task<IActionResult> UpdatePatientAdmissionStatus(int patientId, [FromBody] UpdateAdmissionStatusRequest request)
        {
            try
            {
                var result = await _customPatientServiceAsync.UpdatePatientAdmissionStatus(patientId, request.IsAdmitted);

                if (result.HasError)
                {
                    return BadRequest(new { message = result.ErrorMessage });
                }

                return Ok(new { message = result.Data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class UpdateQuantityRequest
    {
        public int QuantityChange { get; set; }
        public string Operation { get; set; } // "issuance" or "return"
    }

    public class UpdateAdmissionStatusRequest
    {
        public bool IsAdmitted { get; set; }
    }
}

