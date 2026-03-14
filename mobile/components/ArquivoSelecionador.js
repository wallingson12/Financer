// components/ArquivoSelecionador.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ArquivoSelecionador({ arquivo, onSelecionar, disabled }) {
  return (
    <>
      <Text style={styles.titulo}>📊 Importar Extrato</Text>

      <View style={[
        styles.arquivoCard,
        arquivo ? styles.arquivoSelecionado : null
      ]}>
        <Ionicons
          name={arquivo ? "checkmark-circle" : "document-outline"}
          size={32}
          color={arquivo ? "#4caf50" : "#94A3B8"}
          style={styles.icon}
        />
        <Text style={styles.arquivoTexto}>
          {arquivo ? arquivo.name : 'Nenhum arquivo selecionado'}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.botaoSelecionar,
          disabled ? styles.botaoDesabilitado : null
        ]}
        onPress={onSelecionar}
        disabled={disabled}
      >
        <Ionicons name="folder-open" size={20} color="#fff" />
        <Text style={styles.botaoTexto}>Escolher Arquivo</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333'
  },
  arquivoCard: {
    backgroundColor: '#e0e0e0',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ccc',
    flexDirection: 'row',
    gap: 12
  },
  arquivoSelecionado: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50'
  },
  icon: {
    marginRight: 4
  },
  arquivoTexto: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
    flex: 1
  },
  botaoSelecionar: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  botaoDesabilitado: {
    backgroundColor: '#ccc',
    opacity: 0.6
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});
