import React, { useEffect, useState } from 'react';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
// @ts-ignore
import { db } from '../../firebaseConfig';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './DataHora.module.css';
import { useAgendamento } from '../context/AgendamentoContext';
import { useNavigate } from 'react-router-dom';

interface DisponibilidadeRotativa {
  diasCalendario: string[];
  horariosPorData: { [key: string]: string[] };
  medicoId: string;
  tipo: string;
}

interface DisponibilidadeFixa {
  diasDaSemanaComHorarios: { [key: string]: string[] };
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
  const { agendamentoData } = useAgendamento();
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

  const isDiaIndisponivel = (date: Date) => {
    const dataFormatada = formatarData(date);
    const dataAtual = new Date();
    const diaSemana = getDiaSemana(date);
  
    // Verifica se a data é anterior ao dia atual
    if (date < new Date(dataAtual.setHours(0, 0, 0, 0))) {
      return true;
    }
  
    // Obtem horários disponíveis para o dia
    const horariosRotativa = verificarDisponibilidadeRotativa(date);
    const horariosFixa = obterHorariosFixa(date);
  
    // Combina os horários das agendas rotativa e fixa
    const todosHorariosDisponiveis = [...horariosRotativa, ...horariosFixa];
  
    if (todosHorariosDisponiveis.length === 0) {
      return true; // Não há horários disponíveis no dia
    }
  
    // Ordena os horários disponíveis para obter o último horário
    todosHorariosDisponiveis.sort((a, b) => {
      const [horaA, minutoA] = a.split(':').map(Number);
      const [horaB, minutoB] = b.split(':').map(Number);
      return horaA * 60 + minutoA - (horaB * 60 + minutoB);
    });
  
    const ultimoHorarioDisponivel = todosHorariosDisponiveis[todosHorariosDisponiveis.length - 1];
  
    // Se for o dia atual, verifica se o último horário disponível já passou
    if (formatarData(date) === formatarData(dataAtual)) {
      const [hora, minuto] = ultimoHorarioDisponivel.split(':').map(Number);
      const ultimoHorarioDate = new Date();
      ultimoHorarioDate.setHours(hora, minuto, 0, 0);
  
      if (ultimoHorarioDate <= dataAtual) {
        return true; // Bloqueia o dia se o último horário já passou
      }
    }
  
    // Verifica se o dia é feriado
    if (feriados.includes(dataFormatada)) {
      return true;
    }
  
    // Verifica disponibilidade para agenda rotativa
    if (disponibilidadeRotativa && !disponibilidadeRotativa.diasCalendario.includes(dataFormatada)) {
      return true;
    }
  
    // Verifica disponibilidade para agenda fixa
    if (disponibilidadeFixa && !disponibilidadeFixa.diasDaSemanaComHorarios[diaSemana]) {
      return true;
    }
  
    return false; // O dia está disponível
  };
  
  const verificarDisponibilidadeRotativa = (data: Date) => {
    const dataFormatada = formatarData(data);
    const horariosDisponiveis = disponibilidadeRotativa?.horariosPorData[dataFormatada] || [];

    // Remove horários já agendados
    const horariosFuturos = horariosDisponiveis.filter((horario) => {
      const [hora, minuto] = horario.split(':');
      const horarioDate = new Date(data);
      horarioDate.setHours(parseInt(hora), parseInt(minuto));

      // Verifica se o horário não está agendado
      const horarioIndisponivel = horariosIndisponiveis.some(
        (agendamento) => agendamento.dia === dataFormatada && agendamento.horario === horario
      );
      return horarioDate > new Date() && !horarioIndisponivel;
    });

    return horariosFuturos;
  };

  const obterHorariosFixa = (data: Date) => {
    const diaSemana = getDiaSemana(data);
    const horariosDisponiveis = disponibilidadeFixa?.diasDaSemanaComHorarios[diaSemana] || [];

    // Remove horários já agendados
    const horariosDisponiveisFixa = horariosDisponiveis.filter((horario) => {
      return !horariosIndisponiveis.some(
        (agendamento) => agendamento.dia === formatarData(data) && agendamento.horario === horario
      );
    });

    return horariosDisponiveisFixa;
  };

  const getDiaSemana = (date: Date) => {
    const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return diasDaSemana[date.getDay()];
  };

  const selecionarHorario = (horario: string) => setHorarioSelecionado(horario);

  const salvarAgendamento = async () => {
    if (!horarioSelecionado) {
      alert('Por favor, selecione um horário.');
      return;
    }

    setIsSaving(true);

    const dataFormatada = formatarData(dataSelecionada);
    const ano = dataSelecionada.getFullYear();
    const mes = dataSelecionada.getMonth() + 1;

    // Obtendo a hora exata no fuso horário de Brasília
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
      mes: mes,
      ano: ano,
      horario: horarioSelecionado,
      especialidadeId: agendamentoData.especialidade,
      convenioId: agendamentoData.convenio.id,
      medicoId: agendamentoData.medico?.id,
      dataCadastro, // Incluindo o campo dataCadastro
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


  const horariosRotativa = verificarDisponibilidadeRotativa(dataSelecionada);
  const horariosFixa = obterHorariosFixa(dataSelecionada);

  const nenhumHorarioDisponivel = horariosRotativa.length === 0 && horariosFixa.length === 0;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>Data e Hora</h1>
        <p className={styles.subtitle}>Selecione a data e hora disponíveis.</p>

        <div className={styles.calendarWrapper}>
          <Calendar
            onChange={() => setDataSelecionada(dataSelecionada)}
            value={dataSelecionada}
            tileDisabled={({ date }) => isDiaIndisponivel(date)}
            tileClassName={({ date }) => {
              const dataFormatada = formatarData(date);
              // Para a agenda rotativa, marcamos os dias específicos
              if (disponibilidadeRotativa && disponibilidadeRotativa.diasCalendario.includes(dataFormatada)) {
                return styles.tileAvailable;
              }

              // Para a agenda fixa, marcamos os dias da semana
              if (disponibilidadeFixa) {
                const diaSemana = getDiaSemana(date);
                if (disponibilidadeFixa.diasDaSemanaComHorarios[diaSemana]) {
                  return styles.tileAvailable;
                }
              }

              return ''; // Dia não disponível
            }}
          />
        </div>

        <h3>Horários Disponíveis para {formatarData(dataSelecionada)}</h3>
        <div className={styles.buttonsWrapper}>
          {/* Exibir horários para agenda rotativa */}
          {horariosRotativa.length > 0 ? (
            horariosRotativa.map((horario, index) => (
              <button
                key={index}
                className={styles.button}
                onClick={() => selecionarHorario(horario)}
                style={{
                  backgroundColor: horarioSelecionado === horario ? '#4CAF50' : '#999',
                }}
              >
                {horario}
              </button>
            ))
          ) : null}

          {/* Exibir horários para agenda fixa */}
          {horariosFixa.length > 0 ? (
            horariosFixa.map((horario, index) => (
              <button
                key={index}
                className={styles.button}
                onClick={() => selecionarHorario(horario)}
                style={{
                  backgroundColor: horarioSelecionado === horario ? '#4CAF50' : '#999',
                }}
              >
                {horario}
              </button>
            ))
          ) : null}

          {/* Exibir mensagem de "Nenhum horário disponível" apenas uma vez */}
          {nenhumHorarioDisponivel && <p>Nenhum horário disponível para este dia.</p>}
        </div>

        <button
          className={styles.saveButton}
          onClick={salvarAgendamento}
          disabled={isSaving || !horarioSelecionado}
        >
          {isSaving ? 'Salvando...' : 'Confirmar Agendamento'}
        </button>
      </div>
    </div>
  );
};

export default DataHora;
