using Api.Entity.Account;
using Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Api.Data
{
    public class Context : IdentityDbContext<User>
    {
        public Context(DbContextOptions<Context> options) : base(options)
        {
        }

        public DbSet<Team> Teams { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<Manager> Managers { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<City> City { get; set; }
        public DbSet<Country> Country { get; set; }
        public DbSet<Event> Event { get; set; }
        public DbSet<AdminPermission> AdminPermissions { get; set; }

        //add-migration AddingEntityToDatabase -o Data/Migrations

        // New tables
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<MedicineSupplier> MedicineSuppliers { get; set; }
        public DbSet<Audit> Audits { get; set; }
        public DbSet<PatientMedicine> PatientMedicines { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure all tables to use lowercase names (MySQL on Linux requirement)
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                var tableName = entityType.GetTableName();
                if (tableName != null)
                {
                    entityType.SetTableName(tableName.ToLowerInvariant());
                }
            }

            // Configure Medicine ↔ MedicineSupplier relationship
            modelBuilder.Entity<Medicine>()
                .HasOne(m => m.MedicineSupplier)
                .WithMany(s => s.Medicines)
                .HasForeignKey(m => m.MedicineSupplierId);

            // Configure many-to-many relationship between Patient and Medicine
            modelBuilder.Entity<PatientMedicine>()
                .HasKey(pm => pm.Id);

            modelBuilder.Entity<PatientMedicine>()
                .HasOne(pm => pm.Patient)
                .WithMany(p => p.PatientMedicines)
                .HasForeignKey(pm => pm.PatientId);

            modelBuilder.Entity<PatientMedicine>()
                .HasOne(pm => pm.Medicine)
                .WithMany(m => m.PatientMedicines)
                .HasForeignKey(pm => pm.MedicineId);

            // Ensure unique combination of Patient and Medicine
            modelBuilder.Entity<PatientMedicine>()
                .HasIndex(pm => new { pm.PatientId, pm.MedicineId })
                .IsUnique();
        }
    }
}
