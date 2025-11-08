using Api.Interface;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using Api.Entity.Account;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaintenanceSettingsController : ControllerBase
    {
        private readonly ICustomMaintenanceSettingsAsync _customMaintenanceSettingsAsync;

        public MaintenanceSettingsController(ICustomMaintenanceSettingsAsync customMaintenanceSettingsAsync)
        {
            _customMaintenanceSettingsAsync = customMaintenanceSettingsAsync;
        }

        [HttpGet]
        public async Task<IActionResult> GetMaintenanceSettings()
        {
            try
            {
                var result = await _customMaintenanceSettingsAsync.GetMaintenanceSettings();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateMaintenanceSettings([FromBody] MaintenanceSettings maintenanceSettings)
        {
            try
            {
                var result = await _customMaintenanceSettingsAsync.UpdateMaintenanceSettings(maintenanceSettings);
                
                if (result.HasError)
                    return BadRequest(new { message = result.ErrorMessage });

                return Ok(new { message = "Maintenance settings updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}

