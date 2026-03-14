// services/transacoesService.js
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

export async function carregarTransacoes(token) {
  try {
    const res = await fetchWithTimeout(`${API}/api/transacoes`, {
      headers: { Authorization: `Bearer ${token}` }
    }, 15000);

    if (!res.ok) {
      throw new Error('Erro ao carregar transações');
    }

    const data = await res.json();
    return data || [];
  } catch (error) {
    console.log("ERRO ao carregar transações:", error.message);

    if (error.message.includes('Timeout')) {
      throw new Error('⏱️ Tempo limite excedido. Tente novamente.');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      throw new Error('❌ Não foi possível conectar. Verifique sua conexão.');
    } else {
      throw new Error('❌ Erro ao carregar transações');
    }
  }
}

export async function categorizarTransacao(token, dados) {
  try {
    const res = await fetchWithTimeout(`${API}/api/categorizar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(dados)
    }, 15000);

    if (!res.ok) {
      throw new Error('Erro ao categorizar transação');
    }

    return await res.json();
  } catch (error) {
    console.log("ERRO ao categorizar:", error.message);

    if (error.message.includes('Timeout')) {
      throw new Error('Timeout: Requisição excedeu 15s');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Failed to fetch: Verifique sua conexão de internet');
    } else {
      throw error;
    }
  }
}
