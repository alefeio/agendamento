import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';  // CSS modular

import logo from '../assets/logo.jpeg';

const Home: React.FC = () => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentWrapper}>
        <img
          src={logo} alt="Logo Unigrastro"
          className={styles.logo}
        />
        <h1 className={styles.title}>Bem-vindo ao nosso<br /><span>Sistema de Agendamento</span></h1>
        <Link to="/step-flow">
          <button className={styles.button}>Agende sua consulta</button>
        </Link>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2025 Unigastro. Todos os direitos reservados.</p>
        {/* Link discreto para a tela de login */}
        {/* <Link to="/login" className={styles.loginLink}>Login</Link> */}
      </footer>
    </div>
  );
};

export default Home;
