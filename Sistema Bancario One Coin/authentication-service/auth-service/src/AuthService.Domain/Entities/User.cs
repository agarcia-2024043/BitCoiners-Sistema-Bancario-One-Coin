using System;
using System.Collections.Generic;
using System.Linq;

namespace AuthService.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        // --- DATOS PERSONALES DEL CLIENTE (requeridos por el banco) ---
        public string? FullName { get; set; }
        public string? Dpi { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? JobName { get; set; }
        public decimal? MonthlyIncome { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsLocked { get; set; } = false;
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LastLogin { get; set; }

        public bool EmailConfirmed { get; set; } = false;
        public string? VerificationToken { get; set; }

        // Token UUID (enlace) — se mantiene por compatibilidad
        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpires { get; set; }

        // Código OTP numérico de 6 dígitos para el flujo por pasos
        public string? ResetOtpCode { get; set; }
        public DateTime? ResetOtpExpires { get; set; }

        // --- RELACIONES ---
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

        public string MainRole => (UserRoles != null && UserRoles.Any())
            ? UserRoles.First().Role?.Name ?? "Cliente"
            : "Cliente";
    }
}