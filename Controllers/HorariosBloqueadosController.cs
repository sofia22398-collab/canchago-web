using CanchaGo.Data;
using CanchaGo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CanchaGo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HorariosBloqueadosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HorariosBloqueadosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBloqueos()
        {
            var bloqueos = await _context.HorariosBloqueados
                .Include(b => b.Cancha)
                .ToListAsync();

            return Ok(bloqueos);
        }

        [HttpPost]
        public async Task<IActionResult> CrearBloqueo(HorarioBloqueado bloqueo)
        {
            if (bloqueo.HoraInicio >= bloqueo.HoraFin)
                return BadRequest("La hora de inicio debe ser menor que la hora fin.");

            var existeReserva = await _context.Reservas.AnyAsync(r =>
                r.CanchaId == bloqueo.CanchaId &&
                r.Fecha.Date == bloqueo.Fecha.Date &&
                r.Estado != "Cancelada" &&
                bloqueo.HoraInicio < r.HoraFin &&
                bloqueo.HoraFin > r.HoraInicio
            );

            if (existeReserva)
                return BadRequest("No puede bloquear este horario porque ya existe una reserva.");

            var existeBloqueo = await _context.HorariosBloqueados.AnyAsync(b =>
                b.CanchaId == bloqueo.CanchaId &&
                b.Fecha.Date == bloqueo.Fecha.Date &&
                bloqueo.HoraInicio < b.HoraFin &&
                bloqueo.HoraFin > b.HoraInicio
            );

            if (existeBloqueo)
                return BadRequest("Ya existe un bloqueo en ese horario.");

            _context.HorariosBloqueados.Add(bloqueo);
            await _context.SaveChangesAsync();

            return Ok(bloqueo);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarBloqueo(int id)
        {
            var bloqueo = await _context.HorariosBloqueados.FindAsync(id);

            if (bloqueo == null)
                return NotFound("Bloqueo no encontrado.");

            _context.HorariosBloqueados.Remove(bloqueo);
            await _context.SaveChangesAsync();

            return Ok("Bloqueo eliminado correctamente.");
        }
    }
}