const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

app.get('/api/rececao-uvas', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const query = `
            select m.Campanha,m.DataMovimento,m.CodSocio,F.nome,A.Artigo,A.Descricao,SA.SubFamilia,SA.Descricao as DescricaoSubFamilia,A.CDU_Casta,C.Descricao as DescricaoCasta,M.PesoLiquido,M.Grau,m.processovindima,PV.Descricao as DescricaoProcesso
            from VIN_RececaoUvaMovimentos M
            inner join Fornecedores F on F.Fornecedor=M.codsocio
            inner join Artigo A on A.Artigo = M.TipoUva
            inner join Familias FA on FA.Familia=A.Familia
            inner join SubFamilias SA on SA.Familia=A.Familia and SA.SubFamilia=A.SubFamilia
            inner join Marcas MA on MA.Marca=A.Marca
            inner join VIN_Castas C on C.Codigo=A.CDU_Casta
            inner join VIN_ProcessoVindima PV on PV.Codigo=M.ProcessoVindima
            where M.DataAnulado is null
        `;
        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Database connection or query error:', err);
        res.status(500).send('Erro ao obter dados da base de dados');
    } finally {
        // sql.close(); // Not strictly necessary for single queries if connection pool is used properly, but good practice.
    }
});

app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Servidor a correr na porta ${port}`);
});
