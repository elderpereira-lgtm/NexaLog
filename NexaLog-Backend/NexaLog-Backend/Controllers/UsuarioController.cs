using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexaLog_Backend.Data;
using NexaLog_Backend.Models;

namespace NexaLog_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly NexaLogContext _context;

        public UsuarioController(NexaLogContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            return await _context.Usuarios.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
                return NotFound();

            return usuario;
        }

        [HttpPost("cadastro")]
        public async Task<ActionResult> Cadastro(Usuario usuario)
        {
            var emailExiste = await _context.Usuarios
                .AnyAsync(u => u.Email == usuario.Email);

            if (emailExiste)
                return BadRequest("Este e-mail já está cadastrado.");

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok("Usuário cadastrado com sucesso.");
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginRequest login)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u =>
                    u.Email == login.Email &&
                    u.Senha == login.Senha);

            if (usuario == null)
                return Unauthorized("E-mail ou senha inválidos.");

            HttpContext.Session.SetInt32("IdUsuario", usuario.IdUsuario);
            HttpContext.Session.SetString("NomeUsuario", usuario.Nome);
            HttpContext.Session.SetString("TipoUsuario", usuario.TipoUsuario);

            return Ok(new
            {
                mensagem = "Login realizado com sucesso.",
                idUsuario = usuario.IdUsuario,
                nome = usuario.Nome,
                tipoUsuario = usuario.TipoUsuario
            });
        }

        [HttpGet("sessao")]
        public ActionResult VerificarSessao()
        {
            var idUsuario = HttpContext.Session.GetInt32("IdUsuario");
            var nomeUsuario = HttpContext.Session.GetString("NomeUsuario");
            var tipoUsuario = HttpContext.Session.GetString("TipoUsuario");

            if (idUsuario == null)
                return Unauthorized("Nenhum usuário logado.");

            return Ok(new
            {
                idUsuario,
                nomeUsuario,
                tipoUsuario
            });
        }

        [HttpPost("logout")]
        public ActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok("Logout realizado com sucesso.");
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
    }
}