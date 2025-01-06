import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import styles from './Agendamentos.module.css'; // Importando o CSS

interface DadosPessoais {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
}

interface Especialidade {
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
  especialidade: Especialidade;
  convenio: Convenio;
  medico: Medico | null;
  data: string;
  horario: string;
  dataCadastro: string; // Adicionado campo para a data de cadastro
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
              cpf: data?.dadosPessoais?.cpf || '',
              telefone: data?.dadosPessoais?.telefone || '',
              endereco: data?.dadosPessoais?.endereco || '',
            },
            especialidade: data?.especialidade || 'Especialidade não informada',
            convenio: {
              id: data?.convenio?.id || '',
              nome: data?.convenio?.nome || 'Convênio não informado',
            },
            medico: data?.medico || null,
            data: data?.data || '',
            horario: data?.horario || '',
            dataCadastro: data?.dataCadastro || 'Data não informada', // Data de cadastro
          };
        }) as Agendamento[];
        setAgendamentos(listaAgendamentos);
        setLoading(false);
      } catch (err) {
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
                    Nome: {agendamento.dadosPessoais.nome}<br />
                    E-mail: {agendamento.dadosPessoais.email}<br />
                    Telefone: {agendamento.dadosPessoais.telefone}<br />
                    CPF: {agendamento.dadosPessoais.cpf}<br />
                    End: {agendamento.dadosPessoais.endereco}<br />
                    <small>
                      Data Cadastro:
                      {agendamento.dataCadastro.split(',')[0]},
                      {agendamento.dataCadastro.split(',')[1].split(':')[0]}:
                      {agendamento.dataCadastro.split(',')[1].split(':')[1]}
                    </small>
                  </td>
                  <td>{agendamento.especialidade.nome}</td>
                  <td>{agendamento.convenio?.nome || 'Convênio não informado'}</td>
                  <td>{agendamento.medico?.nome || 'Não informado'}</td>
                  <td>{agendamento.data}</td>
                  <td>{agendamento.horario}</td>
                  <td>
                    <button className={styles.confirmarButton} onClick={() => alert('Agendamento confirmado!')}>
                      Confirmar
                    </button>
                    <button className={styles.deleteButton} onClick={() => handleExcluirAgendamento(agendamento.id)}>
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
