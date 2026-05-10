using AuthService.Persistence.Data;
using AuthService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
public static class DataSeeder
{
    public static async Task SeedAdminAsync(ApplicationDbContext db)
    {
        var adminRole = await db.Role.FirstOrDefaultAsync(r => r.Name == "Admin");
        if (adminRole == null)
        {
            adminRole = new Role { Id = Guid.NewGuid(), Name = "Admin", Description = "Administrador del banco" };
            db.Role.Add(adminRole);
        }

        var clienteRole = await db.Role.FirstOrDefaultAsync(r => r.Name == "Cliente");
        if (clienteRole == null)
        {
            clienteRole = new Role { Id = Guid.NewGuid(), Name = "Cliente", Description = "Cliente del banco" };
            db.Role.Add(clienteRole);
        }

        var adminExists = await db.User.AnyAsync(u => u.Email == "agarcia-2024043@kinal.edu.gt");
        if (!adminExists)
        {
            var admin = new User
            {
                Id = Guid.NewGuid(),
                Email = "agarcia-2024043@kinal.edu.gt",
                Username = "agarcia",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!", 12),
                IsActive = true,
                EmailConfirmed = true,
            };
            admin.UserRoles.Add(new UserRole { RoleId = adminRole.Id });
            db.User.Add(admin);
        }

        await db.SaveChangesAsync();
    }
}