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
import { Plus, ArrowUpDown } from 'lucide-react-native';
import { financialService } from '@/services/financialService';
import { MovementCard } from '@/components/MovementCard';

export default function MovementsScreen() {
  const [movements, setMovements] = useState([]);
  const [banks, setBanks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'credit',
    bankId: '',
  });

  const loadMovements = async () => {
    try {
      const movementsData = await financialService.getMovements();
      setMovements(movementsData);
    } catch (error) {
      console.error('Error loading movements:', error);
    }
  };

  const loadBanks = async () => {
    try {
      const banksData = await financialService.getBanks();
      setBanks(banksData);
      if (banksData.length > 0 && !formData.bankId) {
        setFormData(prev => ({ ...prev, bankId: banksData[0].id }));
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  };

  const handleAddMovement = async () => {
    if (!formData.description.trim() || !formData.amount.trim() || !formData.bankId) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const amount = parseFloat(formData.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }

    try {
      await financialService.addMovement({
        date: formData.date,
        description: formData.description.trim(),
        amount,
        type: formData.type,
        bankId: formData.bankId,
      });

      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'credit',
        bankId: banks[0]?.id || '',
      });
      setShowForm(false);
      loadMovements();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao lançar movimentação');
    }
  };

  const handleDeleteMovement = async (movementId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta movimentação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await financialService.deleteMovement(movementId);
              loadMovements();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir movimentação');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadMovements();
    loadBanks();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.header}
      >
        <Text style={styles.title}>Movimentações</Text>
        <Text style={styles.subtitle}>Histórico de transações</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {!showForm && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <Plus size={24} color="white" />
            <Text style={styles.addButtonText}>Nova Movimentação</Text>
          </TouchableOpacity>
        )}

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Nova Movimentação</Text>
            
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
                <Picker.Item label="Crédito" value="credit" />
                <Picker.Item label="Débito" value="debit" />
              </Picker>
            </View>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.bankId}
                onValueChange={(value) => setFormData({ ...formData, bankId: value })}
                style={styles.picker}
              >
                <Picker.Item label="Selecione um banco" value="" />
                {banks.map((bank) => (
                  <Picker.Item key={bank.id} label={bank.name} value={bank.id} />
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
                    type: 'credit',
                    bankId: banks[0]?.id || '',
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddMovement}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.movementsList}>
          {movements.map((movement) => (
            <MovementCard
              key={movement.id}
              movement={movement}
              onDelete={() => handleDeleteMovement(movement.id)}
            />
          ))}
          
          {movements.length === 0 && !showForm && (
            <View style={styles.emptyState}>
              <ArrowUpDown size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhuma movimentação encontrada</Text>
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
  movementsList: {
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