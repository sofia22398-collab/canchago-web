namespace CanchaGo.DTOs
{
    public class ActualizarPerfilDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public string? Genero { get; set; }
        public DateTime? FechaNacimiento { get; set; }
    }
}