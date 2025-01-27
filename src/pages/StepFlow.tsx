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

    const handleNext = () => {
        setStep((prevStep) => {
            // Se o step atual for 3 (Convênio) e a categoria for "Exame", pule o Médico
            if (prevStep === 3 && agendamentoData.categoria?.nome === 'Exame') {
                return Math.min(prevStep + 2, steps.length);
            }
            return Math.min(prevStep + 1, steps.length);
        });
    };

    const handlePrevious = () => {
        setStep((prevStep) => {
            // Se o step atual for 5 (Data e Hora) e a categoria for "Exame", volte para Convênio
            if (prevStep === 5 && agendamentoData.categoria?.nome === 'Exame') {
                return Math.max(prevStep - 2, 1);
            }
            return Math.max(prevStep - 1, 1);
        });
    };

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
                    <p><strong>Especialidade:</strong> {agendamentoData.categoria?.nome || 'Não selecionada'}</p>
                    <p><strong>Tipo:</strong> {agendamentoData.subcategoria?.nome || 'Não selecionada'}</p>
                    <p><strong>Convênio:</strong> {agendamentoData.convenio?.nome || 'Não selecionado'}</p>
                    <p><strong>Médico:</strong> {agendamentoData.medico?.nome || 'Não selecionado'}</p>
                    <p><strong>Data de Agendamento:</strong> {agendamentoData.dataHora || 'Não selecionada'}</p>
                </div>
            </aside>

            <main className={styles.stepWrapper}>
                {steps.find((s) => s.id === step)?.component}
                <div className={styles.buttonWrapper}>
                    <button
                        onClick={handlePrevious}
                        disabled={step === 1}
                        style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                    >
                        Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={
                            (step === 1 && (!agendamentoData.dadosPessoais.nome || !agendamentoData.dadosPessoais.cpf || !agendamentoData.dadosPessoais.email || !agendamentoData.dadosPessoais.endereco || !agendamentoData.dadosPessoais.telefone)) ||
                            (step === 2 && (!agendamentoData.categoria || !agendamentoData.subcategoria)) ||
                            // (step === 3 && !agendamentoData.convenio?.nome) ||
                            (step === 4 && agendamentoData.categoria?.nome === 'Consulta' && !agendamentoData.medico) ||
                            (step === 5 && !agendamentoData.dataHora)
                        }
                        style={{ visibility: step === steps.length ? 'hidden' : 'visible' }}
                    >
                        Próximo
                    </button>
                </div>
            </main>
        </div>
    );
};

export default StepFlow;
