// components/ResumoTransacoes.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ResumoTransacoes({ totais }) {
  const saldoTotal = totais.credito - totais.debito;

  return (
    <View style={styles.resumoCard}>
      <View style={styles.resumoItem}>
        <Text style={styles.resumoLabel}>Receitas</Text>
        <Text style={styles.resumoCredito}>
          + R$ {totais.credito.toFixed(2)}
        </Text>
      </View>

      <View style={styles.resumoDivisor} />

      <View style={styles.resumoItem}>
        <Text style={styles.resumoLabel}>Despesas</Text>
        <Text style={styles.resumoDebito}>
          - R$ {totais.debito.toFixed(2)}
        </Text>
      </View>

      <View style={styles.resumoDivisor} />

      <View style={styles.resumoItem}>
        <Text style={styles.resumoLabel}>Total</Text>
        <Text style={[
          styles.resumoTotal,
          { color: saldoTotal >= 0 ? '#10b981' : '#ef4444' }
        ]}>
          R$ {saldoTotal.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resumoCard: {
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center'
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center'
  },
  resumoDivisor: {
    width: 1,
    height: 40,
    backgroundColor: '#334155'
  },
  resumoLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 4
  },
  resumoCredito: {
    color: '#22C55E',
    fontWeight: 'bold',
    fontSize: 13
  },
  resumoDebito: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 13
  },
  resumoTotal: {
    fontWeight: 'bold',
    fontSize: 13
  }
});
