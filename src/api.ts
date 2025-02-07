import axios from 'axios';

const api = axios.create({
    baseURL: 'http://polls.apiblueprint.org',
});

api.interceptors.request.use(async (config) => {
    if (!config.headers.Authorization) {
        try {
            const response = await axios.get('/api/versatilisToken', {
                headers: { 'Content-Type': 'text/plain' },
                params: {
                    username: '1cce8244-ee5e-477c-a0fb-64186980ef6d',
                    password: 'api@versatilis',
                    grant_type: 'password',
                },
            });

            const token = response.data.access_token;
            config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
            console.error('Erro ao obter token:', error);
        }
    }
    return config;
});

export default api;
