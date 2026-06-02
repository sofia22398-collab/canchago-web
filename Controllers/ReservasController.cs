using CanchaGo.Data;
using CanchaGo.Models;
using CanchaGo.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CanchaGo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public ReservasController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<IActionResult> GetReservas()
        {
            var reservas = await _context.Reservas
                .Include(r => r.Cancha)
                .Include(r => r.Usuario)
                .ToListAsync();

            return Ok(reservas);
        }

        [HttpGet("disponibilidad")]
        public async Task<IActionResult> Disponibilidad(int canchaId, DateTime fecha)
        {
            var inicio = DateTime.SpecifyKind(fecha.Date, DateTimeKind.Utc);
            var fin = inicio.AddDays(1);

            var reservas = await _context.Reservas
                .Where(r =>
                    r.CanchaId == canchaId &&
                    r.Fecha >= inicio &&
                    r.Fecha < fin &&
                    r.Estado != "Cancelada")
                .Select(r => new
                {
                    r.Id,
                    r.CanchaId,
                    r.Fecha,
                    r.HoraInicio,
                    r.HoraFin,
                    Tipo = "Reserva",
                    Motivo = "Reservado"
                })
                .ToListAsync();

            var bloqueos = await _context.HorariosBloqueados
                .Where(b =>
                    b.CanchaId == canchaId &&
                    b.Fecha >= inicio &&
                    b.Fecha < fin)
                .Select(b => new
                {
                    b.Id,
                    b.CanchaId,
                    b.Fecha,
                    b.HoraInicio,
                    b.HoraFin,
                    Tipo = "Bloqueo",
                    Motivo = b.Motivo ?? "Bloqueado"
                })
                .ToListAsync();

            var ocupados = reservas
                .Concat(bloqueos)
                .OrderBy(x => x.HoraInicio)
                .ToList();

            return Ok(ocupados);
        }

        [HttpPost]
        public async Task<IActionResult> CrearReserva(Reserva reserva)
        {
            reserva.Fecha = DateTime.SpecifyKind(reserva.Fecha.Date, DateTimeKind.Utc);

            if (reserva.HoraInicio >= reserva.HoraFin)
                return BadRequest("La hora de inicio debe ser menor que la hora fin.");

            var inicio = reserva.Fecha;
            var fin = inicio.AddDays(1);

            var existeReserva = await _context.Reservas.AnyAsync(r =>
                r.CanchaId == reserva.CanchaId &&
                r.Fecha >= inicio &&
                r.Fecha < fin &&
                r.Estado != "Cancelada" &&
                reserva.HoraInicio < r.HoraFin &&
                reserva.HoraFin > r.HoraInicio
            );

            if (existeReserva)
                return BadRequest("Ya existe una reserva en ese horario.");

            var existeBloqueo = await _context.HorariosBloqueados.AnyAsync(b =>
                b.CanchaId == reserva.CanchaId &&
                b.Fecha >= inicio &&
                b.Fecha < fin &&
                reserva.HoraInicio < b.HoraFin &&
                reserva.HoraFin > b.HoraInicio
            );

            if (existeBloqueo)
                return BadRequest("Este horario está bloqueado por administración.");

            var cancha = await _context.Canchas.FindAsync(reserva.CanchaId);

            if (cancha == null)
                return BadRequest("La cancha no existe.");

            reserva.Estado = "Reservada";
            reserva.EstadoPago = "Pendiente";
            reserva.MetodoPago = null;
            reserva.FechaPago = null;
            reserva.MontoTotal = cancha.PrecioHora;

            _context.Reservas.Add(reserva);
            await _context.SaveChangesAsync();

            var partido = new Partido
            {
                ReservaId = reserva.Id,
                UsuarioCreadorId = reserva.UsuarioId,
                Titulo = $"Partido abierto - {cancha.Nombre}",
                Nivel = "Libre",
                CuposTotales = reserva.CantidadJugadores,
                Estado = "Abierto",
                FechaCreacion = DateTime.UtcNow
            };

            _context.Partidos.Add(partido);
            await _context.SaveChangesAsync();

            var jugadorCreador = new PartidoJugador
            {
                PartidoId = partido.Id,
                UsuarioId = reserva.UsuarioId,
                FechaUnion = DateTime.UtcNow
            };

            _context.PartidoJugadores.Add(jugadorCreador);
            await _context.SaveChangesAsync();

            return Ok(reserva);
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<IActionResult> GetReservasPorUsuario(int usuarioId)
        {
            var reservas = await _context.Reservas
                .Include(r => r.Cancha)
                .Where(r => r.UsuarioId == usuarioId)
                .OrderByDescending(r => r.Fecha)
                .ThenBy(r => r.HoraInicio)
                .ToListAsync();

            return Ok(reservas);
        }

        [HttpPut("{id}/pago")]
        public async Task<IActionResult> MarcarComoPagado(int id)
        {
            var reserva = await _context.Reservas
                .Include(r => r.Cancha)
                .Include(r => r.Usuario)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reserva == null)
                return NotFound("Reserva no encontrada.");

            if (reserva.Estado == "Cancelada")
                return BadRequest("No se puede marcar como pagada una reserva cancelada.");

            reserva.EstadoPago = "Pagado";
            reserva.MetodoPago = "SINPE";
            reserva.FechaPago = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(reserva);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelarReserva(int id)
        {
            var reserva = await _context.Reservas
                .Include(r => r.Cancha)
                .Include(r => r.Usuario)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reserva == null)
                return NotFound("Reserva no encontrada.");

            reserva.Estado = "Cancelada";

            await _context.SaveChangesAsync();

            return Ok(reserva);
        }
    }
}