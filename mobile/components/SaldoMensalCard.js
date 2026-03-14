// components/SaldoMensalCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SaldoMensalCard({ saldo }) {
  return (
    <View style={styles.card}>
      <Text style={styles.mes}>{saldo.mes || "Mês"}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Crédito</Text>
        <Text style={styles.credito}>
          + R$ {Number(saldo.total_credito || 0).toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Débito</Text>
        <Text style={styles.debito}>
          - R$ {Number(saldo.total_debito || 0).toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Saldo</Text>
        <Text style={[
          styles.saldo,
          { color: saldo.saldo >= 0 ? '#10b981' : '#ef4444' }
        ]}>
          R$ {Number(saldo.saldo || 0).toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14
  },
  mes: {
    color: "#F8FAFC",
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  label: {
    color: "#94A3B8"
  },
  credito: {
    color: "#22C55E",
    fontWeight: "600"
  },
  debito: {
    color: "#EF4444",
    fontWeight: "600"
  },
  saldo: {
    fontWeight: "bold"
  }
});
