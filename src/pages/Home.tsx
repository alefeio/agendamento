// src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';  // Importando o CSS como módulo

const Home: React.FC = () => {
  return (
    <div className="pageWrapper">
      <div className="contentWrapper">
        <h1 className={styles.title}>Bem-vindo ao Sistema de Agendamento</h1>
        <p className={styles.subtitle}>Escolha uma opção para começar.</p>
        <Link to="/step-flow">
          <button className={styles.button}>Iniciar Fluxo de Cadastro</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
