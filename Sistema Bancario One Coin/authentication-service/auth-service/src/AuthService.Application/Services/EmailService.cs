using AuthService.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace AuthService.Application.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpHost  = _config["Email:SmtpHost"]  ?? throw new InvalidOperationException("Email:SmtpHost no configurado");
        var smtpPort  = int.Parse(_config["Email:SmtpPort"] ?? "587");
        var smtpUser  = _config["Email:SmtpUser"]  ?? throw new InvalidOperationException("Email:SmtpUser no configurado");
        var smtpPass  = _config["Email:SmtpPass"]  ?? throw new InvalidOperationException("Email:SmtpPass no configurado");
        var fromName  = _config["Email:FromName"]  ?? "OneCoin Banco";
        var fromEmail = _config["Email:FromEmail"] ?? smtpUser;

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = body };

        using var client = new SmtpClient();
        client.ServerCertificateValidationCallback = (s, c, h, e) => true;
        await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(smtpUser, smtpPass);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    // ── Plantillas HTML ──────────────────────────────────────────────────────

    public static string BuildOtpEmail(string otpCode, string userEmail) => $@"<!DOCTYPE html>
<html lang=""es"">
<head>
  <meta charset=""UTF-8""/>
  <meta name=""viewport"" content=""width=device-width,initial-scale=1.0""/>
  <title>Código de verificación · OneCoin</title>
</head>
<body style=""margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"">

  <!-- Wrapper -->
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
         style=""background:#0a0a0a;padding:48px 20px;"">
    <tr><td align=""center"">

      <!-- Card -->
      <table width=""560"" cellpadding=""0"" cellspacing=""0"" border=""0""
             style=""max-width:560px;width:100%;background:#111111;
                     border:1px solid #222222;border-radius:4px;overflow:hidden;"">

        <!-- Header -->
        <tr>
          <td style=""background:#0a0a0a;padding:32px 40px;border-bottom:1px solid #1a1a1a;"">
            <table cellpadding=""0"" cellspacing=""0"" border=""0"">
              <tr>
                <td style=""background:#ffffff;border-radius:8px;width:36px;height:36px;
                             text-align:center;vertical-align:middle;"">
                  <span style=""font-size:20px;font-weight:900;color:#0a0a0a;
                                font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                                line-height:36px;display:block;"">C</span>
                </td>
                <td style=""padding-left:12px;vertical-align:middle;"">
                  <span style=""font-size:10px;font-weight:700;color:#888888;
                                letter-spacing:3px;display:block;"">ONE</span>
                  <span style=""font-size:16px;font-weight:900;color:#ffffff;
                                letter-spacing:1px;display:block;margin-top:-2px;"">COIN</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style=""padding:48px 40px 40px;"">

            <!-- Label -->
            <div style=""display:inline-block;border:1px solid #c9a84c;border-radius:2px;
                         padding:4px 12px;margin-bottom:28px;"">
              <span style=""font-size:10px;font-weight:700;color:#c9a84c;
                            letter-spacing:2px;"">VERIFICACIÓN DE SEGURIDAD</span>
            </div>

            <!-- Title -->
            <h1 style=""margin:0 0 12px;font-size:28px;font-weight:900;color:#ffffff;
                        letter-spacing:-0.5px;line-height:1.1;"">
              Tu código<br/>de acceso<span style=""color:#c9a84c;"">.</span>
            </h1>

            <!-- Subtitle -->
            <p style=""margin:0 0 36px;font-size:14px;color:#666666;line-height:1.6;"">
              Solicitaste restablecer la contraseña de<br/>
              <span style=""color:#aaaaaa;font-weight:500;"">{userEmail}</span>
            </p>

            <!-- Divider -->
            <div style=""width:32px;height:2px;background:#c9a84c;margin-bottom:36px;""></div>

            <!-- OTP Box -->
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
                   style=""background:#0a0a0a;border:1px solid #222222;border-radius:4px;
                           margin-bottom:36px;"">
              <tr>
                <td style=""padding:32px;text-align:center;"">
                  <span style=""font-size:11px;font-weight:700;color:#555555;
                                letter-spacing:3px;display:block;margin-bottom:16px;"">CÓDIGO OTP</span>
                  <span style=""font-size:48px;font-weight:900;color:#ffffff;
                                letter-spacing:16px;font-family:'Courier New',Courier,monospace;"">
                    {otpCode}
                  </span>
                  <span style=""font-size:11px;color:#444444;display:block;margin-top:16px;"">
                    Válido por <span style=""color:#c9a84c;font-weight:700;"">10 minutos</span>
                  </span>
                </td>
              </tr>
            </table>

            <!-- Warning -->
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
                   style=""background:#0f0f0f;border-left:3px solid #c9a84c;
                           border-radius:0 4px 4px 0;margin-bottom:0;"">
              <tr>
                <td style=""padding:16px 20px;"">
                  <span style=""font-size:12px;color:#666666;line-height:1.5;"">
                    Si no solicitaste este código, ignora este mensaje.<br/>
                    Tu cuenta permanece segura.
                  </span>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style=""background:#0a0a0a;padding:24px 40px;border-top:1px solid #1a1a1a;"">
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">
            </table>
          </td>
        </tr>

      </table>
      <!-- /Card -->

    </td></tr>
  </table>
</body>
</html>";

    public static string BuildWelcomeEmail(string username) => $@"<!DOCTYPE html>
<html lang=""es"">
<head>
  <meta charset=""UTF-8""/>
  <meta name=""viewport"" content=""width=device-width,initial-scale=1.0""/>
  <title>Bienvenido · OneCoin</title>
</head>
<body style=""margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
         style=""background:#0a0a0a;padding:48px 20px;"">
    <tr><td align=""center"">
      <table width=""560"" cellpadding=""0"" cellspacing=""0"" border=""0""
             style=""max-width:560px;width:100%;background:#111111;
                     border:1px solid #222222;border-radius:4px;overflow:hidden;"">

        <!-- Header -->
        <tr>
          <td style=""background:#0a0a0a;padding:32px 40px;border-bottom:1px solid #1a1a1a;"">
            <table cellpadding=""0"" cellspacing=""0"" border=""0"">
              <tr>
                <td style=""background:#ffffff;border-radius:8px;width:36px;height:36px;
                             text-align:center;vertical-align:middle;"">
                  <span style=""font-size:20px;font-weight:900;color:#0a0a0a;
                                font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                                line-height:36px;display:block;"">C</span>
                </td>
                <td style=""padding-left:12px;vertical-align:middle;"">
                  <span style=""font-size:10px;font-weight:700;color:#888888;
                                letter-spacing:3px;display:block;"">ONE</span>
                  <span style=""font-size:16px;font-weight:900;color:#ffffff;
                                letter-spacing:1px;display:block;margin-top:-2px;"">COIN</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style=""padding:48px 40px 40px;"">
            <div style=""display:inline-block;border:1px solid #c9a84c;border-radius:2px;
                         padding:4px 12px;margin-bottom:28px;"">
              <span style=""font-size:10px;font-weight:700;color:#c9a84c;letter-spacing:2px;"">PORTAL OFICIAL</span>
            </div>
            <h1 style=""margin:0 0 8px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;line-height:1.1;"">
              Tu dinero,<br/><span style=""font-weight:300;"">un solo lugar</span><span style=""color:#c9a84c;"">.</span>
            </h1>
            <p style=""margin:0 0 36px;font-size:14px;color:#666666;line-height:1.6;"">
              Bienvenido, <span style=""color:#aaaaaa;font-weight:700;"">{username}</span>.<br/>
              Tu cuenta ha sido creada exitosamente. Ya puedes acceder<br/>a todos los servicios de OneCoin.
            </p>
            <div style=""width:32px;height:2px;background:#c9a84c;margin-bottom:36px;""></div>

            <!-- Features -->
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""margin-bottom:36px;"">
              <tr>
                <td style=""padding:14px 0;border-bottom:1px solid #1a1a1a;"">
                  <span style=""font-size:8px;color:#c9a84c;letter-spacing:2px;font-weight:700;"">●</span>
                  <span style=""font-size:13px;color:#888888;margin-left:12px;"">Transferencias instantáneas 24/7</span>
                </td>
              </tr>
              <tr>
                <td style=""padding:14px 0;border-bottom:1px solid #1a1a1a;"">
                  <span style=""font-size:8px;color:#c9a84c;letter-spacing:2px;font-weight:700;"">●</span>
                  <span style=""font-size:13px;color:#888888;margin-left:12px;"">Seguridad de nivel bancario certificado</span>
                </td>
              </tr>
              <tr>
                <td style=""padding:14px 0;"">
                  <span style=""font-size:8px;color:#c9a84c;letter-spacing:2px;font-weight:700;"">●</span>
                  <span style=""font-size:13px;color:#888888;margin-left:12px;"">Inversiones y crypto integradas</span>
                </td>
              </tr>
            </table>

            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
                   style=""background:#0f0f0f;border-left:3px solid #c9a84c;border-radius:0 4px 4px 0;"">
              <tr>
                <td style=""padding:16px 20px;"">
                  <span style=""font-size:12px;color:#666666;"">
                    Banca digital segura y moderna · 256-bit SSL · Regulado · FDIC Insured
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style=""background:#0a0a0a;padding:24px 40px;border-top:1px solid #1a1a1a;"">
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";

    public static string BuildPasswordChangedEmail(string userEmail) => $@"<!DOCTYPE html>
<html lang=""es"">
<head>
  <meta charset=""UTF-8""/>
  <meta name=""viewport"" content=""width=device-width,initial-scale=1.0""/>
  <title>Contraseña actualizada · OneCoin</title>
</head>
<body style=""margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
         style=""background:#0a0a0a;padding:48px 20px;"">
    <tr><td align=""center"">
      <table width=""560"" cellpadding=""0"" cellspacing=""0"" border=""0""
             style=""max-width:560px;width:100%;background:#111111;
                     border:1px solid #222222;border-radius:4px;overflow:hidden;"">

        <!-- Header -->
        <tr>
          <td style=""background:#0a0a0a;padding:32px 40px;border-bottom:1px solid #1a1a1a;"">
            <table cellpadding=""0"" cellspacing=""0"" border=""0"">
              <tr>
                <td style=""background:#ffffff;border-radius:8px;width:36px;height:36px;
                             text-align:center;vertical-align:middle;"">
                  <span style=""font-size:20px;font-weight:900;color:#0a0a0a;
                                font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                                line-height:36px;display:block;"">C</span>
                </td>
                <td style=""padding-left:12px;vertical-align:middle;"">
                  <span style=""font-size:10px;font-weight:700;color:#888888;
                                letter-spacing:3px;display:block;"">ONE</span>
                  <span style=""font-size:16px;font-weight:900;color:#ffffff;
                                letter-spacing:1px;display:block;margin-top:-2px;"">COIN</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style=""padding:48px 40px 40px;"">
            <div style=""display:inline-block;border:1px solid #c9a84c;border-radius:2px;
                         padding:4px 12px;margin-bottom:28px;"">
              <span style=""font-size:10px;font-weight:700;color:#c9a84c;letter-spacing:2px;"">ALERTA DE SEGURIDAD</span>
            </div>
            <h1 style=""margin:0 0 12px;font-size:28px;font-weight:900;color:#ffffff;
                        letter-spacing:-0.5px;line-height:1.1;"">
              Contraseña<br/>actualizada<span style=""color:#c9a84c;"">.</span>
            </h1>
            <p style=""margin:0 0 36px;font-size:14px;color:#666666;line-height:1.6;"">
              La contraseña de tu cuenta<br/>
              <span style=""color:#aaaaaa;font-weight:500;"">{userEmail}</span><br/>
              fue cambiada exitosamente.
            </p>
            <div style=""width:32px;height:2px;background:#c9a84c;margin-bottom:36px;""></div>

            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
                   style=""background:#0f0f0f;border-left:3px solid #c9a84c;
                           border-radius:0 4px 4px 0;margin-bottom:24px;"">
              <tr>
                <td style=""padding:20px;"">
                  <span style=""font-size:13px;color:#888888;line-height:1.6;"">
                    Si no realizaste este cambio, contacta a soporte inmediatamente.<br/>
                    Tu seguridad es nuestra prioridad.
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style=""background:#0a0a0a;padding:24px 40px;border-top:1px solid #1a1a1a;"">
            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";
}