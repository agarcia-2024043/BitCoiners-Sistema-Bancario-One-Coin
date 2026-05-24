/// <summary>Restablece la contraseña usando el OTP ya verificado.</summary>
public record ResetPasswordDto(
    string Email,
    string OtpCode,          // se revalida en el reset para evitar saltar el paso 2
    string NewPassword,
    string ConfirmPassword,
    string Token = ""        // campo legacy, ignorado
);
