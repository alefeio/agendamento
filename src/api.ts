let authToken: string | null = null;

const fetchToken = async (): Promise<string> => {
    const username = encodeURIComponent('1cce8244-ee5e-477c-a0fb-64186980ef6d');
    const password = encodeURIComponent('api@versatilis');
    const grantType = encodeURIComponent('password');

    const url = `http://177.159.112.242:9091/versatilis/Token?username=${username}&password=${password}&grant_type=${grantType}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/plain',
            },
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Resposta inesperada:', text);
            throw new Error('A resposta do servidor não é um JSON válido.');
        }

        const data: { access_token: string } = await response.json();
        authToken = data.access_token;
        return authToken;
    } catch (error) {
        console.error('Erro ao obter o token:', error);
        throw error;
    }
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    try {
        if (!authToken) {
            await fetchToken();
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            console.warn('Token expirado. Renovando...');
            authToken = await fetchToken();

            // Refazer a requisição com o novo token
            return fetchWithAuth(url, options);
        }

        console.log('response', response)

        return response;
    } catch (error) {
        console.error('Erro ao fazer requisição autenticada:', error);
        throw error;
    }
};
