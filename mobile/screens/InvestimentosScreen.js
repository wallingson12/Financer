// screens/InvestimentosScreen.js
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";

import { carregarInvestimentos, adicionarInvestimento, removerInvestimento } from '../services/investimentosService';
import CarteiraSaldo from '../components/CarteiraSaldo';
import FormularioInvestimento from '../components/FormularioInvestimento';
import InvestimentoCard from '../components/InvestimentoCard';
import ErroConexao from '../components/ErroConexao';
import EstadoVazio from '../components/EstadoVazio';

export default function InvestimentosScreen({ token }) {
  const [papel, setPapel] = useState("");
  const [saldo, setSaldo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [investimentos, setInvestimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adicionando, setAdicionando] = useState(false);
  const [erro, setErro] = useState(null);
  const [deletando, setDeletando] = useState(null);

  useEffect(() => {
    fetchInvestimentos();
  }, []);

  async function fetchInvestimentos() {
    try {
      setLoading(true);
      setErro(null);
      const data = await carregarInvestimentos(token);
      setInvestimentos(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErro(error.message);
    }
  }

  async function handleAdicionarInvestimento() {
    if (!papel || !saldo) {
      Alert.alert("Erro", "Preencha os campos obrigatórios.");
      return;
    }

    try {
      setAdicionando(true);
      setErro(null);

      await adicionarInvestimento(token, {
        papel,
        saldo: parseFloat(saldo),
        descricao
      });

      setPapel("");
      setSaldo("");
      setDescricao("");
      setAdicionando(false);
      Alert.alert("✅ Sucesso", "Investimento adicionado!");
      fetchInvestimentos();
    } catch (err) {
      setAdicionando(false);

      if (err.message.includes('Timeout')) {
        Alert.alert("⏱️ Timeout", "A requisição demorou muito. Tente novamente.");
      } else if (err.message.includes('Failed to fetch')) {
        Alert.alert("❌ Erro de Conexão", "Não foi possível conectar na API.");
      } else {
        Alert.alert("❌ Erro", err.message);
      }
    }
  }

  async function handleRemover(id) {
    try {
      setDeletando(id);
      setErro(null);
      await removerInvestimento(token, id);
      setDeletando(null);
      Alert.alert("✅ Removido", "Investimento removido com sucesso!");
      fetchInvestimentos();
    } catch (err) {
      setDeletando(null);

      if (err.message.includes('Timeout')) {
        Alert.alert("⏱️ Timeout", "A requisição demorou muito. Tente novamente.");
      } else {
        Alert.alert("❌ Erro", "Não foi possível remover o investimento.");
      }
    }
  }

  const saldoTotal = useMemo(() => {
    return investimentos.reduce((acc, item) => acc + Number(item.saldo || 0), 0);
  }, [investimentos]);

  if (erro && investimentos.length === 0) {
    return <ErroConexao erro={erro} onRetry={fetchInvestimentos} titulo="Investimentos" />;
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
      <CarteiraSaldo 
        titulo="Investimentos"
        saldo={saldoTotal}
        label="Carteira Total"
        onRefresh={fetchInvestimentos}
      />

      <FormularioInvestimento
        papel={papel}
        saldo={saldo}
        descricao={descricao}
        onPapelChange={setPapel}
        onSaldoChange={setSaldo}
        onDescricaoChange={setDescricao}
        onAdicionar={handleAdicionarInvestimento}
        loading={adicionando}
      />

      {investimentos.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum investimento cadastrado."
          subtitulo="Crie um novo para começar"
          icon="briefcase-outline"
        />
      ) : (
        <View style={styles.carteiraCard}>
          <View style={styles.cardTitle}>
            <View />
            <View />
          </View>

          <FlatList
            data={investimentos}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <InvestimentoCard
                item={item}
                deletando={deletando === item.id}
                onRemover={() => handleRemover(item.id)}
              />
            )}
          />
        </View>
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
  carteiraCard: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 16,
    marginBottom: 18
  },
  cardTitle: {
    marginBottom: 12
  }
});
