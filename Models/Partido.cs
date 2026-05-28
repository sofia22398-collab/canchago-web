using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CanchaGo.Models
{
    [Table("Partidos")]
    public class Partido
    {
        [Key]
        public int Id { get; set; }

        public int ReservaId { get; set; }

        public int UsuarioCreadorId { get; set; }

        public string Titulo { get; set; } = string.Empty;

        public string? Nivel { get; set; }

        public int CuposTotales { get; set; }

        public string Estado { get; set; } = "Abierto";

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public Reserva? Reserva { get; set; }

        public Usuario? UsuarioCreador { get; set; }

        public List<PartidoJugador> Jugadores { get; set; } = new();
    }
}