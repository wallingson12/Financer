// components/EstadoVazio.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EstadoVazio({ titulo, subtitulo, icon = "document-outline" }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={48} color="#94A3B8" />
      <Text style={styles.vazio}>{titulo}</Text>
      {subtitulo && <Text style={styles.vazioSubtexto}>{subtitulo}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    marginTop: 60
  },
  vazio: {
    textAlign: 'center',
    marginTop: 16,
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600'
  },
  vazioSubtexto: {
    textAlign: 'center',
    marginTop: 8,
    color: '#64748B',
    fontSize: 14
  }
});
