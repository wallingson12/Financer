// services/dashboardService.js
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

export async function carregarDashboard(token) {
  try {
    const res = await fetchWithTimeout(`${API}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    }, 15000);

    if (!res.ok) {
      throw new Error('Erro ao carregar dashboard');
    }

    const data = await res.json();
    console.log("DADOS RECEBIDOS:", data);

    let lista = [];

    if (Array.isArray(data)) {
      lista = data;
    } else if (typeof data === "object" && data !== null) {
      lista = Object.entries(data).map(([mes, valores]) => ({
        mes,
        ...valores
      }));
    }

    return lista;
  } catch (error) {
    console.log("ERRO DASHBOARD:", error.message);

    // ✅ Tratamento específico de erros
    if (error.message.includes('Timeout')) {
      throw new Error('⏱️ Tempo limite excedido. Verifique sua conexão.');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      throw new Error('❌ Não foi possível conectar. Verifique sua conexão de internet.');
    } else {
      throw new Error('❌ Erro ao carregar dados: ' + error.message);
    }
  }
}
