using System.Text.Json.Serialization;

namespace NexaLog_Backend.Models
{
    public class Produto
    {
        public int IdProduto { get; set; }
        public string Nome { get; set; } = string.Empty;
        public DateOnly DataCadastro { get; set; }
        public DateOnly DataValidade { get; set; }
        public decimal Quantidade { get; set; }
        public UnidadeMedida Unidade { get; set; }
        public int CodProduto { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public ICollection<Lote> Lotes { get; set; } = new List<Lote>();
    }
}