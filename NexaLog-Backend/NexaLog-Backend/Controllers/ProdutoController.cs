using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexaLog_Backend.Data;
using NexaLog_Backend.Filters;
using NexaLog_Backend.Models;

namespace NexaLog_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProdutoController : ControllerBase
    {
        private readonly NexaLogContext _context;
        public ProdutoController(NexaLogContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Produto>>> GetProdutos()
        {
            return await _context.Produtos
                .Include(p => p.Lotes)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Produto>> GetProduto(int id)
        {
            var produto = await _context.Produtos
                .Include(p => p.Lotes)
                .FirstOrDefaultAsync(p => p.IdProduto == id);

            if (produto == null)
                return NotFound();

            return produto;
        }

        [HttpPost]
        [CargoAuthorize("Administrador", "Gestor")]
        public async Task<ActionResult<Produto>> PostProduto(Produto produto)
        {
            _context.Produtos.Add(produto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduto), new { id = produto.IdProduto }, produto);
        }

        [HttpPut("{id}")]
        [CargoAuthorize("Administrador", "Gestor")]
        public async Task<IActionResult> PutProduto(int id, Produto produtoAtualizado)
        {
            if (id != produtoAtualizado.IdProduto)
                return BadRequest();

            var produto = await _context.Produtos.FindAsync(id);
            if (produto == null)
                return NotFound();

            produto.Nome = produtoAtualizado.Nome;
            produto.DataCadastro = produtoAtualizado.DataCadastro;
            produto.DataValidade = produtoAtualizado.DataValidade;
            produto.Quantidade = produtoAtualizado.Quantidade;
            produto.CodProduto = produtoAtualizado.CodProduto;
            produto.Descricao = produtoAtualizado.Descricao;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [CargoAuthorize("Administrador")]
        public async Task<IActionResult> DeleteProduto(int id)
        {
            var produto = await _context.Produtos.FindAsync(id);0
            if (produto == null)
                return NotFound();

            _context.Produtos.Remove(produto);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return BadRequest("Não é possível excluir este produto pois existem lotes ou movimentações associadas a ele.");
            }

            return NoContent();
        }
    }
}