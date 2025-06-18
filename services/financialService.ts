import AsyncStorage from '@react-native-async-storage/async-storage';

interface Bank {
  id: string;
  name: string;
  balance: number;
  isPrincipal: boolean;
}

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  isPaid: boolean;
  paidDate?: string;
}

interface Movement {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  bankId: string;
  bankName?: string;
}

interface Investment {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  category: string;
}

interface Tax {
  id: string;
  type: string;
  date: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid';
  paidDate?: string;
}

class FinancialService {
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Helper method to safely get data from AsyncStorage
  private async getStorageData<T>(key: string, defaultValue: T[] = []): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      if (!data) return defaultValue;
      
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return defaultValue;
    }
  }

  // Helper method to safely set data to AsyncStorage
  private async setStorageData<T>(key: string, data: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  }

  // Banks
  async getBanks(): Promise<Bank[]> {
    try {
      const banks = await this.getStorageData<Bank>('banks');
      
      // Ensure all banks have IDs
      const banksWithIds = banks.map((bank: any) => ({
        ...bank,
        id: bank.id || this.generateId()
      }));
      
      // Save back if any banks were missing IDs
      if (banksWithIds.some((bank: Bank, index: number) => !banks[index]?.id)) {
        await this.setStorageData('banks', banksWithIds);
      }
      
      return banksWithIds;
    } catch (error) {
      console.error('Error getting banks:', error);
      return [];
    }
  }

  async addBank(bankData: Omit<Bank, 'id'>): Promise<void> {
    try {
      const banks = await this.getBanks();
      
      // If this is set as principal, remove principal from others
      if (bankData.isPrincipal) {
        banks.forEach(bank => bank.isPrincipal = false);
      }
      
      const newBank: Bank = {
        id: this.generateId(),
        ...bankData,
      };
      
      banks.push(newBank);
      await this.setStorageData('banks', banks);
    } catch (error) {
      console.error('Error adding bank:', error);
      throw error;
    }
  }

  async deleteBank(bankId: string): Promise<void> {
    try {
      console.log('Attempting to delete bank with ID:', bankId);
      
      const banks = await this.getBanks();
      console.log('Current banks:', banks.map(b => ({ id: b.id, name: b.name })));
      
      const bankToDelete = banks.find(bank => bank.id === bankId);
      if (!bankToDelete) {
        console.error('Bank not found with ID:', bankId);
        throw new Error('Banco não encontrado');
      }
      
      console.log('Found bank to delete:', bankToDelete.name);
      
      const filteredBanks = banks.filter(bank => bank.id !== bankId);
      console.log('Banks after filtering:', filteredBanks.map(b => ({ id: b.id, name: b.name })));
      
      await this.setStorageData('banks', filteredBanks);
      
      // Also remove related movements
      const movements = await this.getMovements();
      const filteredMovements = movements.filter(movement => movement.bankId !== bankId);
      
      // Store movements without bankName property
      const movementsToStore = filteredMovements.map(m => ({
        id: m.id,
        date: m.date,
        description: m.description,
        amount: m.amount,
        type: m.type,
        bankId: m.bankId
      }));
      
      await this.setStorageData('movements', movementsToStore);
      
      console.log('Bank deleted successfully');
    } catch (error) {
      console.error('Error deleting bank:', error);
      throw error;
    }
  }

  async updateBankBalance(bankId: string, amount: number): Promise<void> {
    try {
      const banks = await this.getBanks();
      const bank = banks.find(b => b.id === bankId);
      if (bank) {
        bank.balance += amount;
        await this.setStorageData('banks', banks);
      }
    } catch (error) {
      console.error('Error updating bank balance:', error);
      throw error;
    }
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    try {
      const expenses = await this.getStorageData<Expense>('expenses');
      
      // Ensure all expenses have IDs
      const expensesWithIds = expenses.map((expense: any) => ({
        ...expense,
        id: expense.id || this.generateId()
      }));
      
      // Save back if any expenses were missing IDs
      if (expensesWithIds.some((expense: Expense, index: number) => !expenses[index]?.id)) {
        await this.setStorageData('expenses', expensesWithIds);
      }
      
      return expensesWithIds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  async getExpensesByPeriod(year: number, month?: number): Promise<Expense[]> {
    try {
      const expenses = await this.getExpenses();
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseYear = expenseDate.getFullYear();
        const expenseMonth = expenseDate.getMonth() + 1;
        
        if (month) {
          return expenseYear === year && expenseMonth === month;
        }
        return expenseYear === year;
      });
    } catch (error) {
      console.error('Error getting expenses by period:', error);
      return [];
    }
  }

  async addExpense(expenseData: Omit<Expense, 'id'>): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const newExpense: Expense = {
        id: this.generateId(),
        ...expenseData,
      };
      expenses.push(newExpense);
      await this.setStorageData('expenses', expenses);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  async payExpense(expenseId: string): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const banks = await this.getBanks();
      
      const expense = expenses.find(e => e.id === expenseId);
      if (!expense || expense.isPaid) {
        throw new Error('Despesa não encontrada ou já paga');
      }

      const principalBank = banks.find(b => b.isPrincipal);
      if (!principalBank) {
        throw new Error('Nenhuma conta principal definida');
      }

      if (principalBank.balance < expense.amount) {
        throw new Error('Saldo insuficiente');
      }

      // Update expense
      expense.isPaid = true;
      expense.paidDate = new Date().toISOString().split('T')[0];
      
      // Update bank balance
      principalBank.balance -= expense.amount;
      
      await this.setStorageData('expenses', expenses);
      await this.setStorageData('banks', banks);
    } catch (error) {
      console.error('Error paying expense:', error);
      throw error;
    }
  }

  async revertExpense(expenseId: string): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const banks = await this.getBanks();
      
      const expense = expenses.find(e => e.id === expenseId);
      if (!expense || !expense.isPaid) {
        throw new Error('Despesa não encontrada ou não paga');
      }

      const principalBank = banks.find(b => b.isPrincipal);
      if (!principalBank) {
        throw new Error('Nenhuma conta principal definida');
      }

      // Update expense
      expense.isPaid = false;
      delete expense.paidDate;
      
      // Update bank balance
      principalBank.balance += expense.amount;
      
      await this.setStorageData('expenses', expenses);
      await this.setStorageData('banks', banks);
    } catch (error) {
      console.error('Error reverting expense:', error);
      throw error;
    }
  }

  async deleteExpense(expenseId: string): Promise<void> {
    try {
      console.log('Attempting to delete expense with ID:', expenseId);
      
      const expenses = await this.getExpenses();
      console.log('Current expenses:', expenses.map(e => ({ id: e.id, description: e.description })));
      
      const expenseToDelete = expenses.find(e => e.id === expenseId);
      if (!expenseToDelete) {
        console.error('Expense not found with ID:', expenseId);
        throw new Error('Despesa não encontrada');
      }
      
      console.log('Found expense to delete:', expenseToDelete.description);
      
      // If expense was paid, revert the payment first
      if (expenseToDelete.isPaid) {
        console.log('Expense is paid, reverting payment first');
        await this.revertExpense(expenseId);
        // Get updated expenses after revert
        const updatedExpenses = await this.getExpenses();
        const filteredExpenses = updatedExpenses.filter(e => e.id !== expenseId);
        await this.setStorageData('expenses', filteredExpenses);
      } else {
        const filteredExpenses = expenses.filter(e => e.id !== expenseId);
        await this.setStorageData('expenses', filteredExpenses);
      }
      
      console.log('Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Movements
  async getMovements(): Promise<Movement[]> {
    try {
      const movements = await this.getStorageData<any>('movements');
      
      // Ensure all movements have IDs
      const movementsWithIds = movements.map((movement: any) => ({
        ...movement,
        id: movement.id || this.generateId()
      }));
      
      // Save back if any movements were missing IDs
      if (movementsWithIds.some((movement: any, index: number) => !movements[index]?.id)) {
        const movementsToStore = movementsWithIds.map(m => ({
          id: m.id,
          date: m.date,
          description: m.description,
          amount: m.amount,
          type: m.type,
          bankId: m.bankId
        }));
        await this.setStorageData('movements', movementsToStore);
      }
      
      // Add bank names to movements
      const banks = await this.getBanks();
      return movementsWithIds.map(movement => ({
        ...movement,
        bankName: banks.find(b => b.id === movement.bankId)?.name || 'Banco não encontrado'
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting movements:', error);
      return [];
    }
  }

  async addMovement(movementData: Omit<Movement, 'id' | 'bankName'>): Promise<void> {
    try {
      const movements = await this.getMovements();
      const newMovement = {
        id: this.generateId(),
        date: movementData.date,
        description: movementData.description,
        amount: movementData.amount,
        type: movementData.type,
        bankId: movementData.bankId
      };
      
      const movementsToStore = movements.map(m => ({
        id: m.id,
        date: m.date,
        description: m.description,
        amount: m.amount,
        type: m.type,
        bankId: m.bankId
      }));
      
      movementsToStore.push(newMovement);
      await this.setStorageData('movements', movementsToStore);
      
      // Update bank balance
      const amount = movementData.type === 'credit' ? movementData.amount : -movementData.amount;
      await this.updateBankBalance(movementData.bankId, amount);
    } catch (error) {
      console.error('Error adding movement:', error);
      throw error;
    }
  }

  async deleteMovement(movementId: string): Promise<void> {
    try {
      console.log('Attempting to delete movement with ID:', movementId);
      
      const movements = await this.getMovements();
      console.log('Current movements:', movements.map(m => ({ id: m.id, description: m.description })));
      
      const movementToDelete = movements.find(m => m.id === movementId);
      if (!movementToDelete) {
        console.error('Movement not found with ID:', movementId);
        throw new Error('Movimentação não encontrada');
      }
      
      console.log('Found movement to delete:', movementToDelete.description);
      
      // Revert bank balance
      const amount = movementToDelete.type === 'credit' ? -movementToDelete.amount : movementToDelete.amount;
      await this.updateBankBalance(movementToDelete.bankId, amount);
      
      // Remove movement
      const filteredMovements = movements.filter(m => m.id !== movementId);
      const movementsToStore = filteredMovements.map(m => ({
        id: m.id,
        date: m.date,
        description: m.description,
        amount: m.amount,
        type: m.type,
        bankId: m.bankId
      }));
      
      await this.setStorageData('movements', movementsToStore);
      
      console.log('Movement deleted successfully');
    } catch (error) {
      console.error('Error deleting movement:', error);
      throw error;
    }
  }

  // Investments
  async getInvestments(): Promise<Investment[]> {
    try {
      const investments = await this.getStorageData<Investment>('investments');
      
      // Ensure all investments have IDs
      const investmentsWithIds = investments.map((investment: any) => ({
        ...investment,
        id: investment.id || this.generateId()
      }));
      
      // Save back if any investments were missing IDs
      if (investmentsWithIds.some((investment: Investment, index: number) => !investments[index]?.id)) {
        await this.setStorageData('investments', investmentsWithIds);
      }
      
      return investmentsWithIds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting investments:', error);
      return [];
    }
  }

  async addInvestment(investmentData: Omit<Investment, 'id'>): Promise<void> {
    try {
      const investments = await this.getInvestments();
      const newInvestment: Investment = {
        id: this.generateId(),
        ...investmentData,
      };
      investments.push(newInvestment);
      await this.setStorageData('investments', investments);
    } catch (error) {
      console.error('Error adding investment:', error);
      throw error;
    }
  }

  async deleteInvestment(investmentId: string): Promise<void> {
    try {
      console.log('Attempting to delete investment with ID:', investmentId);
      
      const investments = await this.getInvestments();
      console.log('Current investments:', investments.map(i => ({ id: i.id, description: i.description })));
      
      const investmentToDelete = investments.find(investment => investment.id === investmentId);
      if (!investmentToDelete) {
        console.error('Investment not found with ID:', investmentId);
        throw new Error('Investimento não encontrado');
      }
      
      console.log('Found investment to delete:', investmentToDelete.description);
      
      const filteredInvestments = investments.filter(investment => investment.id !== investmentId);
      await this.setStorageData('investments', filteredInvestments);
      
      console.log('Investment deleted successfully');
    } catch (error) {
      console.error('Error deleting investment:', error);
      throw error;
    }
  }

  // Taxes
  async getTaxes(): Promise<Tax[]> {
    try {
      const taxes = await this.getStorageData<Tax>('taxes');
      
      // Ensure all taxes have IDs
      const taxesWithIds = taxes.map((tax: any) => ({
        ...tax,
        id: tax.id || this.generateId()
      }));
      
      // Save back if any taxes were missing IDs
      if (taxesWithIds.some((tax: Tax, index: number) => !taxes[index]?.id)) {
        await this.setStorageData('taxes', taxesWithIds);
      }
      
      return taxesWithIds.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting taxes:', error);
      return [];
    }
  }

  async addTax(taxData: Omit<Tax, 'id'>): Promise<void> {
    try {
      const taxes = await this.getTaxes();
      const newTax: Tax = {
        id: this.generateId(),
        ...taxData,
      };
      taxes.push(newTax);
      await this.setStorageData('taxes', taxes);
    } catch (error) {
      console.error('Error adding tax:', error);
      throw error;
    }
  }

  async payTax(taxId: string): Promise<void> {
    try {
      const taxes = await this.getTaxes();
      const banks = await this.getBanks();
      
      const tax = taxes.find(t => t.id === taxId);
      if (!tax || tax.status === 'paid') {
        throw new Error('Imposto não encontrado ou já pago');
      }

      const principalBank = banks.find(b => b.isPrincipal);
      if (!principalBank) {
        throw new Error('Nenhuma conta principal definida');
      }

      if (principalBank.balance < tax.amount) {
        throw new Error('Saldo insuficiente');
      }

      // Update tax
      tax.status = 'paid';
      tax.paidDate = new Date().toISOString().split('T')[0];
      
      // Update bank balance
      principalBank.balance -= tax.amount;
      
      await this.setStorageData('taxes', taxes);
      await this.setStorageData('banks', banks);
    } catch (error) {
      console.error('Error paying tax:', error);
      throw error;
    }
  }

  async deleteTax(taxId: string): Promise<void> {
    try {
      console.log('Attempting to delete tax with ID:', taxId);
      
      const taxes = await this.getTaxes();
      console.log('Current taxes:', taxes.map(t => ({ id: t.id, description: t.description })));
      
      const taxToDelete = taxes.find(t => t.id === taxId);
      if (!taxToDelete) {
        console.error('Tax not found with ID:', taxId);
        throw new Error('Imposto não encontrado');
      }
      
      console.log('Found tax to delete:', taxToDelete.description);
      
      // If tax was paid, revert the payment first
      if (taxToDelete.status === 'paid') {
        console.log('Tax is paid, reverting payment first');
        const banks = await this.getBanks();
        const principalBank = banks.find(b => b.isPrincipal);
        if (principalBank) {
          principalBank.balance += taxToDelete.amount;
          await this.setStorageData('banks', banks);
        }
      }
      
      const filteredTaxes = taxes.filter(t => t.id !== taxId);
      await this.setStorageData('taxes', filteredTaxes);
      
      console.log('Tax deleted successfully');
    } catch (error) {
      console.error('Error deleting tax:', error);
      throw error;
    }
  }

  // Financial suggestions
  async getFinancialSuggestions(availableBalance: number) {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDaysInMonth = daysInMonth - today.getDate() + 1;
    
    // Reserve 20% for emergency fund
    const emergencyReserve = availableBalance * 0.2;
    const spendableAmount = availableBalance - emergencyReserve;
    
    // Daily and weekly suggestions
    const dailySuggestion = spendableAmount / remainingDaysInMonth;
    const weeklySuggestion = dailySuggestion * 7;
    
    return {
      dailySuggestion: Math.max(0, dailySuggestion),
      weeklySuggestion: Math.max(0, weeklySuggestion),
      emergencyReserve: Math.max(0, emergencyReserve),
      remainingDays: remainingDaysInMonth
    };
  }

  // Test methods for debugging
  async testDeletion(): Promise<void> {
    try {
      console.log('=== TESTE DE EXCLUSÃO ===');
      
      // Test bank deletion
      console.log('\n1. Testando exclusão de banco...');
      const testBank = {
        name: 'Banco Teste',
        balance: 1000,
        isPrincipal: false
      };
      
      await this.addBank(testBank);
      const banks = await this.getBanks();
      const addedBank = banks.find(b => b.name === 'Banco Teste');
      
      if (addedBank) {
        console.log('Banco adicionado:', addedBank.name, 'ID:', addedBank.id);
        await this.deleteBank(addedBank.id);
        const banksAfterDelete = await this.getBanks();
        const deletedBank = banksAfterDelete.find(b => b.id === addedBank.id);
        console.log('Banco excluído com sucesso:', !deletedBank);
      }
      
      // Test expense deletion
      console.log('\n2. Testando exclusão de despesa...');
      const testExpense = {
        date: new Date().toISOString().split('T')[0],
        description: 'Despesa Teste',
        category: 'Teste',
        amount: 100,
        isPaid: false
      };
      
      await this.addExpense(testExpense);
      const expenses = await this.getExpenses();
      const addedExpense = expenses.find(e => e.description === 'Despesa Teste');
      
      if (addedExpense) {
        console.log('Despesa adicionada:', addedExpense.description, 'ID:', addedExpense.id);
        await this.deleteExpense(addedExpense.id);
        const expensesAfterDelete = await this.getExpenses();
        const deletedExpense = expensesAfterDelete.find(e => e.id === addedExpense.id);
        console.log('Despesa excluída com sucesso:', !deletedExpense);
      }
      
      console.log('\n=== TESTE CONCLUÍDO ===');
    } catch (error) {
      console.error('Erro no teste de exclusão:', error);
    }
  }

  // Clear all data (for testing purposes)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['banks', 'expenses', 'movements', 'investments', 'taxes']);
      console.log('Todos os dados foram limpos');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }
}

export const financialService = new FinancialService();