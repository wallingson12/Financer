// components/FiltroMes.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function FiltroMes({ meses, mesSelecionado, onMesChange }) {
  return (
    <View style={styles.filtro}>
      <Text style={styles.titulo}>Transações</Text>
      <Text style={styles.label}>📅 Filtrar por mês:</Text>
      <Picker
        selectedValue={mesSelecionado}
        onValueChange={onMesChange}
        style={styles.picker}
      >
        {meses.map(m => (
          <Picker.Item
            key={m}
            label={m === "todos" ? "Todos os meses" : m}
            value={m}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  filtro: {
    marginBottom: 16
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#F8FAFC",
    marginBottom: 12
  },
  label: {
    color: "#94A3B8",
    marginBottom: 6,
    fontWeight: '600'
  },
  picker: {
    backgroundColor: "#1E293B",
    color: "white"
  }
});
