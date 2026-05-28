using CanchaGo.Models;
using Microsoft.EntityFrameworkCore;

namespace CanchaGo.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Cancha> Canchas { get; set; }
        public DbSet<Reserva> Reservas { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<HorarioBloqueado> HorariosBloqueados { get; set; }
        public DbSet<Partido> Partidos { get; set; }
        public DbSet<PartidoJugador> PartidoJugadores { get; set; }
    }
}