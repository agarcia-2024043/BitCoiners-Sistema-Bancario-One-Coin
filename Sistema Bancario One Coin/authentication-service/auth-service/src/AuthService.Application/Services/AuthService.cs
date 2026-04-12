using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;

namespace AuthService.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IJwtService _jwt;
    private readonly IEmailService _emailService;

    public AuthService(IUserRepository users, IJwtService jwt, IEmailService emailService)
    {
        _users = users;
        _jwt = jwt;
        _emailService = emailService;
    }

    public async Task<AuthResponseDto> Login(LoginDto dto)
    {
        var user = await _users.GetByEmailAsync(dto.Email);

        if (user == null)
            return new AuthResponseDto { Success = false, Message = "Credenciales inválidas" };

        if (user.IsLocked)
            return new AuthResponseDto { Success = false, Message = "Cuenta bloqueada temporalmente." };

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5) user.IsLocked = true;

            await _users.UpdateAsync(user);
            return new AuthResponseDto { Success = false, Message = "Credenciales inválidas" };
        }

        user.FailedLoginAttempts = 0;
        user.LastLogin = DateTime.UtcNow;
        await _users.UpdateAsync(user);

        return new AuthResponseDto
        {
            Success = true,
            Token = _jwt.GenerateToken(user),
            RefreshToken = _jwt.GenerateRefreshToken(),
            User = new UserDetailsDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                Role = user.MainRole
            }
        };
    }

    public async Task<AuthResponseDto> Register(RegisterDto dto)
    {
        if (!IsPasswordStrong(dto.Password))
            return new AuthResponseDto { Success = false, Message = "La contraseña no cumple los requisitos bancarios." };

        if (await _users.ExistsAsync(dto.Email))
            return new AuthResponseDto { Success = false, Message = "El email ya está registrado" };

        // Buscar el rol "Cliente" en la base de datos
        // Los roles fueron sembrados en ApplicationDbContext con HasData()
        var clienteRole = await _users.GetRoleByNameAsync("Cliente");

        if (clienteRole == null)
            return new AuthResponseDto { Success = false, Message = "Error de configuración: rol 'Cliente' no encontrado." };

        var newUser = new User
        {
            Email = dto.Email,
            Username = dto.Email, // usar email como username por defecto
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 12),
            EmailConfirmed = false,
            VerificationToken = Guid.NewGuid().ToString(),
            UserRoles = new List<UserRole>
            {
                // Asignamos RoleId con el Guid real del rol "Cliente"
                new UserRole { RoleId = clienteRole.Id }
            }
        };

        await _users.AddAsync(newUser);

        await _emailService.SendEmailAsync(
            newUser.Email,
            "Bienvenido a OneCoin",
            "Verifique su cuenta bancaria."
        );

        return new AuthResponseDto { Success = true, Message = "Registro exitoso. Verifique su email." };
    }

    public async Task<bool> VerifyEmail(string token)
    {
        var user = await _users.GetByVerificationTokenAsync(token);

        if (user == null) return false;

        user.EmailConfirmed = true;
        user.VerificationToken = null;
        await _users.UpdateAsync(user);

        await _emailService.SendEmailAsync(user.Email, "Cuenta Activada", "Su correo ha sido verificado.");

        return true;
    }

    public async Task ForgotPassword(string email)
    {
        var user = await _users.GetByEmailAsync(email);
        if (user != null)
        {
            user.ResetToken = Guid.NewGuid().ToString();
            user.ResetTokenExpires = DateTime.UtcNow.AddHours(1);
            await _users.UpdateAsync(user);
            await _emailService.SendEmailAsync(email, "Recuperación", $"Token: {user.ResetToken}");
        }
    }

    public async Task ResetPassword(ResetPasswordDto dto)
    {
        var user = await _users.GetByResetTokenAsync(dto.Token);

        if (user == null || user.ResetTokenExpires < DateTime.UtcNow)
            throw new Exception("El token es inválido o ha expirado.");

        if (!IsPasswordStrong(dto.NewPassword))
            throw new Exception("La contraseña no cumple los requisitos mínimos.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword, 12);
        user.ResetToken = null;
        user.ResetTokenExpires = null;

        await _users.UpdateAsync(user);
        await _emailService.SendEmailAsync(user.Email, "Seguridad", "Su contraseña ha sido restablecida.");
    }

    private bool IsPasswordStrong(string pw) =>
        pw.Length >= 8 &&
        pw.Any(char.IsUpper) &&
        pw.Any(char.IsDigit) &&
        pw.Any(c => !char.IsLetterOrDigit(c));
}