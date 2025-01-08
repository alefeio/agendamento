import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import styles from './Especialidade.module.css';

interface Categoria {
  id: string;
  nome: string;
}

interface Subcategoria {
  id: string;
  nome: string;
  categoriaId: string;
  limiteConvenio?: string; // Campo opcional
}

const Especialidade: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novaSubcategoria, setNovaSubcategoria] = useState({ nome: '', categoriaId: '' });
  const [limiteConvenio, setLimiteConvenio] = useState('');
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [subcategoriaEditando, setSubcategoriaEditando] = useState<Subcategoria | null>(null);
  const [mostrarFormularioCategoria, setMostrarFormularioCategoria] = useState(false);
  const [mostrarFormularioSubcategoria, setMostrarFormularioSubcategoria] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      const categoriasRef = collection(db, 'categorias');
      const snapshot = await getDocs(categoriasRef);
      const listaCategorias = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setCategorias(listaCategorias.sort((a, b) => a.nome.localeCompare(b.nome)));
    };

    const fetchSubcategorias = async () => {
      const subcategoriasRef = collection(db, 'subcategorias');
      const snapshot = await getDocs(subcategoriasRef);
      const listaSubcategorias = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
        categoriaId: doc.data().categoriaId,
        limiteConvenio: doc.data().limiteConvenio,
      }));
      setSubcategorias(listaSubcategorias);
    };

    fetchCategorias();
    fetchSubcategorias();
  }, []);

  const handleAdicionarCategoria = async () => {
    if (novaCategoria.trim() === '') {
      alert('Por favor, insira um nome para a categoria.');
      return;
    }

    const categoriasRef = collection(db, 'categorias');
    const docRef = await addDoc(categoriasRef, { nome: novaCategoria });
    setCategorias((prev) => [...prev, { id: docRef.id, nome: novaCategoria }]);
    setNovaCategoria('');
    setMostrarFormularioCategoria(false);
  };

  const handleAdicionarSubcategoria = async () => {
    const { nome, categoriaId } = novaSubcategoria;
    if (!nome || !categoriaId) {
      alert('Por favor, preencha todos os campos da subcategoria.');
      return;
    }

    const subcategoriaData: any = { nome, categoriaId };
    const categoriaSelecionada = categorias.find((cat) => cat.id === categoriaId);

    if (categoriaSelecionada?.nome === 'Exame') {
      if (!limiteConvenio.trim()) {
        alert('Por favor, insira o limite do convênio para a subcategoria.');
        return;
      }
      subcategoriaData.limiteConvenio = limiteConvenio;
    }

    const subcategoriasRef = collection(db, 'subcategorias');
    const docRef = await addDoc(subcategoriasRef, subcategoriaData);
    setSubcategorias((prev) => [...prev, { id: docRef.id, ...subcategoriaData }]);
    setNovaSubcategoria({ nome: '', categoriaId: '' });
    setLimiteConvenio('');
    setMostrarFormularioSubcategoria(false);
  };

  const handleExcluirCategoria = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      await deleteDoc(doc(db, 'categorias', id));
      setCategorias((prev) => prev.filter((categoria) => categoria.id !== id));
    }
  };

  const handleExcluirSubcategoria = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta subcategoria?')) {
      await deleteDoc(doc(db, 'subcategorias', id));
      setSubcategorias((prev) => prev.filter((subcategoria) => subcategoria.id !== id));
    }
  };

  const handleEditarCategoria = async () => {
    if (!categoriaEditando || categoriaEditando.nome.trim() === '') {
      alert('Por favor, insira um nome válido.');
      return;
    }

    const categoriaRef = doc(db, 'categorias', categoriaEditando.id);
    await updateDoc(categoriaRef, { nome: categoriaEditando.nome });

    setCategorias((prev) =>
      prev.map((categoria) =>
        categoria.id === categoriaEditando.id ? categoriaEditando : categoria
      )
    );
    setCategoriaEditando(null);
  };

  const handleEditarSubcategoria = async () => {
    if (!subcategoriaEditando || subcategoriaEditando.nome.trim() === '') {
      alert('Por favor, insira um nome válido para a subcategoria.');
      return;
    }
  
    const subcategoriaRef = doc(db, 'subcategorias', subcategoriaEditando.id);
    const { nome, categoriaId, limiteConvenio } = subcategoriaEditando;
  
    // Se a categoria for do tipo "Exame", devemos verificar e atualizar o limite do convênio
    if (categoriaId) {
      const categoria = categorias.find((cat) => cat.id === categoriaId);
  
      if (categoria?.nome === 'Exame' && limiteConvenio !== undefined) {
        // Atualiza a subcategoria no Firestore
        await updateDoc(subcategoriaRef, {
          nome,
          categoriaId,
          limiteConvenio, // Somente "Exame" terá limiteConvenio
        });
      } else {
        // Se for do tipo "Consulta", não precisa de limiteConvenio
        await updateDoc(subcategoriaRef, {
          nome,
          categoriaId,
          limiteConvenio: null, // Remover o limiteConvenio para consultas
        });
      }
    }
  
    // Atualiza o estado local
    setSubcategorias((prev) =>
      prev.map((sub) =>
        sub.id === subcategoriaEditando.id ? subcategoriaEditando : sub
      )
    );
    setSubcategoriaEditando(null);
  };
  

  const subcategoriasConsulta = subcategorias.filter((sub) => {
    const categoria = categorias.find((cat) => cat.id === sub.categoriaId);
    return categoria?.nome === 'Consulta';
  });

  const subcategoriasExame = subcategorias.filter((sub) => {
    const categoria = categorias.find((cat) => cat.id === sub.categoriaId);
    return categoria?.nome === 'Exame';
  });

  return (
    <div>
      <h2>Especialidades</h2>

      {/* Formulário para adicionar categoria */}
      <button
        onClick={() => setMostrarFormularioCategoria((prev) => !prev)}
        className={styles.novaEspecialidadeButton}
      >
        Adicionar Categoria
      </button>

      {mostrarFormularioCategoria && (
        <div>
          <h3>Adicionar Nova Categoria</h3>
          <input
            type="text"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            placeholder="Nova Categoria"
          />
          <button onClick={handleAdicionarCategoria}>Adicionar</button>
        </div>
      )}

      {/* Listagem de Categorias */}
      <div className={styles.tabelaWrapper}>
        <h3>Categorias</h3>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td>
                  {categoriaEditando?.id === categoria.id ? (
                    <input
                      type="text"
                      value={categoriaEditando.nome}
                      onChange={(e) =>
                        setCategoriaEditando({ ...categoriaEditando, nome: e.target.value })
                      }
                    />
                  ) : (
                    categoria.nome
                  )}
                </td>
                <td>
                  {categoriaEditando?.id === categoria.id ? (
                    <button onClick={handleEditarCategoria}>Salvar</button>
                  ) : (
                    <button
                      onClick={() => setCategoriaEditando(categoria)}
                      className={styles.editButton}
                    >
                      Editar
                    </button>
                  )}
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleExcluirCategoria(categoria.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulário para adicionar subcategoria */}
      <button
        onClick={() => setMostrarFormularioSubcategoria((prev) => !prev)}
        className={styles.novaEspecialidadeButton}
      >
        Adicionar Subcategoria
      </button>

      {mostrarFormularioSubcategoria && (
        <div>
          <h3>Adicionar Nova Subcategoria</h3>
          <input
            type="text"
            value={novaSubcategoria.nome}
            onChange={(e) =>
              setNovaSubcategoria((prev) => ({ ...prev, nome: e.target.value }))
            }
            placeholder="Nome da Subcategoria"
          />
          <select
            value={novaSubcategoria.categoriaId}
            onChange={(e) => {
              setNovaSubcategoria((prev) => ({ ...prev, categoriaId: e.target.value }));
              const categoriaSelecionada = categorias.find(
                (cat) => cat.id === e.target.value
              );
              if (categoriaSelecionada?.nome === 'Exame') {
                setLimiteConvenio('');
              }
            }}
          >
            <option value="">Selecione uma Categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>

          {categorias.find((cat) => cat.id === novaSubcategoria.categoriaId)?.nome ===
            'Exame' && (
              <input
                type="text"
                value={limiteConvenio}
                onChange={(e) => setLimiteConvenio(e.target.value)}
                placeholder="Limite diário do Convênio"
              />
            )}

          <button onClick={handleAdicionarSubcategoria}>Adicionar</button>
        </div>
      )}

      {/* Listagem de Subcategorias */}
      <div className={styles.tabelaWrapper}>
        <h3>Subcategorias</h3>

        {/* Subcategorias do tipo Consulta */}
        <h4>Consulta</h4>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {subcategoriasConsulta.map((sub) => (
              <tr key={sub.id}>
                <td>
                  {subcategoriaEditando?.id === sub.id ? (
                    <input
                      type="text"
                      value={subcategoriaEditando.nome}
                      onChange={(e) =>
                        setSubcategoriaEditando({
                          ...subcategoriaEditando,
                          nome: e.target.value,
                        })
                      }
                    />
                  ) : (
                    sub.nome
                  )}
                </td>
                <td>
                  {subcategoriaEditando?.id === sub.id ? (
                    <button onClick={handleEditarSubcategoria}>Salvar</button>
                  ) : (
                    <button
                      onClick={() => setSubcategoriaEditando(sub)}
                      className={styles.editButton}
                    >
                      Editar
                    </button>
                  )}
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleExcluirSubcategoria(sub.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Subcategorias do tipo Exame */}
        <h4>Exame</h4>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Limite diário do Convênio</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {subcategoriasExame.map((sub) => (
              <tr key={sub.id}>
                <td>
                  {subcategoriaEditando?.id === sub.id ? (
                    <input
                      type="text"
                      value={subcategoriaEditando.nome}
                      onChange={(e) =>
                        setSubcategoriaEditando({
                          ...subcategoriaEditando,
                          nome: e.target.value,
                        })
                      }
                    />
                  ) : (
                    sub.nome
                  )}
                </td>
                <td>
                  {subcategoriaEditando?.id === sub.id ? (
                    <input
                      type="text"
                      value={subcategoriaEditando.limiteConvenio || ''}
                      onChange={(e) =>
                        setSubcategoriaEditando({
                          ...subcategoriaEditando,
                          limiteConvenio: e.target.value,
                        })
                      }
                    />
                  ) : (
                    sub.limiteConvenio || 'N/A'
                  )}
                </td>
                <td>
                  {subcategoriaEditando?.id === sub.id ? (
                    <button onClick={handleEditarSubcategoria}>Salvar</button>
                  ) : (
                    <button
                      onClick={() => setSubcategoriaEditando(sub)}
                      className={styles.editButton}
                    >
                      Editar
                    </button>
                  )}
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleExcluirSubcategoria(sub.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Especialidade;
