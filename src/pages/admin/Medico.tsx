import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

import { db } from '../../../firebaseConfig';
import styles from './Medico.module.css';

interface Categoria {
    id: string;
    nome: string;
}

interface Subcategoria {
    id: string;
    nome: string;
    categoriaId: string;
}

interface Medico {
    id: string;
    nome: string;
    crm: string;
    especialidades: {
        categoriaId: string;
        subcategorias: string[];
    }[];
}

const Medico: React.FC = () => {
    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
    const [novoMedico, setNovoMedico] = useState({ nome: '', crm: '', especialidades: [] as Medico['especialidades'] });
    const [editarMedicoId, setEditarMedicoId] = useState<string | null>(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategorias = async () => {
            const categoriasRef = collection(db, 'categorias');
            const snapshotCategorias = await getDocs(categoriasRef);
            const listaCategorias = snapshotCategorias.docs.map((doc) => ({
                id: doc.id,
                nome: doc.data().nome,
            }));
            setCategorias(listaCategorias);
        };

        const fetchSubcategorias = async () => {
            const subcategoriasRef = collection(db, 'subcategorias');
            const snapshotSubcategorias = await getDocs(subcategoriasRef);
            const listaSubcategorias = snapshotSubcategorias.docs.map((doc) => ({
                id: doc.id,
                nome: doc.data().nome,
                categoriaId: doc.data().categoriaId,
            }));
            setSubcategorias(listaSubcategorias);
        };

        fetchCategorias();
        fetchSubcategorias();
    }, []);

    useEffect(() => {
        const fetchMedicos = async () => {
            const medicosRef = collection(db, 'medicos');
            const snapshot = await getDocs(medicosRef);
            const listaMedicos = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Medico[];

            listaMedicos.sort((a, b) => a.nome.localeCompare(b.nome));
            setMedicos(listaMedicos);
        };

        fetchMedicos();
    }, []);

    const handleAdicionarMedico = async () => {
        const { nome, crm, especialidades } = novoMedico;

        if (!nome || !crm || especialidades.length === 0) {
            alert('Por favor, preencha todos os campos e selecione ao menos uma especialidade.');
            return;
        }

        if (editarMedicoId) {
            const medicoDocRef = doc(db, 'medicos', editarMedicoId);
            await updateDoc(medicoDocRef, { nome, crm, especialidades });

            setMedicos((prev) => {
                return prev.map((medico) =>
                    medico.id === editarMedicoId ? { ...medico, nome, crm, especialidades } : medico
                );
            });

            setEditarMedicoId(null);
        } else {
            const medicosRef = collection(db, 'medicos');
            const docRef = await addDoc(medicosRef, { nome, crm, especialidades });

            setMedicos((prev) => {
                const novaLista = [...prev, { id: docRef.id, nome, crm, especialidades }];
                return novaLista.sort((a, b) => a.nome.localeCompare(b.nome));
            });
        }

        setNovoMedico({ nome: '', crm: '', especialidades: [] });
        setMostrarFormulario(false);
    };

    const handleExcluirMedico = async (id: string) => {
        const confirmacao = window.confirm('Tem certeza que deseja excluir este médico?');
        if (!confirmacao) return;

        const medicoDocRef = doc(db, 'medicos', id);
        await deleteDoc(medicoDocRef);

        setMedicos((prev) => prev.filter((medico) => medico.id !== id));
    };

    const handleEditarMedico = (medico: Medico) => {
        setNovoMedico({ nome: medico.nome, crm: medico.crm, especialidades: medico.especialidades });
        setEditarMedicoId(medico.id);
        setMostrarFormulario(true);
    };

    const handleEspecialidadeChange = (categoriaId: string, subcategoriaId: string, isChecked: boolean) => {
        setNovoMedico((prev) => {
            const especialidades = [...prev.especialidades];
            const index = especialidades.findIndex((e) => e.categoriaId === categoriaId);

            if (isChecked) {
                if (index === -1) {
                    especialidades.push({ categoriaId, subcategorias: [subcategoriaId] });
                } else {
                    especialidades[index].subcategorias.push(subcategoriaId);
                }
            } else {
                if (index !== -1) {
                    especialidades[index].subcategorias = especialidades[index].subcategorias.filter((id) => id !== subcategoriaId);
                    if (especialidades[index].subcategorias.length === 0) {
                        especialidades.splice(index, 1);
                    }
                }
            }

            return { ...prev, especialidades };
        });
    };

    const handleVerDetalhes = (id: string) => {
        navigate(`/medicos/${id}`);
    };

    return (
        <div>
            <h2>Médicos</h2>

            <button
                onClick={() => {
                    setMostrarFormulario((prev) => {
                        const novoEstado = !prev;
                        if (!novoEstado) {
                            setEditarMedicoId(null);
                            setNovoMedico({ nome: '', crm: '', especialidades: [] });
                        }
                        return novoEstado;
                    });
                }}
                className={styles.novoMedicoButton}
            >
                {editarMedicoId ? 'Cancelar Edição' : 'Adicionar Médico'}
            </button>

            {mostrarFormulario && (
                <div className={styles.formGroup}>
                    <h3>{editarMedicoId ? 'Editar Médico' : 'Adicionar Novo Médico'}</h3>
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

                    {categorias.map((categoria) => (
                        <div key={categoria.id} className={styles.categoriaGroup}>
                            <h4>{categoria.nome}</h4>
                            {subcategorias
                                .filter((sub) => sub.categoriaId === categoria.id)
                                .map((sub) => (
                                    <label key={sub.id} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={
                                                novoMedico.especialidades.some(
                                                    (e) => e.categoriaId === categoria.id && e.subcategorias.includes(sub.id)
                                                )
                                            }
                                            onChange={(e) =>
                                                handleEspecialidadeChange(categoria.id, sub.id, e.target.checked)
                                            }
                                        />
                                        {sub.nome}
                                    </label>
                                ))}
                        </div>
                    ))}

                    <button onClick={handleAdicionarMedico}>{editarMedicoId ? 'Salvar Alterações' : 'Adicionar'}</button>
                </div>
            )}

            <div className={styles.tabelaWrapper}>
                {medicos.length === 0 ? (
                    <p>Nenhum médico encontrado.</p>
                ) : (
                    <table className={styles.responsiveTable}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CRM</th>
                                <th>Especialidades</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicos.map((medico) => (
                                <tr key={medico.id}>
                                    <td>{medico.nome}</td>
                                    <td>{medico.crm}</td>
                                    <td>
                                        {medico.especialidades.map((especialidade) => {
                                            const categoria = categorias.find((c) => c.id === especialidade.categoriaId);
                                            const subcategoriasNomes = especialidade.subcategorias
                                                .map((subId) => subcategorias.find((sub) => sub.id === subId)?.nome)
                                                .filter(Boolean)
                                                .join(', ');

                                            return (
                                                <div key={especialidade.categoriaId}>
                                                    <strong>{categoria?.nome}:</strong> {subcategoriasNomes || 'Nenhuma'}
                                                </div>
                                            );
                                        })}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleVerDetalhes(medico.id)}
                                            className={styles.detalhesBtn}
                                            title="Ver detalhes"
                                        >
                                            🔍
                                        </button>
                                        <button
                                            onClick={() => handleEditarMedico(medico)}
                                            className={styles.editarBtn}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleExcluirMedico(medico.id)}
                                            className={styles.excluirBtn}
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

export default Medico;
