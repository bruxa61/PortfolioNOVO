// Script para testar configurações de HTTPS
import https from 'https';
import http from 'http';

const testUrl = process.argv[2] || 'https://portfolionovo-3.onrender.com';
console.log(`Testando: ${testUrl}`);

const options = {
  hostname: testUrl.replace('https://', '').replace('http://', ''),
  port: 443,
  path: '/',
  method: 'GET',
  rejectUnauthorized: false, // Para debug apenas
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers de Segurança:');
  console.log('- Strict-Transport-Security:', res.headers['strict-transport-security']);
  console.log('- X-Content-Type-Options:', res.headers['x-content-type-options']);
  console.log('- X-Frame-Options:', res.headers['x-frame-options']);
  console.log('- Content-Security-Policy:', res.headers['content-security-policy']);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Conexão HTTPS funcionando!');
    if (data.includes('Rafaela')) {
      console.log('✅ Site carregado corretamente!');
    }
  });
});

req.on('error', (e) => {
  console.error('Erro HTTPS:', e.message);
  console.log('Tentando diagnóstico...');
  
  // Teste adicional para ver certificado
  const testReq = https.request({
    hostname: options.hostname,
    port: 443,
    path: '/',
    method: 'HEAD',
    agent: false,
    rejectUnauthorized: true
  }, (res) => {
    console.log('Certificado válido!');
  });
  
  testReq.on('error', (certError) => {
    console.error('Problema no certificado:', certError.message);
  });
  
  testReq.end();
});

req.end();