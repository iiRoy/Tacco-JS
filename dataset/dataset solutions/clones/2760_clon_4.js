const calculateOptimalTariff = (inputLineData) => {
  const numericalFragments = inputLineData.match(/-?\d+/g);

  const parsedValues = numericalFragments.reduce((accumulator, currentString, index) => {
    switch (index) {
      case 0:
        accumulator.initialAmount = parseInt(currentString, 10);
        break;
      case 1:
        accumulator.ratePerUnit = parseInt(currentString, 10);
        break;
      case 2:
        accumulator.alternativeCost = parseInt(currentString, 10);
        break;
    }
    return accumulator;
  }, {});

  const derivedExpense = parsedValues.initialAmount * parsedValues.ratePerUnit;

  const finalSelection = Math.min(derivedExpense, parsedValues.alternativeCost);

  return finalSelection;
};

let accumulatedInput = '';

process.stdin.on('data', (inputFragment) => {
  accumulatedInput += inputFragment.toString();
});

process.stdin.on('end', () => {
  const finalCalculatedValue = calculateOptimalTariff(accumulatedInput.trim());
  process.stdout.write(String(finalCalculatedValue) + '\n');
});