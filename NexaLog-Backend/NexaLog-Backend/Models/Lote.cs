using NexaLog_Backend.Models;
using System.Text.Json.Serialization;
public class Lote
{
    public int IdLote { get; set; }
    public decimal QuantidadeLote { get; set; }
    public string CodLote { get; set; } = string.Empty;
    public DateOnly DataValidade { get; set; }
    public DateOnly DataFabricacao { get; set; }
    public int FkProdutoIdProduto { get; set; }
    [JsonIgnore]
    public Produto? Produto { get; set; }
}