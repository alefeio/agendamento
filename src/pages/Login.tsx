// src/pages/Login.tsx
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css'; // Estilo da página

import logo from '../assets/logo.jpeg';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const auth = getAuth();
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/restrito'); // Redireciona para a área restrita
        } catch (error) {
            console.error(error);
            setError('Erro ao realizar login. Verifique suas credenciais.');
        }
    };

    return (
        <div className={styles.pg}>
            <div className={styles.loginWrapper}>
                <img
                    src={logo} alt="Logo Unigrastro"
                    className={styles.logo}
                />
                <h1 className={styles.title}>Login</h1>
                <form onSubmit={handleLogin} className={styles.loginForm}>
                    {error && <p className={styles.error}>{error}</p>}
                    <label>
                        E-mail:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Senha:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
