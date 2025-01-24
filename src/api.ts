import axios from 'axios';

const api = axios.create({
    baseURL: 'http://polls.apiblueprint.org',
});

api.interceptors.request.use(async (config) => {
    if (!config.headers.Authorization) {
        const response = await axios.post('http://177.159.112.242:9091/versatilis/Token', {
            username: '1cce8244-ee5e-477c-a0fb-64186980ef6d',
            password: 'api@versatilis',
            grant_type: 'password',
        }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const token = response.data.access_token;
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
