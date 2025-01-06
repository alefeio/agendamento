// src/context/AgendamentoContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definindo o tipo para os dados de agendamento
interface AgendamentoData {
  dadosPessoais: {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    endereco: string;
  };
  especialidade: {
    id: string;
    nome: string;
  };
  convenio: {
    id: string;
    nome: string;
  };
  medico: {
    id: string;
    nome: string;
  } | null;
  dataAgendamento: string;
}

// Criando o contexto com um valor inicial vazio
const AgendamentoContext = createContext<{
  agendamentoData: AgendamentoData;
  setAgendamentoData: React.Dispatch<React.SetStateAction<AgendamentoData>>;
}>({
  agendamentoData: {
    dadosPessoais: { nome: '', email: '', cpf: '', telefone: '', endereco: '' },
    especialidade: { id: '', nome: ''},
    convenio: { id: '', nome: ''},
    medico: null,
    dataAgendamento: '',
  },
  setAgendamentoData: () => {},
});

// Criando o provedor do contexto
export const AgendamentoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agendamentoData, setAgendamentoData] = useState<AgendamentoData>({
    dadosPessoais: { nome: '', email: '', cpf: '', telefone: '', endereco: '' },
    especialidade: { id: '', nome: ''},
    convenio: { id: '', nome: '' },
    medico: null,
    dataAgendamento: '',
  });

  return (
    <AgendamentoContext.Provider value={{ agendamentoData, setAgendamentoData }}>
      {children}
    </AgendamentoContext.Provider>
  );
};

// Hook para acessar o contexto em outros componentes
export const useAgendamento = () => useContext(AgendamentoContext);
