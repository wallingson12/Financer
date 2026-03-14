// components/FormularioInvestimento.js
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

export default function FormularioInvestimento({
  papel,
  saldo,
  descricao,
  onPapelChange,
  onSaldoChange,
  onDescricaoChange,
  onAdicionar,
  loading
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📊 Novo Investimento</Text>

      <TextInput
        style={[styles.input, loading ? styles.inputDesabilitado : null]}
        placeholder="Papel (ex: PETR4)"
        placeholderTextColor="#94A3B8"
        value={papel}
        onChangeText={onPapelChange}
        editable={!loading}
      />

      <TextInput
        style={[styles.input, loading ? styles.inputDesabilitado : null]}
        placeholder="Saldo (R$)"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={saldo}
        onChangeText={onSaldoChange}
        editable={!loading}
      />

      <TextInput
        style={[styles.input, loading ? styles.inputDesabilitado : null]}
        placeholder="Descrição"
        placeholderTextColor="#94A3B8"
        value={descricao}
        onChangeText={onDescricaoChange}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.botao, loading ? styles.botaoDesabilitado : null]}
        onPress={onAdicionar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoTexto}>+ Adicionar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 16,
    marginBottom: 18
  },
  cardTitle: {
    color: "#F8FAFC",
    fontWeight: "bold",
    marginBottom: 12,
    fontSize: 16
  },
  input: {
    backgroundColor: "#334155",
    color: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12
  },
  inputDesabilitado: {
    opacity: 0.6
  },
  botao: {
    backgroundColor: "#6366F1",
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  botaoDesabilitado: {
    backgroundColor: "#94A3B8",
    opacity: 0.6
  },
  botaoTexto: {
    color: "white",
    fontWeight: "bold"
  }
});
