using Microsoft.EntityFrameworkCore;
using NexaLog_Backend.Models;

namespace NexaLog_Backend.Data
{
    public class NexaLogContext : DbContext
    {
        public NexaLogContext(DbContextOptions<NexaLogContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Produto> Produtos { get; set; }
        public DbSet<Movimentacao> Movimentacoes { get; set; }
        public DbSet<Lote> Lotes { get; set; }
        public DbSet<ItemMovimentacao> ItensMovimentacao { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Usuario>().ToTable("Usuario");
            modelBuilder.Entity<Usuario>().HasKey(u => u.IdUsuario);
            modelBuilder.Entity<Usuario>().Property(u => u.IdUsuario).HasColumnName("id_usuario");
            modelBuilder.Entity<Usuario>().Property(u => u.Email).HasColumnName("email");
            modelBuilder.Entity<Usuario>().Property(u => u.Nome).HasColumnName("nome");
            modelBuilder.Entity<Usuario>().Property(u => u.Senha).HasColumnName("senha");
            modelBuilder.Entity<Usuario>().Property(u => u.TipoUsuario).HasColumnName("tipo_usuario");

            modelBuilder.Entity<Produto>().ToTable("Produto");
            modelBuilder.Entity<Produto>().HasKey(p => p.IdProduto);
            modelBuilder.Entity<Produto>().Property(p => p.IdProduto).HasColumnName("id_produto");
            modelBuilder.Entity<Produto>().Property(p => p.Nome).HasColumnName("nome");
            modelBuilder.Entity<Produto>().Property(p => p.DataCadastro).HasColumnName("data_cadastro");
            modelBuilder.Entity<Produto>().Property(p => p.Quantidade).HasColumnName("quantidade");
            modelBuilder.Entity<Produto>().Property(p => p.Descricao).HasColumnName("descricao");

            modelBuilder.Entity<Movimentacao>().ToTable("Movimentacao");
            modelBuilder.Entity<Movimentacao>().HasKey(m => m.IdMovimentacao);
            modelBuilder.Entity<Movimentacao>().Property(m => m.IdMovimentacao).HasColumnName("id_movimentacao");
            modelBuilder.Entity<Movimentacao>().Property(m => m.TipoMovimentacao).HasColumnName("tipo_movimentacao");
            modelBuilder.Entity<Movimentacao>().Property(m => m.DataMovimentacao).HasColumnName("data_movimentacao");
            modelBuilder.Entity<Movimentacao>().Property(m => m.FkUsuarioIdUsuario).HasColumnName("fk_Usuario_id_usuario");

            modelBuilder.Entity<Lote>().ToTable("Lote");
            modelBuilder.Entity<Lote>().HasKey(l => l.IdLote);
            modelBuilder.Entity<Lote>().Property(l => l.IdLote).HasColumnName("id_lote");
            modelBuilder.Entity<Lote>().Property(l => l.QuantidadeLote).HasColumnName("quantidade_lote");
            modelBuilder.Entity<Lote>().Property(l => l.CodLote).HasColumnName("cod_lote");
            modelBuilder.Entity<Lote>().Property(l => l.DataValidade).HasColumnName("data_validade");
            modelBuilder.Entity<Lote>().Property(l => l.DataFabricacao).HasColumnName("data_fabricacao");
            modelBuilder.Entity<Lote>().Property(l => l.FkProdutoIdProduto).HasColumnName("fk_Produto_id_produto");

            modelBuilder.Entity<ItemMovimentacao>().ToTable("Item_Movimentacao");
            modelBuilder.Entity<ItemMovimentacao>()
                .HasKey(i => new { i.FkProdutoIdProduto, i.FkMovimentacaoIdMovimentacao });

            modelBuilder.Entity<ItemMovimentacao>().Property(i => i.FkProdutoIdProduto).HasColumnName("fk_Produto_id_produto");
            modelBuilder.Entity<ItemMovimentacao>().Property(i => i.FkMovimentacaoIdMovimentacao).HasColumnName("fk_Movimentacao_id_movimentacao");
            modelBuilder.Entity<ItemMovimentacao>().Property(i => i.Quantidade).HasColumnName("quantidade").HasPrecision(10, 2);
        }
    }
}