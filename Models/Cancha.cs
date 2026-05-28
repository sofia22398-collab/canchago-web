using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CanchaGo.Models
{
    [Table("Canchas")]
    public class Cancha
    {
        [Key]
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string TipoDeporte { get; set; } = string.Empty;

        public string TipoSuperficie { get; set; } = string.Empty;

        public bool Interior { get; set; }

        public bool Iluminacion { get; set; }

        public int CantidadJugadores { get; set; }

        public decimal PrecioHora { get; set; }

        public bool Activa { get; set; }
        public string? Descripcion { get; set; }
    }
}