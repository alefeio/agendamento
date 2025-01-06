import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAgendamento } from '../context/AgendamentoContext';
import styles from './Especialidade.module.css';

interface Especialidade {
  id: string;
  nome: string;
}

const Especialidade: React.FC = () => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { agendamentoData, setAgendamentoData } = useAgendamento();

  useEffect(() => {
    const fetchEspecialidadesComMedicos = async () => {
      try {
        const especialidadesRef = collection(db, 'especialidades');
        const snapshotEspecialidades = await getDocs(especialidadesRef);

        const listaEspecialidades = snapshotEspecialidades.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome,
        }));

        // Filtrar especialidades com médicos
        const especialidadesComMedicos = [];
        for (const especialidade of listaEspecialidades) {
          const medicosRef = collection(db, 'medicos');
          const queryMedicos = query(
            medicosRef,
            where('especialidadeId', '==', especialidade.id)
          );
          const snapshotMedicos = await getDocs(queryMedicos);

          if (!snapshotMedicos.empty) {
            especialidadesComMedicos.push(especialidade);
          }
        }

        setEspecialidades(especialidadesComMedicos);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar especialidades. Tente novamente.');
        setIsLoading(false);
      }
    };

    fetchEspecialidadesComMedicos();
  }, []);

  const handleEspecialidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const especialidadeId = e.target.value;
    const especialidadeSelecionada = especialidades.find(
      (especialidade) => especialidade.id === especialidadeId
    );

    setAgendamentoData((prevData) => ({
      ...prevData,
      especialidade: especialidadeSelecionada!,
    }));
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>Especialidade</h1>

        {isLoading ? (
          <p className={styles.loading}>Carregando especialidades...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.selectWrapper}>
            <label htmlFor="especialidade" className={styles.label}>
              Escolha a Especialidade:
            </label>
            <select
              id="especialidade"
              value={agendamentoData.especialidade?.id || ''}
              onChange={handleEspecialidadeChange}
              className={styles.select}
            >
              <option value="">Selecione uma especialidade</option>
              {especialidades.map((especialidade) => (
                <option key={especialidade.id} value={especialidade.id}>
                  {especialidade.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default Especialidade;
