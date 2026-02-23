import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: "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",
});

app.post("/gerar-descricao", async (req, res) => {
  const { nomeProduto } = req.body;

  const response = openai.responses.create({
    model: "gpt-4.1",
    input: "write a haiku about ai",
    store: true,
    messages: [
      {
        role: "user",
        content: `Crie uma descrição profissional para o produto: ${nomeProduto}`
      }
    ]
  });

  res.json({ descricao: response.choices[0].message.content });
});

app.listen(5500, () => {
  console.log("Servidor rodando na porta 5500");
});