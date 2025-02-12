let authToken: string | null = null;

export const fetchToken = async (): Promise<string | null> => {
    try {
        const url = 'http://177.159.112.242:9091/versatilis/Token';

        const response = await fetch(url, {
            method: 'POST', // O Postman está enviando como POST
            headers: {
                'Content-Type': 'text/plain',
                'Accept': 'application/text', // Garantir que o Accept esteja igual ao Postman
            },
            body: 'username=1cce8244-ee5e-477c-a0fb-64186980ef6d&password=api@versatilis&grant_type=password'
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição do token: ${response.status}`);
        }

        const data = await response.json();
        console.log('🔑 Token obtido:', data.access_token);

        authToken = data.access_token;
        return authToken;
    } catch (error) {
        console.error('❌ Erro ao obter token:', error);
        return null;
    }
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    try {
        if (!authToken) {
            console.log('🔄 Obtendo novo token...');
            authToken = await fetchToken();
        }

        if (!authToken) {
            throw new Error('⚠️ Falha ao obter token. Requisição cancelada.');
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
            console.warn('⚠️ Token expirado. Renovando...');
            authToken = await fetchToken();

            if (!authToken) {
                throw new Error('Erro ao renovar token. Requisição cancelada.');
            }

            return fetchWithAuth(url, options);
        }

        console.log('✅ Resposta da requisição:', response);
        return response;
    } catch (error) {
        console.error('❌ Erro ao fazer requisição autenticada:', error);
        throw error;
    }
};
