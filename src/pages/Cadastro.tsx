// src/pages/Cadastro.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../../firebaseConfig'
import styles from './Cadastro.module.css';

import logo from '../assets/logo.jpeg';

const Cadastro: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCadastro = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Usuário cadastrado:', userCredential.user);
            navigate('/restrito'); // Redireciona para a área restrita após cadastro e login automático
        } catch (err) {
            console.error('Erro ao cadastrar:', err);
            setError('Erro ao criar conta. Verifique os dados e tente novamente.');
        }
    };

    return (
        <div className={styles.pg}>
            <div className={styles.cadastroWrapper}>
                <img
                    src={logo} alt="Logo Unigrastro"
                    className={styles.logo}
                />
                <h1 className={styles.title}>Cadastro</h1>
                <form className={styles.cadastroForm} onSubmit={handleCadastro}>
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="password">Senha:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.cadastroButton}>
                        Cadastrar
                    </button>
                </form>

                <p className={styles.loginRedirect}>
                    Já possui uma conta? <Link to="/login">Clique aqui para fazer login</Link>
                </p>
            </div>
        </div>
    );
};

export default Cadastro;
