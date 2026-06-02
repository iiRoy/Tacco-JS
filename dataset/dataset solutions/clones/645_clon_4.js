const obtainCeilingQuotient = (dividendValue, divisorValue) => {
  if (divisorValue <= 0) {
    return Infinity;
  }
  return Math.floor((dividendValue + divisorValue - 1) / divisorValue);
};

const executionArguments = process.argv.slice(2);

if (executionArguments.length === 5) {
  const targetQuantity = Number(executionArguments[0]);
  const unitSizeA = Number(executionArguments[1]);
  const costPerUnitA = Number(executionArguments[2]);
  const unitSizeB = Number(executionArguments[3]);
  const costPerUnitB = Number(executionArguments[4]);

  const batchesForOptionA = obtainCeilingQuotient(targetQuantity, unitSizeA);
  const batchesForOptionB = obtainCeilingQuotient(targetQuantity, unitSizeB);

  const totalExpenditureA = costPerUnitA * batchesForOptionA;
  const totalExpenditureB = costPerUnitB * batchesForOptionB;

  console.log(Math.min(totalExpenditureA, totalExpenditureB));
}
