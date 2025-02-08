import React, { useEffect, useState } from 'react';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '../../firebaseConfig';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './DataHora.module.css';
import { useAgendamento } from '../context/AgendamentoContext';
import { useNavigate } from 'react-router-dom';

interface Horario {
    horario: string;
    limite: number;
}

interface DisponibilidadeRotativa {
    diasCalendario: string[];
    horariosPorData: { [key: string]: Horario[] };
    medicoId: string;
    tipo: string;
}

interface DisponibilidadeFixa {
    diasDaSemanaComHorarios: { [key: string]: Horario[] };
    medicoId: string;
    tipo: string;
}

interface AgendamentoExistente {
    dia: string;
    horario: string;
}

const DataHora: React.FC = () => {
    const [disponibilidadeRotativa, setDisponibilidadeRotativa] = useState<DisponibilidadeRotativa | null>(null);
    const [disponibilidadeFixa, setDisponibilidadeFixa] = useState<DisponibilidadeFixa | null>(null);
    const [horariosIndisponiveis, setHorariosIndisponiveis] = useState<AgendamentoExistente[]>([]);
    const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
    const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { agendamentoData, setAgendamentoData } = useAgendamento();
    const navigate = useNavigate();

    const feriados = ['2025-01-01', '2025-02-20', '2025-04-21', '2025-05-01'];

    useEffect(() => {
        const carregarDisponibilidade = async () => {
            if (!agendamentoData.medico?.id) return;

            try {
                const disponibilidadeRef = collection(db, 'disponibilidade');
                const q = query(
                    disponibilidadeRef,
                    where('medicoId', '==', agendamentoData.medico.id)
                );
                const snapshot = await getDocs(q);

                snapshot.docs.forEach((doc) => {
                    const data = doc.data();
                    if (data.tipo === 'rotativa') {
                        setDisponibilidadeRotativa(data as DisponibilidadeRotativa);
                    } else if (data.tipo === 'fixa') {
                        setDisponibilidadeFixa(data as DisponibilidadeFixa);
                    }
                });
            } catch (error) {
                console.error('Erro ao carregar disponibilidade:', error);
            }
        };

        carregarDisponibilidade();
    }, [agendamentoData.medico?.id]);

    useEffect(() => {
        const carregarHorariosIndisponiveis = async () => {
            if (!agendamentoData.medico?.id) return;

            try {
                const agendamentosRef = collection(db, 'agendamentos');
                const q = query(
                    agendamentosRef,
                    where('medicoId', '==', agendamentoData.medico.id)
                );
                const snapshot = await getDocs(q);
                const horariosOcupados = snapshot.docs.map((doc) => ({
                    dia: doc.data().data,
                    horario: doc.data().horario,
                }));

                setHorariosIndisponiveis(horariosOcupados);
            } catch (error) {
                console.error('Erro ao carregar horários indisponíveis:', error);
            }
        };

        carregarHorariosIndisponiveis();
    }, [agendamentoData.medico?.id]);

    const formatarData = (data: Date) => data.toISOString().split('T')[0];

    const selecionarData = (data: Date) => {
        setDataSelecionada(data);
        setAgendamentoData((prev) => ({
            ...prev,
            dataHora: formatarData(data),
        }));
    };

    const selecionarHorario = (horario: string) => {
        setHorarioSelecionado(horario);
        setAgendamentoData((prev) => ({
            ...prev,
            dataHora: horario,
        }));
    };

    const getDiaSemana = (date: Date) => {
        const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return diasDaSemana[date.getDay()];
    };

    const verificarHorariosDisponiveis = (data: Date) => {
        const dataFormatada = formatarData(data);
        const diaSemana = getDiaSemana(data);

        // Bloqueia feriados
        if (feriados.includes(dataFormatada)) return [];

        const horariosRotativa = disponibilidadeRotativa?.horariosPorData[dataFormatada] || [];
        const horariosFixa = disponibilidadeFixa?.diasDaSemanaComHorarios[diaSemana] || [];

        const horariosDisponiveis = [...horariosRotativa, ...horariosFixa].filter(({ horario, limite }) => {
            const agendamentosParaHorario = horariosIndisponiveis.filter(
                (h) => h.dia === dataFormatada && h.horario === horario
            ).length;

            return agendamentosParaHorario < limite; // Só exibe se não atingiu o limite
        });

        return horariosDisponiveis.map(h => h.horario);
    };

    const salvarAgendamento = async () => {
        if (!horarioSelecionado) {
            alert('Por favor, selecione um horário.');
            return;
        }

        setIsSaving(true);

        const dataFormatada = formatarData(dataSelecionada);
        const ano = dataSelecionada.getFullYear();
        const mes = dataSelecionada.getMonth() + 1;

        const dataCadastro = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(new Date());

        const agendamento = {
            ...agendamentoData,
            data: dataFormatada,
            mes,
            ano,
            horario: horarioSelecionado,
            convenioId: agendamentoData.convenio.id,
            medicoId: agendamentoData.medico?.id,
            dataCadastro,
        };

        try {
            const agendamentoRef = collection(db, 'agendamentos');
            await addDoc(agendamentoRef, agendamento);
            alert('Agendamento realizado com sucesso!');
            navigate('/obrigado');
        } catch (error) {
            console.error('Erro ao salvar o agendamento:', error);
            alert('Ocorreu um erro ao salvar o agendamento. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const horariosDisponiveis = verificarHorariosDisponiveis(dataSelecionada);
    const nenhumHorarioDisponivel = horariosDisponiveis.length === 0;

    return (
        <div className={styles.contentWrapper}>
            <h1 className={styles.title}>Data e Hora</h1>
            <p className={styles.subtitle}>Selecione a data e hora disponíveis.</p>

            <div className={styles.calendarWrapper}>
                <Calendar
                    onClickDay={(date: Date) => {
                        setDataSelecionada(date);
                        selecionarData(date);
                    }}
                    value={dataSelecionada}
                    tileDisabled={({ date }) => verificarHorariosDisponiveis(date).length === 0}
                    tileClassName={({ date }) =>
                        verificarHorariosDisponiveis(date).length > 0 ? styles.tileAvailable : ''
                    }
                />
            </div>

            <h3>Horários Disponíveis para {formatarData(dataSelecionada).split('-').reverse().join('/')}</h3>
            <div className={styles.buttonsWrapper}>
                {horariosDisponiveis.map((horario, index) => (
                    <button key={index} className={styles.button} onClick={() => selecionarHorario(horario)}>
                        {horario}
                    </button>
                ))}
            </div>

            <button className={styles.saveButton} onClick={salvarAgendamento} disabled={isSaving || !horarioSelecionado}>
                {isSaving ? 'Salvando...' : 'Confirmar Agendamento'}
            </button>
        </div>
    );
};

export default DataHora;
