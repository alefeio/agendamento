// src/pages/Especialidade.tsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import styles from './Especialidade.module.css'; // Importando o CSS

interface Especialidade {
  id: string;
  nome: string;
}

const Especialidade: React.FC = () => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [novaEspecialidade, setNovaEspecialidade] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Novo estado para controle do formulário

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
    setMostrarFormulario(false); // Fechar o formulário após adicionar
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
      
      <button 
        onClick={() => setMostrarFormulario((prev) => !prev)} // Alterna a visibilidade do formulário
        className={styles.novaEspecialidadeButton}
      >
        Nova Especialidade
      </button>
      
      {mostrarFormulario && (
        <div>
          <h3>Adicionar Nova Especialidade</h3>
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
      )}

      <div className={styles.tabelaWrapper}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {especialidades.map((especialidade) => (
              <tr key={especialidade.id}>
                <td>{especialidade.nome}</td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleExcluirEspecialidade(especialidade.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Especialidade;
