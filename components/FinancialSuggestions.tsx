import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, Calendar, Shield } from 'lucide-react-native';
import { formatCurrency } from '@/utils/formatters';

interface FinancialSuggestionsProps {
  suggestions: {
    dailySuggestion: number;
    weeklySuggestion: number;
    emergencyReserve: number;
    remainingDays: number;
  };
}

export function FinancialSuggestions({ suggestions }: FinancialSuggestionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sugestões Financeiras</Text>
      
      <View style={styles.suggestionsGrid}>
        <View style={styles.suggestionCard}>
          <View style={styles.iconContainer}>
            <Target size={20} color="#4CAF50" />
          </View>
          <Text style={styles.suggestionLabel}>Gasto Diário Sugerido</Text>
          <Text style={styles.suggestionValue}>
            {formatCurrency(suggestions.dailySuggestion)}
          </Text>
          <Text style={styles.suggestionNote}>
            Para os próximos {suggestions.remainingDays} dias
          </Text>
        </View>
        
        <View style={styles.suggestionCard}>
          <View style={styles.iconContainer}>
            <Calendar size={20} color="#2196F3" />
          </View>
          <Text style={styles.suggestionLabel}>Gasto Semanal Sugerido</Text>
          <Text style={styles.suggestionValue}>
            {formatCurrency(suggestions.weeklySuggestion)}
          </Text>
          <Text style={styles.suggestionNote}>
            Baseado no gasto diário
          </Text>
        </View>
        
        <View style={[styles.suggestionCard, styles.fullWidth]}>
          <View style={styles.iconContainer}>
            <Shield size={20} color="#FF9800" />
          </View>
          <Text style={styles.suggestionLabel}>Reserva de Emergência Sugerida</Text>
          <Text style={styles.suggestionValue}>
            {formatCurrency(suggestions.emergencyReserve)}
          </Text>
          <Text style={styles.suggestionNote}>
            20% do saldo disponível para emergências
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  suggestionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  suggestionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  suggestionNote: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});