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
    public class MedicineSupplierController : ControllerBase
    {
        private readonly ICustomMedicineSupplierServiceAsync _customMedicineSupplierServiceAsync;

        public MedicineSupplierController(ICustomMedicineSupplierServiceAsync customMedicineSupplierServiceAsync)
        {
            _customMedicineSupplierServiceAsync = customMedicineSupplierServiceAsync;
        }

        [HttpPost]
        public async Task<IActionResult> CreateMedicineSupplier([FromBody] MedicineSupplier medicineSupplierDto)
        {
            try
            {
                var result = await _customMedicineSupplierServiceAsync.CreateMedicineSupplier(medicineSupplierDto);

                if (result.HasError)
                {
                    return BadRequest(result);
                }

                return Ok(result); // ✅ FIXED (was: return Ok(result.Data))
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMedicineSupplierById(int id)
        {
            try
            {
                var result = await _customMedicineSupplierServiceAsync.GetMedicineSupplierById(id);
                if (result == null)
                    return NotFound("Medicine supplier not found");

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMedicineSuppliers()
        {
            try
            {
                var result = await _customMedicineSupplierServiceAsync.GetAllMedicineSuppliers();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateMedicineSupplier([FromBody] MedicineSupplier medicineSupplierDto)
        {
            try
            {
                var result = await _customMedicineSupplierServiceAsync.UpdateMedicineSupplier(medicineSupplierDto);
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
        public async Task<IActionResult> DeleteMedicineSupplier(int id)
        {
            try
            {
                var response = await _customMedicineSupplierServiceAsync.DeleteMedicineSupplier(id);
                if (response.HasError)
                    return NotFound(response.ErrorMessage);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}

