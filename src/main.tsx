// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Especialidade from './pages/Especialidade';
import Convenio from './pages/Convenio';
import Medico from './pages/Medico';
import DataHora from './pages/DataHora';
import PainelGestao from './pages/PainelGestao';
import StepFlow from './pages/StepFlow';
import './global.css'
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Restrito from './pages/admin/Restrito';
import { AgendamentoProvider } from './context/AgendamentoContext';
import DetalhesMedico from './pages/admin/DetalhesMedico';
import Obrigado from './pages/Obrigado';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AgendamentoProvider>
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/especialidade" element={<Especialidade />} />
          <Route path="/convenio" element={<Convenio />} />
          <Route path="/medico" element={<Medico />} />
          <Route path="/data-hora" element={<DataHora />} />
          <Route path="/painel-gestao" element={<PainelGestao />} />
          <Route path="/step-flow" element={<StepFlow />} />
          <Route path="/medicos/:id" element={<DetalhesMedico />} />
          <Route path="/obrigado" element={<Obrigado />} />
          <Route
            path="/restrito"
            element={
              <PrivateRoute>
                <Restrito />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </React.StrictMode>
  </AgendamentoProvider>
);