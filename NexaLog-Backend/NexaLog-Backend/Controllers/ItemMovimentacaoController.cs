using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexaLog_Backend.Data;
using NexaLog_Backend.Filters;
using NexaLog_Backend.Models;

namespace NexaLog_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemMovimentacaoController : ControllerBase
    {
        private readonly NexaLogContext _context;
        public ItemMovimentacaoController(NexaLogContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemMovimentacao>>> GetItensMovimentacao()
        {
            return await _context.ItensMovimentacao.ToListAsync();
        }

        [HttpGet("{idProduto}/{idMovimentacao}")]
        public async Task<ActionResult<ItemMovimentacao>> GetItemMovimentacao(int idProduto, int idMovimentacao)
        {
            var item = await _context.ItensMovimentacao.FindAsync(idProduto, idMovimentacao);
            if (item == null)
                return NotFound();
            return item;
        }

        [HttpPost]
        [CargoAuthorize("Administrador", "Encarregado")]
        public async Task<ActionResult<ItemMovimentacao>> PostItemMovimentacao(ItemMovimentacao item)
        {
            var produtoExiste = await _context.Produtos
                .AnyAsync(p => p.IdProduto == item.FkProdutoIdProduto);
            if (!produtoExiste)
                return BadRequest("Produto não encontrado.");
            var movimentacaoExiste = await _context.Movimentacoes
                .AnyAsync(m => m.IdMovimentacao == item.FkMovimentacaoIdMovimentacao);
            if (!movimentacaoExiste)
                return BadRequest("Movimentação não encontrada.");
            _context.ItensMovimentacao.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(
                nameof(GetItemMovimentacao),
                new
                {
                    idProduto = item.FkProdutoIdProduto,
                    idMovimentacao = item.FkMovimentacaoIdMovimentacao
                },
                item
            );
        }

        [HttpPut("{idProduto}/{idMovimentacao}")]
        [CargoAuthorize("Administrador", "Encarregado")]
        public async Task<IActionResult> PutItemMovimentacao( int idProduto, int idMovimentacao, ItemMovimentacao itemAtualizado)
        {
            if (idProduto != itemAtualizado.FkProdutoIdProduto ||
                idMovimentacao != itemAtualizado.FkMovimentacaoIdMovimentacao)
            {
                return BadRequest();
            }

            var item = await _context.ItensMovimentacao.FindAsync(idProduto, idMovimentacao);
            if (item == null)
                return NotFound();

            item.Quantidade = itemAtualizado.Quantidade;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{idProduto}/{idMovimentacao}")]
        [CargoAuthorize("Administrador")]
        public async Task<IActionResult> DeleteItemMovimentacao(int idProduto, int idMovimentacao)
        {
            var item = await _context.ItensMovimentacao.FindAsync(idProduto, idMovimentacao);
            if (item == null)
                return NotFound();
            _context.ItensMovimentacao.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}