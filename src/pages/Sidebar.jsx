import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

export default function Sidebar({ isAuthenticated, onLogout }) {
  return (
    <aside className={styles.sidebar} aria-label="Sidebar">
      <div className={styles.brand}>TaskFlow</div>
      <nav>
        <ul className={styles.navList}>
          {isAuthenticated && (
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : undefined}>
                Dashboard
              </NavLink>
            </li>
          )}
          {!isAuthenticated && (
            <li>
              <NavLink to="/login" className={({ isActive }) => isActive ? styles.active : undefined}>
                Login
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/sobre" className={({ isActive }) => isActive ? styles.active : undefined}>
              Sobre
            </NavLink>
          </li>
        </ul>
      </nav>
      {isAuthenticated && (
        <button type="button" className={styles.logoutButton} onClick={onLogout}>
          Sair
        </button>
      )}
    </aside>
  );
}
