import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '../../firebaseConfig';
import { useAgendamento } from '../context/AgendamentoContext';
import styles from './Especialidade.module.css';

interface Categoria {
    id: string;
    nome: string;
}

interface Subcategoria {
    id: string;
    nome: string;
    categoriaId: string;
}

const Especialidade: React.FC = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { agendamentoData, setAgendamentoData } = useAgendamento();

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const categoriasRef = collection(db, 'categorias');
                const snapshotCategorias = await getDocs(categoriasRef);

                const listaCategorias = snapshotCategorias.docs.map((doc) => ({
                    id: doc.id,
                    nome: doc.data().nome,
                }));

                setCategorias(listaCategorias);

                // Inicializa categoria selecionada com base no context
                if (agendamentoData.categoria) {
                    setCategoriaSelecionada(agendamentoData.categoria.id);
                }

                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setError('Erro ao carregar categorias. Tente novamente.');
                setIsLoading(false);
            }
        };

        fetchCategorias();
    }, [agendamentoData.categoria]);

    useEffect(() => {
        const fetchSubcategorias = async () => {
            if (!categoriaSelecionada) return;

            try {
                const subcategoriasRef = collection(db, 'subcategorias');
                const querySubcategorias = query(
                    subcategoriasRef,
                    where('categoriaId', '==', categoriaSelecionada)
                );
                const snapshotSubcategorias = await getDocs(querySubcategorias);

                const listaSubcategorias = snapshotSubcategorias.docs.map((doc) => ({
                    id: doc.id,
                    nome: doc.data().nome,
                    categoriaId: doc.data().categoriaId,
                }));

                setSubcategorias(listaSubcategorias);

                // Inicializa subcategoria selecionada com base no context
                if (agendamentoData.subcategoria) {
                    const subcategoriaSalva = listaSubcategorias.find(
                        (sub) => sub.id === agendamentoData.subcategoria!.id
                    );
                    if (subcategoriaSalva) {
                        setAgendamentoData((prevData) => ({
                            ...prevData,
                            subcategoria: subcategoriaSalva,
                        }));
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Erro ao carregar subcategorias. Tente novamente.');
            }
        };

        fetchSubcategorias();
    }, [categoriaSelecionada, agendamentoData.subcategoria]);

    const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoriaId = e.target.value;
        setCategoriaSelecionada(categoriaId);
        setSubcategorias([]); // Resetar subcategorias ao mudar a categoria
        setAgendamentoData((prevData) => ({
            ...prevData,
            categoria: categorias.find((cat) => cat.id === categoriaId) || null,
            subcategoria: null,
        }));
    };

    const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subcategoriaId = e.target.value;
        setAgendamentoData((prevData) => ({
            ...prevData,
            subcategoria: subcategorias.find((sub) => sub.id === subcategoriaId) || null,
        }));
    };

    return (
        <div className={styles.contentWrapper}>
            <h1 className={styles.title}>Especialidade</h1>

            {isLoading ? (
                <p className={styles.loading}>Carregando categorias...</p>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <>
                    <div className={styles.selectWrapper}>
                        <label htmlFor="categoria" className={styles.label}>
                            Escolha a Categoria:
                        </label>
                        <select
                            id="categoria"
                            value={categoriaSelecionada}
                            onChange={handleCategoriaChange}
                            className={styles.select}
                        >
                            <option value="">Selecione uma categoria</option>
                            {categorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {categoriaSelecionada && (
                        <div className={styles.selectWrapper}>
                            <label htmlFor="subcategoria" className={styles.label}>
                                Escolha a Subcategoria:
                            </label>
                            <select
                                id="subcategoria"
                                value={agendamentoData.subcategoria?.id || ''}
                                onChange={handleSubcategoriaChange}
                                className={styles.select}
                            >
                                <option value="">Selecione uma subcategoria</option>
                                {subcategorias.map((subcategoria) => (
                                    <option key={subcategoria.id} value={subcategoria.id}>
                                        {subcategoria.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Especialidade;
