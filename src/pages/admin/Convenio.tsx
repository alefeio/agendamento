// src/pages/Convenio.tsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface Convenio {
  id: string;
  nome: string;
}

const Convenio: React.FC = () => {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [novoConvenio, setNovoConvenio] = useState('');

  // Carregar convênios do Firebase
  useEffect(() => {
    const fetchConvenios = async () => {
      const conveniosRef = collection(db, 'convenios');
      const snapshot = await getDocs(conveniosRef);
      const listaConvenios = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
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
    setConvenios((prev) => [...prev, { id: docRef.id, nome: novoConvenio }]);
    setNovoConvenio('');
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
      <ul>
        {convenios.map((convenio) => (
          <li key={convenio.id}>
            {convenio.nome}
            <button onClick={() => handleExcluirConvenio(convenio.id)}>Excluir</button>
          </li>
        ))}
      </ul>

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
  );
};

export default Convenio;
