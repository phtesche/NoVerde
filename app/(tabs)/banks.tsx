import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Trash2, DollarSign } from 'lucide-react-native';
import { financialService } from '@/services/financialService';
import { BankCard } from '@/components/BankCard';
import { formatCurrency } from '@/utils/formatters';

export default function BanksScreen() {
  const [banks, setBanks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    isPrincipal: false,
  });

  const loadBanks = async () => {
    try {
      const banksData = await financialService.getBanks();
      setBanks(banksData);
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  };

  const handleAddBank = async () => {
    if (!formData.name.trim() || !formData.balance.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const balance = parseFloat(formData.balance.replace(',', '.'));
    if (isNaN(balance)) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }

    try {
      await financialService.addBank({
        name: formData.name.trim(),
        balance,
        isPrincipal: formData.isPrincipal,
      });

      setFormData({ name: '', balance: '', isPrincipal: false });
      setShowForm(false);
      loadBanks();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar banco');
    }
  };

  const handleDeleteBank = async (bankId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este banco?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await financialService.deleteBank(bankId);
              loadBanks();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir banco');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadBanks();
  }, []);

  const totalBalance = banks.reduce((sum, bank) => sum + bank.balance, 0);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.header}
      >
        <Text style={styles.title}>Bancos</Text>
        <Text style={styles.subtitle}>{formatCurrency(totalBalance)}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {!showForm && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <Plus size={24} color="white" />
            <Text style={styles.addButtonText}>Adicionar Banco</Text>
          </TouchableOpacity>
        )}

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Novo Banco</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome do banco"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Saldo inicial"
              value={formData.balance}
              onChangeText={(text) => setFormData({ ...formData, balance: text })}
              keyboardType="numeric"
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Conta Principal</Text>
              <Switch
                value={formData.isPrincipal}
                onValueChange={(value) => setFormData({ ...formData, isPrincipal: value })}
                trackColor={{ false: '#ddd', true: '#4CAF50' }}
              />
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowForm(false);
                  setFormData({ name: '', balance: '', isPrincipal: false });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddBank}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.banksList}>
          {banks.map((bank) => (
            <BankCard
              key={bank.id}
              bank={bank}
              onDelete={() => handleDeleteBank(bank.id)}
            />
          ))}
          
          {banks.length === 0 && !showForm && (
            <View style={styles.emptyState}>
              <DollarSign size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum banco cadastrado</Text>
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
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
  banksList: {
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