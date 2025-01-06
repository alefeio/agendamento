// src/pages/Convenio.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '../../firebaseConfig';
import { useAgendamento } from '../context/AgendamentoContext';
import styles from './Convenio.module.css';

interface Convenio {
    id: string;
    nome: string;
}

const Convenio: React.FC = () => {
    const [convenios, setConvenios] = useState<Convenio[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Estado de carregamento
    const [error, setError] = useState<string | null>(null); // Estado para erros
    const { agendamentoData, setAgendamentoData } = useAgendamento();

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
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setError('Erro ao carregar convênios. Tente novamente.');
                setIsLoading(false);
            }
        };

        fetchConvenios();
    }, []);

    const handleConvenioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const convenioId = e.target.value;
        const convenioSelecionado = convenios.find(
            (convenio) => convenio.id === convenioId
        );

        setAgendamentoData((prev) => ({
            ...prev,
            convenio: convenioSelecionado!,
        }));
    };

    return (
        <div className={styles.contentWrapper}>
            <h1 className={styles.title}>Convênio</h1>

            {isLoading ? (
                <p className={styles.loading}>Carregando convênios...</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <div className={styles.selectWrapper}>
                    <label htmlFor="convenio" className={styles.label}>
                        Selecione seu convênio:
                    </label>
                    <select
                        id="convenio"
                        value={agendamentoData.convenio?.id || ''}
                        onChange={handleConvenioChange}
                        className={styles.select}
                    >
                        <option value="">Selecione um convênio</option>
                        {convenios.map((convenio) => (
                            <option key={convenio.id} value={convenio.id}>
                                {convenio.nome}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default Convenio;
