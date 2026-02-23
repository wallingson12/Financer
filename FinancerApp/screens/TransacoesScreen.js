// screens/TransacoesScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const API = 'http://192.168.1.33:5000';

export default function TransacoesScreen({ token }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState("todos");

  const categorias = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Lazer",
    "Salário",
    "Outros"
  ];

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`${API}/api/transacoes`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        setRegistros(data);
      } catch (err) {
        console.log("Erro:", err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [token]);

  const meses = useMemo(() => {
    const lista = registros.map(r => r.data.slice(0, 7));
    return ["todos", ...new Set(lista)];
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    if (mesSelecionado === "todos") return registros;
    return registros.filter(r => r.data.startsWith(mesSelecionado));
  }, [registros, mesSelecionado]);

  async function salvarCategoria(id, categoria, aplicarTodas = false) {
    await fetch(`${API}/api/categorizar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        transacao_id: id,
        categoria,
        aplicar_todas: aplicarTodas
      })
    });

    // recarrega lista
    const res = await fetch(`${API}/api/transacoes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRegistros(data);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Transações</Text>

      {/* Filtro */}
      <View style={styles.filtro}>
        <Text style={styles.label}>Filtrar por mês:</Text>
        <Picker
          selectedValue={mesSelecionado}
          onValueChange={(value) => setMesSelecionado(value)}
          style={styles.picker}
        >
          {meses.map(m => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={registrosFiltrados}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.data}>{item.data}</Text>
            <Text style={styles.tipo}>{item.tipo}</Text>
            <Text style={styles.detalhe}>{item.detalhe}</Text>

            <View style={styles.valores}>
              {item.credito > 0 && (
                <Text style={styles.credito}>
                  + R$ {Number(item.credito).toFixed(2)}
                </Text>
              )}
              {item.debito > 0 && (
                <Text style={styles.debito}>
                  - R$ {Number(item.debito).toFixed(2)}
                </Text>
              )}
            </View>

            <Picker
              selectedValue={item.categoria}
              onValueChange={(value) =>
                salvarCategoria(item.id, value, false)
              }
              style={styles.pickerCategoria}
            >
              {categorias.map(cat => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>

            <TouchableOpacity
              style={styles.btnTodas}
              onPress={() =>
                salvarCategoria(item.id, item.categoria, true)
              }
            >
              <Text style={styles.btnTexto}>
                Aplicar em todas iguais
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A"
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#F8FAFC",
    marginBottom: 20
  },
  filtro: {
    marginBottom: 20
  },
  label: {
    color: "#94A3B8",
    marginBottom: 5
  },
  picker: {
    backgroundColor: "#1E293B",
    color: "white"
  },
  card: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 14,
    marginBottom: 14
  },
  data: {
    color: "#94A3B8",
    fontSize: 12
  },
  tipo: {
    color: "#F8FAFC",
    fontWeight: "bold",
    marginTop: 5
  },
  detalhe: {
    color: "#CBD5E1",
    marginBottom: 6
  },
  valores: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  credito: {
    color: "#22C55E",
    fontWeight: "bold"
  },
  debito: {
    color: "#EF4444",
    fontWeight: "bold"
  },
  pickerCategoria: {
    backgroundColor: "#334155",
    color: "white",
    marginTop: 10
  },
  btnTodas: {
    marginTop: 8,
    backgroundColor: "#6366F1",
    padding: 8,
    borderRadius: 8,
    alignItems: "center"
  },
  btnTexto: {
    color: "white",
    fontSize: 12
  }
});