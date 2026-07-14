using NexaLog_Backend.Models;

public class Lote
{
    public int IdLote { get; set; }
    public int QuantidadeLote { get; set; }
    public string CodLote { get; set; } = string.Empty;
    public DateOnly DataValidade { get; set; }
    public DateOnly DataFabricacao { get; set; }
    public int FkProdutoIdProduto { get; set; }
    public Produto? Produto { get; set; }
}