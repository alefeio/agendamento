// src/pages/Especialidade.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAgendamento } from '../context/AgendamentoContext'; // Importando o hook para acessar o contexto
import styles from './Especialidade.module.css'; // Importando o CSS como módulo

interface Especialidade {
  id: string;
  nome: string;
}

const Especialidade: React.FC = () => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const { agendamentoData, setAgendamentoData } = useAgendamento(); // Acessando o contexto

  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const especialidadesRef = collection(db, 'especialidades');
        const snapshot = await getDocs(especialidadesRef);
        const listaEspecialidades = snapshot.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome,
        }));
        setEspecialidades(listaEspecialidades);
      } catch (error) {
        console.error('Erro ao buscar especialidades:', error);
      }
    };

    fetchEspecialidades();
  }, []);

  // Função para atualizar a especialidade no contexto
  const handleEspecialidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const especialidadeId = e.target.value;
    const especialidadeSelecionada = especialidades.find(
      (especialidade) => especialidade.id === especialidadeId
    );

    // Atualizando o estado do contexto
    setAgendamentoData((prevData) => ({
      ...prevData,
      especialidade: especialidadeSelecionada ? especialidadeSelecionada.nome : '',
    }));
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>Especialidade</h1>
        <div className={styles.selectWrapper}>
          <select
            value={agendamentoData.especialidade} // Controlando o valor da especialidade selecionada
            onChange={handleEspecialidadeChange} // Chamando a função para atualizar o contexto
          >
            <option value="">Selecione uma especialidade</option>
            {especialidades.map((especialidade) => (
              <option key={especialidade.id} value={especialidade.id}>
                {especialidade.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Especialidade;
