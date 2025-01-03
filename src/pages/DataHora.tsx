// src/pages/DataHora.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';  // Biblioteca para o calendário
import 'react-calendar/dist/Calendar.css';  // Estilos padrão do react-calendar
import styles from './DataHoma.module.css';  // Importando o CSS como módulo

interface Disponibilidade {
  dia: string;
  horarios: string[];
}

const DataHora: React.FC = () => {
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);

  // Exemplo de lista de feriados
  const feriados = [
    '2025-01-01', // Exemplo de feriado (Ano Novo)
    '2025-02-20', // Carnaval
    '2025-04-21', // Tiradentes
    '2025-05-01', // Dia do Trabalho
    // Adicione mais feriados conforme necessário
  ];

  // Função comentada temporariamente, que seria responsável pela consulta à API
  /*
  const consultarDisponibilidade = async () => {
    try {
      const response = await axios.get('/api/disponibilidade'); // Substitua pela URL correta da sua API
      setDisponibilidade(response.data);
    } catch (error) {
      console.error('Erro ao consultar a API:', error);
    }
  };
  */

  useEffect(() => {
    // Dados temporários para preencher o setDisponibilidade
    const dadosTemporarios: Disponibilidade[] = [
      { dia: '2025-01-05', horarios: ['09:00', '11:00', '14:00', '16:00'] },
      { dia: '2025-01-06', horarios: ['08:00', '10:00', '13:00', '15:00'] },
      { dia: '2025-01-07', horarios: ['09:30', '12:30', '14:30', '17:00'] },
    ];
    setDisponibilidade(dadosTemporarios);

    // Caso a função estivesse ativa, chamaria a API
    // consultarDisponibilidade();
  }, []);

  // Função para formatar a data no formato 'YYYY-MM-DD'
  const formatarData = (data: Date) => {
    return data.toISOString().split('T')[0];
  };

  // Verificar se o dia selecionado está na lista de disponibilidade
  const verificarDisponibilidade = (data: Date) => {
    const dataFormatada = formatarData(data);
    const diaDisponivel = disponibilidade.find((item) => item.dia === dataFormatada);
    return diaDisponivel ? diaDisponivel.horarios : [];
  };

  // Função para verificar se é um sábado, domingo ou feriado
  const isDiaIndisponivel = (date: Date) => {
    const diaSemana = date.getDay(); // 0 = Domingo, 6 = Sábado
    const dataFormatada = formatarData(date);
    return diaSemana === 0 || diaSemana === 6 || feriados.includes(dataFormatada); // Desabilita domingos, sábados e feriados
  };

  // Função para selecionar um horário
  const selecionarHorario = (horario: string) => {
    setHorarioSelecionado(horario);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>Data e Hora</h1>
        <p className={styles.subtitle}>Selecione a data e hora disponíveis.</p>
        
        <div className={styles.calendarWrapper}>
          <Calendar
            onChange={setDataSelecionada}
            value={dataSelecionada}
            tileDisabled={({ date }) => isDiaIndisponivel(date)} // Desabilita os sábados, domingos e feriados
          />
        </div>
        
        <h2>Horários Disponíveis para {formatarData(dataSelecionada)}</h2>
        <div className={styles.buttonsWrapper}>
          {verificarDisponibilidade(dataSelecionada).length > 0 ? (
            verificarDisponibilidade(dataSelecionada).map((horario, index) => (
              <button
                key={index}
                className={styles.button}
                onClick={() => selecionarHorario(horario)}
                style={{ backgroundColor: horarioSelecionado === horario ? '#007bff' : '#333' }}
              >
                {horario}
              </button>
            ))
          ) : (
            <p>Não há horários disponíveis neste dia.</p>
          )}
        </div>

        {horarioSelecionado && (
          <div className={styles.selectedWrapper}>
            <p>Horário Selecionado: {horarioSelecionado}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataHora;
