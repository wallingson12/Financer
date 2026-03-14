// screens/TransacoesScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { carregarTransacoes, categorizarTransacao } from '../services/transacoesService';
import ResumoTransacoes from '../components/ResumoTransacoes';
import FiltroMes from '../components/FiltroMes';
import TransacaoCard from '../components/TransacaoCard';
import ErroConexao from '../components/ErroConexao';
import EstadoVazio from '../components/EstadoVazio';

export default function TransacoesScreen({ token }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [mesSelecionado, setMesSelecionado] = useState("todos");
  const [atualizando, setAtualizando] = useState(null);

  useEffect(() => {
    fetchTransacoes();
  }, [token]);

  async function fetchTransacoes() {
    try {
      setLoading(true);
      setErro(null);
      const data = await carregarTransacoes(token);
      setRegistros(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErro(error.message);
    }
  }

  const meses = useMemo(() => {
    const lista = registros.map(r => r.data.slice(0, 7));
    return ["todos", ...new Set(lista)];
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    if (mesSelecionado === "todos") return registros;
    return registros.filter(r => r.data.startsWith(mesSelecionado));
  }, [registros, mesSelecionado]);

  const totaisFiltrados = useMemo(() => {
    return registrosFiltrados.reduce(
      (acc, item) => ({
        credito: acc.credito + Number(item.credito || 0),
        debito: acc.debito + Number(item.debito || 0)
      }),
      { credito: 0, debito: 0 }
    );
  }, [registrosFiltrados]);

  async function handleCategorizar(id, categoria, aplicarTodas = false) {
    try {
      setAtualizando(id);
      setErro(null);
      
      await categorizarTransacao(token, {
        transacao_id: id,
        categoria,
        aplicar_todas: aplicarTodas
      });

      setAtualizando(null);
      await fetchTransacoes();

      if (aplicarTodas) {
        Alert.alert("✅ Sucesso", "Categoria aplicada em todas as transações iguais!");
      }
    } catch (err) {
      setAtualizando(null);

      if (err.message.includes('Timeout')) {
        Alert.alert("⏱️ Timeout", "A requisição demorou muito. Tente novamente.");
      } else if (err.message.includes('Failed to fetch')) {
        Alert.alert("❌ Erro de Conexão", "Não foi possível conectar na API.");
      } else {
        Alert.alert("❌ Erro", err.message);
      }
    }
  }

  if (erro && registros.length === 0) {
    return <ErroConexao erro={erro} onRetry={fetchTransacoes} titulo="Transações" />;
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
      <View style={styles.header}>
        <View>
          <FiltroMes
            meses={meses}
            mesSelecionado={mesSelecionado}
            onMesChange={setMesSelecionado}
          />
        </View>
        <TouchableOpacity onPress={fetchTransacoes} style={styles.botaoReload}>
          <Ionicons name="refresh" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {registrosFiltrados.length > 0 && (
        <ResumoTransacoes totais={totaisFiltrados} />
      )}

      {registrosFiltrados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma transação encontrada."
          subtitulo="Importe um extrato para visualizar"
          icon="document-outline"
        />
      ) : (
        <FlatList
          data={registrosFiltrados}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TransacaoCard
              item={item}
              atualizando={atualizando === item.id}
              onCategorizar={handleCategorizar}
            />
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
    alignItems: 'flex-start',
    marginBottom: 16
  },
  botaoReload: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    marginTop: 20
  }
});
