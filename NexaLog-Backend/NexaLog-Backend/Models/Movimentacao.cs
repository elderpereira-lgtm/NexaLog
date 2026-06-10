namespace NexaLog_Backend.Models
{
	public class Movimentacao
	{
		public int IdMovimentacao { get; set; }
		public string TipoMovimentacao { get; set; } = string.Empty;
		public DateTime DataMovimentacao { get; set; }
		public int FkUsuarioIdUsuario { get; set; }
	}
}