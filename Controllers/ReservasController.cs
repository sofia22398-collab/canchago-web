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
            var reservas = await _context.Reservas
                .Where(r =>
                    r.CanchaId == canchaId &&
                    r.Fecha.Date == fecha.Date &&
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
                    b.Fecha.Date == fecha.Date)
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
            if (reserva.HoraInicio >= reserva.HoraFin)
                return BadRequest("La hora de inicio debe ser menor que la hora fin.");

            var existeReserva = await _context.Reservas.AnyAsync(r =>
                r.CanchaId == reserva.CanchaId &&
                r.Fecha.Date == reserva.Fecha.Date &&
                r.Estado != "Cancelada" &&
                reserva.HoraInicio < r.HoraFin &&
                reserva.HoraFin > r.HoraInicio
            );

            if (existeReserva)
                return BadRequest("Ya existe una reserva en ese horario.");

            var existeBloqueo = await _context.HorariosBloqueados.AnyAsync(b =>
                b.CanchaId == reserva.CanchaId &&
                b.Fecha.Date == reserva.Fecha.Date &&
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
                FechaCreacion = DateTime.Now
            };

            _context.Partidos.Add(partido);
            await _context.SaveChangesAsync();

            var jugadorCreador = new PartidoJugador
            {
                PartidoId = partido.Id,
                UsuarioId = reserva.UsuarioId,
                FechaUnion = DateTime.Now
            };

            _context.PartidoJugadores.Add(jugadorCreador);
            await _context.SaveChangesAsync();

            var usuario = await _context.Usuarios.FindAsync(reserva.UsuarioId);

            try
            {
                if (reserva.Usuario != null && reserva.Cancha != null)
                {
                    await _emailService.EnviarCorreoAsync(
                        reserva.Usuario.Correo,
                        "Reserva cancelada - CanchaGo",
                        $@"
            <h2>Reserva cancelada</h2>
            <p>Hola {reserva.Usuario.Nombre}, tu reserva fue cancelada.</p>
            <p><strong>Cancha:</strong> {reserva.Cancha.Nombre}</p>
            <p><strong>Fecha:</strong> {reserva.Fecha:dd/MM/yyyy}</p>
            <p><strong>Hora:</strong> {reserva.HoraInicio:hh\:mm} - {reserva.HoraFin:hh\:mm}</p>
            "
                    );
                }
            }
            catch
            {
            }

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
            reserva.FechaPago = DateTime.Now;

            await _context.SaveChangesAsync();

            if (reserva.Usuario != null && reserva.Cancha != null)
            {
                await _emailService.EnviarCorreoAsync(
                    reserva.Usuario.Correo,
                    "Pago confirmado - CanchaGo",
                    $@"
                    <h2>Pago confirmado ✅</h2>
                    <p>Hola {reserva.Usuario.Nombre}, el pago de tu reserva fue confirmado.</p>
                    <p><strong>Cancha:</strong> {reserva.Cancha.Nombre}</p>
                    <p><strong>Fecha:</strong> {reserva.Fecha:dd/MM/yyyy}</p>
                    <p><strong>Hora:</strong> {reserva.HoraInicio:hh\:mm} - {reserva.HoraFin:hh\:mm}</p>
                    <p><strong>Monto:</strong> ₡{reserva.MontoTotal:N2}</p>
                    <p><strong>Método de pago:</strong> {reserva.MetodoPago}</p>
                    "
                );
            }

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

            if (reserva.Usuario != null && reserva.Cancha != null)
            {
                await _emailService.EnviarCorreoAsync(
                    reserva.Usuario.Correo,
                    "Reserva cancelada - CanchaGo",
                    $@"
                    <h2>Reserva cancelada</h2>
                    <p>Hola {reserva.Usuario.Nombre}, tu reserva fue cancelada.</p>
                    <p><strong>Cancha:</strong> {reserva.Cancha.Nombre}</p>
                    <p><strong>Fecha:</strong> {reserva.Fecha:dd/MM/yyyy}</p>
                    <p><strong>Hora:</strong> {reserva.HoraInicio:hh\:mm} - {reserva.HoraFin:hh\:mm}</p>
                    "
                );
            }

            return Ok(reserva);
        }
    }
}