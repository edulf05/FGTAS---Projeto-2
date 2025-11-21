const express = require('express');
const app = express();
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoutes');

app.use(cors());
app.use(express.json());
app.use('/', usuarioRoutes);

app.listen(3000, () => console.log('API rodando na porta 3000'));