import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import API from '../services/api';

// ✅ Função com timeout
const fetchWithTimeout = (url, options = {}, timeout = 30000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Upload excedeu 30s')), timeout)
    )
  ]);
};

export default function ImportarScreen({ token }) {
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);

  async function selecionarArquivo() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      if (result.canceled) return;

      setArquivo(result.assets[0]);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  }

  async function enviarArquivo() {
    if (!arquivo) {
      Alert.alert('Atenção', 'Selecione um arquivo primeiro.');
      return;
    }

    try {
      setLoading(true);

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

      if (response.ok) {
        setLoading(false);
        Alert.alert('✅ Sucesso', 'Extrato importado com sucesso!');
        setArquivo(null);
      } else {
        setLoading(false);
        const data = await response.json().catch(() => ({}));
        Alert.alert('❌ Erro', data.erro || 'Falha ao enviar o arquivo.');
      }

    } catch (error) {
      setLoading(false);
      console.log("ERRO:", error.message);

      // ✅ Tratamento específico de erros
      if (error.message.includes('Timeout')) {
        Alert.alert(
          "⏱️ Tempo Limite Excedido",
          "O upload demorou muito. O arquivo pode ser muito grande ou sua conexão é lenta.\n\nTente com um arquivo menor."
        );
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        Alert.alert(
          "❌ Erro de Conexão",
          "Não foi possível conectar na API. Verifique:\n- Se a API está rodando\n- Se o IP/URL está correto\n- Sua conexão de internet"
        );
      } else {
        Alert.alert('❌ Erro', error.message || 'Erro ao enviar arquivo.');
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📊 Importar Extrato</Text>

      {/* ✅ Card com arquivo selecionado */}
      <View style={[
        styles.botaoSecundario,
        arquivo ? styles.arquivoSelecionado : null
      ]}>
        <Text style={styles.botaoTexto}>
          {arquivo ? `✅ ${arquivo.name}` : '📁 Selecionar arquivo .xlsx'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.botaoSelecionar}
        onPress={selecionarArquivo}
        disabled={loading}
      >
        <Text style={styles.botaoSelecionarTexto}>Escolher Arquivo</Text>
      </TouchableOpacity>

      {/* ✅ Botão com loading */}
      <TouchableOpacity
        style={[
          styles.botao,
          !arquivo || loading ? styles.botaoDesabilitado : null
        ]}
        onPress={enviarArquivo}
        disabled={!arquivo || loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.botaoTextoUpload}>Enviando...</Text>
          </View>
        ) : (
          <Text style={styles.botaoTextoUpload}>📤 Analisar</Text>
        )}
      </TouchableOpacity>

      {/* ✅ Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTexto}>
          ℹ️ Formatos aceitos: .xlsx (Excel)
        </Text>
        <Text style={styles.infoTexto}>
          ⏱️ Timeout: 30 segundos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f6f8'
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333'
  },
  botaoSecundario: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ccc'
  },
  arquivoSelecionado: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50'
  },
  botaoTexto: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14
  },
  botaoSelecionar: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12
  },
  botaoSelecionarTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  botao: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  botaoDesabilitado: {
    backgroundColor: '#ccc',
    opacity: 0.6
  },
  botaoTextoUpload: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  infoBox: {
    marginTop: 24,
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800'
  },
  infoTexto: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4
  }
});