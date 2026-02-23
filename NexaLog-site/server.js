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
    model: "gpt-5-nano",
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
response.then((result) => console.log(result.output_text));
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});