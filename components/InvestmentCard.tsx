import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react-native';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface Investment {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  category: string;
}

interface InvestmentCardProps {
  investment: Investment;
  onDelete: () => void;
}

export function InvestmentCard({ investment, onDelete }: InvestmentCardProps) {
  const isDeposit = investment.type === 'deposit';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {isDeposit ? (
            <TrendingUp size={20} color="#4CAF50" />
          ) : (
            <TrendingDown size={20} color="#FF5722" />
          )}
        </View>
        
        <View style={styles.info}>
          <Text style={styles.description}>{investment.description}</Text>
          <View style={styles.details}>
            <Text style={styles.category}>{investment.category}</Text>
            <Text style={styles.type}>{isDeposit ? 'Aporte' : 'Retirada'}</Text>
          </View>
          <Text style={styles.date}>{formatDate(investment.date)}</Text>
        </View>
        
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: isDeposit ? '#4CAF50' : '#FF5722' }]}>
            {isDeposit ? '+' : '-'}{formatCurrency(investment.amount)}
          </Text>
          
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Trash2 size={16} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  type: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
});