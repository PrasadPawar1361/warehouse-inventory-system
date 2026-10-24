
const API_URL = 'http://localhost:8080/api/auth';

export async function signup (data) {
    const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fullName: data.fullName,
            email: data.email,
            password: data.password,
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Signup failed');
    }

    return result;
}
