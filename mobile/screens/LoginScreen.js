// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';

import { fazerLogin } from '../services/loginService';
import FormularioLogin from '../components/FormularioLogin';
import BotaoLogin from '../components/BotaoLogin';

export default function LoginScreen({ setToken }) {
  const [numero, setNumero] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!numero || !senha) {
      Alert.alert("Erro", "Preencha número e senha");
      return;
    }

    try {
      setLoading(true);
      const response = await fazerLogin(numero, senha);
      setLoading(false);
      
      if (response.token) {
        setToken(response.token);
      } else {
        Alert.alert("Erro", "Token não recebido");
      }
    } catch (error) {
      setLoading(false);

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
        Alert.alert("❌ Erro", error.message);
      }
    }
  }

  return (
    <View style={styles.container}>
      <FormularioLogin
        numero={numero}
        senha={senha}
        onNumeroChange={setNumero}
        onSenhaChange={setSenha}
        disabled={loading}
      />

      <BotaoLogin
        loading={loading}
        onPress={handleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24,
    backgroundColor: '#f5f5f5'
  }
});
