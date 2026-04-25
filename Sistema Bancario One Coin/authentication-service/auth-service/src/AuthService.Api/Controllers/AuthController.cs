using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador de autenticación del sistema bancario
/// Permite registrar usuarios, iniciar sesión y obtener información del usuario autenticado
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    /// <summary>
    /// Iniciar sesión en el sistema
    /// </summary>
    /// <param name="dto">Credenciales del usuario</param>
    /// <returns>Token JWT si las credenciales son válidas</returns>
    /// <response code="200">Login exitoso</response>
    /// <response code="401">Credenciales inválidas</response>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _auth.Login(dto); 
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    /// <summary>
    /// Registrar un nuevo usuario
    /// </summary>
    /// <param name="dto">Datos del usuario</param>
    /// <returns>Usuario registrado</returns>
    /// <response code="200">Registro exitoso</response>
    /// <response code="400">Error en los datos</response>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _auth.Register(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Obtener información del usuario autenticado
    /// </summary>
    /// <returns>Datos del usuario actual</returns>
    /// <response code="200">Usuario autenticado</response>
    /// <response code="401">Token inválido</response>
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetMe()
    {
        var userEmail = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value 
                        ?? User.Claims.FirstOrDefault(c => c.Type == "username")?.Value;

        return Ok(new { 
            message = "Usuario autenticado correctamente", 
            user = userEmail,
            roles = User.Claims
                .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
                .Select(c => c.Value)
        });
    }
}