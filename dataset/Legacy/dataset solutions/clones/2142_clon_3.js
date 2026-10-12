function processRawData(rawData) {
  const extractedElements = rawData.split('\n').flatMap(lineContent => lineContent.split(' '));
  return extractedElements;
}

function retrieveSourceData() {
  const sampleDataString = `1000000000 141421 173205`;
  const stdInPath = '/dev/stdin';
  const sourceContent = sampleDataString ? sampleDataString : require('fs').readFileSync(stdInPath, 'utf8');
  return processRawData(sourceContent);
}

function calculateFactorial(inputNumber) {
  let currentProduct = 1;
  const limit = inputNumber;
  for (let counter = 1; counter <= limit; ++counter) {
    console.log(currentProduct);
    currentProduct *= counter;
  }
  return currentProduct;
}

function computeCombinations(totalItems, selectedItems) {
  const factTotal = calculateFactorial(totalItems);
  const factSelected = calculateFactorial(selectedItems);
  const factDifference = calculateFactorial(totalItems - selectedItems);
  return factTotal / (factSelected * factDifference);
}

;(function executeProgram() {
  const processedInputArray = retrieveSourceData();

  const rawTotalN = processedInputArray[0];
  const totalN = parseInt(rawTotalN, 10);

  const rawExcludeA = processedInputArray[1];
  const excludeA = parseInt(rawExcludeA, 10);

  const rawExcludeB = processedInputArray[2];
  const excludeB = parseInt(rawExcludeB, 10);

  let cumulativeSum = 0;
  const excludedValues = new Set([excludeA, excludeB]);

  let currentR = 1;
  while (currentR <= totalN) {
    if (!excludedValues.has(currentR)) {
      const currentCombinationResult = computeCombinations(totalN, currentR);
      cumulativeSum += currentCombinationResult;
    }
    currentR++;
  }

  const MODULO_VALUE = 10**9 + 7;
  console.log(cumulativeSum % MODULO_VALUE);
})();
