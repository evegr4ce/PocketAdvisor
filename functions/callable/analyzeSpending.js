// spending analysis function
async function analyzeSpending(userId, transactions) {
  const categoryTotals = {};
  let totalSpending = 0;

  transactions.forEach((tx) => {
    if (tx.userId !== userId) return;

    const amount = Math.abs(tx.amount);
    totalSpending += amount;

    if (!categoryTotals[tx.category]) {
      categoryTotals[tx.category] = 0;
    }
    categoryTotals[tx.category] += amount;
  });

  const categoryPercentages = {};
  for (const category in categoryTotals) {
    categoryPercentages[category] = (
      (categoryTotals[category] / totalSpending) *
      100
    ).toFixed(2);
  }

  return {
    totalSpending,
    categoryTotals,
    categoryPercentages,
  };
}

module.exports = { analyzeSpending };