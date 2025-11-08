using Api.Interface;
using System.Threading.Tasks;
using System.Data;
using Api.Constant;
using Api.Entity.Account;
using Dapper;
using Api.Web.Response;
using System;

namespace Api.Services
{
    public class CustomMaintenanceSettingsAsync : ICustomMaintenanceSettingsAsync
    {
        private readonly IDapperServiceAsync _dapperServiceAsync;

        public CustomMaintenanceSettingsAsync(IDapperServiceAsync dapperServiceAsync)
        {
            _dapperServiceAsync = dapperServiceAsync;
        }

        public async Task<MaintenanceSettings> GetMaintenanceSettings()
        {
            try
            {
                string query = @"
                    SELECT Id, Display
                    FROM MaintenanceSettings
                    WHERE Id = 1";

                var parameters = new DynamicParameters();

                var data = await _dapperServiceAsync.Get<MaintenanceSettings>(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                // If no record exists, return default settings with Id = 0 to indicate it doesn't exist
                if (data == null)
                {
                    return new MaintenanceSettings { Id = 0, Display = false };
                }

                return data;
            }
            catch (Exception ex)
            {
                // Return default settings on error with Id = 0 to indicate it doesn't exist
                return new MaintenanceSettings { Id = 0, Display = false };
            }
        }

        public async Task<Response> UpdateMaintenanceSettings(MaintenanceSettings maintenanceSettings)
        {
            if (maintenanceSettings == null)
                return new Response("Maintenance settings data is required.");

            try
            {
                // First check if record exists
                var existing = await GetMaintenanceSettings();

                string query;
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@Display", maintenanceSettings.Display);

                if (existing.Id == 0)
                {
                    // Insert new record
                    query = @"
                        INSERT INTO MaintenanceSettings (Id, Display)
                        VALUES (1, @Display)";
                }
                else
                {
                    // Update existing record
                    query = @"
                        UPDATE MaintenanceSettings
                        SET Display = @Display
                        WHERE Id = 1";
                }

                int result = await _dapperServiceAsync.ExecuteAsync(
                    query,
                    Connection.LoveBoracayDB,
                    parameters,
                    CommandType.Text
                );

                return result > 0
                    ? new Response()
                    : new Response("Failed to update maintenance settings.");
            }
            catch (Exception ex)
            {
                return new Response($"Error: {ex.Message}");
            }
        }
    }
}

