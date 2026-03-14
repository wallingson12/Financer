// components/InfoUpload.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InfoUpload() {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoItem}>
        <Text style={styles.infoIcon}>📄</Text>
        <Text style={styles.infoTexto}>Formatos aceitos: .xlsx (Excel)</Text>
      </View>
      
      <View style={styles.infoItem}>
        <Text style={styles.infoIcon}>⏱️</Text>
        <Text style={styles.infoTexto}>Timeout: 30 segundos</Text>
      </View>
      
      <View style={styles.infoItem}>
        <Text style={styles.infoIcon}>💾</Text>
        <Text style={styles.infoTexto}>Tamanho máximo: 10MB</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    marginTop: 24,
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800'
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10
  },
  infoIcon: {
    fontSize: 18
  },
  infoTexto: {
    fontSize: 13,
    color: '#666',
    flex: 1
  }
});
