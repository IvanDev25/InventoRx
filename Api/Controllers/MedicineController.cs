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
    public class MedicineController : ControllerBase
    {
        private readonly ICustomMedicineServiceAsync _customMedicineServiceAsync;

        public MedicineController(ICustomMedicineServiceAsync customMedicineServiceAsync)
        {
            _customMedicineServiceAsync = customMedicineServiceAsync;
        }

        [HttpPost]
        public async Task<IActionResult> CreateMedicine([FromBody] Medicine medicineDto)
        {
            try
            {
                var result = await _customMedicineServiceAsync.CreateMedicine(medicineDto);

                if (result.HasError)
                {
                    return BadRequest(new { message = result.ErrorMessage });
                }

                // ✅ Always return JSON with a message property
                return Ok(new { message = result.Data ?? "Medicine added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }



        [HttpPost("multiple")]
        public async Task<IActionResult> CreateMedicines([FromBody] List<Medicine> medicinesDto)
        {
            try
            {
                var result = await _customMedicineServiceAsync.CreateMedicines(medicinesDto);

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
        public async Task<IActionResult> GetMedicineById(int id)
        {
            try
            {
                var result = await _customMedicineServiceAsync.GetMedicineById(id);
                if (result == null)
                    return NotFound("Medicine not found");

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMedicines()
        {
            try
            {
                var result = await _customMedicineServiceAsync.GetAllMedicines();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateMedicine([FromBody] Medicine medicineDto)
        {
            try
            {
                var result = await _customMedicineServiceAsync.UpdateMedicine(medicineDto);
                if (result.HasError)
                    return BadRequest(result.ErrorMessage);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("multiple")]
        public async Task<IActionResult> UpdateMedicines([FromBody] List<Medicine> medicinesDto)
        {
            try
            {
                var result = await _customMedicineServiceAsync.UpdateMedicines(medicinesDto);
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
        public async Task<IActionResult> DeleteMedicine(int id)
        {
            try
            {
                var response = await _customMedicineServiceAsync.DeleteMedicine(id);
                if (response.HasError)
                    return NotFound(response.ErrorMessage);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("{id}/refill")]
        public async Task<IActionResult> RefillMedicine(int id, [FromBody] RefillRequest request)
        {
            try
            {
                var result = await _customMedicineServiceAsync.RefillMedicine(id, request.Quantity);
                if (result.HasError)
                    return BadRequest(new { message = result.ErrorMessage });

                return Ok(new { message = result.Data ?? "Medicine refilled successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class RefillRequest
    {
        public int Quantity { get; set; }
    }
}
