using System;
using System.Collections.Generic;

namespace Api.Entity.Account
{
    public class MedicineSupplier
    {
        public int Id { get; set; }
        public string SupplierName { get; set; }

        public List<Medicine> Medicines { get; set; } = new List<Medicine>();

    }
}
