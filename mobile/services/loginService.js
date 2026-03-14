// services/loginService.js
import API from './api';

// ✅ Função com timeout
const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Requisição excedeu 15s')), timeout)
    )
  ]);
};

export async function fazerLogin(numero, senha) {
  try {
    const res = await fetchWithTimeout(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero, senha })
    }, 15000);

    console.log("Status HTTP:", res.status);

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Resposta inválida do servidor');
    }

    console.log("Resposta:", data);

    if (!res.ok) {
      throw new Error(data.erro || 'Erro no login');
    }

    return data;
  } catch (error) {
    console.log("ERRO DE CONEXÃO:", error.message);

    // ✅ Tratamento específico de erros
    if (error.message.includes('Timeout')) {
      throw new Error('Timeout: Requisição excedeu 15s');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      throw new Error('Failed to fetch: Verifique sua conexão de internet');
    } else {
      throw error;
    }
  }
}
