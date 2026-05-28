using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CanchaGo.Models
{
    [Table("Reservas")]
    public class Reserva
    {
        [Key]
        public int Id { get; set; }

        public Cancha? Cancha { get; set; }

        public int UsuarioId { get; set; }

        public int CanchaId { get; set; }

        public DateTime Fecha { get; set; }

        public TimeSpan HoraInicio { get; set; }

        public TimeSpan HoraFin { get; set; }

        public int CantidadJugadores { get; set; }

        public string TipoPartido { get; set; } = string.Empty;

        public string Estado { get; set; } = "Reservada";

        public string? Observaciones { get; set; }

        public string EstadoPago { get; set; } = "Pendiente";
        public decimal MontoTotal { get; set; }
        public string? MetodoPago { get; set; }
        public DateTime? FechaPago { get; set; }

        public Usuario? Usuario { get; set; }


    }
}