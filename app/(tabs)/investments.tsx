import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { Plus, TrendingUp } from 'lucide-react-native';
import { financialService } from '@/services/financialService';
import { InvestmentCard } from '@/components/InvestmentCard';
import { formatCurrency } from '@/utils/formatters';

const CATEGORIES = ['CDI', 'CDB', 'Tesouro', 'Consórcio'];

export default function InvestmentsScreen() {
  const [investments, setInvestments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'deposit',
    category: 'CDI',
  });

  const loadInvestments = async () => {
    try {
      const investmentsData = await financialService.getInvestments();
      setInvestments(investmentsData);
    } catch (error) {
      console.error('Error loading investments:', error);
    }
  };

  const handleAddInvestment = async () => {
    if (!formData.description.trim() || !formData.amount.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const amount = parseFloat(formData.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }

    try {
      await financialService.addInvestment({
        date: formData.date,
        description: formData.description.trim(),
        amount,
        type: formData.type,
        category: formData.category,
      });

      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'deposit',
        category: 'CDI',
      });
      setShowForm(false);
      loadInvestments();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao registrar investimento');
    }
  };

  const handleDeleteInvestment = async (investmentId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este investimento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await financialService.deleteInvestment(investmentId);
              loadInvestments();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir investimento');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const totalInvestments = investments.reduce((sum, inv) => {
    return inv.type === 'deposit' ? sum + inv.amount : sum - inv.amount;
  }, 0);

  const categoryTotals = investments.reduce((acc, inv) => {
    if (!acc[inv.category]) acc[inv.category] = 0;
    acc[inv.category] += inv.type === 'deposit' ? inv.amount : -inv.amount;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.header}
      >
        <Text style={styles.title}>Investimentos</Text>
        <Text style={styles.subtitle}>{formatCurrency(totalInvestments)}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {Object.keys(categoryTotals).length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Resumo por Categoria</Text>
            {Object.entries(categoryTotals).map(([category, total]) => (
              <View key={category} style={styles.summaryItem}>
                <Text style={styles.summaryCategory}>{category}</Text>
                <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
              </View>
            ))}
          </View>
        )}

        {!showForm && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <Plus size={24} color="white" />
            <Text style={styles.addButtonText}>Novo Investimento</Text>
          </TouchableOpacity>
        )}

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Novo Investimento</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Data (AAAA-MM-DD)"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Valor"
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              keyboardType="numeric"
            />
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                style={styles.picker}
              >
                <Picker.Item label="Aporte" value="deposit" />
                <Picker.Item label="Retirada" value="withdrawal" />
              </Picker>
            </View>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                style={styles.picker}
              >
                {CATEGORIES.map((category) => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowForm(false);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: '',
                    type: 'deposit',
                    category: 'CDI',
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddInvestment}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.investmentsList}>
          {investments.map((investment) => (
            <InvestmentCard
              key={investment.id}
              investment={investment}
              onDelete={() => handleDeleteInvestment(investment.id)}
            />
          ))}
          
          {investments.length === 0 && !showForm && (
            <View style={styles.emptyState}>
              <TrendingUp size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum investimento cadastrado</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryCategory: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  investmentsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});