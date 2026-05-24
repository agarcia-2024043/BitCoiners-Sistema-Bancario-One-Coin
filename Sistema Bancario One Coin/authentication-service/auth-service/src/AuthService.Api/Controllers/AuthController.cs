using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador de autenticación del sistema bancario.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    /// <summary>Iniciar sesión.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _auth.Login(dto);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    /// <summary>Registrar nuevo usuario.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _auth.Register(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Información del usuario autenticado.</summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetMe()
    {
        var userEmail = User.Claims
            .FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value
            ?? User.Claims.FirstOrDefault(c => c.Type == "username")?.Value;

        return Ok(new
        {
            message = "Usuario autenticado correctamente",
            user    = userEmail,
            roles   = User.Claims
                .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
                .Select(c => c.Value)
        });
    }

    /// <summary>
    /// PASO 1 — Solicita recuperación: genera OTP y lo envía por correo.
    /// Siempre responde 200 (seguridad: no revela si el email existe).
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        await _auth.ForgotPassword(dto.Email);
        return Ok(new { success = true, message = "Si el correo está registrado, recibirás un código de verificación." });
    }

    /// <summary>
    /// PASO 2 — Verifica el OTP ingresado por el usuario.
    /// </summary>
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
    {
        try
        {
            await _auth.VerifyOtp(dto);
            return Ok(new { success = true, message = "Código verificado correctamente." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// PASO 3 — Restablece la contraseña (revalida el OTP internamente).
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        try
        {
            await _auth.ResetPassword(dto);
            return Ok(new { success = true, message = "Contraseña restablecida exitosamente." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}