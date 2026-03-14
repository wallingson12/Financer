// components/FormularioLogin.js
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function FormularioLogin({
  numero,
  senha,
  onNumeroChange,
  onSenhaChange,
  disabled
}) {
  return (
    <>
      <Text style={styles.titulo}>💰 Financer</Text>

      <View style={styles.formulario}>
        <TextInput
          style={[styles.input, disabled ? styles.inputDesabilitado : null]}
          placeholder="Número da conta"
          value={numero}
          onChangeText={onNumeroChange}
          autoCapitalize="none"
          editable={!disabled}
          placeholderTextColor="#999"
        />

        <TextInput
          style={[styles.input, disabled ? styles.inputDesabilitado : null]}
          placeholder="Senha"
          value={senha}
          secureTextEntry
          onChangeText={onSenhaChange}
          editable={!disabled}
          placeholderTextColor="#999"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#6366F1'
  },
  formulario: {
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  inputDesabilitado: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5'
  }
});
