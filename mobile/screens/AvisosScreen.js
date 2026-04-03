// screens/AvisosScreen.js
import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Linking, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLinksUteis, getAvisos } from '../services/avisosService';

export default function AvisosScreen() {
  const [abaAtiva, setAbaAtiva] = useState('links');
  const [expandidos, setExpandidos] = useState({});
  const linksUteis = useMemo(() => getLinksUteis(), []);

  const regras = [
    {
      id: 1,
      categoria: 'Obrigações',
      titulo: 'Pagar DAS mensalmente',
      descricaoResumida: 'Dia 20 de cada mês',
      descricaoCompleta: 'O não pagamento gera multa, juros e pode causar o desenquadramento do Simples Nacional.',
      icone: 'calendar',
      cor: '#3B82F6'
    },
    {
      id: 2,
      categoria: 'Obrigações',
      titulo: 'DASN-SIMEI anual',
      descricaoResumida: 'Até 31 de maio',
      descricaoCompleta: 'Deve ser entregue anualmente mesmo sem faturamento. Multa mínima de R$ 50,00 por atraso.',
      icone: 'document-text',
      cor: '#3B82F6'
    },
    {
      id: 3,
      categoria: 'Limites',
      titulo: 'Limite de faturamento',
      descricaoResumida: 'Até R$ 81.000/ano',
      descricaoCompleta: 'Ultrapassar resulta em desenquadramento e cobrança retroativa de impostos.',
      icone: 'trending-up',
      cor: '#F59E0B'
    },
    {
      id: 4,
      categoria: 'Limites',
      titulo: 'Um funcionário apenas',
      descricaoResumida: 'Contratação limitada',
      descricaoCompleta: 'Pode contratar no máximo 1 funcionário com salário mínimo. Obrigatório registrar em carteira.',
      icone: 'people',
      cor: '#F59E0B'
    },
    {
      id: 5,
      categoria: 'Proibições',
      titulo: 'Não pode ser sócio',
      descricaoResumida: 'De outra empresa',
      descricaoCompleta: 'Não pode ser titular, sócio ou administrador de outra empresa. Perde o enquadramento se fizer isso.',
      icone: 'close-circle',
      cor: '#EF4444'
    },
    {
      id: 6,
      categoria: 'Proibições',
      titulo: 'Atividades restritas',
      descricaoResumida: 'Nem todas são permitidas',
      descricaoCompleta: 'Verifique se sua atividade consta na lista oficial no Portal do Empreendedor.',
      icone: 'ban',
      cor: '#EF4444'
    },
    {
      id: 7,
      categoria: 'Dicas',
      titulo: 'Emita Nota Fiscal',
      descricaoResumida: 'Para pessoa jurídica',
      descricaoCompleta: 'Obrigatório para clientes PJ. Para pessoa física, apenas se solicitado.',
      icone: 'receipt',
      cor: '#10B981'
    },
    {
      id: 8,
      categoria: 'Dicas',
      titulo: 'Monitore seu CNPJ',
      descricaoResumida: 'Evite débitos em aberto',
      descricaoCompleta: 'Débitos podem negativar CNPJ e impedir acesso a crédito e licitações.',
      icone: 'shield-checkmark',
      cor: '#10B981'
    }
  ];

  const abrirLink = (url) => {
    Linking.openURL(url).catch(err =>
      console.log('Erro ao abrir link:', err)
    );
  };

  const toggleExpandir = (id) => {
    setExpandidos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getCategoriaIcon = (categoria) => {
    const icons = {
      'Obrigações': 'checkmark-done',
      'Limites': 'warning',
      'Proibições': 'close-circle',
      'Dicas': 'bulb'
    };
    return icons[categoria] || 'information-circle';
  };

  const getCategoriaColor = (categoria) => {
    const cores = {
      'Obrigações': '#3B82F6',
      'Limites': '#F59E0B',
      'Proibições': '#EF4444',
      'Dicas': '#10B981'
    };
    return cores[categoria] || '#9CA3AF';
  };

  const renderarRegras = (categoria) => {
    const regrasDaCategoria = regras.filter(r => r.categoria === categoria);

    return (
      <View style={styles.categoriaContainer}>
        <View style={[styles.categoriaHeader, { borderLeftColor: getCategoriaColor(categoria) }]}>
          <Ionicons
            name={getCategoriaIcon(categoria)}
            size={24}
            color={getCategoriaColor(categoria)}
          />
          <Text style={[styles.categoriaTitulo, { color: getCategoriaColor(categoria) }]}>
            {categoria}
          </Text>
          <Text style={styles.categoriaCount}>
            {regrasDaCategoria.length}
          </Text>
        </View>

        {regrasDaCategoria.map(regra => (
          <TouchableOpacity
            key={regra.id}
            style={[styles.regraCard, { borderLeftColor: regra.cor }]}
            onPress={() => toggleExpandir(regra.id)}
          >
            <View style={styles.regraHeader}>
              <View style={[styles.regraIconContainer, { backgroundColor: regra.cor + '20' }]}>
                <Ionicons name={regra.icone} size={24} color={regra.cor} />
              </View>

              <View style={styles.regraInfo}>
                <Text style={styles.regraTitulo}>{regra.titulo}</Text>
                <Text style={styles.regraResumida}>{regra.descricaoResumida}</Text>
              </View>

              <Ionicons
                name={expandidos[regra.id] ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#9CA3AF"
              />
            </View>

            {expandidos[regra.id] && (
              <View style={styles.regraDescricao}>
                <Text style={styles.regraTexto}>{regra.descricaoCompleta}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Regras do MEI</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'links' && styles.tabAtiva]}
          onPress={() => setAbaAtiva('links')}
        >
          <Text style={[styles.tabText, abaAtiva === 'links' && styles.tabTextAtivo]}>
            🔗 Links Úteis
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'regras' && styles.tabAtiva]}
          onPress={() => setAbaAtiva('regras')}
        >
          <Text style={[styles.tabText, abaAtiva === 'regras' && styles.tabTextAtivo]}>
            📚 Regras
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {abaAtiva === 'links' && (
          <View style={styles.tabContent}>
            {linksUteis.map(link => (
              <TouchableOpacity
                key={link.id}
                style={styles.linkItem}
                onPress={() => abrirLink(link.url)}
              >
                <Ionicons name="open-outline" size={20} color="#3B82F6" />
                <Text style={styles.linkText}>{link.titulo}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {abaAtiva === 'regras' && (
          <View style={styles.tabContent}>
            {renderarRegras('Obrigações')}
            {renderarRegras('Limites')}
            {renderarRegras('Proibições')}
            {renderarRegras('Dicas')}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginBottom: 8
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingHorizontal: 16
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabAtiva: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  tabTextAtivo: {
    color: '#3B82F6',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#0F172A',
  },
  tabContent: {
    marginBottom: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    gap: 12
  },
  linkText: {
    fontSize: 15,
    color: '#F3F4F6',
    fontWeight: '500',
    flex: 1
  },
  categoriaContainer: {
    marginBottom: 24,
  },
  categoriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderLeftWidth: 4,
    borderRadius: 10,
    marginBottom: 12,
    gap: 12
  },
  categoriaTitulo: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1
  },
  categoriaCount: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  regraCard: {
    backgroundColor: '#1E293B',
    borderLeftWidth: 4,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden'
  },
  regraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12
  },
  regraIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  regraInfo: {
    flex: 1,
  },
  regraTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 4
  },
  regraResumida: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  regraDescricao: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  regraTexto: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18
  }
});