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
            throw new Error(`Erro ao buscar o token: ${response.statusText}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Erro ao obter o token:', error);
        throw error;
    }
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    let token = localStorage.getItem('versatilisToken');

    if (!token) {
        token = await fetchToken();
        localStorage.setItem('versatilisToken', token);
    }

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        token = await fetchToken();
        localStorage.setItem('versatilisToken', token);

        return fetch(url, { ...options, headers: { ...headers, Authorization: `Bearer ${token}` } });
    }

    return response;
};
