using System.Collections.Generic;

namespace Api.ViewModel
{
    public class PatientMedicineAssignmentViewModel
    {
        public int PatientId { get; set; }
        public List<int> MedicineIds { get; set; }
    }
}

