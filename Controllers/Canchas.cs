using CanchaGo.Data;
using CanchaGo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CanchaGo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CanchasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CanchasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCanchas()
        {
            var canchas = await _context.Canchas
                .Where(c => c.Activa)
                .ToListAsync();

            return Ok(canchas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCancha(int id)
        {
            var cancha = await _context.Canchas.FindAsync(id);

            if (cancha == null)
                return NotFound("Cancha no encontrada.");

            return Ok(cancha);
        }

        [HttpPost]
        public async Task<IActionResult> CrearCancha(Cancha cancha)
        {
            cancha.Activa = true;

            _context.Canchas.Add(cancha);
            await _context.SaveChangesAsync();

            return Ok(cancha);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditarCancha(int id, Cancha cancha)
        {
            var existe = await _context.Canchas.FindAsync(id);

            if (existe == null)
                return NotFound("Cancha no encontrada.");

            existe.Nombre = cancha.Nombre;
            existe.TipoDeporte = cancha.TipoDeporte;
            existe.TipoSuperficie = cancha.TipoSuperficie;
            existe.Interior = cancha.Interior;
            existe.Iluminacion = cancha.Iluminacion;
            existe.CantidadJugadores = cancha.CantidadJugadores;
            existe.PrecioHora = cancha.PrecioHora;
            existe.Activa = cancha.Activa;
            existe.Descripcion = cancha.Descripcion;

            await _context.SaveChangesAsync();

            return Ok(existe);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DesactivarCancha(int id)
        {
            var cancha = await _context.Canchas.FindAsync(id);

            if (cancha == null)
                return NotFound("Cancha no encontrada.");

            cancha.Activa = false;
            await _context.SaveChangesAsync();

            return Ok("Cancha desactivada correctamente.");
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetCanchasAdmin()
        {
            var canchas = await _context.Canchas
                .OrderBy(c => c.Nombre)
                .ToListAsync();

            return Ok(canchas);
        }
    }
}