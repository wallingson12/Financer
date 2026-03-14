// components/SaldoCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SaldoCard({ titulo, saldo, onRefresh }) {
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

      <LinearGradient
        colors={["#6366F1", "#8B5CF6"]}
        style={styles.saldoCard}
      >
        <Text style={styles.saldoLabel}>Saldo Total</Text>
        <Text style={styles.saldoValor}>
          R$ {saldo.toFixed(2)}
        </Text>
      </LinearGradient>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: "#F8FAFC"
  },
  botaoReload: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B'
  },
  saldoCard: {
    padding: 24,
    borderRadius: 18,
    marginBottom: 24
  },
  saldoLabel: {
    color: "#E0E7FF",
    fontSize: 14
  },
  saldoValor: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 6
  }
});
