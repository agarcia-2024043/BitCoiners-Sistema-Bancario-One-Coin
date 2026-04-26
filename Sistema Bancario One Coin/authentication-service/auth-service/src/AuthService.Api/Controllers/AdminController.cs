using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador de administración y gestión de usuarios bancarios.
/// Permite consultar información del usuario autenticado y acceder a rutas protegidas por rol.
/// </summary>
[ApiController]
[Route("api/management")]
[Produces("application/json")]
[Tags("Management")]
public class AdminController : ControllerBase
{
    /// <summary>
    /// Obtiene la información del usuario autenticado.
    /// </summary>
    /// <remarks>
    /// Retorna los datos del token JWT del usuario que realiza la solicitud.
    /// Requiere un token JWT válido en el header Authorization.
    ///
    /// Ejemplo de respuesta:
    /// <code>
    /// {
    ///   "success": true,
    ///   "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    ///   "username": "jperez",
    ///   "role": "cajero"
    /// }
    /// </code>
    /// </remarks>
    /// <response code="200">Información del usuario autenticado retornada correctamente.</response>
    /// <response code="401">Token JWT inválido, expirado o no proporcionado.</response>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(MeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public IActionResult Me()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var username = User.FindFirstValue(JwtRegisteredClaimNames.UniqueName);
        var role = User.FindFirstValue("role");

        return Ok(new
        {
            success = true,
            sub,
            username,
            role
        });
    }

    /// <summary>
    /// Endpoint exclusivo para administradores bancarios.
    /// </summary>
    /// <remarks>
    /// Solo accesible por usuarios con el rol <b>adminBanco</b>.
    /// Verifica que el token JWT contenga el claim de rol correspondiente.
    ///
    /// Ejemplo de respuesta exitosa:
    /// <code>
    /// {
    ///   "success": true,
    ///   "message": "Acceso permitido: administrador bancario"
    /// }
    /// </code>
    /// </remarks>
    /// <response code="200">Acceso concedido al administrador bancario.</response>
    /// <response code="401">Token JWT no proporcionado o inválido.</response>
    /// <response code="403">El usuario no tiene el rol de administrador bancario.</response>
    [Authorize(Roles = "adminBanco")]
    [HttpGet("only-admin")]
    [ProducesResponseType(typeof(AdminResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public IActionResult OnlyAdmin()
    {
        return Ok(new { success = true, message = "Acceso permitido: administrador bancario" });
    }
}

// ── Response models para tipado en Swagger ──────────────────────────────────

/// <summary>Respuesta del endpoint /me con datos del usuario autenticado.</summary>
public record MeResponse(
    /// <summary>Indica si la operación fue exitosa.</summary>
    bool Success,
    /// <summary>Identificador único del usuario (Subject del JWT).</summary>
    string Sub,
    /// <summary>Nombre de usuario.</summary>
    string Username,
    /// <summary>Rol asignado al usuario dentro del sistema bancario.</summary>
    string Role
);

/// <summary>Respuesta del endpoint de acceso exclusivo para administradores.</summary>
public record AdminResponse(
    /// <summary>Indica si la operación fue exitosa.</summary>
    bool Success,
    /// <summary>Mensaje descriptivo del resultado.</summary>
    string Message
);

/// <summary>Modelo de respuesta para errores de autenticación y autorización.</summary>
public record ErrorResponse(
    /// <summary>Indica que la operación no fue exitosa.</summary>
    bool Success,
    /// <summary>Descripción del error ocurrido.</summary>
    string Message
);