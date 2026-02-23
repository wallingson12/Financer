// screens/DashboardScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const API = 'http://192.168.1.33:5000';

export default function DashboardScreen({ token }) {
  const [saldos, setSaldos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const res = await fetch(`${API}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

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
      } catch (error) {
        console.log("ERRO DASHBOARD:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, [token]);

  // 🔥 Saldo total geral
  const saldoTotal = useMemo(() => {
    return saldos.reduce((acc, item) => acc + Number(item.saldo || 0), 0);
  }, [saldos]);

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

      <Text style={styles.titulo}>Dashboard</Text>

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
        <Text style={styles.vazio}>Nenhum dado encontrado.</Text>
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
                <Text style={styles.saldo}>
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
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#F8FAFC",
    marginBottom: 20
  },
  vazio: {
    textAlign: 'center',
    marginTop: 40,
    color: '#94A3B8'
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
    color: "#38BDF8",
    fontWeight: "bold"
  }
});