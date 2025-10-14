using System;
using System.Collections.Generic;
using System.Linq;

namespace Api.Entity.Account
{
    public class Medicine
    {
        public int Id { get; set; }
        public string GenericName { get; set; }
        public int Issuance { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public DateTime ExpirationDate { get; set; }
        public int Return { get; set; }
        public int Refill { get; set; }
        public int MedicineSupplierId { get; set; }
        public MedicineSupplier MedicineSupplier { get; set; }
        
        // Many-to-many relationship through junction table
        public virtual ICollection<PatientMedicine> PatientMedicines { get; set; } = new List<PatientMedicine>();
        
        // Helper property to get patients directly (for convenience)
        public IEnumerable<Patient> Patients 
        { 
            get 
            { 
                return PatientMedicines?.Select(pm => pm.Patient) ?? new List<Patient>(); 
            } 
        }
        // Computed property for status
        public string Status 
        { 
            get 
            {
                bool isLowStock = Stock < 20;
                bool isExpiringSoon = ExpirationDate <= DateTime.Now.AddMonths(1);
                
                if (isLowStock && isExpiringSoon)
                {
                    return "Low Stock, expiry soon";
                }
                else if (isLowStock)
                {
                    return "Low Stock";
                }
                else if (isExpiringSoon)
                {
                    return "In Stock, expiry soon";
                }
                else
                {
                    return "In Stock";
                }
            }
        }

        /// <summary>
        /// Refills the medicine stock by adding the specified quantity
        /// </summary>
        /// <param name="refillQuantity">The quantity to add to the stock</param>
        /// <returns>The new stock quantity after refill</returns>
        public int AddRefill(int refillQuantity)
        {
            if (refillQuantity <= 0)
            {
                throw new ArgumentException("Refill quantity must be greater than 0", nameof(refillQuantity));
            }

            Refill += refillQuantity;
            Stock += refillQuantity;
            return Stock;
        }

        /// <summary>
        /// Returns medicine to stock by adding the specified quantity
        /// </summary>
        /// <param name="returnQuantity">The quantity to return to stock</param>
        /// <returns>The new stock quantity after return</returns>
        public int AddReturn(int returnQuantity)
        {
            if (returnQuantity <= 0)
            {
                throw new ArgumentException("Return quantity must be greater than 0", nameof(returnQuantity));
            }

            Return += returnQuantity;
            Stock += returnQuantity;
            return Stock;
        }

        /// <summary>
        /// Gets the total refill quantity for this medicine
        /// </summary>
        /// <returns>Total refill quantity</returns>
        public int GetTotalRefill()
        {
            return Refill;
        }

        /// <summary>
        /// Gets the total return quantity for this medicine
        /// </summary>
        /// <returns>Total return quantity</returns>
        public int GetTotalReturn()
        {
            return Return;
        }

    }
}
