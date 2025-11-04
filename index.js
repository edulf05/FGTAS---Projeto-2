const express = require("express")
const knex = require("knex")
const errors = require("http-errors")

const app = express()

app.use( express.json() )
app.use( express.urlencoded( {extended : true}) )

const PORT = 8001
const HOSTNAME = "localhost"

const conn = knex( {
    client : "mysql2" ,
    connection : {
        host : HOSTNAME ,
        user : "root" , 
        password : "" ,
        database : "sdm_25_2"
    }
} )

app.get( "/" , (req, res, next)=>{
    res.json( { resposta : "Seja bem-vindo(a) à nossa API-REST"} )
} )

app.get("/cidade", (req, res, next) => {
    // 1. Inicia a query na tabela de produtos
    conn("cidades")
        // 2. Seleciona os campos desejados de AMBAS as tabelas
        .select(
            "cidades.*",             // Pega todos os campos da tabela 'produtos'
        )
        // 4. Mantém a ordenação
        .orderBy("cidades.nome_cidade", "asc")
        // 5. Retorna os dados
        .then(dados => res.json(dados))
        .catch(next);
});

app.get("/cliente", (req, res, next) => {
    conn("clientes")
        .select(
            "clientes.*",
            "clientes.id_cliente AS clienteId",
            "cidades.nome_cidade AS cidadeNome"
        )
        .leftJoin(
            "cidades",                   // tabela relacionada
            "clientes.cidade_id",       // campo FK em clientes
            "=",
            "cidades.id_cidade"          // campo PK em cidades
        )
        .orderBy("clientes.nome_cliente", "asc")
        .then(dados => res.json(dados))
        .catch(next);
});

app.get("/pedido", (req, res, next) => {
    // 1. Inicia a query na tabela de produtos
    conn("pedidos")
        // 2. Seleciona os campos desejados de AMBAS as tabelas
        .select(
            "pedidos.*",             // Pega todos os campos da tabela 'produto'
            "pedidos.id_pedido AS pedidosId" // Pega o campo 'id' da tabela 'clientes' e renomeia para 'clienteId'
        )
        // 3. Junta (JOIN) a tabela 'categoria'
        .leftJoin(
            "pedidos_produto",                            // Tabela a ser juntada
            "pedidos.cidade_id",                 // Chave estrangeira na tabela 'cliente'
            "=",
            "cidades.id_cidade"                          // Chave primária na tabela 'cidade'
        )
        // 4. Mantém a ordenação
        .orderBy("pedidos.id_pedido", "asc")
        // 5. Retorna os dados
        .then(dados => res.json(dados))
        .catch(next);
});

app.get( "/product/last" , (req, res, next)=>{
    conn( "produto" )
        .orderBy( "id" , "desc" )
        .first()
        .select(
            "produto.*",             // Pega todos os campos da tabela 'produto'
            "categoria.nome AS nomeCategoria" // Pega o campo 'nome' da tabela 'categoria' e renomeia para 'nomeCategoria'
        )
        // 3. Junta (JOIN) a tabela 'categoria'
        .leftJoin(
            "categoria",                            // Tabela a ser juntada
            "produto.codCategoria",                 // Chave estrangeira na tabela 'produto'
            "=",
            "categoria.id"                          // Chave primária na tabela 'categoria'
        )
        .then( dados => res.json( dados ) )
        .catch( next )
})
app.get("/product/:idProd", (req, res, next) => {
    const idProduto = req.params.idProd;
    
    conn("produto")
        // 1. Aplica o JOIN com a tabela 'categoria'
        .leftJoin(
            "categoria",                            // Tabela a ser juntada
            "produto.codCategoria",                 // Chave estrangeira na tabela 'produto'
            "=",
            "categoria.id"                          // Chave primária na tabela 'categoria'
        )
        // 2. Seleciona os campos desejados, incluindo o nome da categoria
        .select(
            "produto.*",                             // Todos os campos do produto
            "categoria.nome AS nomeCategoria"       // Nome da categoria, renomeado
        )
        // 3. Filtra pelo ID do produto
        .where("produto.id", idProduto)
        .first()
        .then(dados => {
            if (!dados) {
                // É mais comum usar 404 (Not Found) para um recurso não encontrado por ID,
                // mas mantive sua estrutura de erro para compatibilidade.
                return next(errors(200, "Nenhum Produto encontrado")); 
            }
            res.json(dados);
        })
        .catch(next);
});

// Rota GET para listar todas as categorias
app.get("/categoria", (req, res, next) => {
    conn("categorias")
        .orderBy("nome_categoria", "asc")
        .then(categorias => res.json(categorias))
        .catch(next);
});

// Rota GET para buscar uma categoria por ID
app.get("/categoria/:id", (req, res, next) => {
    const { id } = req.params;
    
    conn("categorias")
        .where({ id_categoria: id })
        .first() // Limita a busca a apenas um registro
        .then(categoria => {
            if (!categoria) {
                return res.status(404).json({ erro: "Categoria não encontrada" });
            }
            res.json(categoria);
        })
        .catch(next);
});

app.post( "/product" , (req, res, next)=>{
    conn( "produto" )
        .insert( req.body )
        .then( dados => {
            if( !dados ){
                return next( errors(404 , "Erro ao inserir")  )
            }
            res.status(201).json( {
                reposta : "Produto Inserido" ,
                id : dados[0]
            } )
        } )
        .catch( next )
})

// Rota POST para criar uma nova categoria
app.post("/category", (req, res, next) => {
    const novaCategoria = req.body; // Assume que o body contém o objeto da categoria { nome: '...' }

    // Verifica se o campo obrigatório está presente (exemplo)
    if (!novaCategoria.nome) {
        return res.status(400).json({ erro: "O nome da categoria é obrigatório." });
    }

    conn("categoria")
        .insert(novaCategoria)
        .then(ids => {
            // Retorna o ID do item inserido e o objeto criado
            res.status(201).json({ id: ids[0], ...novaCategoria });
        })
        .catch(next);
});

app.put( "/product/:idProd" , (req, res, next)=>{
    const idProduto = req.params.idProd
    conn( "produto" )
        .where( "id" , idProduto )
        .update( req.body )
        .then( dados => {
            if( !dados ){
                return next( errors(404 , "Erro ao tentar editar")  )
            }
            res.status(200).json( {
                reposta : "Produto atualizado" 
            } )
        } )
        .catch( next )
})

// Rota PUT para atualizar uma categoria existente
app.put("/category/:id", (req, res, next) => {
    const { id } = req.params;
    const dadosAtualizados = req.body; // Ex: { nome: 'Novo Nome' }

    conn("categoria")
        .where({ id })
        .update(dadosAtualizados)
        .then(count => {
            if (count === 0) {
                return res.status(404).json({ erro: "Categoria não encontrada para atualização" });
            }
            res.status(200).json( {
                reposta : "Categoria atualizado" 
            } )
        })
        .catch(next);
});

app.delete( "/product/:idProd" , (req, res, next)=>{
    const idProduto = req.params.idProd
    conn( "produto" )
        .where( "id" , idProduto )
        .delete( )
        .then( dados => {
            if( !dados ){
                return next( errors(404 , "Erro ao tentar excluir")  )
            }
            res.status(200).json( {
                reposta : "Produto excluído com sucesso!" 
            } )
        } )
        .catch( next )
})

// Rota DELETE para remover uma categoria
app.delete("/category/:id", (req, res, next) => {
    const { id } = req.params;

    conn("categoria")
        .where({ id })
        .del() // Comando para deletar
        .then(count => {
            if (count === 0) {
                return res.status(404).json({ erro: "Categoria não encontrada para exclusão" });
            }
            // Retorna o status 204 (No Content) para exclusão bem-sucedida
            res.status(200).json( {
                reposta : "Categoria excluída com sucesso!" 
            } )
        })
        .catch(next);
});

app.listen( PORT , ()=>{
    console.log( `Loja executando em http://${HOSTNAME}:${PORT}` )
})