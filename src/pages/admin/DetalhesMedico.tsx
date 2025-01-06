import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import styles from './DetalhesMedico.module.css';
import { Disponibilidade } from '../../components/Disponibilidade';

interface Medico {
    nome: string;
    crm: string;
    especialidadeId: string;
}

interface Convenio {
    id: string;
    nome: string;
}

interface DetalhesMedico {
    id: string;
    medicoId: string;
    convenioId: string;
    nomeConvenio: string;
    limiteMensal: number;
}

const DetalhesMedico: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [medico, setMedico] = useState<Medico | null>(null);
    const [especialidade, setEspecialidade] = useState<string>('');
    const [convenios, setConvenios] = useState<Convenio[]>([]);
    const [relacoes, setRelacoes] = useState<DetalhesMedico[]>([]);
    const [novoConvenio, setNovoConvenio] = useState({ convenioId: '', limite: 0 });
    const [editandoLimite, setEditandoLimite] = useState<string | null>(null);
    const [limiteEditado, setLimiteEditado] = useState<number | null>(null);
    const [formVisible, setFormVisible] = useState(false); // Novo estado para controlar a visibilidade do formulário

    const goToRestrito = () => {
        navigate('/restrito?tab=medicos'); // Navega para a URL com a query string
    };

    useEffect(() => {
        const fetchMedico = async () => {
            if (!id) return;
            const medicoRef = doc(db, 'medicos', id);
            const medicoSnap = await getDoc(medicoRef);

            if (medicoSnap.exists()) {
                const medicoData = medicoSnap.data() as Medico;
                setMedico(medicoData);

                const especialidadeRef = doc(db, 'especialidades', medicoData.especialidadeId);
                const especialidadeSnap = await getDoc(especialidadeRef);
                if (especialidadeSnap.exists()) {
                    setEspecialidade(especialidadeSnap.data().nome);
                }
            }
        };
        fetchMedico();
    }, [id]);

    useEffect(() => {
        const fetchConvenios = async () => {
            const conveniosRef = collection(db, 'convenios');
            const snapshot = await getDocs(conveniosRef);
            const listaConvenios = snapshot.docs.map((doc) => ({
                id: doc.id,
                nome: doc.data().nome,
            }));
            const conveniosAssociados = relacoes.map((rel) => rel.convenioId);
            const conveniosDisponiveis = listaConvenios.filter(
                (convenio) => !conveniosAssociados.includes(convenio.id)
            );
            setConvenios(conveniosDisponiveis);
        };
        fetchConvenios();
    }, [relacoes]);

    useEffect(() => {
        const fetchRelacoes = async () => {
            if (!id) return;
            const conveniosRef = collection(doc(db, 'medicos', id), 'convenios');
            const snapshot = await getDocs(conveniosRef);
            const relacoes = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    medicoId: id,
                    convenioId: doc.id,
                    nomeConvenio: data.nome,
                    limiteMensal: data.limiteMensal,
                };
            });
            setRelacoes(relacoes);
        };
        fetchRelacoes();
    }, [id]);

    const handleAdicionarConvenio = async () => {
        const { convenioId, limite } = novoConvenio;
        if (!convenioId || limite <= 0) {
            alert('Por favor, preencha todos os campos do convênio.');
            return;
        }
        const medicoRef = doc(db, 'medicos', id!);
        const conveniosRef = collection(medicoRef, 'convenios');
        const convenioDoc = doc(conveniosRef, convenioId);

        await setDoc(convenioDoc, {
            nome: convenios.find((c) => c.id === convenioId)?.nome || '',
            limiteMensal: limite,
        });
        setNovoConvenio({ convenioId: '', limite: 0 });
        alert('Convênio associado com sucesso!');
        const snapshot = await getDocs(conveniosRef);
        const relacoesAtualizadas = snapshot.docs.map((doc) => ({
            id: doc.id,
            medicoId: id!,
            convenioId: doc.id,
            nomeConvenio: doc.data().nome,
            limiteMensal: doc.data().limiteMensal,
        }));
        setRelacoes(relacoesAtualizadas);
    };

    const handleEditarLimite = async (convenioId: string, novoLimite: number) => {
        if (novoLimite <= 0) {
            alert('O limite deve ser maior que zero.');
            return;
        }
        const medicoRef = doc(db, 'medicos', id!);
        const convenioDoc = doc(collection(medicoRef, 'convenios'), convenioId);
        await setDoc(convenioDoc, { limiteMensal: novoLimite }, { merge: true });
        alert('Limite atualizado com sucesso!');
        setEditandoLimite(null);
        setLimiteEditado(null);
        const conveniosRef = collection(medicoRef, 'convenios');
        const snapshot = await getDocs(conveniosRef);
        const relacoesAtualizadas = snapshot.docs.map((doc) => ({
            id: doc.id,
            medicoId: id!,
            convenioId: doc.id,
            nomeConvenio: doc.data().nome,
            limiteMensal: doc.data().limiteMensal,
        }));
        setRelacoes(relacoesAtualizadas);
    };

    const handleExcluirRelacao = async (convenioId: string) => {
        const confirmacao = window.confirm('Tem certeza que deseja excluir essa relação?');
        if (!confirmacao) return;
        const medicoRef = doc(db, 'medicos', id!);
        const convenioDoc = doc(collection(medicoRef, 'convenios'), convenioId);
        await deleteDoc(convenioDoc);
        setRelacoes((prev) => prev.filter((rel) => rel.convenioId !== convenioId));
    };

    const toggleFormVisibility = () => setFormVisible((prev) => !prev); // Função para alternar a visibilidade do formulário

    if (!medico) return <p>Carregando detalhes do médico...</p>;

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.box}>
                <header>
                    <button className={styles.backButton} onClick={goToRestrito}>
                        Voltar
                    </button>
                    <h1>Detalhes do Médico</h1>
                </header>
                <p>
                    <strong>Nome:</strong> {medico.nome}
                </p>
                <p>
                    <strong>CRM:</strong> {medico.crm}
                </p>
                <p>
                    <strong>Especialidade:</strong> {especialidade}
                </p>

                <div className={styles.box1}>
                    <h2>Convênios Associados</h2>
                    <div className={styles.addConvenio}>
                        <button onClick={toggleFormVisibility} className={styles.toggleButton}>
                            {formVisible ? 'Cancelar' : 'Associar Convênio'}
                        </button>

                        {/* Formulário de associar convênio */}
                        {formVisible && (
                            <div className={styles.addConvenio}>
                                <h3>Associar Convênio</h3>
                                <select
                                    value={novoConvenio.convenioId}
                                    onChange={(e) =>
                                        setNovoConvenio((prev) => ({ ...prev, convenioId: e.target.value }))
                                    }
                                >
                                    <option value="">Selecione o Convênio</option>
                                    {convenios.map((convenio) => (
                                        <option key={convenio.id} value={convenio.id}>
                                            {convenio.nome}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={novoConvenio.limite}
                                    onChange={(e) =>
                                        setNovoConvenio((prev) => ({ ...prev, limite: Number(e.target.value) }))
                                    }
                                    placeholder="Limite Mensal"
                                />
                                <button onClick={handleAdicionarConvenio}>Adicionar</button>
                            </div>
                        )}
                        {relacoes.length > 0 && (
                            <table className={styles.responsiveTable}>
                                <thead>
                                    <tr>
                                        <th>Convênio</th>
                                        <th>Limite Mensal</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {relacoes.map((rel) => (
                                        <tr key={rel.id}>
                                            <td>{rel.nomeConvenio}</td>
                                            <td>
                                                {editandoLimite === rel.convenioId ? (
                                                    <input
                                                        type="number"
                                                        value={limiteEditado ?? rel.limiteMensal}
                                                        onChange={(e) =>
                                                            setLimiteEditado(Number(e.target.value))
                                                        }
                                                    />
                                                ) : (
                                                    rel.limiteMensal
                                                )}
                                            </td>
                                            <td>
                                                {editandoLimite === rel.convenioId ? (
                                                    <button
                                                        onClick={() =>
                                                            handleEditarLimite(rel.convenioId, limiteEditado ?? rel.limiteMensal)
                                                        }
                                                    >
                                                        Salvar
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditandoLimite(rel.convenioId);
                                                            setLimiteEditado(rel.limiteMensal);
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleExcluirRelacao(rel.convenioId)}
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
                <Disponibilidade id={id} />
            </div>
        </div>
    );
};

export default DetalhesMedico;
