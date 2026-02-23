// screens/InvestimentosScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";

const API = "http://192.168.1.33:5000";

export default function InvestimentosScreen({ token }) {
  const [papel, setPapel] = useState("");
  const [saldo, setSaldo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [investimentos, setInvestimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function carregarInvestimentos() {
    try {
      const res = await fetch(`${API}/api/investimentos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setInvestimentos(data);
    } catch (err) {
      console.log("Erro:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarInvestimentos();
  }, []);

  async function adicionarInvestimento() {
    if (!papel || !saldo) {
      Alert.alert("Erro", "Preencha os campos obrigatórios.");
      return;
    }

    await fetch(`${API}/api/investimentos/salvar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        papel,
        saldo: parseFloat(saldo),
        descricao
      })
    });

    setPapel("");
    setSaldo("");
    setDescricao("");
    carregarInvestimentos();
  }

  async function removerInvestimento(id) {
    await fetch(`${API}/api/investimentos/remover/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    carregarInvestimentos();
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
      <Text style={styles.titulo}>Investimentos</Text>

      {/* Formulário */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Novo Investimento</Text>

        <TextInput
          style={styles.input}
          placeholder="Papel (ex: PETR4)"
          placeholderTextColor="#94A3B8"
          value={papel}
          onChangeText={setPapel}
        />

        <TextInput
          style={styles.input}
          placeholder="Saldo (R$)"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={saldo}
          onChangeText={setSaldo}
        />

        <TextInput
          style={styles.input}
          placeholder="Descrição"
          placeholderTextColor="#94A3B8"
          value={descricao}
          onChangeText={setDescricao}
        />

        <TouchableOpacity
          style={styles.botao}
          onPress={adicionarInvestimento}
        >
          <Text style={styles.botaoTexto}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Carteira</Text>

        {investimentos.length === 0 ? (
          <Text style={styles.vazio}>
            Nenhum investimento cadastrado.
          </Text>
        ) : (
          <FlatList
            data={investimentos}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View>
                  <Text style={styles.descricao}>
                    {item.descricao || item.papel}
                  </Text>
                  <Text style={styles.saldo}>
                    R$ {Number(item.saldo).toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.remover}
                  onPress={() =>
                    removerInvestimento(item.id)
                  }
                >
                  <Text style={styles.removerTexto}>
                    Remover
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
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
  card: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 16,
    marginBottom: 18
  },
  cardTitle: {
    color: "#F8FAFC",
    fontWeight: "bold",
    marginBottom: 12
  },
  input: {
    backgroundColor: "#334155",
    color: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12
  },
  botao: {
    backgroundColor: "#6366F1",
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  botaoTexto: {
    color: "white",
    fontWeight: "bold"
  },
  vazio: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 10
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#334155"
  },
  descricao: {
    color: "#F8FAFC",
    fontWeight: "600"
  },
  saldo: {
    color: "#22C55E",
    marginTop: 4
  },
  remover: {
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 8
  },
  removerTexto: {
    color: "white",
    fontSize: 12
  }
});