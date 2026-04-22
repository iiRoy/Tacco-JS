function processRawText(textPayload) {
  const allNumericValues = textPayload.match(/\d+/g).map(Number);

  const budgetConstraint = allNumericValues[2];
  const countSetA = allNumericValues[0];
  const countSetB = allNumericValues[1];

  let currentPosition = 3;

  const elementsA = [];
  for (let i = 0; i < countSetA; ++i) {
    elementsA.push(allNumericValues[currentPosition++]);
  }

  const elementsB = [];
  for (let i = 0; i < countSetB; ++i) {
    elementsB.push(allNumericValues[currentPosition++]);
  }

  return { limitValue: budgetConstraint, collectionA: elementsA, collectionB: elementsB };
}

function calculateCumulativeTotals(individualValues) {
  let runningSum = 0;
  const cumulativeSeries = [];
  for (const value of individualValues) {
    runningSum += value;
    cumulativeSeries.push(runningSum);
  }
  return cumulativeSeries;
}

function findMaximumCombinations(parameters) {
  const { limitValue, collectionA, collectionB } = parameters;

  const accumulatedA = calculateCumulativeTotals(collectionA);
  const accumulatedB = calculateCumulativeTotals(collectionB);

  let highestCount = 0;
  let pointerB = accumulatedB.length;

  for (let pointerA = 0; pointerA <= collectionA.length; ++pointerA) {
    const currentCostA = (pointerA === 0) ? 0 : accumulatedA[pointerA - 1];

    if (currentCostA > limitValue) {
      break;
    }

    while (pointerB > 0 && currentCostA + accumulatedB[pointerB - 1] > limitValue) {
      pointerB--;
    }

    highestCount = Math.max(highestCount, pointerA + pointerB);
  }

  return highestCount;
}

function executeSystem(inputString) {
  const processedData = processRawText(inputString);
  const finalResult = findMaximumCombinations(processedData);
  console.log(finalResult);
}

executeSystem(require('fs').readFileSync('/dev/stdin', 'utf8').trim());