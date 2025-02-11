// src/pages/DadosPessoais.tsx
import React, { useEffect, useState } from 'react';
import { useAgendamento } from '../context/AgendamentoContext';
import styles from './DadosPessoais.module.css';
import api, { fetchWithAuth } from '../api';

const DadosPessoais: React.FC = () => {
    const { agendamentoData, setAgendamentoData } = useAgendamento();
    const [formValid, setFormValid] = useState(true);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAgendamentoData((prevData) => ({
            ...prevData,
            dadosPessoais: {
                ...prevData.dadosPessoais,
                [name]: value,
            },
        }));
    };

    const teste = async () => {
        try {
            const response = await fetchWithAuth('http://polls.apiblueprint.org/api/Especialidade');
            const data = await response.json();
            console.log('Dados obtidos:', data);
            return data;
        } catch (error) {
            console.error('Erro ao obter dados:', error);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { nome, email, cpf, telefone, endereco } = agendamentoData.dadosPessoais;
        if (nome && email && cpf && telefone && endereco) {
            console.log('Dados enviados:', agendamentoData.dadosPessoais);
            setFormValid(true);
        } else {
            setFormValid(false);
        }
    };

    useEffect(() => {
        teste();
    }, [])

    return (
        <div className={styles.contentWrapper}>
            <h1 className={styles.title}>Dados Pessoais</h1>
            {!formValid && <p className={styles.error}>Preencha todos os campos obrigatórios!</p>}
            <form className={styles.formWrapper} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <label htmlFor="nome">Nome*:</label>
                    <input
                        type="text"
                        id="nome"
                        name="nome"
                        placeholder="Digite seu nome"
                        value={agendamentoData.dadosPessoais.nome || ''}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="email">Email*:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Digite seu email"
                        value={agendamentoData.dadosPessoais.email || ''}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="cpf">CPF*:</label>
                    <input
                        type="text"
                        id="cpf"
                        name="cpf"
                        placeholder="Digite seu CPF"
                        value={agendamentoData.dadosPessoais.cpf || ''}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="telefone">Telefone*:</label>
                    <input
                        type="tel"
                        id="telefone"
                        name="telefone"
                        placeholder="Digite seu telefone"
                        value={agendamentoData.dadosPessoais.telefone || ''}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="endereco">Endereço*:</label>
                    <input
                        type="text"
                        id="endereco"
                        name="endereco"
                        placeholder="Digite seu endereço"
                        value={agendamentoData.dadosPessoais.endereco || ''}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <small>* Dados obrigatórios.</small>
            </form>
        </div>
    );
};

export default DadosPessoais;
