import http from 'node:http';

const PORT = process.env.PORT || 3001;

const users = [
  {
    id: 1,
    nome: 'Administrador',
    email: 'admin@taskflow.com',
    senha: '123456',
  },
];

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  res.end(JSON.stringify(payload));
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, {
      ok: true,
      message: 'TaskFlow API funcionando',
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/auth/login') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const dados = JSON.parse(body || '{}');
        const email = String(dados.email || '').trim().toLowerCase();
        const senha = String(dados.senha || '').trim();

        if (!email || !senha) {
          sendJson(res, 400, {
            erro: 'Informe e-mail e senha.',
          });
          return;
        }

        const usuario = users.find(
          (item) => item.email.toLowerCase() === email && item.senha === senha
        );

        if (!usuario) {
          sendJson(res, 401, {
            erro: 'E-mail ou senha inválidos.',
          });
          return;
        }

        sendJson(res, 200, {
          token: `taskflow-token-${Date.now()}`,
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
          },
        });
      } catch (error) {
        sendJson(res, 400, {
          erro: 'JSON inválido.',
        });
      }
    });

    return;
  }

  sendJson(res, 404, {
    erro: 'Rota não encontrada.',
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`TaskFlow API rodando em http://localhost:${PORT}`);
});
