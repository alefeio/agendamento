// src/pages/Restrito.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Especialidade from './Especialidade';
import Convenio from './Convenio';
import Medico from './Medico';
import DataHora from './DataHora';
import styles from './Restrito.module.css';
import MedicoConvenio from './MedicoConvenio';

const Restrito: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'especialidades' | 'convenios' | 'medicos' | 'horarios' | 'relacao'>('especialidades');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

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
      case 'especialidades':
        return <Especialidade />;
      case 'convenios':
        return <Convenio />;
      case 'medicos':
        return <Medico />;
      case 'horarios':
        return <DataHora />;
      case 'relacao':
        return <MedicoConvenio />;
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
        <button
          className={`${activeTab === 'relacao' ? styles.active : ''}`}
          onClick={() => setActiveTab('relacao')}
        >
          Disponibilidade
        </button>
        <button
          className={`${activeTab === 'horarios' ? styles.active : ''}`}
          onClick={() => setActiveTab('horarios')}
        >
          Agendamentos
        </button>
      </div>

      <div className={styles.sectionContent}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Restrito;
