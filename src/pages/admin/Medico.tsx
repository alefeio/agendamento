import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
 
import { db } from '../../../firebaseConfig';
import styles from './Medico.module.css';

interface Especialidade {
  id: string;
  nome: string;
}

interface Medico {
  id: string;
  nome: string;
  crm: string;
  especialidadeId: string;
}

const Medico: React.FC = () => {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [novoMedico, setNovoMedico] = useState({ nome: '', crm: '', especialidadeId: '' });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicos = async () => {
      const medicosRef = collection(db, 'medicos');
      const snapshot = await getDocs(medicosRef);
      const listaMedicos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Medico[];

      // Ordenar os médicos por nome
      listaMedicos.sort((a, b) => a.nome.localeCompare(b.nome));
      setMedicos(listaMedicos);
    };

    fetchMedicos();
  }, []);

  useEffect(() => {
    const fetchEspecialidades = async () => {
      const especialidadesRef = collection(db, 'especialidades');
      const snapshot = await getDocs(especialidadesRef);
      const listaEspecialidades = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setEspecialidades(listaEspecialidades);
    };

    fetchEspecialidades();
  }, []);

  const handleAdicionarMedico = async () => {
    const { nome, crm, especialidadeId } = novoMedico;

    if (!nome || !crm || !especialidadeId) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const medicosRef = collection(db, 'medicos');
    const docRef = await addDoc(medicosRef, { nome, crm, especialidadeId });

    setMedicos((prev) => {
      const novaLista = [...prev, { id: docRef.id, nome, crm, especialidadeId }];
      // Ordenar novamente após adicionar
      return novaLista.sort((a, b) => a.nome.localeCompare(b.nome));
    });

    setNovoMedico({ nome: '', crm: '', especialidadeId: '' });
    setMostrarFormulario(false); // Fechar o formulário após adicionar
  };

  const handleExcluirMedico = async (id: string) => {
    const confirmacao = window.confirm('Tem certeza que deseja excluir este médico?');
    if (!confirmacao) return;

    const medicoDocRef = doc(db, 'medicos', id);
    await deleteDoc(medicoDocRef);

    setMedicos((prev) => prev.filter((medico) => medico.id !== id));
  };

  const handleVerDetalhes = (id: string) => {
    navigate(`/medicos/${id}`);
  };

  return (
    <div>
      <h2>Médicos</h2>

      <button
        onClick={() => setMostrarFormulario((prev) => !prev)}
        className={styles.novoMedicoButton}
      >
        Adicionar Novo Médico
      </button>

      {mostrarFormulario && (
        <div className={styles.formGroup}>
          <h3>Adicionar Novo Médico</h3>
          <input
            type="text"
            value={novoMedico.nome}
            onChange={(e) => setNovoMedico((prev) => ({ ...prev, nome: e.target.value }))}
            placeholder="Nome"
          />
          <input
            type="text"
            value={novoMedico.crm}
            onChange={(e) => setNovoMedico((prev) => ({ ...prev, crm: e.target.value }))}
            placeholder="CRM"
          />
          <select
            value={novoMedico.especialidadeId}
            onChange={(e) => setNovoMedico((prev) => ({ ...prev, especialidadeId: e.target.value }))}
          >
            <option value="">Selecione a Especialidade</option>
            {especialidades.map((especialidade) => (
              <option key={especialidade.id} value={especialidade.id}>
                {especialidade.nome}
              </option>
            ))}
          </select>
          <button onClick={handleAdicionarMedico}>Adicionar</button>
        </div>
      )}

      <table className={styles.responsiveTable}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CRM</th>
            <th>Especialidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {medicos.map((medico) => {
            const especialidadeNome =
              especialidades.find((esp) => esp.id === medico.especialidadeId)?.nome || 'Desconhecida';
            return (
              <tr key={medico.id}>
                <td>{medico.nome}</td>
                <td>{medico.crm}</td>
                <td>{especialidadeNome}</td>
                <td>
                  <button
                    onClick={() => handleVerDetalhes(medico.id)}
                    className={styles.detalhesBtn}
                    title="Ver detalhes"
                  >
                    🔍
                  </button>
                  <button
                    onClick={() => handleExcluirMedico(medico.id)}
                    className={styles.excluirBtn}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Medico;
