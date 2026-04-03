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
import { getLinksUteis, getAvisos } from '../services/avisosService';

export default function AvisosScreen() {
  const [abaAtiva, setAbaAtiva] = useState('links'); // 'links' ou 'avisos'
  const linksUteis = useMemo(() => getLinksUteis(), []);
  const avisos = useMemo(() => getAvisos(), []);

  const abrirLink = (url) => {
    Linking.openURL(url).catch(err => 
      console.log('Erro ao abrir link:', err)
    );
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Orientações para MEI</Text>
      </View>

      {/* Abas */}
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
          style={[styles.tab, abaAtiva === 'avisos' && styles.tabAtiva]}
          onPress={() => setAbaAtiva('avisos')}
        >
          <Text style={[styles.tabText, abaAtiva === 'avisos' && styles.tabTextAtivo]}>
            ⚠️ Avisos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      <ScrollView style={styles.contentContainer}>
        {/* ABA 1: Links Úteis */}
        {abaAtiva === 'links' && (
          <View style={styles.tabContent}>
            <View style={styles.linksContainer}>
              {linksUteis.map(link => (
                <TouchableOpacity 
                  key={link.id}
                  style={styles.linkItem}
                  onPress={() => abrirLink(link.url)}
                >
                  <Text style={styles.linkText}>
                    {link.emoji} {link.titulo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ABA 2: Avisos Importantes */}
        {abaAtiva === 'avisos' && (
          <View style={styles.tabContent}>
            {avisos.map(aviso => (
              <View key={aviso.id} style={styles.card}>
                <Text style={styles.cardTitle}>{aviso.titulo}</Text>
                <Text style={styles.cardText}>{aviso.descricao}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Espaçamento final */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  tabTextAtivo: {
    color: '#6366F1',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabContent: {
    marginBottom: 20,
  },
  linksContainer: {
    gap: 12,
  },
  linkItem: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2
  },
  linkText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500'
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  cardText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18
  }
});
