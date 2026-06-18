using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> Login(LoginDto dto);
    Task<AuthResponseDto> Register(RegisterDto dto);
    Task<IReadOnlyList<UserSummaryDto>> GetAllUsersAsync();
    Task<bool> ToggleUserActiveAsync(Guid userId, string currentUserEmail);

    /// <summary>Admin edita datos de un cliente. No puede tocar DPI ni contraseña.</summary>
    Task<UserSummaryDto> UpdateUserAsync(Guid userId, UpdateUserDto dto);

    /// <summary>Admin elimina un cliente. No puede eliminar a otro Admin.</summary>
    Task DeleteUserAsync(Guid userId);

    Task<bool> VerifyEmail(string token);

    /// <summary>Paso 1: genera y envía OTP al correo.</summary>
    Task ForgotPassword(string email);

    /// <summary>Paso 2: valida que el OTP sea correcto y no haya expirado.</summary>
    Task VerifyOtp(VerifyOtpDto dto);

    /// <summary>Paso 3: cambia la contraseña (revalida OTP).</summary>
    Task ResetPassword(ResetPasswordDto dto);
}