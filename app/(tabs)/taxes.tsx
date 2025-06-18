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
import { Plus, FileText } from 'lucide-react-native';
import { financialService } from '@/services/financialService';
import { TaxCard } from '@/components/TaxCard';
import { formatCurrency } from '@/utils/formatters';

const TAX_TYPES = ['DAS', 'IR', 'IPVA', 'IPTU', 'Outro'];

export default function TaxesScreen() {
  const [taxes, setTaxes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'DAS',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    status: 'pending',
  });

  const loadTaxes = async () => {
    try {
      const taxesData = await financialService.getTaxes();
      setTaxes(taxesData);
    } catch (error) {
      console.error('Error loading taxes:', error);
    }
  };

  const handleAddTax = async () => {
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
      await financialService.addTax({
        type: formData.type,
        date: formData.date,
        amount,
        description: formData.description.trim(),
        status: formData.status,
      });

      setFormData({
        type: 'DAS',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        status: 'pending',
      });
      setShowForm(false);
      loadTaxes();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao registrar imposto');
    }
  };

  const handlePayTax = async (taxId) => {
    try {
      await financialService.payTax(taxId);
      loadTaxes();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao pagar imposto');
    }
  };

  const handleDeleteTax = async (taxId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este imposto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await financialService.deleteTax(taxId);
              loadTaxes();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir imposto');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadTaxes();
  }, []);

  const pendingTotal = taxes
    .filter(tax => tax.status === 'pending')
    .reduce((sum, tax) => sum + tax.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.header}
      >
        <Text style={styles.title}>Impostos</Text>
        <Text style={styles.subtitle}>Pendentes: {formatCurrency(pendingTotal)}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {!showForm && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <Plus size={24} color="white" />
            <Text style={styles.addButtonText}>Novo Imposto</Text>
          </TouchableOpacity>
        )}

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Novo Imposto</Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                style={styles.picker}
              >
                {TAX_TYPES.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Data (AAAA-MM-DD)"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Valor"
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                style={styles.picker}
              >
                <Picker.Item label="Pendente" value="pending" />
                <Picker.Item label="Pago" value="paid" />
              </Picker>
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowForm(false);
                  setFormData({
                    type: 'DAS',
                    date: new Date().toISOString().split('T')[0],
                    amount: '',
                    description: '',
                    status: 'pending',
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddTax}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.taxesList}>
          {taxes.map((tax) => (
            <TaxCard
              key={tax.id}
              tax={tax}
              onPay={() => handlePayTax(tax.id)}
              onDelete={() => handleDeleteTax(tax.id)}
            />
          ))}
          
          {taxes.length === 0 && !showForm && (
            <View style={styles.emptyState}>
              <FileText size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum imposto cadastrado</Text>
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
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
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
  taxesList: {
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