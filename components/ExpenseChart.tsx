import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface ExpenseChartProps {
  data: Record<string, number>;
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const colors = [
    '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', 
    '#FF5722', '#607D8B', '#00BCD4', '#8BC34A',
    '#FF9800', '#795548'
  ];

  const chartData = Object.entries(data).map(([category, amount], index) => ({
    name: category,
    amount,
    color: colors[index % colors.length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  if (chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum dado para exibir</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PieChart
        data={chartData}
        width={width - 64}
        height={200}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});