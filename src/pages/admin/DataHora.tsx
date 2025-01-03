// src/pages/DataHora.tsx
import React, { useState } from 'react';

interface Horario {
  id: number;
  hora: string;
}

const DataHora: React.FC = () => {
  const [horarios, setHorarios] = useState<Horario[]>([
    { id: 1, hora: '09:00' },
    { id: 2, hora: '10:00' },
    { id: 3, hora: '14:00' },
    { id: 4, hora: '16:00' },
  ]);

  const handleCadastrar = () => {
    // Aqui você pode abrir um modal ou redirecionar para outra página para o cadastro
    alert('Abrir formulário de cadastro para Horários');
  };

  return (
    <div>
      <h2>Horários Disponíveis</h2>
      <ul>
        {horarios.map((horario) => (
          <li key={horario.id}>{horario.hora}</li>
        ))}
      </ul>
      <button onClick={handleCadastrar}>Cadastrar Novo Horário</button>
    </div>
  );
};

export default DataHora;
