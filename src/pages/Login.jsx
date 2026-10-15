import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Login.css';

function Login({ login }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro('');

    try {
      const resposta = await api.post('/auth/login', {
        email,
        senha,
      });

      const { token, usuario } = resposta.data;

      login(usuario, token); 
      navigate('/dashboard');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login');
      setShake(true);

      setTimeout(() => {
        setShake(false);
      }, 500);
    }
  }

  return (
    <main className="login-page">
      <form className={`login-form ${shake ? 'shake' : ''}`} onSubmit={handleLogin}>
        <h2>Login</h2>
        
        <label>
          E-mail 
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Senha 
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {erro && <p className="login-error">{erro}</p>}
        
        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}

export default Login;