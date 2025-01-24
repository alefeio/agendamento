import { useEffect, useState } from 'react';
import { doc, collection, getDocs, deleteDoc, setDoc, addDoc } from 'firebase/firestore';
 
import { db } from '../../firebaseConfig';
import styles from './Disponibilidade.module.css';

interface Disponibilidad {
    id?: string;
    tipo: 'fixa' | 'rotativa';
    medicoId: string;
    diasSemana?: boolean[];
    horarios?: { horario: string; limite: number }[];
    diasCalendario?: string[];
    horariosPorData?: { [key: string]: { horario: string; limite: number }[] };
    diasDaSemanaComHorarios?: { [key: string]: { horario: string; limite: number }[] };
}

export const Disponibilidade = ({ id }: { id: any }) => {
    const [tipoAgenda, setTipoAgenda] = useState<'fixa' | 'rotativa' | ''>('');
    const [diasSemana, setDiasSemana] = useState<boolean[]>(new Array(7).fill(false));
    const [horarios, setHorarios] = useState<{ horario: string; limite: number }[]>([]);
    const [diasCalendario, setDiasCalendario] = useState<string[]>([]);
    const [horarioSelecionado, setHorarioSelecionado] = useState<string>('');
    const [limiteSelecionado, setLimiteSelecionado] = useState<number>(1);
    const [horariosPorData, setHorariosPorData] = useState<{ [key: string]: { horario: string; limite: number }[] }>({});
    const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);

    const fetchDisp = async () => {
        if (!id) return;

        const disponibilidadeRef = collection(db, 'disponibilidade');
        const snapshot = await getDocs(disponibilidadeRef);

        const disponibilidades = snapshot.docs
            .map((doc) => {
                const data = { ...doc.data(), id: doc.id } as Disponibilidad;

                // Ordenar as datas da agenda rotativa, se existir
                if (data.tipo === 'rotativa' && data.horariosPorData) {
                    const sortedHorariosPorData = Object.keys(data.horariosPorData)
                        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Ordena as datas
                        .reduce((acc, key) => {
                            acc[key] = data.horariosPorData![key];
                            return acc;
                        }, {} as Record<string, { horario: string; limite: number }[]>);

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

    const handleAdicionarHorario = () => {
        if (horarioSelecionado && !horarios.some((h) => h.horario === horarioSelecionado)) {
            const novosHorarios = [...horarios, { horario: horarioSelecionado, limite: limiteSelecionado }];
            setHorarios(novosHorarios);
            setHorarioSelecionado('');
            setLimiteSelecionado(1);
        } else {
            alert('Este horário já foi adicionado ou não foi selecionado!');
        }
    };

    const salvarDisponibilidade = async () => {
        if (!id || tipoAgenda === '') return;

        const disponib: Disponibilidad = {
            tipo: tipoAgenda,
            medicoId: id,
        };

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
                        if (diasDaSemanaAtualizados[dia]) {
                            diasDaSemanaAtualizados[dia] = [
                                ...diasDaSemanaAtualizados[dia],
                                ...horarios,
                            ];
                        } else {
                            diasDaSemanaAtualizados[dia] = horarios;
                        }
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
                disponib.diasDaSemanaComHorarios = {};

                diasSemana.forEach((isSelected, index) => {
                    if (isSelected) {
                        const dia = ordemDias[index];
                        disponib.diasDaSemanaComHorarios![dia] = horarios;
                    }
                });

                const disponibilidadeRef = collection(db, 'disponibilidade');
                await addDoc(disponibilidadeRef, disponib);

                setDiasSemana([]);
                setHorarios([]);
                alert('Disponibilidade fixa salva com sucesso!');
            }
        }

        fetchDisp();
        setTipoAgenda('');
    };

    return (
        <div className={styles.box1}>
            <h2>Disponibilidade</h2>
            <div className={styles.addDisponibilidade}>
                <button
                    onClick={() => setTipoAgenda(tipoAgenda === 'fixa' ? '' : 'fixa')}
                    disabled={disponibilidades.some((d) => d.tipo === 'rotativa')}
                >
                    Adicionar Agenda Fixa
                </button>

                {tipoAgenda === 'fixa' && (
                    <div>
                        <h4>Selecione os dias da semana e horários</h4>
                        <div className={styles.diaSemana}>
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
                            <input
                                type="number"
                                min="1"
                                value={limiteSelecionado}
                                onChange={(e) => setLimiteSelecionado(Number(e.target.value))}
                                placeholder="Limite"
                            />
                            <button onClick={handleAdicionarHorario}>Incluir horário</button>
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

                {tipoAgenda !== '' && (
                    <button className={styles.saveButton} onClick={salvarDisponibilidade}>
                        Salvar Disponibilidade
                    </button>
                )}
            </div>
        </div>
    );
};
