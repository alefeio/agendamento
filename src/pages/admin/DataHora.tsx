import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

import { db } from '../../../firebaseConfig';
import styles from './Agendamentos.module.css';

interface DadosPessoais {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
}

interface Categoria {
  id: string;
  nome: string;
}

interface Subcategoria {
  id: string;
  nome: string;
}

interface Convenio {
  id: string;
  nome: string;
}

interface Medico {
  id: string;
  nome: string;
}

interface Agendamento {
  id: string;
  dadosPessoais: DadosPessoais;
  categoria: Categoria | null;
  subcategoria: Subcategoria | null;
  convenio: Convenio;
  medico: Medico | null;
  data: string;
  horario: string;
  dataCadastro: string;
}

const Agendamentos: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const agendamentosRef = collection(db, 'agendamentos');
        const snapshot = await getDocs(agendamentosRef);
        const listaAgendamentos = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            dadosPessoais: {
              nome: data?.dadosPessoais?.nome || 'Nome não informado',
              email: data?.dadosPessoais?.email || 'Email não informado',
              cpf: data?.dadosPessoais?.cpf || 'CPF não informado',
              telefone: data?.dadosPessoais?.telefone || 'Telefone não informado',
              endereco: data?.dadosPessoais?.endereco || 'Endereço não informado',
            },
            categoria: data?.categoria && typeof data.categoria === 'object'
              ? data.categoria
              : { id: '', nome: 'Categoria não informada' },
            subcategoria: data?.subcategoria && typeof data.subcategoria === 'object'
              ? data.subcategoria
              : { id: '', nome: 'Subcategoria não informada' },
            convenio: data?.convenio && typeof data.convenio === 'object'
              ? data.convenio
              : { id: '', nome: 'Convênio não informado' },
            medico: data?.medico && typeof data.medico === 'object'
              ? data.medico
              : { id: '', nome: 'Médico não informado' },
            data: data?.data || 'Data não informada',
            horario: data?.horario || 'Horário não informado',
            dataCadastro: data?.dataCadastro || 'Data não informada',
          };
        }) as Agendamento[];

        listaAgendamentos.sort((a, b) => {
          const dataA = new Date(a.dataCadastro).getTime();
          const dataB = new Date(b.dataCadastro).getTime();
          return dataB - dataA; // Ordem decrescente
        });

        setAgendamentos(listaAgendamentos);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar agendamentos. Tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchAgendamentos();
  }, []);

  const handleExcluirAgendamento = async (id: string) => {
    const confirmacao = window.confirm('Tem certeza que deseja excluir este agendamento?');
    if (!confirmacao) return;

    try {
      const agendamentoDocRef = doc(db, 'agendamentos', id);
      await deleteDoc(agendamentoDocRef);
      setAgendamentos((prev) => prev.filter((agendamento) => agendamento.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir agendamento. Tente novamente.');
    }
  };

  if (loading) return <p>Carregando agendamentos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Agendamentos</h2>
      {agendamentos.length === 0 ? (
        <p>Nenhum agendamento encontrado.</p>
      ) : (
        <div className={styles.tabelaWrapper}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Dados Pessoais</th>
                <th>Especialidade</th>
                <th>Convênio</th>
                <th>Médico</th>
                <th>Data</th>
                <th>Horário</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.map((agendamento) => (
                <tr key={agendamento.id}>
                  <td>
                    <strong>Nome:</strong> {agendamento.dadosPessoais.nome}<br />
                    <strong>E-mail:</strong> {agendamento.dadosPessoais.email}<br />
                    <strong>Telefone:</strong> {agendamento.dadosPessoais.telefone}<br />
                    <strong>CPF:</strong> {agendamento.dadosPessoais.cpf}<br />
                    <strong>Endereço:</strong> {agendamento.dadosPessoais.endereco}<br />
                    <small><strong>Data Cadastro:</strong> {agendamento.dataCadastro}</small>
                  </td>
                  <td>
                    <strong>Categoria:</strong> {agendamento.categoria?.nome || 'Categoria não informada'}<br />
                    <strong>Subcategoria:</strong> {agendamento.subcategoria?.nome || 'Subcategoria não informada'}
                  </td>
                  <td>{agendamento.convenio?.nome || 'Convênio não informado'}</td>
                  <td>{agendamento.medico?.nome || 'Médico não informado'}</td>
                  <td>{agendamento.data}</td>
                  <td>{agendamento.horario}</td>
                  <td>
                    <button
                      className={styles.confirmarButton}
                      onClick={() => alert(`Agendamento de ${agendamento.dadosPessoais.nome} confirmado!`)}
                    >
                      Confirmar
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleExcluirAgendamento(agendamento.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Agendamentos;
