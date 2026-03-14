// components/BotaoLogin.js
import React from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BotaoLogin({ loading, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.botao, loading ? styles.botaoLoading : null]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.botaoTexto}>Autenticando...</Text>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Ionicons name="log-in" size={20} color="#fff" />
          <Text style={styles.botaoTexto}>Entrar</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  botaoLoading: {
    opacity: 0.8
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  botaoTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});
