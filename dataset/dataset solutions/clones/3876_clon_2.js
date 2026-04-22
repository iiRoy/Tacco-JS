function processData (incomingData) {
  let contentLines = incomingData.split('\n');
  const initialConfig = contentLines[0].split(' ');

  let itemCount = initialConfig[0];

  let resourceLimit = parseInt(initialConfig[1], 10);

  let expenseValues = [];

  for (let idx = 0; idx < contentLines.length - 1; idx++) {
    expenseValues.push(parseInt(contentLines[idx + 1], 10));
  }

  let totalProcessed = 0;

  const smallestExpense = Math.min.apply(null, expenseValues);

  // Calculate how many items can be purchased initially
  for (let itemIndex = 0; itemIndex < expenseValues.length; itemIndex++) {
    resourceLimit = resourceLimit - expenseValues[itemIndex];
    totalProcessed++;
  }

  totalProcessed = totalProcessed + Math.floor(resourceLimit / smallestExpense);

  console.log(totalProcessed);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));