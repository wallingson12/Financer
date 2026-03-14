// components/CarteiraSaldo.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CarteiraSaldo({ titulo, saldo, label, onRefresh }) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.titulo}>{titulo}</Text>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} style={styles.botaoReload}>
            <Ionicons name="refresh" size={24} color="#6366F1" />
          </TouchableOpacity>
        )}
      </View>

      {saldo > 0 && (
        <View style={styles.saldoCard}>
          <Text style={styles.saldoLabel}>{label}</Text>
          <Text style={styles.saldoValor}>
            R$ {saldo.toFixed(2)}
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#F8FAFC"
  },
  botaoReload: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B'
  },
  saldoCard: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 18
  },
  saldoLabel: {
    color: '#E0E7FF',
    fontSize: 12
  },
  saldoValor: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4
  }
});
