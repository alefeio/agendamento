import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface Especialidade {
  id: string;
  nome: string;
}

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
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [relacoes, setRelacoes] = useState<MedicoConvenio[]>([]);
  const [novoMedico, setNovoMedico] = useState({ nome: '', crm: '', especialidadeId: '' });
  const [novoConvenio, setNovoConvenio] = useState({ medicoId: '', convenioId: '', limite: 0 });

  // Carregar médicos do Firebase
  useEffect(() => {
    const fetchMedicos = async () => {
      const medicosRef = collection(db, 'medicos');
      const snapshot = await getDocs(medicosRef);
      const listaMedicos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Medico[];
      setMedicos(listaMedicos);
    };

    fetchMedicos();
  }, []);

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

  // Carregar relações médico-convênio do Firebase
  const fetchRelacoes = async () => {
    const relacoes: MedicoConvenio[] = [];
    for (const medico of medicos) {
      const conveniosRef = collection(doc(db, 'medicos', medico.id), 'convenios');
      const snapshot = await getDocs(conveniosRef);

      snapshot.docs.forEach((doc) => {
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
    if (medicos.length) {
      fetchRelacoes();
    }
  }, [medicos]);

  // Adicionar convênio com limite
  const handleAdicionarConvenio = async () => {
    const { medicoId, convenioId, limite } = novoConvenio;

    if (!medicoId || !convenioId || limite <= 0) {
      alert('Por favor, preencha todos os campos do convênio.');
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

    // Atualizar a listagem de relações após a inclusão
    fetchRelacoes();
  };

  // Excluir relação médico-convênio
  const handleExcluirRelacao = async (medicoId: string, convenioId: string) => {
    const confirmacao = window.confirm('Tem certeza que deseja excluir essa relação?');
    if (!confirmacao) return;

    const medicoRef = doc(db, 'medicos', medicoId);
    const convenioDoc = doc(collection(medicoRef, 'convenios'), convenioId);

    await deleteDoc(convenioDoc);
    setRelacoes((prev) => prev.filter((rel) => rel.medicoId !== medicoId || rel.convenioId !== convenioId));
  };

  return (
    <div>
      {relacoes.length > 0 && (
        <div>
          <h2>Relações Médico-Convênio</h2>
          <ul>
            {relacoes.map((rel) => (
              <li key={rel.id}>
                Médico: {rel.nomeMedico} - Convênio: {rel.nomeConvenio} - Limite Mensal: {rel.limiteMensal}
                <button onClick={() => handleExcluirRelacao(rel.medicoId, rel.convenioId)}>Excluir</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3>Associar Convênio ao Médico</h3>
        <select
          value={novoConvenio.medicoId}
          onChange={(e) => setNovoConvenio((prev) => ({ ...prev, medicoId: e.target.value }))}
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
          onChange={(e) => setNovoConvenio((prev) => ({ ...prev, convenioId: e.target.value }))}
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
          onChange={(e) => setNovoConvenio((prev) => ({ ...prev, limite: Number(e.target.value) }))}
          placeholder="Limite Mensal"
        />
        <button onClick={handleAdicionarConvenio}>Adicionar Convênio</button>
      </div>
    </div>
  );
};

export default MedicoConvenio;
