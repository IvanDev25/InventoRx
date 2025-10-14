namespace Api.Entity.Account
{
    public class PatientMedicine
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int MedicineId { get; set; }
        public int Quantity { get; set; } = 0; // Default to 0 for new assignments
        
        // Navigation properties
        public Patient Patient { get; set; }
        public Medicine Medicine { get; set; }
    }
}
