// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';

import API from '../services/api';

// ✅ Função com timeout
const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Requisição excedeu 15s')), timeout)
    )
  ]);
};

export default function LoginScreen({ setToken }) {
  const [numero, setNumero] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false); // ✅ Estado de loading

  async function login() {
    console.log("BOTÃO CLICADO");

    if (!numero || !senha) {
      Alert.alert("Erro", "Preencha número e senha");
      return;
    }

    try {
      setLoading(true); // ✅ Inicia loading

      // ✅ Usando fetchWithTimeout
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
        setLoading(false);
        Alert.alert("Erro", "Resposta inválida do servidor");
        return;
      }

      console.log("Resposta:", data);

      if (!res.ok) {
        setLoading(false); // ✅ Para loading
        Alert.alert("Erro", data.erro || "Erro no login");
        return;
      }

      if (data.token) {
        console.log("TOKEN RECEBIDO");
        setLoading(false); // ✅ Para loading
        setToken(data.token);
      } else {
        setLoading(false);
        Alert.alert("Erro", "Token não recebido");
      }

    } catch (error) {
      setLoading(false); // ✅ Para loading em caso de erro

      console.log("ERRO DE CONEXÃO:", error.message);

      // ✅ Tratamento específico de erros
      if (error.message.includes('Timeout')) {
        Alert.alert(
          "⏱️ Tempo Limite Excedido",
          "A requisição demorou muito. Verifique sua conexão de internet."
        );
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        Alert.alert(
          "❌ Erro de Conexão",
          "Não foi possível conectar na API. Verifique:\n- Se a API está rodando\n- Se o IP/URL está correto\n- Sua conexão de internet"
        );
      } else {
        Alert.alert("Erro", error.message);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>💰 Financer</Text>

      <TextInput
        style={styles.input}
        placeholder="Número da conta"
        value={numero}
        onChangeText={setNumero}
        autoCapitalize="none"
        editable={!loading} // ✅ Desabilita input enquanto loading
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        secureTextEntry
        onChangeText={setSenha}
        editable={!loading} // ✅ Desabilita input enquanto loading
      />

      {/* ✅ Botão com loading */}
      {loading ? (
        <View style={styles.loadingButton}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Autenticando...</Text>
        </View>
      ) : (
        <Button title="Entrar" onPress={login} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  loadingButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10
  },
  loadingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});