using NexaLog_Backend.Data;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace NexaLog_Backend.Filters
{
    public class CargoAuthorizeAttribute : ActionFilterAttribute
    {
        private readonly string[] _cargosPermitidos;
        public CargoAuthorizeAttribute(params string[] cargos)
        {
            _cargosPermitidos = cargos;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var session = context.HttpContext.Session;
            var id = session.GetInt32("IdUsuario");

            if (id == null)
            {
                context.Result = new UnauthorizedObjectResult("Não logado");
                return;
            }
            var db = context.HttpContext.RequestServices
                            .GetRequiredService<NexaLogContext>();
            var usuario = db.Usuarios.Find(id.Value);

            if (usuario == null || !_cargosPermitidos.Contains(usuario.TipoUsuario))
            {
                context.Result = new ObjectResult(new
                {
                    mensagem = "Acesso negado para seu cargo."
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }

            base.OnActionExecuting(context);
        }
    }
}