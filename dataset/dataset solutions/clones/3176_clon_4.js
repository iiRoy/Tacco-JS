let targetMetrics;

function processSegments(remainingItems, currentTotals) {
  if (remainingItems.length === 0) {
    const differenceA = Math.abs(targetMetrics.metricA - currentTotals.valueA);
    const differenceB = Math.abs(targetMetrics.metricB - currentTotals.valueB);
    const differenceC = Math.abs(targetMetrics.metricC - currentTotals.valueC);
    return differenceA + differenceB + differenceC;
  }

  const currentItemValue = remainingItems[0];
  const subsequentItems = remainingItems.slice(1);

  // Option 1: Exclude the current item
  const outcome1 = processSegments(subsequentItems, currentTotals);

  // Option 2: Add current item to first total
  const nextTotals2 = { ...currentTotals, valueA: currentTotals.valueA + currentItemValue };
  const outcome2 = processSegments(subsequentItems, nextTotals2) + 10;

  // Option 3: Add current item to second total
  const nextTotals3 = { ...currentTotals, valueB: currentTotals.valueB + currentItemValue };
  const outcome3 = processSegments(subsequentItems, nextTotals3) + 10;

  // Option 4: Add current item to third total
  const nextTotals4 = { ...currentTotals, valueC: currentTotals.valueC + currentItemValue };
  const outcome4 = processSegments(subsequentItems, nextTotals4) + 10;

  return Math.min(outcome1, outcome2, outcome3, outcome4);
}

function executeComposition(sourceData) {
  const allDataLines = sourceData.split('\n');
  const initialParameters = allDataLines[0].split(' ').map(Number);

  const goalA = initialParameters[1];
  const goalB = initialParameters[2];
  const goalC = initialParameters[3];

  targetMetrics = { metricA: goalA, metricB: goalB, metricC: goalC };

  const availablePieceLengths = allDataLines.slice(1).map(Number);

  const startingSums = { valueA: 0, valueB: 0, valueC: 0 };
  const finalCalculatedScore = processSegments(availablePieceLengths, startingSums);

  console.log(finalCalculatedScore - 30);
}

executeComposition(require('fs').readFileSync('/dev/stdin', 'utf8'));