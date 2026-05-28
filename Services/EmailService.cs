using System.Net;
using System.Net.Mail;

namespace CanchaGo.Services
{
    public class EmailService
    {
        public async Task EnviarCorreoAsync(
            string para,
            string asunto,
            string cuerpo
        )
        {
            var smtp = new SmtpClient("sandbox.smtp.mailtrap.io")
            {
                Port = 2525,

                Credentials = new NetworkCredential(
                    "0827a8ad563cdd",
                    "1d23816c376435"
                ),

                EnableSsl = true,
            };

            var mensaje = new MailMessage
            {
                From = new MailAddress(
                    "noreply@canchago.com",
                    "CanchaGo"
                ),

                Subject = asunto,

                Body = cuerpo,

                IsBodyHtml = true,
            };

            mensaje.To.Add(para);

            try
            {
                await smtp.SendMailAsync(mensaje);
            }
            catch
            {
                // No rompe reservas, pagos ni cancelaciones si Mailtrap limita correos.
            }
        }
    }
}