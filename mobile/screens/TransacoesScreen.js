// screens/TransacoesScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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

export default function TransacoesScreen({ token }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [mesSelecionado, setMesSelecionado] = useState("todos");
  const [atualizando, setAtualizando] = useState(null);

  const categorias = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Lazer",
    "Salário",
    "Outros"
  ];

  async function carregarTransacoes() {
    try {
      setLoading(true);
      setErro(null);

      // ✅ Usando fetchWithTimeout
      const res = await fetchWithTimeout(`${API}/api/transacoes`, {
        headers: { Authorization: `Bearer ${token}` }
      }, 15000);

      if (!res.ok) {
        throw new Error('Erro ao carregar transações');
      }

      const data = await res.json();
      setRegistros(data || []);
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
        setErro('❌ Erro ao carregar transações');
      }
    }
  }

  useEffect(() => {
    carregarTransacoes();
  }, [token]);

  const meses = useMemo(() => {
    const lista = registros.map(r => r.data.slice(0, 7));
    return ["todos", ...new Set(lista)];
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    if (mesSelecionado === "todos") return registros;
    return registros.filter(r => r.data.startsWith(mesSelecionado));
  }, [registros, mesSelecionado]);

  // ✅ Total de crédito e débito dos registros filtrados
  const totaisFiltrados = useMemo(() => {
    return registrosFiltrados.reduce(
      (acc, item) => ({
        credito: acc.credito + Number(item.credito || 0),
        debito: acc.debito + Number(item.debito || 0)
      }),
      { credito: 0, debito: 0 }
    );
  }, [registrosFiltrados]);

  async function salvarCategoria(id, categoria, aplicarTodas = false) {
    try {
      setAtualizando(id);
      setErro(null);

      // ✅ Usando fetchWithTimeout
      const res = await fetchWithTimeout(`${API}/api/categorizar`, {
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
      }, 15000);

      if (!res.ok) {
        throw new Error('Erro ao categorizar transação');
      }

      setAtualizando(null);

      // ✅ Recarrega lista com timeout
      const resData = await fetchWithTimeout(`${API}/api/transacoes`, {
        headers: { Authorization: `Bearer ${token}` }
      }, 15000);

      const data = await resData.json();
      setRegistros(data);

      if (aplicarTodas) {
        Alert.alert("✅ Sucesso", "Categoria aplicada em todas as transações iguais!");
      }
    } catch (err) {
      setAtualizando(null);
      console.log("ERRO ao categorizar:", err.message);

      if (err.message.includes('Timeout')) {
        Alert.alert("⏱️ Timeout", "A requisição demorou muito. Tente novamente.");
      } else if (err.message.includes('Failed to fetch')) {
        Alert.alert("❌ Erro de Conexão", "Não foi possível conectar na API.");
      } else {
        Alert.alert("❌ Erro", err.message);
      }
    }
  }

  // ✅ Tela de erro
  if (erro && registros.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Transações</Text>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Erro de Conexão</Text>
          <Text style={styles.errorMessage}>{erro}</Text>

          <TouchableOpacity style={styles.botaoRetry} onPress={carregarTransacoes}>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Transações</Text>
        <TouchableOpacity onPress={carregarTransacoes} style={styles.botaoReload}>
          <Ionicons name="refresh" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* ✅ Card de Resumo */}
      {registrosFiltrados.length > 0 && (
        <View style={styles.resumoCard}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Receitas</Text>
            <Text style={styles.resumoCredito}>
              + R$ {totaisFiltrados.credito.toFixed(2)}
            </Text>
          </View>
          <View style={styles.resumoDivisor} />
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Despesas</Text>
            <Text style={styles.resumoDebito}>
              - R$ {totaisFiltrados.debito.toFixed(2)}
            </Text>
          </View>
          <View style={styles.resumoDivisor} />
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Total</Text>
            <Text style={[
              styles.resumoTotal,
              { color: (totaisFiltrados.credito - totaisFiltrados.debito) >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              R$ {(totaisFiltrados.credito - totaisFiltrados.debito).toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* Filtro */}
      <View style={styles.filtro}>
        <Text style={styles.label}>📅 Filtrar por mês:</Text>
        <Picker
          selectedValue={mesSelecionado}
          onValueChange={(value) => setMesSelecionado(value)}
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

      {/* ✅ Estado vazio */}
      {registrosFiltrados.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
          <Text style={styles.emptySubtext}>Importe um extrato para visualizar</Text>
        </View>
      ) : (
        <FlatList
          data={registrosFiltrados}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[
              styles.card,
              atualizando === item.id ? styles.cardAtualizando : null
            ]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.data}>📅 {item.data}</Text>
                  <Text style={styles.tipo}>{item.tipo}</Text>
                  <Text style={styles.detalhe}>{item.detalhe}</Text>
                </View>
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
                selectedValue={item.categoria}
                onValueChange={(value) =>
                  salvarCategoria(item.id, value, false)
                }
                style={styles.pickerCategoria}
                enabled={atualizando !== item.id}
              >
                {categorias.map(cat => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>

              <TouchableOpacity
                style={[
                  styles.btnTodas,
                  atualizando === item.id ? styles.btnTodasDesabilitado : null
                ]}
                onPress={() =>
                  salvarCategoria(item.id, item.categoria, true)
                }
                disabled={atualizando === item.id}
              >
                {atualizando === item.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="copy" size={14} color="#fff" />
                    <Text style={styles.btnTexto}>
                      Aplicar em todas iguais
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  },
  filtro: {
    marginBottom: 16
  },
  label: {
    color: "#94A3B8",
    marginBottom: 6,
    fontWeight: '600'
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
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60
  },
  emptyText: {
    color: "#94A3B8",
    marginTop: 16,
    fontWeight: '600',
    fontSize: 16
  },
  emptySubtext: {
    color: "#64748B",
    marginTop: 8
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
  }
});