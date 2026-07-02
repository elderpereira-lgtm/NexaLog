using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;

namespace NexaLog_Backend.Filters
{
    public class ExigirLoginAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var temAllowAnonimo = context.ActionDescriptor is ControllerActionDescriptor descriptor &&
                (
                    descriptor.MethodInfo.GetCustomAttributes(typeof(AllowAnonimoAttribute), true).Any() ||
                    descriptor.ControllerTypeInfo.GetCustomAttributes(typeof(AllowAnonimoAttribute), true).Any()
                );

            if (temAllowAnonimo)
            {
                base.OnActionExecuting(context);
                return;
            }

            var idUsuario = context.HttpContext.Session.GetInt32("IdUsuario");
            if (idUsuario == null)
            {
                context.Result = new UnauthorizedObjectResult("Nenhum usuário logado");
                return;
            }

            base.OnActionExecuting(context);
        }
    }
}