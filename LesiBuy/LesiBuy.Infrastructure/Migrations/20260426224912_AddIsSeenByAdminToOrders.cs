using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LesiBuy.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsSeenByAdminToOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSeenByAdmin",
                table: "Orders",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSeenByAdmin",
                table: "Orders");
        }
    }
}
