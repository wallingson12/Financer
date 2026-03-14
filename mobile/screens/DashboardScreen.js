// screens/DashboardScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

export default function DashboardScreen({ token }) {
  const [saldos, setSaldos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarDashboard();
  }, [token]);

  async function carregarDashboard() {
    try {
      setLoading(true);
      setErro(null);

      // ✅ Usando fetchWithTimeout
      const res = await fetchWithTimeout(`${API}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      }, 15000);

      if (!res.ok) {
        throw new Error('Erro ao carregar dashboard');
      }

      const data = await res.json();
      console.log("DADOS RECEBIDOS:", data);

      let lista = [];

      if (Array.isArray(data)) {
        lista = data;
      } else if (typeof data === "object" && data !== null) {
        lista = Object.entries(data).map(([mes, valores]) => ({
          mes,
          ...valores
        }));
      }

      setSaldos(lista);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("ERRO DASHBOARD:", error.message);

      // ✅ Tratamento específico de erros
      if (error.message.includes('Timeout')) {
        setErro('⏱️ Tempo limite excedido. Verifique sua conexão.');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        setErro('❌ Não foi possível conectar. Verifique sua conexão de internet.');
      } else {
        setErro('❌ Erro ao carregar dados: ' + error.message);
      }
    }
  }

  // 🔥 Saldo total geral
  const saldoTotal = useMemo(() => {
    return saldos.reduce((acc, item) => acc + Number(item.saldo || 0), 0);
  }, [saldos]);

  // ✅ Tela de erro
  if (erro) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.titulo}>Dashboard</Text>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Erro de Conexão</Text>
          <Text style={styles.errorMessage}>{erro}</Text>

          <TouchableOpacity style={styles.botaoRetry} onPress={carregarDashboard}>
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
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.titulo}>Dashboard</Text>
        <TouchableOpacity onPress={carregarDashboard} style={styles.botaoReload}>
          <Ionicons name="refresh" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* Card Saldo Total */}
      <LinearGradient
        colors={["#6366F1", "#8B5CF6"]}
        style={styles.saldoCard}
      >
        <Text style={styles.saldoLabel}>Saldo Total</Text>
        <Text style={styles.saldoValor}>
          R$ {saldoTotal.toFixed(2)}
        </Text>
      </LinearGradient>

      {saldos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={48} color="#94A3B8" />
          <Text style={styles.vazio}>Nenhum dado encontrado.</Text>
          <Text style={styles.vazioSubtexto}>Importe um extrato para começar</Text>
        </View>
      ) : (
        <FlatList
          data={saldos}
          keyExtractor={(_, i) => String(i)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.mes}>{item.mes || "Mês"}</Text>

              <View style={styles.row}>
                <Text style={styles.label}>Crédito</Text>
                <Text style={styles.credito}>
                  + R$ {Number(item.total_credito || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Débito</Text>
                <Text style={styles.debito}>
                  - R$ {Number(item.total_debito || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Saldo</Text>
                <Text style={[
                  styles.saldo,
                  { color: item.saldo >= 0 ? '#10b981' : '#ef4444' }
                ]}>
                  R$ {Number(item.saldo || 0).toFixed(2)}
                </Text>
              </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#0F172A"
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#F8FAFC"
  },
  botaoReload: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B'
  },
  vazio: {
    textAlign: 'center',
    marginTop: 16,
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600'
  },
  vazioSubtexto: {
    textAlign: 'center',
    marginTop: 8,
    color: '#64748B',
    fontSize: 14
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60
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
  saldoCard: {
    padding: 24,
    borderRadius: 18,
    marginBottom: 24
  },
  saldoLabel: {
    color: "#E0E7FF",
    fontSize: 14
  },
  saldoValor: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 6
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14
  },
  mes: {
    color: "#F8FAFC",
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  label: {
    color: "#94A3B8"
  },
  credito: {
    color: "#22C55E",
    fontWeight: "600"
  },
  debito: {
    color: "#EF4444",
    fontWeight: "600"
  },
  saldo: {
    fontWeight: "bold"
  }
});