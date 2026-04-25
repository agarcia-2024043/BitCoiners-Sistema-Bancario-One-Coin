using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthService.Persistence.Data; // CORREGIDO: Era AppDbContext

namespace AuthService.Api.Controllers
{
    
/// <summary>
/// Controlador para verificar la salud del sistema
/// </summary>
[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        ApplicationDbContext dbContext,
        ILogger<HealthController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>
    /// Verifica el estado de la API y la base de datos
    /// </summary>
    /// <returns>Estado del sistema</returns>
    /// <response code="200">Sistema saludable</response>
    /// <response code="503">Sistema no disponible</response>
    [HttpGet]
    public async Task<IActionResult> Check()
    {
        var healthStatus = new
        {
            api = "Healthy",
            database = "Unknown",
            timestamp = DateTime.UtcNow
        };

        try
        {
            var startTime = DateTime.UtcNow;
            var canConnect = await _dbContext.Database.CanConnectAsync();
            var responseTime = (DateTime.UtcNow - startTime).TotalMilliseconds;

            if (canConnect)
            {
                var rolesCount = await _dbContext.Role.CountAsync();

                healthStatus = healthStatus with
                {
                    database = $"Healthy ({responseTime:F0}ms, {rolesCount} roles)"
                };
            }
            else
            {
                healthStatus = healthStatus with { database = "Unhealthy" };
            }

            return Ok(new
            {
                success = true,
                status = "Healthy",
                checks = healthStatus,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en health check");

            return StatusCode(503, new
            {
                success = false,
                status = "Unhealthy",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Endpoint de prueba (ping)
    /// </summary>
    /// <returns>Respuesta simple</returns>
    /// <response code="200">Servicio activo</response>
    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new
        {
            success = true,
            status = "alive",
            timestamp = DateTime.UtcNow
        });
    }
}
}