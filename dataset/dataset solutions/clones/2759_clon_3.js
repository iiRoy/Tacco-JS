function determineFinalValue(quantity, unitCost, maximumBudget) {
  const totalCostEstimate = quantity * unitCost;
  let finalResult;

  if (totalCostEstimate >= maximumBudget) {
    finalResult = maximumBudget;
  } else {
    finalResult = totalCostEstimate;
  }

  return finalResult;
}
