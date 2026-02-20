import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/gerar-descricao", async (req, res) => {
  const { nomeProduto } = req.body;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Crie uma descrição profissional para o produto: ${nomeProduto}`
      }
    ]
  });

  res.json({ descricao: response.choices[0].message.content });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});