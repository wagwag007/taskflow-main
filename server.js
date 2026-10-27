import 'dotenv/config';
import http from 'node:http';
import process from 'node:process';

const PORT = process.env.PORT || 3000;
const tasks = [];
let nextTaskId = 1;

const users = [
  {
    id: 1,
    nome: 'wagner',
    email: 'wagnerfilho321@gmail.com',
    senha: '123456',
  },
];

const statuses = new Set(['pending', 'inprogress', 'done']);
const priorities = new Set(['alta', 'media', 'baixa']);

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(payload));
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Corpo da requisição muito grande.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new SyntaxError('JSON inválido.'));
      }
    });
    req.on('error', reject);
  });

const getUsuarioAutenticado = (req) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const match = token?.match(/^taskflow-token-(\d+)$/);
  if (!match) return null;
  return users.find((user) => user.id === Number(match[1])) || null;
};

const validarTarefa = (dados, parcial = false) => {
  const tarefa = {};

  if (!parcial || Object.hasOwn(dados, 'texto')) {
    const texto = typeof dados.texto === 'string' ? dados.texto.trim() : '';
    if (!texto) return { erro: 'Informe o texto da tarefa.' };
    tarefa.texto = texto;
  }

  if (!parcial || Object.hasOwn(dados, 'prioridade')) {
    const prioridade = dados.prioridade || 'media';
    if (!priorities.has(prioridade)) return { erro: 'Prioridade inválida.' };
    tarefa.prioridade = prioridade;
  }

  if (Object.hasOwn(dados, 'status')) {
    if (!statuses.has(dados.status)) return { erro: 'Status inválido.' };
    tarefa.status = dados.status;
    tarefa.concluida = dados.status === 'done';
  } else if (Object.hasOwn(dados, 'concluida')) {
    if (typeof dados.concluida !== 'boolean') {
      return { erro: 'O campo concluida deve ser booleano.' };
    }
    tarefa.concluida = dados.concluida;
    tarefa.status = dados.concluida ? 'done' : 'pending';
  }

  if (!parcial) {
    tarefa.status = tarefa.status || 'pending';
    tarefa.concluida = tarefa.status === 'done';
  }

  return { tarefa };
};

const server = http.createServer(async (req, res) => {
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

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { ok: true, message: 'TaskFlow API funcionando' });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/auth/login') {
      const dados = await readJsonBody(req);
      const email = String(dados.email || '').trim().toLowerCase();
      const senha = String(dados.senha || '').trim();

      if (!email || !senha) {
        sendJson(res, 400, { erro: 'Informe e-mail e senha.' });
        return;
      }

      const usuario = users.find(
        (item) => item.email.toLowerCase() === email && item.senha === senha
      );

      if (!usuario) {
        sendJson(res, 401, { erro: 'E-mail ou senha inválidos.' });
        return;
      }

      sendJson(res, 200, {
        token: `taskflow-token-${usuario.id}`,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      });
      return;
    }

    if (url.pathname.startsWith('/tasks')) {
      const usuario = getUsuarioAutenticado(req);
      if (!usuario) {
        sendJson(res, 401, { erro: 'Faça login para acessar as tarefas.' });
        return;
      }
      if (req.method === 'GET' && url.pathname === '/tasks') {
        const tarefas = tasks
          .filter((task) => task.userId === usuario.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        sendJson(res, 200, tarefas);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/tasks') {
        const dados = await readJsonBody(req);
        const resultado = validarTarefa(dados);
        if (resultado.erro) {
          sendJson(res, 400, { erro: resultado.erro });
          return;
        }

        const agora = new Date().toISOString();
        const tarefa = {
          id: nextTaskId++,
          ...resultado.tarefa,
          userId: usuario.id,
          createdAt: agora,
          updatedAt: agora,
        };
        tasks.push(tarefa);
        sendJson(res, 201, tarefa);
        return;
      }

      const match = url.pathname.match(/^\/tasks\/(\d+)$/);
      if (match && ['PUT', 'DELETE'].includes(req.method)) {
        const id = Number(match[1]);
        if (req.method === 'DELETE') {
          const index = tasks.findIndex(
            (task) => task.id === id && task.userId === usuario.id
          );
          if (index === -1) {
            sendJson(res, 404, { erro: 'Tarefa não encontrada.' });
            return;
          }
          tasks.splice(index, 1);
          sendJson(res, 200, { ok: true });
          return;
        }

        const dados = await readJsonBody(req);
        const resultado = validarTarefa(dados, true);
        if (resultado.erro) {
          sendJson(res, 400, { erro: resultado.erro });
          return;
        }

        const tarefa = tasks.find(
          (task) => task.id === id && task.userId === usuario.id
        );
        if (!tarefa) {
          sendJson(res, 404, { erro: 'Tarefa não encontrada.' });
          return;
        }

        Object.assign(tarefa, resultado.tarefa, {
          updatedAt: new Date().toISOString(),
        });
        sendJson(res, 200, tarefa);
        return;
      }
    }

    sendJson(res, 404, { erro: 'Rota não encontrada.' });
  } catch (error) {
    if (error instanceof SyntaxError) {
      sendJson(res, 400, { erro: 'JSON inválido.' });
      return;
    }
    console.error('Erro ao processar requisição:', error);
    sendJson(res, 500, { erro: 'Erro interno ao processar a requisição.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`TaskFlow API rodando em http://localhost:${PORT}`);
});

const encerrar = () => {
  server.close();
};

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
