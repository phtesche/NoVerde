import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2, Star } from 'lucide-react-native';
import { formatCurrency } from '@/utils/formatters';

interface Bank {
  id: string;
  name: string;
  balance: number;
  isPrincipal: boolean;
}

interface BankCardProps {
  bank: Bank;
  onDelete: () => void;
}

export function BankCard({ bank, onDelete }: BankCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{bank.name}</Text>
          {bank.isPrincipal && (
            <Star size={16} color="#FFD700" fill="#FFD700" />
          )}
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Trash2 size={20} color="#FF5722" />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.balance, { color: bank.balance >= 0 ? '#4CAF50' : '#FF5722' }]}>
        {formatCurrency(bank.balance)}
      </Text>
      
      {bank.isPrincipal && (
        <Text style={styles.principalLabel}>Conta Principal</Text>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  principalLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});