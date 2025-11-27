module.exports = async function adminAuth(req, res, next) {
  try {
    const Usuario = require("../models/usuarioModel");
    const adminId = req.header('x-admin-id');
    if (!adminId) return res.status(401).json({ message: 'Admin required.' });

    const usuario = await Usuario.buscarPorId(parseInt(adminId, 10));
    if (!usuario) return res.status(401).json({ message: 'Admin required.' });

    // verifica coluna adm_usuario (0/1)
    if (!usuario.adm_usuario || Number(usuario.adm_usuario) !== 1) {
      return res.status(403).json({ message: 'Forbidden. Admin only.' });
    }

    req.admin = { id: usuario.id_usuario, nome: usuario.nome_usuario };
    next();
  } catch (err) {
    console.error('adminAuth error', err);
    return res.status(500).json({ message: 'Erro interno.' });
  }
};