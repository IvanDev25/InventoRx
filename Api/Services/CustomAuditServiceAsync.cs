using Api.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data;
using Api.Constant;
using Api.Entity.Account;
using Dapper;
using Api.Web.Response;
using System;

namespace Api.Services
{
    public class CustomAuditServiceAsync : ICustomAuditServiceAsync
    {
        private readonly IDapperServiceAsync _dapperServiceAsync;

        public CustomAuditServiceAsync(IDapperServiceAsync dapperServiceAsync)
        {
            _dapperServiceAsync = dapperServiceAsync;
        }

        public async Task<Response> CreateAudit(Audit auditDto)
        {
            try
            {
                string query = @"
                    INSERT INTO Audits (
                        Name, Description, CreatedToday)
                    VALUES (
                        @Name, @Description, @CreatedToday);";

                var parameters = new DynamicParameters();
                parameters.Add("@Name", auditDto.Name);
                parameters.Add("@Description", auditDto.Description);
                parameters.Add("@CreatedToday", auditDto.CreatedToday);

                int result = await _dapperServiceAsync.ExecuteAsync(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                return result > 0
                    ? new Response()
                    : new Response("Failed to create audit record.");
            }
            catch (Exception ex)
            {
                return new Response($"Error: {ex.Message}");
            }
        }

        public async Task<IEnumerable<Audit>> GetAllAudits()
        {
            try
            {
                string query = @"
                    SELECT 
                        Id,
                        Name,
                        Description,
                        CreatedToday
                    FROM Audits
                    ORDER BY CreatedToday DESC";

                var result = await _dapperServiceAsync.GetAll<Audit>(
                    query,
                    Connection.LoveBoracayDB,
                    null,
                    CommandType.Text
                );

                return result ?? new List<Audit>();
            }
            catch (Exception)
            {
                return new List<Audit>();
            }
        }

        public async Task<Audit> GetAuditById(int id)
        {
            try
            {
                string query = @"
                    SELECT 
                        Id,
                        Name,
                        Description,
                        CreatedToday
                    FROM Audits
                    WHERE Id = @Id";

                var parameters = new DynamicParameters();
                parameters.Add("@Id", id);

                var data = await _dapperServiceAsync.Get<Audit>(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                return data ?? new Audit();
            }
            catch (Exception)
            {
                return new Audit();
            }
        }

        public async Task<Response> UpdateAudit(Audit auditDto)
        {
            try
            {
                string query = @"
                    UPDATE Audits 
                    SET 
                        Name = @Name,
                        Description = @Description,
                        CreatedToday = @CreatedToday
                    WHERE Id = @Id";

                var parameters = new DynamicParameters();
                parameters.Add("@Id", auditDto.Id);
                parameters.Add("@Name", auditDto.Name);
                parameters.Add("@Description", auditDto.Description);
                parameters.Add("@CreatedToday", auditDto.CreatedToday);

                int result = await _dapperServiceAsync.ExecuteAsync(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                return result > 0
                    ? new Response()
                    : new Response("Failed to update audit record.");
            }
            catch (Exception ex)
            {
                return new Response($"Error: {ex.Message}");
            }
        }

        public async Task<Response> DeleteAudit(int id)
        {
            try
            {
                string query = @"
                    DELETE FROM Audits 
                    WHERE Id = @Id";

                var parameters = new DynamicParameters();
                parameters.Add("@Id", id);

                int result = await _dapperServiceAsync.ExecuteAsync(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                return result > 0
                    ? new Response()
                    : new Response("Failed to delete audit record.");
            }
            catch (Exception ex)
            {
                return new Response($"Error: {ex.Message}");
            }
        }
    }
}
