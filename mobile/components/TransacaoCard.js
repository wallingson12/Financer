// components/TransacaoCard.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const categorias = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Salário",
  "Outros"
];

export default function TransacaoCard({ item, atualizando, onCategorizar }) {
  const [categoria, setCategoria] = useState(item.categoria);

  return (
    <View style={[
      styles.card,
      atualizando ? styles.cardAtualizando : null
    ]}>
      <View style={styles.cardHeader}>
        <Text style={styles.data}>📅 {item.data}</Text>
        <Text style={styles.tipo}>{item.tipo}</Text>
        <Text style={styles.detalhe}>{item.detalhe}</Text>
      </View>

      <View style={styles.valores}>
        {item.credito > 0 && (
          <Text style={styles.credito}>
            ↑ + R$ {Number(item.credito).toFixed(2)}
          </Text>
        )}
        {item.debito > 0 && (
          <Text style={styles.debito}>
            ↓ - R$ {Number(item.debito).toFixed(2)}
          </Text>
        )}
      </View>

      <Text style={styles.categoriaLabel}>Categoria:</Text>
      <Picker
        selectedValue={categoria}
        onValueChange={(value) => {
          setCategoria(value);
          onCategorizar(item.id, value, false);
        }}
        style={styles.pickerCategoria}
        enabled={!atualizando}
      >
        {categorias.map(cat => (
          <Picker.Item key={cat} label={cat} value={cat} />
        ))}
      </Picker>

      <TouchableOpacity
        style={[
          styles.btnTodas,
          atualizando ? styles.btnTodasDesabilitado : null
        ]}
        onPress={() => onCategorizar(item.id, categoria, true)}
        disabled={atualizando}
      >
        {atualizando ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="copy" size={14} color="#fff" />
            <Text style={styles.btnTexto}>Aplicar em todas iguais</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 14,
    marginBottom: 14
  },
  cardAtualizando: {
    opacity: 0.6
  },
  cardHeader: {
    marginBottom: 10
  },
  data: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 4
  },
  tipo: {
    color: "#F8FAFC",
    fontWeight: "bold",
    marginTop: 3,
    marginBottom: 2
  },
  detalhe: {
    color: "#CBD5E1",
    fontSize: 13
  },
  valores: {
    flexDirection: "row",
    gap: 16,
    marginVertical: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#334155',
    borderBottomColor: '#334155'
  },
  credito: {
    color: "#22C55E",
    fontWeight: "bold",
    fontSize: 13
  },
  debito: {
    color: "#EF4444",
    fontWeight: "bold",
    fontSize: 13
  },
  categoriaLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 6,
    marginTop: 10,
    fontWeight: '600'
  },
  pickerCategoria: {
    backgroundColor: "#334155",
    color: "white",
    marginBottom: 8
  },
  btnTodas: {
    marginTop: 8,
    backgroundColor: "#6366F1",
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    gap: 6
  },
  btnTodasDesabilitado: {
    backgroundColor: '#94A3B8',
    opacity: 0.6
  },
  btnTexto: {
    color: "white",
    fontSize: 12,
    fontWeight: '600'
  }
});
