import { useNavigate } from 'react-router-dom';

export default function LogoutButton({ onLogout, label = 'Sair' }) {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate('/login');
  }

  return (
    <button type="button" className="logout-button" onClick={handleLogout}>
      {label}
    </button>
  );
}
