// src/pages/StepFlow.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgendamento } from '../context/AgendamentoContext'; // Certifique-se de importar o hook
import DadosPessoais from './DadosPessoais';
import Especialidade from './Especialidade';
import Convenio from './Convenio';
import Medico from './Medico';
import DataHora from './DataHora';
import styles from './StepFlow.module.css'; // Importando o CSS como módulo

const StepFlow: React.FC = () => {
  const { agendamentoData } = useAgendamento(); // Acessando os dados do contexto
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevious = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const handleFinish = () => {
    navigate('/'); // Redireciona para a página inicial ao finalizar
  };

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.title}>Fluxo de Cadastro</h1>
      
      {/* Exibindo os dados do contexto */}
      <div className={styles.summaryWrapper}>
        <h2>Resumo dos Dados Selecionados</h2>
        <p><strong>Nome:</strong> {agendamentoData.dadosPessoais.nome || 'Não preenchido'}</p>
        <p><strong>Especialidade:</strong> {agendamentoData.especialidade || 'Não selecionado'}</p>
        <p><strong>Convênio:</strong> {agendamentoData.convenio ? agendamentoData.convenio.nome : 'Não selecionado'}</p>
        <p><strong>Médico:</strong> {agendamentoData.medico ? agendamentoData.medico.nome : 'Não selecionado'}</p>
        <p><strong>Data de Agendamento:</strong> {agendamentoData.dataAgendamento || 'Não selecionada'}</p>
      </div>

      {/* Renderizando o conteúdo baseado no step */}
      {step === 1 && <DadosPessoais />}
      {step === 2 && <Especialidade />}
      {step === 3 && <Convenio />}
      {step === 4 && <Medico />}
      {step === 5 && <DataHora />}

      <div className={styles.buttonWrapper}>
        {step > 1 && <button onClick={handlePrevious}>Anterior</button>}
        {step < 5 ? (
          <button onClick={handleNext}>Próximo</button>
        ) : (
          <button onClick={handleFinish}>Finalizar</button>
        )}
      </div>
    </div>
  );
};

export default StepFlow;
