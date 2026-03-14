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
import { Ionicons } from '@expo/vector-icons';

import API from '../services/api';

// ✅ Função com timeout
const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Requisição excedeu 15s')), timeout)
    )
  ]);
};

export default function InvestimentosScreen({ token }) {
  const [papel, setPapel] = useState("");
  const [saldo, setSaldo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [investimentos, setInvestimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adicionando, setAdicionando] = useState(false);
  const [erro, setErro] = useState(null);
  const [deletando, setDeletando] = useState(null);

  async function carregarInvestimentos() {
    try {
      setLoading(true);
      setErro(null);

      // ✅ Usando fetchWithTimeout
      const res = await fetchWithTimeout(`${API}/api/investimentos`, {
        headers: { Authorization: `Bearer ${token}` }
      }, 15000);

      if (!res.ok) {
        throw new Error('Erro ao carregar investimentos');
      }

      const data = await res.json();
      setInvestimentos(data || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log("ERRO ao carregar:", err.message);

      // ✅ Tratamento específico de erros
      if (err.message.includes('Timeout')) {
        setErro('⏱️ Tempo limite excedido. Tente novamente.');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        setErro('❌ Não foi possível conectar. Verifique sua conexão.');
      } else {
        setErro('❌ Erro ao carregar investimentos');
      }
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

    try {
      setAdicionando(true);
      setErro(null);

      // ✅ Usando fetchWithTimeout
      const res = await fetchWithTimeout(`${API}/api/investimentos/salvar`, {
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
      }, 15000);

      if (!res.ok) {
        throw new Error('Erro ao adicionar investimento');
      }

      setPapel("");
      setSaldo("");
      setDescricao("");
      setAdicionando(false);
      Alert.alert("✅ Sucesso", "Investimento adicionado!");
      carregarInvestimentos();
    } catch (err) {
      setAdicionando(false);
      console.log("ERRO ao adicionar:", err.message);

      if (err.message.includes('Timeout')) {
        Alert.alert("⏱️ Timeout", "A requisição demorou muito. Tente novamente.");
      } else if (err.message.includes('Failed to fetch')) {
        Alert.alert("❌ Erro de Conexão", "Não foi possível conectar na API.");
      } else {
        Alert.alert("❌ Erro", err.message);
      }
    }
  }

  async function removerInvestimento(id) {
    try {
      setDeletando(id);
      setErro(null);

      // ✅ Usando fetchWithTimeout
      const res = await fetchWithTimeout(`${API}/api/investimentos/remover/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }, 15000);

      if (!res.ok) {
        throw new Error('Erro ao remover investimento');
      }

      setDeletando(null);
      Alert.alert("✅ Removido", "Investimento removido com sucesso!");
      carregarInvestimentos();
    } catch (err) {
      setDeletando(null);
      console.log("ERRO ao remover:", err.message);

      if (err.message.includes('Timeout')) {
        Alert.alert("⏱️ Timeout", "A requisição demorou muito. Tente novamente.");
      } else {
        Alert.alert("❌ Erro", "Não foi possível remover o investimento.");
      }
    }
  }

  // ✅ Tela de erro
  if (erro && investimentos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Investimentos</Text>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Erro de Conexão</Text>
          <Text style={styles.errorMessage}>{erro}</Text>

          <TouchableOpacity style={styles.botaoRetry} onPress={carregarInvestimentos}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.botaoRetryTexto}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 10, color: "#94A3B8" }}>Carregando...</Text>
      </View>
    );
  }

  // ✅ Saldo total da carteira
  const saldoTotal = investimentos.reduce((acc, item) => acc + Number(item.saldo || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Investimentos</Text>
        <TouchableOpacity onPress={carregarInvestimentos} style={styles.botaoReload}>
          <Ionicons name="refresh" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* Card Saldo Total */}
      {investimentos.length > 0 && (
        <View style={styles.saldoCard}>
          <Text style={styles.saldoLabel}>Carteira Total</Text>
          <Text style={styles.saldoValor}>
            R$ {saldoTotal.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Formulário */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Novo Investimento</Text>

        <TextInput
          style={[styles.input, !adicionando ? null : styles.inputDesabilitado]}
          placeholder="Papel (ex: PETR4)"
          placeholderTextColor="#94A3B8"
          value={papel}
          onChangeText={setPapel}
          editable={!adicionando}
        />

        <TextInput
          style={[styles.input, !adicionando ? null : styles.inputDesabilitado]}
          placeholder="Saldo (R$)"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={saldo}
          onChangeText={setSaldo}
          editable={!adicionando}
        />

        <TextInput
          style={[styles.input, !adicionando ? null : styles.inputDesabilitado]}
          placeholder="Descrição"
          placeholderTextColor="#94A3B8"
          value={descricao}
          onChangeText={setDescricao}
          editable={!adicionando}
        />

        <TouchableOpacity
          style={[styles.botao, adicionando ? styles.botaoDesabilitado : null]}
          onPress={adicionarInvestimento}
          disabled={adicionando}
        >
          {adicionando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>+ Adicionar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💼 Carteira</Text>

        {investimentos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color="#94A3B8" />
            <Text style={styles.vazio}>Nenhum investimento cadastrado.</Text>
            <Text style={styles.vazioSubtexto}>Crie um novo para começar</Text>
          </View>
        ) : (
          <FlatList
            data={investimentos}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            renderItem={({ item }) => (
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
                    deletando === item.id ? styles.removendoAtivo : null
                  ]}
                  onPress={() => removerInvestimento(item.id)}
                  disabled={deletando === item.id}
                >
                  {deletando === item.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#F8FAFC"
  },
  botaoReload: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B'
  },
  saldoCard: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 18
  },
  saldoLabel: {
    color: '#E0E7FF',
    fontSize: 12
  },
  saldoValor: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4
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
  },
  vazio: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 16,
    fontWeight: '600',
    fontSize: 16
  },
  vazioSubtexto: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 8
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8
  },
  errorMessage: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 20
  },
  botaoRetry: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8
  },
  botaoRetryTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
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