/// <summary>Verifica el código OTP enviado al correo.</summary>
public record VerifyOtpDto(string Email, string OtpCode);
