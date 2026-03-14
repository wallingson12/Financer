// components/BotaoUpload.js
import React from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BotaoUpload({ loading, arquivoSelecionado, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.botao,
        (!arquivoSelecionado || loading) ? styles.botaoDesabilitado : null
      ]}
      onPress={onPress}
      disabled={!arquivoSelecionado || loading}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fff" size="small" />
          <Text style={styles.botaoTexto}>Enviando...</Text>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Ionicons name="cloud-upload" size={20} color="#fff" />
          <Text style={styles.botaoTexto}>Analisar Extrato</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  botaoDesabilitado: {
    backgroundColor: '#ccc',
    opacity: 0.6
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center'
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});
