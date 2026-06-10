using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexaLog_Backend.Data;
using NexaLog_Backend.Models;

namespace NexaLog_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoteController : ControllerBase
    {
        private readonly NexaLogContext _context;

        public LoteController(NexaLogContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lote>>> GetLotes()
        {
            return await _context.Lotes.ToListAsync();
        }
    }
}