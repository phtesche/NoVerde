import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react-native';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface Movement {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  bankId: string;
  bankName?: string;
}

interface MovementCardProps {
  movement: Movement;
  onDelete: () => void;
}

export function MovementCard({ movement, onDelete }: MovementCardProps) {
  const isCredit = movement.type === 'credit';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {isCredit ? (
            <ArrowUp size={20} color="#4CAF50" />
          ) : (
            <ArrowDown size={20} color="#FF5722" />
          )}
        </View>
        
        <View style={styles.info}>
          <Text style={styles.description}>{movement.description}</Text>
          <Text style={styles.bank}>{movement.bankName}</Text>
          <Text style={styles.date}>{formatDate(movement.date)}</Text>
        </View>
        
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: isCredit ? '#4CAF50' : '#FF5722' }]}>
            {isCredit ? '+' : '-'}{formatCurrency(movement.amount)}
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
    marginBottom: 2,
  },
  bank: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
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