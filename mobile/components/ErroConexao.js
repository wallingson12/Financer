// components/ErroConexao.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ErroConexao({ erro, onRetry, titulo = "Dashboard" }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.titulo}>{titulo}</Text>

      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Erro de Conexão</Text>
        <Text style={styles.errorMessage}>{erro}</Text>

        {onRetry && (
          <TouchableOpacity style={styles.botaoRetry} onPress={onRetry}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.botaoRetryTexto}>Tentar Novamente</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#F8FAFC",
    marginBottom: 20
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8
  },
  errorMessage: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 20
  },
  botaoRetry: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8
  },
  botaoRetryTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});
