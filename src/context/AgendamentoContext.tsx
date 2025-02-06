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
    categoria: {
        id: string;
        nome: string;
    } | null;
    subcategoria: {
        id: string;
        nome: string;
    } | null;
    convenio: {
        id: string;
        nome: string;
    };
    medico: { id: string; nome: string; } | null;
    dataHora: string;
}

interface AgendamentoContextProps {
    agendamentoData: AgendamentoData;
    setAgendamentoData: React.Dispatch<React.SetStateAction<AgendamentoData>>;
}

const defaultAgendamentoData: AgendamentoData = {
    dadosPessoais: {
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        endereco: '',
    },
    categoria: null,
    subcategoria: null,
    convenio: {
        id: '',
        nome: '',
    },
    medico: {
        id: '',
        nome: '',
    },
    dataHora: '',
};

const AgendamentoContext = createContext<AgendamentoContextProps | undefined>(undefined);

export const AgendamentoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [agendamentoData, setAgendamentoData] = useState<AgendamentoData>(defaultAgendamentoData);

    return (
        <AgendamentoContext.Provider value={{ agendamentoData, setAgendamentoData }}>
            {children}
        </AgendamentoContext.Provider>
    );
};

export const useAgendamento = (): AgendamentoContextProps => {
    const context = useContext(AgendamentoContext);
    if (!context) {
        throw new Error('useAgendamento must be used within an AgendamentoProvider');
    }
    return context;
};
