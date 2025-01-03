// src/pages/Medico.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAgendamento } from '../context/AgendamentoContext'; // Importando o contexto
import styles from './Medico.module.css'; // Importando o CSS como módulo

interface Convenio {
  id: number;
  nome: string;
  limiteMensal: number;
  count: number; // número de consultas realizadas no mês
}

interface Medico {
  id: number;
  nome: string;
}

const MedicoPage: React.FC = () => {
  const { agendamentoData, setAgendamentoData } = useAgendamento(); // Usando o contexto
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [selectedConvenio, setSelectedConvenio] = useState<number | null>(null);

  useEffect(() => {
    const fetchConvenios = async () => {
      try {
        const response = await axios.get('https://api.example.com/convenios');
        setConvenios(response.data);
      } catch (error) {
        console.error('Erro ao buscar convênios:', error);
      }
    };

    fetchConvenios();
  }, []);

  useEffect(() => {
    if (selectedConvenio) {
      const fetchMedicos = async () => {
        try {
          const response = await axios.get(`https://api.example.com/medicos?convenio=${selectedConvenio}`);
          const filteredMedicos = response.data.filter((medico: Medico) => {
            const convenio = convenios.find((c) => c.id === selectedConvenio);
            return convenio ? convenio.count < convenio.limiteMensal : true;
          });
          setMedicos(filteredMedicos);
        } catch (error) {
          console.error('Erro ao buscar médicos:', error);
        }
      };

      fetchMedicos();
    }
  }, [selectedConvenio, convenios]);

  const handleSelectMedico = (medicoId: number) => {
    const selectedMedico = medicos.find((medico) => medico.id === medicoId);
    if (selectedMedico) {
      setAgendamentoData((prevState) => ({
        ...prevState,
        medico: selectedMedico,
      }));
    }
  };

  const handleSelectConvenio = (convenioId: number) => {
    setSelectedConvenio(convenioId);
    const selectedConvenio = convenios.find((c) => c.id === convenioId);
    if (selectedConvenio) {
      setAgendamentoData((prevState) => ({
        ...prevState,
        convenio: selectedConvenio,
      }));
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>Agendamento de Consultas</h1>
        
        {/* Select de Convênios */}
        <div className={styles.selectWrapper}>
          <select
            value={selectedConvenio || ''}
            onChange={(e) => handleSelectConvenio(Number(e.target.value))}
          >
            <option value="">Escolha o Convênio</option>
            {convenios.map((convenio) => (
              <option key={convenio.id} value={convenio.id}>
                {convenio.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Select de Médicos */}
        <div className={styles.selectWrapper}>
          <select onChange={(e) => handleSelectMedico(Number(e.target.value))} disabled={!selectedConvenio}>
            <option value="">Escolha o médico para consulta</option>
            {medicos.map((medico) => (
              <option key={medico.id} value={medico.id}>
                {medico.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default MedicoPage;
