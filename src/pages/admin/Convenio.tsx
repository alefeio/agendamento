import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

import { db } from '../../../firebaseConfig';
import styles from './Coonvenio.module.css'; // Importando o CSS

interface Convenio {
  id: string;
  nome: string;
}

const Convenio: React.FC = () => {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [novoConvenio, setNovoConvenio] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Carregar convênios do Firebase
  useEffect(() => {
    const fetchConvenios = async () => {
      const conveniosRef = collection(db, 'convenios');
      const snapshot = await getDocs(conveniosRef);
      const listaConvenios = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
      }));

      // Ordenar os convênios por nome em ordem alfabética
      listaConvenios.sort((a, b) => a.nome.localeCompare(b.nome));

      setConvenios(listaConvenios);
    };

    fetchConvenios();
  }, []);

  // Adicionar novo convênio
  const handleAdicionarConvenio = async () => {
    if (novoConvenio.trim() === '') {
      alert('Por favor, insira um nome para o convênio.');
      return;
    }

    const conveniosRef = collection(db, 'convenios');
    const docRef = await addDoc(conveniosRef, { nome: novoConvenio });

    setConvenios((prev) => {
      const novaLista = [...prev, { id: docRef.id, nome: novoConvenio }];
      // Ordenar novamente após adicionar um novo convênio
      return novaLista.sort((a, b) => a.nome.localeCompare(b.nome));
    });

    setNovoConvenio('');
    setMostrarFormulario(false); // Fechar o formulário após adicionar
  };

  // Excluir convênio
  const handleExcluirConvenio = async (id: string) => {
    const confirmacao = window.confirm('Tem certeza que deseja excluir este convênio?');
    if (!confirmacao) return;

    const convenioDocRef = doc(db, 'convenios', id);
    await deleteDoc(convenioDocRef);

    setConvenios((prev) => prev.filter((convenio) => convenio.id !== id));
  };

  return (
    <div>
      <h2>Convênios</h2>

      <button
        onClick={() => setMostrarFormulario((prev) => !prev)} // Alterna a visibilidade do formulário
        className={styles.novoConvenioButton}
      >
        Adicionar Convênio
      </button>

      {mostrarFormulario && (
        <div>
          <h3>Adicionar Novo Convênio</h3>
          <div>
            <input
              type="text"
              value={novoConvenio}
              onChange={(e) => setNovoConvenio(e.target.value)}
              placeholder="Novo convênio"
            />
            <button onClick={handleAdicionarConvenio}>Adicionar</button>
          </div>
        </div>
      )}

      <div className={styles.tabelaWrapper}>
        {convenios.length === 0 ? (
          <p>Nenhum convênio encontrado.</p>
        ) : (
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Nome {convenios.length}</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {convenios.map((convenio) => (
                <tr key={convenio.id}>
                  <td>{convenio.nome}</td>
                  <td>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleExcluirConvenio(convenio.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Convenio;
