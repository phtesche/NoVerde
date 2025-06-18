import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Trash2 } from 'lucide-react-native';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface Tax {
  id: string;
  type: string;
  date: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid';
  paidDate?: string;
}

interface TaxCardProps {
  tax: Tax;
  onPay: () => void;
  onDelete: () => void;
}

export function TaxCard({ tax, onPay, onDelete }: TaxCardProps) {
  const isPaid = tax.status === 'paid';

  return (
    <View style={[styles.card, isPaid && styles.paidCard]}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.type}>{tax.type}</Text>
          {isPaid ? (
            <CheckCircle size={16} color="#4CAF50" />
          ) : (
            <AlertTriangle size={16} color="#FF5722" />
          )}
        </View>
        
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Trash2 size={16} color="#999" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.description}>{tax.description}</Text>
      
      <View style={styles.details}>
        <Text style={styles.date}>Vencimento: {formatDate(tax.date)}</Text>
        {isPaid && tax.paidDate && (
          <Text style={styles.paidDate}>Pago em: {formatDate(tax.paidDate)}</Text>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.amount, { color: isPaid ? '#4CAF50' : '#FF5722' }]}>
          {formatCurrency(tax.amount)}
        </Text>
        
        {!isPaid && (
          <TouchableOpacity onPress={onPay} style={styles.payButton}>
            <CheckCircle size={16} color="white" />
            <Text style={styles.payButtonText}>Pagar</Text>
          </TouchableOpacity>
        )}
        
        {isPaid && (
          <View style={styles.paidStatus}>
            <CheckCircle size={16} color="#4CAF50" />
            <Text style={styles.paidText}>Pago</Text>
          </View>
        )}
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
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 4,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  details: {
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  paidDate: {
    fontSize: 12,
    color: '#4CAF50',
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
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  payButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  paidStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paidText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});