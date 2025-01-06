import React from 'react';
import styles from './Obrigado.module.css';  // CSS modular

import logo from '../assets/logo.jpeg';

const Obrigado: React.FC = () => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentWrapper}>
        <img
          src={logo} alt="Logo Unigrastro"
          className={styles.logo}
        />
        <h1 className={styles.title}>Seu agendamento foi cadastrado com<br /><span>Sucesso!</span></h1>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2025 Unigastro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Obrigado;
