using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexaLog_Backend.Data;
using NexaLog_Backend.Filters;
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
            return await _context.Lotes
               .Include(l => l.Produto)
               .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Lote>> GetLote(int id)
        {
            var lote = await _context.Lotes
                .Include(l => l.Produto)
                .FirstOrDefaultAsync(l => l.IdLote == id);

            if (lote == null)
                return NotFound();

            return lote;
        }

        [HttpPost]
        [CargoAuthorize("Administrador", "Encarregado")]
        public async Task<ActionResult<Lote>> PostLote(Lote lote)
        {
            _context.Lotes.Add(lote);
            await _context.SaveChangesAsync();
            return CreatedAtAction(
                nameof(GetLote),
                new { id = lote.IdLote },
                lote
            );
        }

        [HttpPut("{id}")]
        [CargoAuthorize("Administrador", "Encarregado")]
        public async Task<IActionResult> PutLote(int id, Lote lote)
        {
            if (id != lote.IdLote)
                return BadRequest();
            _context.Entry(lote).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Lotes.Any(e => e.IdLote == id))
                    return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        [CargoAuthorize("Administrador")]
        public async Task<IActionResult> DeleteLote(int id)
        {
            var lote = await _context.Lotes.FindAsync(id);
            if (lote == null)
                return NotFound();
            _context.Lotes.Remove(lote);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}