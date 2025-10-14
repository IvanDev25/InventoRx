using Api.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using Api.Entity.Account;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditController : ControllerBase
    {
        private readonly ICustomAuditServiceAsync _customAuditServiceAsync;

        public AuditController(ICustomAuditServiceAsync customAuditServiceAsync)
        {
            _customAuditServiceAsync = customAuditServiceAsync;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAudit(Audit auditDto)
        {
            try
            {
                var item = await _customAuditServiceAsync.CreateAudit(auditDto);

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAudits()
        {
            try
            {
                var result = await _customAuditServiceAsync.GetAllAudits();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAuditById(int id)
        {
            try
            {
                var result = await _customAuditServiceAsync.GetAuditById(id);

                if (result == null || result.Id == 0)
                {
                    return NotFound($"Audit record not found with id: {id}");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAudit(Audit auditDto)
        {
            try
            {
                var result = await _customAuditServiceAsync.UpdateAudit(auditDto);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAudit(int id)
        {
            try
            {
                var result = await _customAuditServiceAsync.DeleteAudit(id);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
