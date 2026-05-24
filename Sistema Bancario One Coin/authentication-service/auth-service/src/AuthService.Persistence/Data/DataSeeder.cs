using AuthService.Persistence.Data;
using AuthService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public static class DataSeeder
{
    // ─── Agrega aquí los admins autorizados ───────────────────────────────
    // Solo estos correos @kinal.edu.gt tendrán rol Admin.
    // Cualquier otro @kinal.edu.gt que se registre entra como Cliente.
    private static readonly List<(string Email, string Username, string Password)> AdminUsers = new()
    {
        ("agarcia-2024043@kinal.edu.gt", "agarcia", "Admin123!"),
        // ("otroAdmin-2024001@kinal.edu.gt", "otroAdmin", "Admin123!"),
    };

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

        await db.SaveChangesAsync();

        foreach (var (email, username, password) in AdminUsers)
        {
            var exists = await db.User.AnyAsync(u => u.Email == email);
            if (!exists)
            {
                var admin = new User
                {
                    Id             = Guid.NewGuid(),
                    Email          = email,
                    Username       = username,
                    PasswordHash   = BCrypt.Net.BCrypt.HashPassword(password, 12),
                    IsActive       = true,
                    EmailConfirmed = true,
                };
                admin.UserRoles.Add(new UserRole { RoleId = adminRole.Id });
                db.User.Add(admin);
            }
        }

        await db.SaveChangesAsync();
    }
}