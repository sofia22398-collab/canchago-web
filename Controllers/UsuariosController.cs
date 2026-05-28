using CanchaGo.Data;
using CanchaGo.DTOs;
using CanchaGo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CanchaGo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("registro")]
        public async Task<IActionResult> Registro(RegistroUsuarioDto dto)
        {
            var existe = await _context.Usuarios
                .AnyAsync(u => u.Correo == dto.Correo);

            if (existe)
                return BadRequest("Ya existe un usuario con ese correo.");

            var usuario = new Usuario
            {
                Nombre = dto.Nombre,
                Correo = dto.Correo,
                PasswordHash = dto.Password,
                Telefono = dto.Telefono,
                Rol = "Cliente",
                Activo = true
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(usuario);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u =>
                    u.Correo == dto.Correo &&
                    u.PasswordHash == dto.Password &&
                    u.Activo);

            if (usuario == null)
                return Unauthorized("Correo o contraseña incorrectos.");

            return Ok(usuario);
        }
    }
}