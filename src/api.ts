let authToken: string | null = null;

const fetchToken = async () => {
    try {
        const response = await fetch('http://177.159.112.242:9091/versatilis/Token', {
            method: 'GET',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'username=1cce8244-ee5e-477c-a0fb-64186980ef6d&password=api@versatilis&grant_type=password'
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const data = await response.json();
        console.log('Token obtido:', data.access_token);
        return data.access_token;
    } catch (error) {
        console.error('Erro ao obter token:', error);
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
