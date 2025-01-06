// src/pages/StepFlow.tsx
import React, { useState } from 'react';
import { useAgendamento } from '../context/AgendamentoContext';
import DadosPessoais from './DadosPessoais';
import Especialidade from './Especialidade';
import Convenio from './Convenio';
import Medico from './Medico';
import DataHora from './DataHora';
import styles from './StepFlow.module.css';
import logo from '../assets/logo.jpeg';

const StepFlow: React.FC = () => {
    const { agendamentoData } = useAgendamento();
    const [step, setStep] = useState(1);

    const steps = [
        { id: 1, component: <DadosPessoais />, label: 'Dados Pessoais' },
        { id: 2, component: <Especialidade />, label: 'Especialidade' },
        { id: 3, component: <Convenio />, label: 'Convênio' },
        { id: 4, component: <Medico />, label: 'Médico' },
        { id: 5, component: <DataHora />, label: 'Data e Hora' },
    ];

    const handleNext = () => setStep((prevStep) => Math.min(prevStep + 1, steps.length));
    const handlePrevious = () => setStep((prevStep) => Math.max(prevStep - 1, 1));

    return (
        <div className={styles.pageWrapper}>
            <aside className={styles.summaryWrapper}>
                <img src={logo} alt="Logo Unigrastro" className={styles.logo} />
                <h1 className={styles.title}>Agendamento Unigrastro</h1>
                <div className={styles.summary}>
                    <p><strong>Paciente:</strong> {agendamentoData.dadosPessoais.nome || 'Não preenchido'}</p>
                    <p><strong>E-mail:</strong> {agendamentoData.dadosPessoais.email || 'Não preenchido'}</p>
                    <p><strong>CPF:</strong> {agendamentoData.dadosPessoais.cpf || 'Não preenchido'}</p>
                    <p><strong>Telefone:</strong> {agendamentoData.dadosPessoais.telefone || 'Não preenchido'}</p>
                    <p><strong>Endereço:</strong> {agendamentoData.dadosPessoais.endereco || 'Não preenchido'}</p>
                    <p><strong>Especialidade:</strong> {agendamentoData.especialidade.nome || 'Não selecionado'}</p>
                    <p><strong>Convênio:</strong> {agendamentoData.convenio?.nome || 'Não selecionado'}</p>
                    <p><strong>Médico:</strong> {agendamentoData.medico?.nome || 'Não selecionado'}</p>
                    <p><strong>Data de Agendamento:</strong> {agendamentoData.dataAgendamento || 'Não selecionada'}</p>
                </div>
            </aside>

            <main className={styles.stepWrapper}>
                {steps.find((s) => s.id === step)?.component}
                <div className={styles.buttonWrapper}>
                    <button onClick={handlePrevious} disabled={step === 1} style={{ visibility: step === 1 ? 'hidden' : 'visible' }}>
                        Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={
                            (step === 1 && !agendamentoData.dadosPessoais.nome || !agendamentoData.dadosPessoais.cpf || !agendamentoData.dadosPessoais.email || !agendamentoData.dadosPessoais.endereco || !agendamentoData.dadosPessoais.telefone) ||
                            (step === 2 && !agendamentoData.especialidade.nome) ||
                            (step === 3 && !agendamentoData.convenio.nome) ||
                            (step === 4 && !agendamentoData.medico) ||
                            (step === 5 && !agendamentoData.dataAgendamento) ||
                            step === 2 && !agendamentoData.especialidade
                        }
                        style={{ visibility: step === steps.length ? 'hidden' : 'visible' }}
                    >Próximo</button>
                </div>
            </main>
        </div>
    );
};

export default StepFlow;
