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

const API = 'http://192.168.1.33:5000';

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

      const response = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Extrato importado com sucesso!');
        setArquivo(null);
      } else {
        Alert.alert('Erro', 'Falha ao enviar o arquivo.');
      }

    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Erro ao enviar arquivo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Importar Extrato</Text>

      <TouchableOpacity style={styles.botaoSecundario} onPress={selecionarArquivo}>
        <Text style={styles.botaoTexto}>
          {arquivo ? arquivo.name : 'Selecionar arquivo .xlsx'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botao} onPress={enviarArquivo}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoTexto}>Analisar</Text>
        )}
      </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20
  },
  botao: {
    backgroundColor: '#1976D2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12
  },
  botaoSecundario: {
    backgroundColor: '#e0e0e0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  botaoTexto: {
    color: '#000',
    fontWeight: '600'
  }
});