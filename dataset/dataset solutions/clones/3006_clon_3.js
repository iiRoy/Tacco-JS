function primaryExecution(rawInputData) {
  const inputLines = rawInputData.split('\n');
  const numItems = parseInt(inputLines[0], 10);
  const valueStringArray = inputLines[1].split(' ');
  const costStringArray = inputLines[2].split(' ');

  let cumulativeProfit = 0;

  const parsedValues = valueStringArray.map(str => parseInt(str, 10));
  const parsedCosts = costStringArray.map(str => parseInt(str, 10));

  for (let itemIndex = 0; itemIndex < numItems; ++itemIndex) {
    const currentItemValue = parsedValues[itemIndex];
    const currentItemCost = parsedCosts[itemIndex];

    if (currentItemValue > currentItemCost) {
      const profitFromItem = currentItemValue - currentItemCost;
      cumulativeProfit += profitFromItem;
    }
  }
  console.log(cumulativeProfit);
}

primaryExecution(require('fs').readFileSync('/dev/stdin', 'utf8'));
