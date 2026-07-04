using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AuthService.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IJwtService _jwt;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;

    private const string AdminDomain = "kinal.edu.gt";

    public AuthService(IUserRepository users, IJwtService jwt,
                       IEmailService emailService, IConfiguration config)
    {
        _users        = users;
        _jwt          = jwt;
        _emailService = emailService;
        _config       = config;
    }

    // ── Login ────────────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> Login(LoginDto dto)
    {
        var user = await _users.GetByEmailAsync(dto.Email);

        if (user == null)
            return new AuthResponseDto { Success = false, Message = "Credenciales inválidas" };

        if (!user.IsActive)
            return new AuthResponseDto { Success = false, Message = "Cuenta deshabilitada. Contacta al administrador." };

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

        var effectiveRole = ResolveEffectiveRole(user);

        return new AuthResponseDto
        {
            Success      = true,
            Message      = "Login exitoso",
            Token        = _jwt.GenerateToken(user),
            RefreshToken = _jwt.GenerateRefreshToken(),
            User = new UserDetailsDto
            {
                Id            = user.Id.ToString(),
                Username      = user.Username,
                Email         = user.Email,
                Role          = effectiveRole,
                IsActive      = user.IsActive,
                FullName      = user.FullName,
                Dpi           = user.Dpi,
                Address       = user.Address,
                PhoneNumber   = user.PhoneNumber,
                JobName       = user.JobName,
                MonthlyIncome = user.MonthlyIncome,
            }
        };
    }

    /// <summary>
    /// @kinal.edu.gt + rol Admin en BD  →  Admin
    /// Cualquier otro caso              →  Cliente
    /// </summary>
    private static string ResolveEffectiveRole(User user)
    {
        var emailDomain  = user.Email.Split('@').LastOrDefault() ?? "";
        var isAdminDomain = emailDomain.Equals(AdminDomain, StringComparison.OrdinalIgnoreCase);
        var isAdminRole   = string.Equals(user.MainRole, "Admin", StringComparison.OrdinalIgnoreCase);

        return (isAdminDomain && isAdminRole) ? "Admin" : "Cliente";
    }

    // ── Register ─────────────────────────────────────────────────────────────
    public async Task<AuthResponseDto> Register(RegisterDto dto)
    {
        if (!IsPasswordStrong(dto.Password))
            return new AuthResponseDto { Success = false, Message = "La contraseña no cumple los requisitos bancarios." };

        if (await _users.ExistsAsync(dto.Email))
            return new AuthResponseDto { Success = false, Message = "El email ya está registrado" };

        if (string.IsNullOrWhiteSpace(dto.FullName))
            return new AuthResponseDto { Success = false, Message = "El nombre es obligatorio." };

        if (string.IsNullOrWhiteSpace(dto.Dpi))
            return new AuthResponseDto { Success = false, Message = "El DPI es obligatorio." };

        if (await _users.DpiExistsAsync(dto.Dpi))
            return new AuthResponseDto { Success = false, Message = "Ya existe un cliente registrado con ese DPI." };

        if (string.IsNullOrWhiteSpace(dto.Address))
            return new AuthResponseDto { Success = false, Message = "La dirección es obligatoria." };

        if (string.IsNullOrWhiteSpace(dto.PhoneNumber))
            return new AuthResponseDto { Success = false, Message = "El celular es obligatorio." };

        if (string.IsNullOrWhiteSpace(dto.JobName))
            return new AuthResponseDto { Success = false, Message = "El nombre de trabajo es obligatorio." };

        // Regla de negocio del banco: ingresos mensuales menores a Q100 no permiten crear la cuenta
        if (dto.MonthlyIncome < 100)
            return new AuthResponseDto { Success = false, Message = "No se puede crear la cuenta: los ingresos mensuales deben ser de al menos Q100." };

        var clienteRole = await _users.GetRoleByNameAsync("Cliente");
        if (clienteRole == null)
            return new AuthResponseDto { Success = false, Message = "Error de configuración: rol 'Cliente' no encontrado." };

        var newUser = new User
        {
            Email             = dto.Email,
            Username          = string.IsNullOrWhiteSpace(dto.Username) ? dto.Email : dto.Username,
            PasswordHash      = BCrypt.Net.BCrypt.HashPassword(dto.Password, 12),
            FullName          = dto.FullName,
            Dpi               = dto.Dpi,
            Address           = dto.Address,
            PhoneNumber       = dto.PhoneNumber,
            JobName           = dto.JobName,
            MonthlyIncome     = dto.MonthlyIncome,
            EmailConfirmed    = true,
            VerificationToken = Guid.NewGuid().ToString(),
            UserRoles         = new List<UserRole> { new UserRole { RoleId = clienteRole.Id } }
        };

        await _users.AddAsync(newUser);

        var createdUser = await _users.GetByEmailAsync(newUser.Email)
            ?? throw new Exception("Error interno: usuario no se pudo crear correctamente.");

        var welcomeHtml = EmailService.BuildWelcomeEmail(createdUser.Username);
        //await _emailService.SendEmailAsync(createdUser.Email, "Bienvenido a OneCoin", welcomeHtml);

        return new AuthResponseDto
        {
            Success      = true,
            Message      = "Registro exitoso",
            Token        = _jwt.GenerateToken(createdUser),
            RefreshToken = _jwt.GenerateRefreshToken(),
            User = new UserDetailsDto
            {
                Id    = createdUser.Id.ToString(),
                Email = createdUser.Email,
                Role  = "Cliente"
            }
        };
    }

    // ── GetAllUsers ──────────────────────────────────────────────────────────
    public async Task<IReadOnlyList<UserSummaryDto>> GetAllUsersAsync()
    {
        var users = await _users.GetAllAsync();
        return users.Select(u => new UserSummaryDto
        {
            Id             = u.Id.ToString(),
            Username       = u.Username,
            Email          = u.Email,
            Role           = ResolveEffectiveRole(u),
            IsActive       = u.IsActive,
            IsLocked       = u.IsLocked,
            EmailConfirmed = u.EmailConfirmed,
            LastLogin      = u.LastLogin,
            FullName       = u.FullName,
            Dpi            = u.Dpi,
            Address        = u.Address,
            PhoneNumber    = u.PhoneNumber,
            JobName        = u.JobName,
            MonthlyIncome  = u.MonthlyIncome,
        }).ToList();
    }


    public async Task<UserSummaryDto> UpdateUserAsync(Guid userId, UpdateUserDto dto)
    {
        var user = await _users.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");

        if (string.Equals(ResolveEffectiveRole(user), "Admin", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("No se puede editar a otro administrador.");

        if (dto.MonthlyIncome.HasValue && dto.MonthlyIncome < 100)
            throw new InvalidOperationException("Los ingresos mensuales deben ser de al menos Q100.");

        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Address != null) user.Address = dto.Address;
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        if (dto.JobName != null) user.JobName = dto.JobName;
        if (dto.MonthlyIncome.HasValue) user.MonthlyIncome = dto.MonthlyIncome;

        await _users.UpdateAsync(user);

        return new UserSummaryDto
        {
            Id             = user.Id.ToString(),
            Username       = user.Username,
            Email          = user.Email,
            Role           = ResolveEffectiveRole(user),
            IsActive       = user.IsActive,
            IsLocked       = user.IsLocked,
            EmailConfirmed = user.EmailConfirmed,
            LastLogin      = user.LastLogin,
            FullName       = user.FullName,
            Dpi            = user.Dpi,
            Address        = user.Address,
            PhoneNumber    = user.PhoneNumber,
            JobName        = user.JobName,
            MonthlyIncome  = user.MonthlyIncome,
        };
    }


    public async Task DeleteUserAsync(Guid userId)
    {
        var user = await _users.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");

        if (string.Equals(ResolveEffectiveRole(user), "Admin", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("No se puede eliminar a otro administrador.");

        await _users.DeleteAsync(userId);
    }

    public async Task<bool> ToggleUserActiveAsync(Guid userId, string currentUserEmail)
    {
        var user = await _users.GetByIdAsync(userId);
        if (user == null) return false;

        if (!string.IsNullOrWhiteSpace(currentUserEmail) &&
            string.Equals(user.Email, currentUserEmail, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("No puedes deshabilitar tu propio usuario.");

        user.IsActive = !user.IsActive;
        await _users.UpdateAsync(user);
        return true;
    }

    public async Task<bool> VerifyEmail(string token)
    {
        var user = await _users.GetByVerificationTokenAsync(token);
        if (user == null) return false;

        user.EmailConfirmed    = true;
        user.VerificationToken = null;
        await _users.UpdateAsync(user);

        await _emailService.SendEmailAsync(user.Email, "Cuenta Activada",
            "<p style='font-family:Arial'>Su correo ha sido verificado exitosamente en OneCoin.</p>");

        return true;
    }

    public async Task ForgotPassword(string email)
    {
        var user = await _users.GetByEmailAsync(email);
        if (user == null) return;

        var otp = new Random().Next(100_000, 999_999).ToString();
        user.ResetOtpCode    = BCrypt.Net.BCrypt.HashPassword(otp, 4);
        user.ResetOtpExpires = DateTime.UtcNow.AddMinutes(10);
        user.ResetToken        = null;
        user.ResetTokenExpires = null;
        await _users.UpdateAsync(user);

        var html = EmailService.BuildOtpEmail(otp, email);
        await _emailService.SendEmailAsync(email, "Tu código de verificación - OneCoin", html);
    }

    public async Task VerifyOtp(VerifyOtpDto dto)
    {
        var user = await _users.GetByEmailAsync(dto.Email)
            ?? throw new Exception("Código inválido o expirado.");

        if (user.ResetOtpCode == null || user.ResetOtpExpires == null)
            throw new Exception("Código inválido o expirado.");

        if (user.ResetOtpExpires < DateTime.UtcNow)
            throw new Exception("El código ha expirado. Solicita uno nuevo.");

        if (!BCrypt.Net.BCrypt.Verify(dto.OtpCode, user.ResetOtpCode))
            throw new Exception("Código incorrecto.");
    }

    public async Task ResetPassword(ResetPasswordDto dto)
    {
        if (dto.NewPassword != dto.ConfirmPassword)
            throw new Exception("Las contraseñas no coinciden.");

        var user = await _users.GetByEmailAsync(dto.Email)
            ?? throw new Exception("Código inválido o expirado.");

        if (user.ResetOtpCode == null || user.ResetOtpExpires == null)
            throw new Exception("Código inválido o expirado.");

        if (user.ResetOtpExpires < DateTime.UtcNow)
            throw new Exception("El código ha expirado. Solicita uno nuevo.");

        if (!BCrypt.Net.BCrypt.Verify(dto.OtpCode, user.ResetOtpCode))
            throw new Exception("Código incorrecto.");

        if (!IsPasswordStrong(dto.NewPassword))
            throw new Exception("La contraseña no cumple los requisitos mínimos (8 caracteres, mayúscula, número y símbolo).");

        user.PasswordHash        = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword, 12);
        user.ResetOtpCode        = null;
        user.ResetOtpExpires     = null;
        user.FailedLoginAttempts = 0;
        user.IsLocked            = false;

        await _users.UpdateAsync(user);

        var htmlBody = EmailService.BuildPasswordChangedEmail(user.Email);
        await _emailService.SendEmailAsync(user.Email, "Contraseña actualizada - OneCoin", htmlBody);
    }

    private static bool IsPasswordStrong(string pw) =>
        pw.Length >= 8 &&
        pw.Any(char.IsUpper) &&
        pw.Any(char.IsDigit) &&
        pw.Any(c => !char.IsLetterOrDigit(c));
}