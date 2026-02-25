const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/previsao", (req, res) => {
    const {historico} = req.body;;

    const media =
    historico.reduce((a,b)=>a+b,0) /
    historico.length;

    const previsão = Math.round(media * 1.1);
    res.json({ previsao });
});

app.listen(5500, () => {
    console.log("IA rodando na porta 5500");
});