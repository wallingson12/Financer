// screens/DashboardScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar
} from 'react-native';

import { carregarDashboard } from '../services/dashboardService';
import SaldoCard from '../components/SaldoCard';
import SaldoMensalCard from '../components/SaldoMensalCard';
import ErroConexao from '../components/ErroConexao';
import EstadoVazio from '../components/EstadoVazio';

export default function DashboardScreen({ token }) {
  const [saldos, setSaldos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setErro(null);
      
      const data = await carregarDashboard(token);
      setSaldos(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErro(error.message);
    }
  }

  const saldoTotal = useMemo(() => {
    return saldos.reduce((acc, item) => acc + Number(item.saldo || 0), 0);
  }, [saldos]);

  if (erro && saldos.length === 0) {
    return <ErroConexao erro={erro} onRetry={fetchDashboard} />;
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
      <StatusBar barStyle="light-content" />
      
      <SaldoCard 
        titulo="Dashboard" 
        saldo={saldoTotal} 
        onRefresh={fetchDashboard} 
      />

      {saldos.length === 0 ? (
        <EstadoVazio 
          titulo="Nenhum dado encontrado."
          subtitulo="Importe um extrato para começar"
          icon="document-outline"
        />
      ) : (
        <FlatList
          data={saldos}
          keyExtractor={(_, i) => String(i)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <SaldoMensalCard saldo={item} />}
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
  }
});
