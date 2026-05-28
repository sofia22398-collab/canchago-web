using CanchaGo.Data;
using CanchaGo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CanchaGo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartidosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PartidosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPartidos()
        {
            var partidos = await _context.Partidos
                .Include(p => p.Reserva)
                    .ThenInclude(r => r.Cancha)
                .Include(p => p.UsuarioCreador)
                .Include(p => p.Jugadores)
                    .ThenInclude(j => j.Usuario)
                .OrderByDescending(p => p.FechaCreacion)
                .Select(p => new
                {
                    p.Id,
                    p.ReservaId,
                    p.UsuarioCreadorId,
                    p.Titulo,
                    p.Nivel,
                    p.CuposTotales,
                    p.Estado,
                    p.FechaCreacion,

                    Reserva = new
                    {
                        p.Reserva.Id,
                        p.Reserva.Fecha,
                        p.Reserva.HoraInicio,
                        p.Reserva.HoraFin,
                        Cancha = new
                        {
                            p.Reserva.Cancha.Id,
                            p.Reserva.Cancha.Nombre,
                            p.Reserva.Cancha.TipoDeporte
                        }
                    },

                    UsuarioCreador = new
                    {
                        p.UsuarioCreador.Id,
                        p.UsuarioCreador.Nombre,
                        p.UsuarioCreador.Correo
                    },

                    Jugadores = p.Jugadores.Select(j => new
                    {
                        j.Id,
                        j.UsuarioId,
                        Usuario = new
                        {
                            j.Usuario.Id,
                            j.Usuario.Nombre,
                            j.Usuario.Correo
                        }
                    }).ToList()
                })
                .ToListAsync();

            return Ok(partidos);
        }

        [HttpPost]
        public async Task<IActionResult> CrearPartido(Partido partido)
        {
            var reserva = await _context.Reservas
                .Include(r => r.Cancha)
                .FirstOrDefaultAsync(r => r.Id == partido.ReservaId);

            if (reserva == null)
                return BadRequest("La reserva no existe.");

            if (reserva.Estado == "Cancelada")
                return BadRequest("No se puede crear partido con una reserva cancelada.");

            var yaExiste = await _context.Partidos.AnyAsync(p =>
                p.ReservaId == partido.ReservaId &&
                p.Estado != "Cancelado"
            );

            if (yaExiste)
                return BadRequest("Ya existe un partido para esta reserva.");

            partido.Estado = "Abierto";
            partido.FechaCreacion = DateTime.Now;

            _context.Partidos.Add(partido);
            await _context.SaveChangesAsync();

            var jugadorCreador = new PartidoJugador
            {
                PartidoId = partido.Id,
                UsuarioId = partido.UsuarioCreadorId,
                FechaUnion = DateTime.Now
            };

            _context.PartidoJugadores.Add(jugadorCreador);
            await _context.SaveChangesAsync();

            return Ok(partido);
        }

        [HttpPost("{id}/unirse/{usuarioId}")]
        public async Task<IActionResult> UnirsePartido(int id, int usuarioId)
        {
            var partido = await _context.Partidos
                .Include(p => p.Jugadores)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (partido == null)
                return NotFound("Partido no encontrado.");

            if (partido.Estado != "Abierto")
                return BadRequest("El partido no está abierto.");

            var yaEsta = partido.Jugadores.Any(j => j.UsuarioId == usuarioId);

            if (yaEsta)
                return BadRequest("Ya estás unido a este partido.");

            if (partido.Jugadores.Count >= partido.CuposTotales)
                return BadRequest("El partido ya está lleno.");

            _context.PartidoJugadores.Add(new PartidoJugador
            {
                PartidoId = id,
                UsuarioId = usuarioId,
                FechaUnion = DateTime.Now
            });

            if (partido.Jugadores.Count + 1 >= partido.CuposTotales)
            {
                partido.Estado = "Completo";
            }

            await _context.SaveChangesAsync();

            return Ok("Te uniste al partido correctamente.");
        }

        [HttpDelete("{id}/salir/{usuarioId}")]
        public async Task<IActionResult> SalirPartido(int id, int usuarioId)
        {
            var jugador = await _context.PartidoJugadores
                .FirstOrDefaultAsync(j =>
                    j.PartidoId == id &&
                    j.UsuarioId == usuarioId
                );

            if (jugador == null)
                return NotFound("No estás unido a este partido.");

            _context.PartidoJugadores.Remove(jugador);

            var partido = await _context.Partidos.FindAsync(id);

            if (partido != null && partido.Estado == "Completo")
            {
                partido.Estado = "Abierto";
            }

            await _context.SaveChangesAsync();

            return Ok("Saliste del partido correctamente.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelarPartido(int id)
        {
            var partido = await _context.Partidos.FindAsync(id);

            if (partido == null)
                return NotFound("Partido no encontrado.");

            partido.Estado = "Cancelado";
            await _context.SaveChangesAsync();

            return Ok(partido);
        }
    }
}