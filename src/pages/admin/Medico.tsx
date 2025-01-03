// src/pages/Medico.tsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

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

  // Carregar médicos do Firebase
  useEffect(() => {
    const fetchMedicos = async () => {
      const medicosRef = collection(db, 'medicos');
      const snapshot = await getDocs(medicosRef);
      const listaMedicos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Medico[];
      setMedicos(listaMedicos);
    };

    fetchMedicos();
  }, []);

  // Carregar especialidades do Firebase
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

  // Adicionar novo médico
  const handleAdicionarMedico = async () => {
    const { nome, crm, especialidadeId } = novoMedico;

    if (!nome || !crm || !especialidadeId) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const medicosRef = collection(db, 'medicos');
    const docRef = await addDoc(medicosRef, { nome, crm, especialidadeId });
    setMedicos((prev) => [...prev, { id: docRef.id, nome, crm, especialidadeId }]);
    setNovoMedico({ nome: '', crm: '', especialidadeId: '' });
  };

  // Excluir médico
  const handleExcluirMedico = async (id: string) => {
    const confirmacao = window.confirm('Tem certeza que deseja excluir este médico?');
    if (!confirmacao) return;

    const medicoDocRef = doc(db, 'medicos', id);
    await deleteDoc(medicoDocRef);
    setMedicos((prev) => prev.filter((medico) => medico.id !== id));
  };

  return (
    <div>
      <h2>Médicos</h2>
      <ul>
        {medicos.map((medico) => {
          const especialidadeNome = especialidades.find((esp) => esp.id === medico.especialidadeId)?.nome || 'Desconhecida';
          return (
            <li key={medico.id}>
              {medico.nome} - CRM: {medico.crm} - Especialidade: {especialidadeNome}
              <button onClick={() => handleExcluirMedico(medico.id)}>Excluir</button>
            </li>
          );
        })}
      </ul>

      <div>
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
    </div>
  );
};

export default Medico;
