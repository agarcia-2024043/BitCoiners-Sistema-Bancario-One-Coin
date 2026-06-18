namespace AuthService.Application.DTOs;

public class UpdateUserDto
{
    public string? FullName { get; set; }
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? JobName { get; set; }
    public decimal? MonthlyIncome { get; set; }
}