function processInput(dataPacket) {
  const numericValues = dataPacket.split(/\s|\n/).filter(Boolean).map(Number);
  const totalElements = numericValues[0];
  let initialCapital = numericValues[1];
  const expenseAmounts = numericValues.slice(2);
  expenseAmounts.sort((first, second) => first - second);
  const finalTally = expenseAmounts.reduce(
    (accumulator, currentExpense) => {
      if (accumulator.currentCapital >= currentExpense) {
        accumulator.currentCapital -= currentExpense;
        accumulator.satisfiedCount++;
      }
      return accumulator;
    },
    { currentCapital: initialCapital, satisfiedCount: 0 }
  );
  if (finalTally.currentCapital > 0 && finalTally.satisfiedCount > 0) {
    finalTally.satisfiedCount--;
  }
  console.log(finalTally.satisfiedCount);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));