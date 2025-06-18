import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { DollarSign, TriangleAlert as AlertTriangle, TrendingUp, CreditCard, Calendar, Target, Shield, TestTube } from 'lucide-react-native';
import { financialService } from '@/services/financialService';
import { SummaryCard } from '@/components/SummaryCard';
import { ExpenseChart } from '@/components/ExpenseChart';
import { FinancialSuggestions } from '@/components/FinancialSuggestions';
import { formatCurrency } from '@/utils/formatters';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [summary, setSummary] = useState({
    totalBalance: 0,
    principalBalance: 0,
    pendingExpenses: 0,
    pendingTaxes: 0,
    totalInvestments: 0,
    availableBalance: 0,
  });
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [suggestions, setSuggestions] = useState({
    dailySuggestion: 0,
    weeklySuggestion: 0,
    emergencyReserve: 0,
    remainingDays: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const banks = await financialService.getBanks();
      const expenses = await financialService.getExpenses();
      const taxes = await financialService.getTaxes();
      const investments = await financialService.getInvestments();

      const totalBalance = banks.reduce((sum, bank) => sum + bank.balance, 0);
      const principalBalance = banks
        .filter(bank => bank.isPrincipal)
        .reduce((sum, bank) => sum + bank.balance, 0);
      
      const pendingExpenses = expenses
        .filter(expense => !expense.isPaid)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const pendingTaxes = taxes
        .filter(tax => tax.status === 'pending')
        .reduce((sum, tax) => sum + tax.amount, 0);
      
      const totalInvestments = investments.reduce((sum, inv) => {
        return inv.type === 'deposit' ? sum + inv.amount : sum - inv.amount;
      }, 0);

      const availableBalance = totalBalance - pendingExpenses - pendingTaxes;

      setSummary({
        totalBalance,
        principalBalance,
        pendingExpenses,
        pendingTaxes,
        totalInvestments,
        availableBalance,
      });

      // Get financial suggestions
      const financialSuggestions = await financialService.getFinancialSuggestions(availableBalance);
      setSuggestions(financialSuggestions);

      // Group expenses by category
      const categoryMap = {};
      expenses.forEach(expense => {
        if (!categoryMap[expense.category]) {
          categoryMap[expense.category] = 0;
        }
        categoryMap[expense.category] += expense.amount;
      });
      setExpensesByCategory(categoryMap);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const runDeletionTest = async () => {
    Alert.alert(
      'Teste de Exclusão',
      'Deseja executar o teste de exclusão? Isso criará e excluirá dados de teste.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Executar',
          onPress: async () => {
            try {
              await financialService.testDeletion();
              Alert.alert('Sucesso', 'Teste de exclusão executado com sucesso! Verifique o console para detalhes.');
              loadData(); // Refresh data after test
            } catch (error) {
              Alert.alert('Erro', 'Erro ao executar teste: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const clearAllData = async () => {
    Alert.alert(
      'Limpar Dados',
      'ATENÇÃO: Isso irá excluir TODOS os dados do aplicativo. Esta ação não pode ser desfeita!',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await financialService.clearAllData();
              Alert.alert('Sucesso', 'Todos os dados foram limpos.');
              loadData(); // Refresh data after clearing
            } catch (error) {
              Alert.alert('Erro', 'Erro ao limpar dados: ' + error.message);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.header}
      >
        <Text style={styles.title}>NoVerde</Text>
        <Text style={styles.subtitle}>Controle Financeiro</Text>
        <Text style={styles.balanceLabel}>Saldo Disponível</Text>
        <Text style={[styles.mainBalance, { color: summary.availableBalance >= 0 ? '#E8F5E8' : '#FFEBEE' }]}>
          {formatCurrency(summary.availableBalance)}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.cardsContainer}>
          <SummaryCard
            title="Saldo Total"
            value={formatCurrency(summary.totalBalance)}
            icon={<DollarSign size={20} color="#4CAF50" />}
            color="#4CAF50"
          />
          
          <SummaryCard
            title="Conta Principal"
            value={formatCurrency(summary.principalBalance)}
            icon={<CreditCard size={20} color="#2196F3" />}
            color="#2196F3"
          />
          
          <SummaryCard
            title="Despesas Pendentes"
            value={formatCurrency(summary.pendingExpenses)}
            icon={<AlertTriangle size={20} color="#FF5722" />}
            color="#FF5722"
          />
          
          <SummaryCard
            title="Investimentos"
            value={formatCurrency(summary.totalInvestments)}
            icon={<TrendingUp size={20} color="#9C27B0" />}
            color="#9C27B0"
          />
        </View>

        <FinancialSuggestions suggestions={suggestions} />

        {Object.keys(expensesByCategory).length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Despesas por Categoria</Text>
            <ExpenseChart data={expensesByCategory} />
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Shield size={20} color="#FF9800" />
            <Text style={styles.statLabel}>Impostos Pendentes</Text>
            <Text style={[styles.statValue, { color: '#FF9800' }]}>
              {formatCurrency(summary.pendingTaxes)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Calendar size={20} color="#607D8B" />
            <Text style={styles.statLabel}>Dias Restantes</Text>
            <Text style={[styles.statValue, { color: '#607D8B' }]}>
              {suggestions.remainingDays} dias
            </Text>
          </View>
        </View>

        {/* Test buttons for debugging */}
        <View style={styles.testContainer}>
          <Text style={styles.testTitle}>Ferramentas de Teste</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={runDeletionTest}>
            <TestTube size={16} color="white" />
            <Text style={styles.testButtonText}>Testar Exclusões</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.testButton, styles.dangerButton]} onPress={clearAllData}>
            <AlertTriangle size={16} color="white" />
            <Text style={styles.testButtonText}>Limpar Todos os Dados</Text>
          </TouchableOpacity>
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
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  mainBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  testContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: '#FF5722',
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});