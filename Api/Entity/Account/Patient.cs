using System;
using System.Collections.Generic;
using System.Linq;

namespace Api.Entity.Account
{
    public class Patient
    {
        public int Id { get; set; }
        public string PatientName { get; set; }
        public bool IsAdmitted { get; set; } = false;

        public DateTime DateCreated { get; set; } = DateTime.UtcNow;

        // Many-to-many relationship through junction table
        public virtual ICollection<PatientMedicine> PatientMedicines { get; set; } = new List<PatientMedicine>();
        
        // Helper property to get medicines directly (for convenience)
        public IEnumerable<Medicine> Medicines 
        { 
            get 
            { 
                return PatientMedicines?.Select(pm => pm.Medicine) ?? new List<Medicine>(); 
            } 
        }
    }
}
