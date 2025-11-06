const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Importa as rotas
const cidadeRoutes = require("./routes/cidadeRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const produtoRoutes = require("./routes/produtoRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");

// Usa as rotas com prefixos
app.use("/cidades", cidadeRoutes);
app.use("/clientes", clienteRoutes);
app.use("/pedidos", pedidoRoutes);
app.use("/produtos", produtoRoutes);
app.use("/categorias", categoriaRoutes);

// Rota inicial
app.get("/", (req, res) => {
  res.json({ mensagem: "API Node MVC funcionando 🚀" });
});

// Middleware de erro genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: "Erro interno no servidor" });
});

module.exports = app;
