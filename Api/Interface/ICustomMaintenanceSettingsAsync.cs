using System.Threading.Tasks;
using Api.Entity.Account;
using Api.Web.Response;

namespace Api.Interface
{
    public interface ICustomMaintenanceSettingsAsync
    {
        Task<MaintenanceSettings> GetMaintenanceSettings();
        Task<Response> UpdateMaintenanceSettings(MaintenanceSettings maintenanceSettings);
    }
}

