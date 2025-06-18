import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleCheck as CheckCircle, Circle as XCircle, Trash2, RotateCcw } from 'lucide-react-native';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  isPaid: boolean;
  paidDate?: string;
}

interface ExpenseCardProps {
  expense: Expense;
  onPay: () => void;
  onRevert: () => void;
  onDelete: () => void;
}

export function ExpenseCard({ expense, onPay, onRevert, onDelete }: ExpenseCardProps) {
  return (
    <View style={[styles.card, expense.isPaid && styles.paidCard]}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.description}>{expense.description}</Text>
          <View style={styles.details}>
            <Text style={styles.category}>{expense.category}</Text>
            <Text style={styles.date}>{formatDate(expense.date)}</Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          {expense.isPaid ? (
            <TouchableOpacity onPress={onRevert} style={styles.actionButton}>
              <RotateCcw size={20} color="#2196F3" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onPay} style={styles.actionButton}>
              <CheckCircle size={20} color="#4CAF50" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Trash2 size={20} color="#FF5722" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.amount, { color: expense.isPaid ? '#4CAF50' : '#FF5722' }]}>
          {formatCurrency(expense.amount)}
        </Text>
        
        <View style={styles.status}>
          {expense.isPaid ? (
            <>
              <CheckCircle size={16} color="#4CAF50" />
              <Text style={[styles.statusText, { color: '#4CAF50' }]}>Pago</Text>
            </>
          ) : (
            <>
              <XCircle size={16} color="#FF5722" />
              <Text style={[styles.statusText, { color: '#FF5722' }]}>Pendente</Text>
            </>
          )}
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
  paidCard: {
    backgroundColor: '#f8f9fa',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    gap: 12,
  },
  category: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});