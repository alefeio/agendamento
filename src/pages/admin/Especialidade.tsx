// src/pages/Especialidade.tsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface Especialidade {
  id: string;
  nome: string;
}

const Especialidade: React.FC = () => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [novaEspecialidade, setNovaEspecialidade] = useState('');

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

  // Adicionar nova especialidade
  const handleAdicionarEspecialidade = async () => {
    if (novaEspecialidade.trim() === '') {
      alert('Por favor, insira um nome para a especialidade.');
      return;
    }

    const especialidadesRef = collection(db, 'especialidades');
    const docRef = await addDoc(especialidadesRef, { nome: novaEspecialidade });
    setEspecialidades((prev) => [...prev, { id: docRef.id, nome: novaEspecialidade }]);
    setNovaEspecialidade('');
  };

  // Excluir especialidade
  const handleExcluirEspecialidade = async (id: string) => {
    const confirmacao = window.confirm('Tem certeza que deseja excluir esta especialidade?');
    if (!confirmacao) return;

    const especialidadeDocRef = doc(db, 'especialidades', id);
    await deleteDoc(especialidadeDocRef);
    setEspecialidades((prev) => prev.filter((especialidade) => especialidade.id !== id));
  };

  return (
    <div>
      <h2>Especialidades</h2>
      <ul>
        {especialidades.map((especialidade) => (
          <li key={especialidade.id}>
            {especialidade.nome}
            <button onClick={() => handleExcluirEspecialidade(especialidade.id)}>Excluir</button>
          </li>
        ))}
      </ul>

      <div>
        <input
          type="text"
          value={novaEspecialidade}
          onChange={(e) => setNovaEspecialidade(e.target.value)}
          placeholder="Nova especialidade"
        />
        <button onClick={handleAdicionarEspecialidade}>Adicionar</button>
      </div>
    </div>
  );
};

export default Especialidade;
