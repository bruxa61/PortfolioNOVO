import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'COLE_SUA_DATABASE_URL_DO_RENDER_AQUI'
});

await client.connect();

// Exportar estrutura
const tables = await client.query(`
  SELECT tablename FROM pg_tables 
  WHERE schemaname = 'public'
`);

console.log('Tabelas encontradas:', tables.rows.map(r => r.tablename));

await client.end();
