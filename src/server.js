const express = require('express');
const app = express();
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoutes');
const atendimentoRoutes = require('./routes/atendimentoRoutes'); 
const relatorioRoutes = require('./routes/relatorioRoutes');


app.use(cors());
app.use(express.json());
app.use('/', usuarioRoutes);
app.use('/', atendimentoRoutes); 
app.use('/', relatorioRoutes);

app.listen(3000, () => console.log('API rodando na porta 3000'));