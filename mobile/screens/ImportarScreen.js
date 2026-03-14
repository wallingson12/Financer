// screens/ImportarScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import { enviarExtrato } from '../services/importarService';
import ArquivoSelecionador from '../components/ArquivoSelecionador';
import BotaoUpload from '../components/BotaoUpload';
import InfoUpload from '../components/InfoUpload';

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

  async function handleEnviar() {
    if (!arquivo) {
      Alert.alert('Atenção', 'Selecione um arquivo primeiro.');
      return;
    }

    try {
      setLoading(true);
      await enviarExtrato(arquivo, token);
      setLoading(false);
      Alert.alert('✅ Sucesso', 'Extrato importado com sucesso!');
      setArquivo(null);
    } catch (error) {
      setLoading(false);

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
      <ArquivoSelecionador
        arquivo={arquivo}
        onSelecionar={selecionarArquivo}
        disabled={loading}
      />

      <BotaoUpload
        loading={loading}
        arquivoSelecionado={!!arquivo}
        onPress={handleEnviar}
      />

      <InfoUpload />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f6f8'
  }
});
