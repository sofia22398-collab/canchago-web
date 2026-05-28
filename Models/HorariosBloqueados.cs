using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CanchaGo.Models
{
    [Table("HorariosBloqueados")]
    public class HorarioBloqueado
    {
        [Key]
        public int Id { get; set; }

        public int CanchaId { get; set; }

        public DateTime Fecha { get; set; }

        public TimeSpan HoraInicio { get; set; }

        public TimeSpan HoraFin { get; set; }

        public string? Motivo { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public Cancha? Cancha { get; set; }
    }
}