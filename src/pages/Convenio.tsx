// src/pages/Convenio.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import styles from './Convenio.module.css'; // Importando o CSS como módulo

interface Convenio {
  id: string;
  nome: string;
}

const Convenio: React.FC = () => {
  const [convenios, setConvenios] = useState<Convenio[]>([]);

  useEffect(() => {
    const fetchConvenios = async () => {
      try {
        const conveniosRef = collection(db, 'convenios');
        const snapshot = await getDocs(conveniosRef);
        const listaConvenios = snapshot.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome,
        }));
        setConvenios(listaConvenios);
      } catch (error) {
        console.error('Erro ao buscar convênios:', error);
      }
    };

    fetchConvenios();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>Convênio</h1>
        <div className={styles.selectWrapper}>
          <select>
            <option value="">Selecione um convênio</option>
            {convenios.map((convenio) => (
              <option key={convenio.id} value={convenio.id}>
                {convenio.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Convenio;
