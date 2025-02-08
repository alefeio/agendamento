import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '../../firebaseConfig';
import { useAgendamento } from '../context/AgendamentoContext';
import styles from './Medico.module.css';

interface Medico {
    id: string;
    nome: string;
    especialidades: {
        categoriaId: string;
        subcategorias: string[];
    }[];
    convenios: { id: string; nome: string; limiteMensal: number; atingiuLimite: boolean }[];
}

const Medico: React.FC = () => {
    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { agendamentoData, setAgendamentoData } = useAgendamento();

    useEffect(() => {
        const fetchMedicos = async () => {
            try {
                if (!agendamentoData.categoria?.id || !agendamentoData.subcategoria?.id) {
                    setMedicos([]);
                    setIsLoading(false);
                    return;
                }

                const medicosRef = collection(db, 'medicos');
                const snapshot = await getDocs(medicosRef);

                const currentDate = new Date();
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();

                const listaMedicos = await Promise.all(
                    snapshot.docs.map(async (doc) => {
                        const medicoData = doc.data();
                        const medicoId = doc.id;

                        const conveniosRef = collection(db, `medicos/${medicoId}/convenios`);
                        const conveniosSnapshot = await getDocs(conveniosRef);
                        const convenios = await Promise.all(
                            conveniosSnapshot.docs.map(async (convenioDoc) => {
                                const convenioData = convenioDoc.data();

                                const agendamentosRef = collection(db, 'agendamentos');
                                const agendamentosQuery = query(
                                    agendamentosRef,
                                    where('medicoId', '==', medicoId),
                                    where('convenioId', '==', convenioDoc.id),
                                    where('mes', '==', currentMonth),
                                    where('ano', '==', currentYear)
                                );
                                const agendamentosSnapshot = await getDocs(agendamentosQuery);
                                const totalAgendamentos = agendamentosSnapshot.size;

                                return {
                                    id: convenioDoc.id,
                                    nome: convenioData.nome,
                                    limiteMensal: convenioData.limiteMensal,
                                    atingiuLimite: totalAgendamentos >= convenioData.limiteMensal,
                                };
                            })
                        );

                        return {
                            id: medicoId,
                            nome: medicoData.nome,
                            especialidades: medicoData.especialidades || [],
                            convenios,
                        };
                    })
                );

                // **Filtragem dos médicos**
                const medicosFiltrados = listaMedicos.filter((medico) =>
                    medico.especialidades.some((especialidade: { categoriaId: string; subcategorias: string[] }) =>
                        especialidade.categoriaId === agendamentoData.categoria?.id &&
                        especialidade.subcategorias.includes(agendamentoData.subcategoria?.id || '')
                    ) &&
                    // Se um convênio estiver selecionado, filtra os médicos que atendem ao convênio
                    (!agendamentoData.convenio?.id ||
                        medico.convenios.some((convenio) =>
                            convenio.id === agendamentoData.convenio?.id && !convenio.atingiuLimite
                        )
                    )
                );

                setMedicos(medicosFiltrados);
                setIsLoading(false);
            } catch (err) {
                console.error('Erro ao buscar médicos:', err);
                setError('Não foi possível carregar os médicos. Tente novamente.');
                setIsLoading(false);
            }
        };

        fetchMedicos();
    }, [agendamentoData.convenio, agendamentoData.categoria, agendamentoData.subcategoria]);

    const handleMedicoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const medicoId = e.target.value;
        const medicoSelecionado = medicos.find((medico) => medico.id === medicoId);

        setAgendamentoData((prev) => ({
            ...prev,
            medico: medicoSelecionado ? { id: medicoSelecionado.id, nome: medicoSelecionado.nome } : null,
        }));
    };

    return (
        <div className={styles.contentWrapper}>
            <h1 className={styles.title}>Médico</h1>
            {isLoading ? (
                <p className={styles.loading}>Carregando médicos...</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : medicos.length === 0 ? (
                <p className={styles.noMedicos}>Nenhum médico disponível para esta especialidade.</p>
            ) : (
                <div className={styles.selectWrapper}>
                    <label htmlFor="medico" className={styles.label}>
                        Selecione um médico:
                    </label>
                    <select
                        id="medico"
                        value={agendamentoData.medico?.id || ''}
                        onChange={handleMedicoChange}
                        className={styles.select}
                    >
                        <option value="">Selecione um médico</option>
                        {medicos.map((medico) => (
                            <option key={medico.id} value={medico.id}>
                                {medico.nome}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default Medico;
