// components/InvestimentoCard.js
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InvestimentoCard({ item, deletando, onRemover }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.descricao}>
          {item.papel || "Investimento"}
        </Text>
        <Text style={styles.itemDescricao}>
          {item.descricao || "Sem descrição"}
        </Text>
        <Text style={styles.saldo}>
          R$ {Number(item.saldo).toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.remover,
          deletando ? styles.removendoAtivo : null
        ]}
        onPress={onRemover}
        disabled={deletando}
      >
        {deletando ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons name="trash-outline" size={18} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155"
  },
  itemInfo: {
    flex: 1
  },
  descricao: {
    color: "#F8FAFC",
    fontWeight: "600",
    fontSize: 16
  },
  itemDescricao: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2
  },
  saldo: {
    color: "#22C55E",
    marginTop: 4,
    fontWeight: '600'
  },
  remover: {
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44
  },
  removendoAtivo: {
    opacity: 0.6
  }
});
