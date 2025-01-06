// src/pages/Restrito.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Especialidade from './Especialidade';
import Convenio from './Convenio';
import Medico from './Medico';
import DataHora from './DataHora';
import styles from './Restrito.module.css';

const Restrito: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'especialidades' | 'convenios' | 'medicos' | 'horarios' | 'relacao'>('horarios');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Pegando os parâmetros da query string
  useEffect(() => {
    const params = new URLSearchParams(location.search); // Usando URLSearchParams para ler a query string
    const tab = params.get('tab'); // Pega o valor do parâmetro 'tab'

    if (tab) {
      setActiveTab(tab as 'especialidades' | 'convenios' | 'medicos' | 'horarios' | 'relacao');
    }
  }, [location.search]);

  useEffect(() => {
    const auth = getAuth();

    // Verifica o estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate('/login'); // Redireciona para login se o usuário não estiver autenticado
      }
    });

    // Limpeza do listener
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      navigate('/login'); // Redireciona para login após logout
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'horarios':
        return <DataHora />;
      case 'especialidades':
        return <Especialidade />;
      case 'convenios':
        return <Convenio />;
      case 'medicos':
        return <Medico />;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    // Pode exibir um spinner ou mensagem enquanto verifica a autenticação
    return <div>Verificando autenticação...</div>;
  }

  return (
    <div className={styles.restritoWrapper}>
      <div className={styles.header}>
        <h1>Área Restrita</h1>
        <button className={styles.logoutButton} onClick={handleLogout}>Sair</button>
      </div>

      <div className={styles.navTabs}>
        <button
          className={`${activeTab === 'horarios' ? styles.active : ''}`}
          onClick={() => setActiveTab('horarios')}
        >
          Agendamentos
        </button>
        <button
          className={`${activeTab === 'especialidades' ? styles.active : ''}`}
          onClick={() => setActiveTab('especialidades')}
        >
          Especialidades
        </button>
        <button
          className={`${activeTab === 'convenios' ? styles.active : ''}`}
          onClick={() => setActiveTab('convenios')}
        >
          Convênios
        </button>
        <button
          className={`${activeTab === 'medicos' ? styles.active : ''}`}
          onClick={() => setActiveTab('medicos')}
        >
          Médicos
        </button>
      </div>

      <div className={styles.sectionContent}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Restrito;
