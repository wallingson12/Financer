// services/importarService.js
import API from './api';

// ✅ Função com timeout
const fetchWithTimeout = (url, options = {}, timeout = 30000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Upload excedeu 30s')), timeout)
    )
  ]);
};

export async function enviarExtrato(arquivo, token) {
  try {
    const formData = new FormData();
    formData.append('extrato', {
      uri: arquivo.uri,
      name: arquivo.name,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // ✅ Usando fetchWithTimeout (30s para upload de arquivo)
    const response = await fetchWithTimeout(`${API}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    }, 30000);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.erro || 'Falha ao enviar o arquivo.');
    }

    return await response.json();
  } catch (error) {
    console.log("ERRO ao enviar extrato:", error.message);

    // ✅ Tratamento específico de erros
    if (error.message.includes('Timeout')) {
      throw new Error('Timeout: Upload excedeu 30s');
    } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      throw new Error('Failed to fetch: Verifique sua conexão de internet');
    } else {
      throw error;
    }
  }
}
