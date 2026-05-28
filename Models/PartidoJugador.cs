using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CanchaGo.Models
{
    [Table("PartidoJugadores")]
    public class PartidoJugador
    {
        [Key]
        public int Id { get; set; }

        public int PartidoId { get; set; }

        public int UsuarioId { get; set; }

        public DateTime FechaUnion { get; set; } = DateTime.Now;

        public Partido? Partido { get; set; }

        public Usuario? Usuario { get; set; }
    }
}