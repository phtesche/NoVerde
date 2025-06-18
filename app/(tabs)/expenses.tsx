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
import { Plus, Receipt, Filter, X } from 'lucide-react-native';
import { financialService } from '@/services/financialService';
import { ExpenseCard } from '@/components/ExpenseCard';
import { formatCurrency } from '@/utils/formatters';

const CATEGORIES = [
  'Luz', 'Água', 'Internet', 'Aluguel', 'Mercado',
  'Presente', 'Viagem', 'C.Crédito', 'Outros'
];

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: '',
  });

  const loadExpenses = async () => {
    try {
      const expensesData = await financialService.getExpenses();
      setExpenses(expensesData);
      applyFilters(expensesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const applyFilters = (expensesData = expenses) => {
    let filtered = expensesData;
    
    if (filterYear) {
      const year = parseInt(filterYear);
      if (filterMonth) {
        const month = parseInt(filterMonth);
        filtered = expensesData.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === month;
        });
      } else {
        filtered = expensesData.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === year;
        });
      }
    }
    
    setFilteredExpenses(filtered);
  };

  const handleAddExpense = async () => {
    if (!formData.description.trim() || !formData.category || !formData.amount.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const amount = parseFloat(formData.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }

    try {
      await financialService.addExpense({
        date: formData.date,
        description: formData.description.trim(),
        category: formData.category,
        amount,
        isPaid: false,
      });

      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        amount: '',
      });
      setShowForm(false);
      loadExpenses();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar despesa');
    }
  };

  const handlePayExpense = async (expenseId) => {
    try {
      await financialService.payExpense(expenseId);
      loadExpenses();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao pagar despesa');
    }
  };

  const handleRevertExpense = async (expenseId) => {
    try {
      await financialService.revertExpense(expenseId);
      loadExpenses();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao reverter pagamento');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta despesa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await financialService.deleteExpense(expenseId);
              loadExpenses();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir despesa');
            }
          },
        },
      ]
    );
  };

  const clearFilters = () => {
    setFilterYear(new Date().getFullYear().toString());
    setFilterMonth('');
    setFilteredExpenses(expenses);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterYear, filterMonth, expenses]);

  const pendingTotal = filteredExpenses
    .filter(expense => !expense.isPaid)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const years = Array.from(new Set(expenses.map(expense => 
    new Date(expense.date).getFullYear()
  ))).sort((a, b) => b - a);

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.header}
      >
        <Text style={styles.title}>Despesas</Text>
        <Text style={styles.subtitle}>
          {filterMonth ? `${months.find(m => m.value === filterMonth)?.label} ${filterYear}` : filterYear} - 
          Pendentes: {formatCurrency(pendingTotal)}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.actionButtons}>
          {!showForm && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowForm(true)}
            >
              <Plus size={20} color="white" />
              <Text style={styles.addButtonText}>Nova Despesa</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilter(!showFilter)}
          >
            <Filter size={20} color="#4CAF50" />
            <Text style={styles.filterButtonText}>Filtros</Text>
          </TouchableOpacity>
        </View>

        {showFilter && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Filtrar por Período</Text>
            
            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Ano</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={filterYear}
                    onValueChange={setFilterYear}
                    style={styles.picker}
                  >
                    {years.map(year => (
                      <Picker.Item key={year} label={year.toString()} value={year.toString()} />
                    ))}
                  </Picker>
                </View>
              </View>
              
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Mês</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={filterMonth}
                    onValueChange={setFilterMonth}
                    style={styles.picker}
                  >
                    <Picker.Item label="Todos" value="" />
                    {months.map(month => (
                      <Picker.Item key={month.value} label={month.label} value={month.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilters}>
              <X size={16} color="#666" />
              <Text style={styles.clearFilterText}>Limpar Filtros</Text>
            </TouchableOpacity>
          </View>
        )}

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Nova Despesa</Text>
            
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
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                style={styles.picker}
              >
                <Picker.Item label="Selecione uma categoria" value="" />
                {CATEGORIES.map((category) => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Valor"
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              keyboardType="numeric"
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowForm(false);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    category: '',
                    amount: '',
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddExpense}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.expensesList}>
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onPay={() => handlePayExpense(expense.id)}
              onRevert={() => handleRevertExpense(expense.id)}
              onDelete={() => handleDeleteExpense(expense.id)}
            />
          ))}
          
          {filteredExpenses.length === 0 && !showForm && (
            <View style={styles.emptyState}>
              <Receipt size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {expenses.length === 0 ? 'Nenhuma despesa cadastrada' : 'Nenhuma despesa encontrada para o período selecionado'}
              </Text>
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
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  filterButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    minWidth: 100,
  },
  filterButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  filterContainer: {
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
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
  },
  clearFilterText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
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
  expensesList: {
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
    textAlign: 'center',
  },
});