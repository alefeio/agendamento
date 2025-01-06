import React from 'react';
import styles from './Obrigado.module.css';  // CSS modular

import logo from '../assets/logo.jpeg';

const Obrigado: React.FC = () => {
  return (
    <div className={styles.pg}>
      <div className={styles.pageWrapper}>
        <div className={styles.contentWrapper}>
          <img
            src={logo} alt="Logo Unigrastro"
            className={styles.logo}
          />
          <h1 className={styles.title}>Agendamento cadastrado com<br /><span>Sucesso!</span></h1>
          <p>Em breve nossa equipe entrará em contato.<br /></p>
          <p><strong>Obrigado!</strong></p>
        </div>
        <footer className={styles.footer}>
          <p>&copy; 2025 Unigastro. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Obrigado;
