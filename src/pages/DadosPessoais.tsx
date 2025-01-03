// src/pages/DadosPessoais.tsx
import React, { useState, useEffect } from 'react';
import { useAgendamento } from '../context/AgendamentoContext'; // Importando o hook para acessar o contexto
import styles from './DadosPessoais.module.css'; // Importando o CSS como módulo

const DadosPessoais: React.FC = () => {
  // Acessando o contexto para pegar os dados e a função de atualização
  const { agendamentoData, setAgendamentoData } = useAgendamento();

  // Função para atualizar o nome no contexto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAgendamentoData((prevData) => ({
      ...prevData,
      dadosPessoais: {
        ...prevData.dadosPessoais,
        [name]: value, // Atualiza o campo correspondente
      },
    }));
  };

  // UseEffect para preencher o nome do campo caso já tenha sido preenchido no contexto
  useEffect(() => {
    if (agendamentoData.dadosPessoais.nome) {
      const nomeInput = document.getElementById('nome') as HTMLInputElement;
      if (nomeInput) nomeInput.value = agendamentoData.dadosPessoais.nome;
    }
  }, [agendamentoData.dadosPessoais.nome]); // Só é chamado quando o nome mudar

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>Cadastro de Dados Pessoais</h1>
        <form className={styles.formWrapper}>
          <div className={styles.inputGroup}>
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              placeholder="Digite seu nome"
              value={agendamentoData.dadosPessoais.nome}
              onChange={handleInputChange} // Chamando a função para atualizar o contexto
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email:</label>
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
            <label htmlFor="cpf">CPF:</label>
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
            <label htmlFor="telefone">Telefone:</label>
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
            <label htmlFor="endereco">Endereço:</label>
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
        </form>
      </div>
    </div>
  );
};

export default DadosPessoais;
