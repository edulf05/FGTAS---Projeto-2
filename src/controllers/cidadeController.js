const Cidade = require("../models/cidadeModel");

module.exports = {
  async listar(req, res, next) {
    try {
      const cidades = await Cidade.listar();
      res.json(cidades);
    } catch (err) {
      next(err);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const cidade = await Cidade.buscarPorId(id);

      if (!cidade) {
        return res.status(404).json({ mensagem: "Cidade não encontrada." });
      }

      res.json(cidade);
    } catch (err) {
      next(err);
    }
  },

  async buscarUltima(req, res, next) {
    try {
      const cidade = await Cidade.buscarUltima();

      if (!cidade) {
        return res.status(404).json({ mensagem: "Nenhuma cidade encontrada." });
      }

      res.json(cidade);
    } catch (err) {
      next(err);
    }
  }
};
