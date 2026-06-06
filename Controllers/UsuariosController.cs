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

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerUsuario(int id)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == id && u.Activo);

            if (usuario == null)
                return NotFound("Usuario no encontrado.");

            return Ok(usuario);
        }

        [HttpPut("{id}/perfil")]
        public async Task<IActionResult> ActualizarPerfil(int id, ActualizarPerfilDto dto)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == id && u.Activo);

            if (usuario == null)
                return NotFound("Usuario no encontrado.");

            var correoExiste = await _context.Usuarios
                .AnyAsync(u => u.Correo == dto.Correo && u.Id != id);

            if (correoExiste)
                return BadRequest("Ya existe otro usuario con ese correo.");

            usuario.Nombre = dto.Nombre;
            usuario.Correo = dto.Correo;
            usuario.Telefono = dto.Telefono;
            usuario.Genero = dto.Genero;
            usuario.FechaNacimiento = dto.FechaNacimiento;

            await _context.SaveChangesAsync();

            return Ok(usuario);
        }
    }
}