using System.Collections.Generic;
using System.Threading.Tasks;
using Api.Entity.Account;
using Api.Web.Response;

namespace Api.Interface
{
    public interface ICustomAuditServiceAsync
    {
        Task<Response> CreateAudit(Audit auditDto);
        Task<IEnumerable<Audit>> GetAllAudits();
        Task<Response> UpdateAudit(Audit auditDto);
        Task<Audit> GetAuditById(int id);
        Task<Response> DeleteAudit(int id);
    }
}
