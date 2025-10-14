using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class EditpatientEntityAgain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_Patients_PatientId",
                table: "Medicines");

            migrationBuilder.DropIndex(
                name: "IX_Medicines_PatientId",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "PatientId",
                table: "Medicines");

            migrationBuilder.CreateTable(
                name: "MedicinePatient",
                columns: table => new
                {
                    MedicinesId = table.Column<int>(type: "int", nullable: false),
                    PatientsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicinePatient", x => new { x.MedicinesId, x.PatientsId });
                    table.ForeignKey(
                        name: "FK_MedicinePatient_Medicines_MedicinesId",
                        column: x => x.MedicinesId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MedicinePatient_Patients_PatientsId",
                        column: x => x.PatientsId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PatientMedicines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    MedicineId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientMedicines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientMedicines_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PatientMedicines_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedicinePatient_PatientsId",
                table: "MedicinePatient",
                column: "PatientsId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientMedicines_MedicineId",
                table: "PatientMedicines",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientMedicines_PatientId_MedicineId",
                table: "PatientMedicines",
                columns: new[] { "PatientId", "MedicineId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MedicinePatient");

            migrationBuilder.DropTable(
                name: "PatientMedicines");

            migrationBuilder.AddColumn<int>(
                name: "PatientId",
                table: "Medicines",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_PatientId",
                table: "Medicines",
                column: "PatientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_Patients_PatientId",
                table: "Medicines",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id");
        }
    }
}
