using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexaLog_Backend.Data;
using NexaLog_Backend.Dtos;
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
        public async Task<ActionResult<IEnumerable<LoteComProdutoDto>>> GetLotes()
        {
            return await _context.Lotes
                .Include(l => l.Produto)
                .Select(l => new LoteComProdutoDto
                {
                    IdLote = l.IdLote,
                    CodLote = l.CodLote,
                    QuantidadeLote = l.QuantidadeLote,
                    NomeProduto = l.Produto!.Nome
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LoteComProdutoDto>> GetLote(int id)
        {
            var lote = await _context.Lotes
                .Include(l => l.Produto)
                .Where(l => l.IdLote == id)
                .Select(l => new LoteComProdutoDto
                {
                    IdLote = l.IdLote,
                    CodLote = l.CodLote,
                    QuantidadeLote = l.QuantidadeLote,
                    NomeProduto = l.Produto!.Nome
                })
                .FirstOrDefaultAsync();

            if (lote == null)
                return NotFound();

            return lote;
        }

        [HttpPost]
        [CargoAuthorize("Administrador", "Gestor")]
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
        [CargoAuthorize("Administrador", "Gestor")]
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