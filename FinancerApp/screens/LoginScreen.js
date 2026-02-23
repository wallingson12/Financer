// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';

const API = 'http://192.168.1.33:5000';

export default function LoginScreen({ setToken }) {
  const [numero, setNumero] = useState('');
  const [senha, setSenha] = useState('');

  async function login() {
    console.log("BOTÃO CLICADO");

    if (!numero || !senha) {
      Alert.alert("Erro", "Preencha número e senha");
      return;
    }

    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero, senha })
      });

      console.log("Status HTTP:", res.status);

      let data;
      try {
        data = await res.json();
      } catch {
        Alert.alert("Erro", "Resposta inválida do servidor");
        return;
      }

      console.log("Resposta:", data);

      if (!res.ok) {
        Alert.alert("Erro", data.erro || "Erro no login");
        return;
      }

      if (data.token) {
        console.log("TOKEN RECEBIDO");
        setToken(data.token);
      } else {
        Alert.alert("Erro", "Token não recebido");
      }

    } catch (error) {
      console.log("ERRO DE CONEXÃO:", error);
      Alert.alert("Erro", "Não conseguiu conectar na API");
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
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        secureTextEntry
        onChangeText={setSenha}
      />

      <Button title="Entrar" onPress={login} />
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
  }
});