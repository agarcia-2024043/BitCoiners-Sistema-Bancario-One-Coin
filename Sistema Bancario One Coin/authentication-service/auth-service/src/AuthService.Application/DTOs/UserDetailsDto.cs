namespace AuthService.Application.DTOs;

public class UserDetailsDto
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }

    // Datos personales del cliente
    public string? FullName { get; set; }
    public string? Dpi { get; set; }
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? JobName { get; set; }
    public decimal? MonthlyIncome { get; set; }
}