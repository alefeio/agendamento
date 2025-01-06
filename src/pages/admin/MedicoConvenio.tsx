import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
// @ts-ignore
import { db } from '../../../firebaseConfig';

interface Convenio {
  id: string;
  nome: string;
}

interface Medico {
  id: string;
  nome: string;
  crm: string;
  especialidadeId: string;
}

interface MedicoConvenio {
  id: string;
  medicoId: string;
  convenioId: string;
  nomeMedico: string;
  nomeConvenio: string;
  limiteMensal: number;
}

const MedicoConvenio: React.FC = () => {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [relacoes, setRelacoes] = useState<MedicoConvenio[]>([]);
  const [novoConvenio, setNovoConvenio] = useState({ medicoId: '', convenioId: '', limite: 0 });

  // Carregar médicos e convênios do Firebase
  useEffect(() => {
    const fetchData = async () => {
      const medicosSnapshot = await getDocs(collection(db, 'medicos'));
      const conveniosSnapshot = await getDocs(collection(db, 'convenios'));

      setMedicos(
        medicosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Medico[]
      );
      setConvenios(
        conveniosSnapshot.docs.map((doc) => ({ id: doc.id, nome: doc.data().nome }))
      );
    };

    fetchData();
  }, []);

  const fetchRelacoes = async () => {
    const relacoes: MedicoConvenio[] = [];
    for (const medico of medicos) {
      const conveniosSnapshot = await getDocs(collection(doc(db, 'medicos', medico.id), 'convenios'));

      conveniosSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        relacoes.push({
          id: doc.id,
          medicoId: medico.id,
          convenioId: doc.id,
          nomeMedico: medico.nome,
          nomeConvenio: data.nome,
          limiteMensal: data.limiteMensal,
        });
      });
    }
    setRelacoes(relacoes);
  };

  useEffect(() => {
    if (medicos.length > 0) {
      fetchRelacoes();
    }
  }, [medicos]);

  const handleAdicionarConvenio = async () => {
    const { medicoId, convenioId, limite } = novoConvenio;

    if (!medicoId || !convenioId || limite <= 0) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    const medicoRef = doc(db, 'medicos', medicoId);
    const conveniosRef = collection(medicoRef, 'convenios');
    const convenioDoc = doc(conveniosRef, convenioId);

    await setDoc(convenioDoc, {
      nome: convenios.find((c) => c.id === convenioId)?.nome || '',
      limiteMensal: limite,
    });

    alert('Convênio associado com sucesso!');
    setNovoConvenio({ medicoId: '', convenioId: '', limite: 0 });
    fetchRelacoes();
  };

  const handleExcluirRelacao = async (medicoId: string, convenioId: string) => {
    const confirmacao = window.confirm('Deseja excluir essa relação?');
    if (!confirmacao) return;

    const medicoRef = doc(db, 'medicos', medicoId);
    await deleteDoc(doc(collection(medicoRef, 'convenios'), convenioId));

    setRelacoes((prev) => prev.filter((rel) => rel.medicoId !== medicoId || rel.convenioId !== convenioId));
  };

  return (
    <div className="container">
      <div>
        <h3>Associar Convênio ao Médico</h3>
        <div className="form-group">
          <select
            value={novoConvenio.medicoId}
            onChange={(e) => setNovoConvenio({ ...novoConvenio, medicoId: e.target.value })}
          >
            <option value="">Selecione o Médico</option>
            {medicos.map((medico) => (
              <option key={medico.id} value={medico.id}>
                {medico.nome}
              </option>
            ))}
          </select>
          <select
            value={novoConvenio.convenioId}
            onChange={(e) => setNovoConvenio({ ...novoConvenio, convenioId: e.target.value })}
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
            onChange={(e) => setNovoConvenio({ ...novoConvenio, limite: Number(e.target.value) })}
            placeholder="Limite Mensal"
          />
          <button onClick={handleAdicionarConvenio}>Adicionar</button>
        </div>
      </div>

      {relacoes.length > 0 && (
        <div>
          <h2>Relações Médico-Convênio</h2>
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Médico</th>
                <th>Convênio</th>
                <th>Limite Mensal</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {relacoes.map((rel) => (
                <tr key={rel.id}>
                  <td>{rel.nomeMedico}</td>
                  <td>{rel.nomeConvenio}</td>
                  <td>{rel.limiteMensal}</td>
                  <td>
                    <button onClick={() => handleExcluirRelacao(rel.medicoId, rel.convenioId)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MedicoConvenio;
