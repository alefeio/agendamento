import { useEffect, useState } from 'react';
import { doc, collection, getDocs, deleteDoc, setDoc, addDoc } from 'firebase/firestore';

import { db } from '../../firebaseConfig';
import styles from './Disponibilidade.module.css';

interface Disponibilidad {
    id?: string;
    tipo: 'fixa' | 'rotativa';
    medicoId: string;
    diasSemana?: boolean[];
    horarios?: { horario: string; limite: number }[]; // Atualizado para incluir limite em fixa
    diasCalendario?: string[];
    horariosPorData?: { [key: string]: { horario: string; limite: number }[] }; // Ajustado para rotativa
    diasDaSemanaComHorarios?: { [key: string]: { horario: string; limite: number }[] }; // Ajustado para fixa
}

export const Disponibilidade = ({ id }: { id: any }) => {
    const [tipoAgenda, setTipoAgenda] = useState<'fixa' | 'rotativa' | ''>('');
    const [diasSemana, setDiasSemana] = useState<boolean[]>(new Array(7).fill(false));
    const [horarios, setHorarios] = useState<{ horario: string; limite: number }[]>([]);
    const [diasCalendario, setDiasCalendario] = useState<string[]>([]);
    const [horarioSelecionado, setHorarioSelecionado] = useState<string>('');
    const [horariosPorData, setHorariosPorData] = useState<{ [key: string]: { horario: string; limite: number }[] }>({});
    const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);
    const [limiteSelecionado, setLimiteSelecionado] = useState<number>(1); // Para o limite de atendimento do horário atual


    const fetchDisp = async () => {
        if (!id) return;

        const disponibilidadeRef = collection(db, 'disponibilidade');
        const snapshot = await getDocs(disponibilidadeRef);

        const disponibilidades = snapshot.docs
            .map((doc) => {
                const data = { ...doc.data(), id: doc.id } as Disponibilidad;

                // Ordenar as datas da agenda rotativa, se existir
                if (data.tipo === 'rotativa' && data.horariosPorData) {
                    const sortedHorariosPorData = Object.keys(data.horariosPorData!)
                        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                        .reduce((acc, key) => {
                            acc[key] = data.horariosPorData![key].map(horarioObj => ({
                                horario: horarioObj.horario,
                                limite: horarioObj.limite,
                            })); // Mantém a estrutura correta
                            return acc;
                        }, {} as { [key: string]: { horario: string; limite: number }[] });

                    data.horariosPorData = sortedHorariosPorData;
                }

                return data;
            })
            .filter((disponibilidade) => disponibilidade.medicoId === id);

        setDisponibilidades(disponibilidades);
    };

    useEffect(() => {
        fetchDisp();
    }, [id]);

    const handleExcluirDisponibilidade = async (disponibilidadeId: string) => {
        const confirmacao = window.confirm('Tem certeza que deseja excluir essa disponibilidade?');
        if (!confirmacao) return;

        const disponibilidadeDoc = doc(db, 'disponibilidade', disponibilidadeId);
        await deleteDoc(disponibilidadeDoc);

        setDisponibilidades((prev) => prev.filter((d) => d.id !== disponibilidadeId));
    };

    const salvarDisponibilidade = async () => {
        if (!id || tipoAgenda === '') return;

        if (tipoAgenda === 'fixa') {
            const disponibilidadeExistente = disponibilidades.find(
                (disponibilidade) => disponibilidade.medicoId === id && disponibilidade.tipo === 'fixa'
            );

            const ordemDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

            if (disponibilidadeExistente) {
                const diasDaSemanaAtualizados = { ...disponibilidadeExistente.diasDaSemanaComHorarios };

                diasSemana.forEach((isSelected, index) => {
                    if (isSelected) {
                        const dia = ordemDias[index];
                        if (!diasDaSemanaAtualizados[dia]) {
                            diasDaSemanaAtualizados[dia] = []; // Inicializa o array corretamente
                        }
                        diasDaSemanaAtualizados[dia] = [
                            ...diasDaSemanaAtualizados[dia],
                            ...horarios.map(horario => ({
                                horario: typeof horario === 'string' ? horario : horario.horario, // Garante que seja string
                                limite: horario.limite ?? 1 // Mantém o limite correto ou define um padrão
                            }))
                        ];
                    }
                });

                await setDoc(doc(db, 'disponibilidade', disponibilidadeExistente.id!), {
                    ...disponibilidadeExistente,
                    diasDaSemanaComHorarios: diasDaSemanaAtualizados,
                });

                setDiasSemana([]);
                setHorarios([]);
                alert('Disponibilidade fixa atualizada com sucesso!');
            } else {
                const disponib: Disponibilidad = {
                    tipo: 'fixa',
                    medicoId: id,
                    diasDaSemanaComHorarios: {},
                };

                diasSemana.forEach((isSelected, index) => {
                    if (isSelected) {
                        const dia = ordemDias[index];

                        // Se a chave ainda não existe, inicializa um array vazio
                        if (!disponib.diasDaSemanaComHorarios) {
                            disponib.diasDaSemanaComHorarios = {};
                        }
                        if (!disponib.diasDaSemanaComHorarios[dia]) {
                            disponib.diasDaSemanaComHorarios[dia] = [];
                        }

                        // Mapeia os horários corretamente, garantindo a estrutura esperada
                        disponib.diasDaSemanaComHorarios[dia] = [
                            ...disponib.diasDaSemanaComHorarios[dia], // Mantém horários já existentes
                            ...horarios.map(horario => ({
                                horario: typeof horario === 'string' ? horario : horario.horario, // Garante que seja string
                                limite: typeof horario === 'object' && 'limite' in horario ? horario.limite : 1 // Mantém ou define um valor padrão
                            }))
                        ];
                    }
                });

                const disponibilidadeRef = collection(db, 'disponibilidade');
                await addDoc(disponibilidadeRef, disponib);

                setDiasSemana([]);
                setHorarios([]);
                alert('Disponibilidade fixa salva com sucesso!');
            }
        }

        else if (tipoAgenda === 'rotativa') {
            const disponibilidadeExistente = disponibilidades.find(
                (disponibilidade) => disponibilidade.medicoId === id && disponibilidade.tipo === 'rotativa'
            );

            if (disponibilidadeExistente) {
                const diasCalendarioAtualizados = [
                    ...disponibilidadeExistente.diasCalendario!,
                    ...diasCalendario,
                ];
                const horariosAtualizados = { ...disponibilidadeExistente.horariosPorData };

                diasCalendario.forEach((data) => {
                    if (horariosPorData[data]) {
                        horariosAtualizados[data] = [
                            ...(horariosAtualizados[data] || []),
                            ...horariosPorData[data],
                        ];
                    }
                });

                const diasCalendarioOrdenados = diasCalendarioAtualizados.sort(
                    (a, b) => new Date(a).getTime() - new Date(b).getTime()
                );

                await setDoc(doc(db, 'disponibilidade', disponibilidadeExistente.id!), {
                    ...disponibilidadeExistente,
                    diasCalendario: diasCalendarioOrdenados,
                    horariosPorData: horariosAtualizados,
                });

                setDiasCalendario([]);
                setHorarios([]);
                alert('Disponibilidade rotativa atualizada com sucesso!');
            } else {
                const disponib: Disponibilidad = {
                    tipo: 'rotativa',
                    medicoId: id,
                    diasCalendario: diasCalendario.sort(
                        (a, b) => new Date(a).getTime() - new Date(b).getTime()
                    ),
                    horariosPorData: horariosPorData,
                };

                const disponibilidadeRef = collection(db, 'disponibilidade');
                await addDoc(disponibilidadeRef, disponib);

                setDiasCalendario([]);
                setHorarios([]);
                alert('Disponibilidade rotativa salva com sucesso!');
            }
        }

        fetchDisp();
        setTipoAgenda('');
    };

    // Função para alternar entre os formulários
    const toggleForm = (agendaTipo: 'fixa' | 'rotativa') => {
        setTipoAgenda(tipoAgenda === agendaTipo ? '' : agendaTipo); // Alterna entre mostrar e esconder o formulário
    };

    const handleExcluirDia = async (disponibilidadeId: string, dia: string) => {
        const confirmacao = window.confirm('Tem certeza que deseja excluir esse dia da semana?');
        if (!confirmacao) return;

        const disponibilidadeExistente = disponibilidades.find((d) => d.id === disponibilidadeId);
        if (disponibilidadeExistente) {
            const novosDias = { ...disponibilidadeExistente.diasDaSemanaComHorarios };
            delete novosDias[dia];

            // Atualiza no Firestore
            await setDoc(doc(db, 'disponibilidade', disponibilidadeId), {
                ...disponibilidadeExistente,
                diasDaSemanaComHorarios: novosDias,
            });

            // Atualiza o estado local
            setDisponibilidades((prev) =>
                prev.map((d) =>
                    d.id === disponibilidadeId
                        ? { ...d, diasDaSemanaComHorarios: novosDias }
                        : d
                )
            );
        }
    };

    const handleExcluirDataRotativa = async (disponibilidadeId: string, data: string) => {
        const confirmacao = window.confirm('Tem certeza que deseja excluir essa data?');
        if (!confirmacao) return;

        const disponibilidadeExistente = disponibilidades.find((d) => d.id === disponibilidadeId);
        if (disponibilidadeExistente) {
            // Remove a data do calendário
            const novosDiasCalendario = disponibilidadeExistente.diasCalendario?.filter((d) => d !== data) || [];
            const novosHorariosPorData = { ...disponibilidadeExistente.horariosPorData };
            delete novosHorariosPorData[data];

            // Atualiza no Firestore
            await setDoc(doc(db, 'disponibilidade', disponibilidadeId), {
                ...disponibilidadeExistente,
                diasCalendario: novosDiasCalendario,
                horariosPorData: novosHorariosPorData,
            });

            // Atualiza o estado local
            setDisponibilidades((prev) =>
                prev.map((d) =>
                    d.id === disponibilidadeExistente.id
                        ? { ...d, diasCalendario: novosDiasCalendario, horariosPorData: novosHorariosPorData }
                        : d
                )
            );
        }
    };

    const handleAdicionarHorarioParaData = (data: string) => {
        if (horarioSelecionado) {
            setHorariosPorData((prev) => {
                const novosHorarios = prev[data] || [];
                if (!novosHorarios.some((h) => h.horario === horarioSelecionado)) {
                    const novosHorariosOrdenados = [
                        ...novosHorarios,
                        { horario: horarioSelecionado, limite: limiteSelecionado },
                    ];
                    return { ...prev, [data]: novosHorariosOrdenados };
                }
                return prev;
            });
            setHorarioSelecionado('');
            setLimiteSelecionado(1);
        } else {
            alert('Selecione um horário para adicionar!');
        }
    };

    const handleRemoverData = (data: string) => {
        setDiasCalendario(diasCalendario.filter((d) => d !== data));
        setHorariosPorData((prev) => {
            const { [data]: _, ...rest } = prev;
            console.log(_);
            return rest;
        });
    };


    return (
        <div className={styles.box1}>
            <h2>Disponibilidade</h2>
            <div className={styles.addDisponibilidade}>
                <button
                    onClick={() => toggleForm('fixa')}
                    disabled={disponibilidades.some((d) => d.tipo === 'rotativa')}
                >
                    Adicionar Agenda Fixa
                </button>
                <button
                    onClick={() => toggleForm('rotativa')}
                    disabled={disponibilidades.some((d) => d.tipo === 'fixa')}
                >
                    Adicionar Agenda Rotativa
                </button>

                {tipoAgenda === 'fixa' && (
                    <div>
                        <h4>Selecione os dias da semana e horários</h4>
                        <div className={styles.diasCalendarioWrapper}>
                            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia, index) => (
                                <div key={index}>
                                    <input
                                        type="checkbox"
                                        checked={diasSemana[index]}
                                        onChange={() => {
                                            const newDias = [...diasSemana];
                                            newDias[index] = !newDias[index];
                                            setDiasSemana(newDias);
                                        }}
                                    />
                                    {dia}
                                </div>
                            ))}
                        </div>
                        <div className={styles.horariosWrapper}>
                            <h4>Horários de Atendimento</h4>
                            <input
                                type="time"
                                value={horarioSelecionado}
                                onChange={(e) => setHorarioSelecionado(e.target.value)}
                            />
                            <small>Capacidade de atendimento:</small>
                            <input
                                type="number"
                                min="1"
                                value={limiteSelecionado}
                                onChange={(e) => setLimiteSelecionado(Number(e.target.value))}
                                placeholder="Limite de Atendimento"
                            />
                            <button
                                onClick={() => {
                                    if (horarioSelecionado && !horarios.some((h) => h.horario === horarioSelecionado)) {
                                        const novosHorarios = [
                                            ...horarios,
                                            { horario: horarioSelecionado, limite: limiteSelecionado },
                                        ];
                                        setHorarios(novosHorarios);
                                        setHorarioSelecionado('');
                                        setLimiteSelecionado(1);
                                    } else {
                                        alert('Este horário já foi adicionado ou não foi selecionado!');
                                    }
                                }}
                            >
                                Incluir horário
                            </button>
                            <button onClick={() => setHorarios([])}>Limpar</button>
                            <ul>
                                {horarios.map((horario, index) => (
                                    <li key={index}>
                                        {horario.horario} - Limite: {horario.limite}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {tipoAgenda === 'rotativa' && (
                    <div className={styles.diasCalendarioWrapper}>
                        <h4>Selecione os dias disponíveis</h4>
                        <input
                            type="date"
                            onChange={(e) => setDiasCalendario([...diasCalendario, e.target.value])}
                        />
                        <ul>
                            {diasCalendario.sort().map((data, index) => (
                                <li key={index}>
                                    {data}
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => handleRemoverData(data)}
                                    >
                                        Remover
                                    </button>
                                    <div>
                                        <input
                                            type="time"
                                            value={horarioSelecionado}
                                            onChange={(e) => setHorarioSelecionado(e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            value={limiteSelecionado}
                                            onChange={(e) => setLimiteSelecionado(Number(e.target.value))}
                                            placeholder="Limite de Atendimento"
                                        />
                                        <button
                                            onClick={() => handleAdicionarHorarioParaData(data)}
                                            className={styles.button}
                                        >
                                            Adicionar Horário
                                        </button>
                                        <ul>
                                            {horariosPorData[data]?.map((horario, i) => (
                                                <li key={i}>
                                                    {horario.horario} - Limite: {horario.limite}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {tipoAgenda !== '' && (
                    <button className={styles.saveButton} onClick={salvarDisponibilidade}>
                        Salvar Disponibilidade
                    </button>
                )}

                {/* Mostrar todas as disponibilidades existentes */}
                <h3>Datas disponíveis</h3>
                <div>
                    {disponibilidades.length > 0 ? (
                        disponibilidades.map((disponibilidade) => (
                            <div key={disponibilidade.id}>
                                <h4>{disponibilidade.tipo === 'fixa' ? 'Agenda Fixa' : 'Agenda Rotativa'}</h4>
                                {disponibilidade.tipo === 'fixa' ? (
                                    <div className={styles.tabelaWrapper}>
                                        <table className={styles.responsiveTable}>
                                            <thead>
                                                <tr>
                                                    <th>Dia</th>
                                                    <th>Horários</th>
                                                    <th>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(disponibilidade.diasDaSemanaComHorarios!)
                                                    .sort(([diaA], [diaB]) => {
                                                        const ordemDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
                                                        return ordemDias.indexOf(diaA) - ordemDias.indexOf(diaB);
                                                    })
                                                    .map(([dia, horarios]) => (
                                                        <tr key={dia}>
                                                            <td>{dia}</td>
                                                            <td>
                                                                {horarios
                                                                    .map((h) => `${h.horario} - Limite: ${h.limite}`)
                                                                    .join(', ')}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className={styles.deleteButton}
                                                                    onClick={() => handleExcluirDia(disponibilidade.id!, dia)}
                                                                >
                                                                    Excluir Dia
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className={styles.tabelaWrapper}>
                                        <table className={styles.responsiveTable}>
                                            <thead>
                                                <tr>
                                                    <th>Data</th>
                                                    <th>Horários</th>
                                                    <th>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(disponibilidade.horariosPorData!).map(([data, horarios]) => (
                                                    <tr key={data}>
                                                        <td>{data}</td>
                                                        <td>
                                                            {horarios
                                                                .map((h) => `${h.horario} - Limite: ${h.limite}`)
                                                                .join(', ')}
                                                        </td>
                                                        <td>
                                                            <button
                                                                className={styles.deleteButton}
                                                                onClick={() => handleExcluirDataRotativa(disponibilidade.id!, data)}
                                                            >
                                                                Excluir Data
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleExcluirDisponibilidade(disponibilidade.id!)}
                                >
                                    Excluir Disponibilidades
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>Nenhuma disponibilidade encontrada.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
