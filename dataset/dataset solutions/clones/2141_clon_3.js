function processRawData(rawData) {
  const extractedElements = rawData.split('\n').reduce((accumulator, lineContent) => {
    const lineParts = lineContent.split(' ');
    return accumulator.concat(lineParts);
  }, []);
  return extractedElements;
}

function retrieveData() {
  const mockData = ``;
  const standardInputPath = '/dev/stdin';
  const fileSystemModule = require('fs');
  const rawFileContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
  const sourceContent = mockData || rawFileContent;
  return processRawData(sourceContent);
}

function calculateFactorial(inputNumber) {
  if (inputNumber === 0) {
    return 1;
  }

  let productResult = 1;
  let currentMultiplier = 1;
  while (currentMultiplier <= inputNumber) {
    productResult *= currentMultiplier;
    currentMultiplier++;
  }
  return productResult;
}

function computeCombination(totalItems, selectedItems) {
  const factN = calculateFactorial(totalItems);
  const factR = calculateFactorial(selectedItems);
  const factNMinusR = calculateFactorial(totalItems - selectedItems);
  const denominator = factR * factNMinusR;
  return factN / denominator;
}

(function executeMainLogic() {
  const parseAndConvertInput = () => {
    const processedInputArray = retrieveData();
    const totalN = +processedInputArray[0];
    const excludeA = +processedInputArray[1];
    const excludeB = +processedInputArray[2];
    return { totalN, excludeA, excludeB };
  };

  const { totalN, excludeA, excludeB } = parseAndConvertInput();

  let cumulativeSum = 0;
  const loopStart = 1;
  const loopEnd = totalN;

  for (let currentR = loopStart; currentR <= loopEnd; currentR++) {
    const isExcluded = (currentR === excludeA || currentR === excludeB);
    if (isExcluded) {
      continue;
    }
    const currentCombinationValue = computeCombination(totalN, currentR);
    cumulativeSum += currentCombinationValue;
  }

  const baseModulo = 10;
  const exponentModulo = 9;
  const additionModulo = 7;
  const moduloConstant = Math.pow(baseModulo, exponentModulo) + additionModulo;

  const finalResult = cumulativeSum % moduloConstant;
  console.log(finalResult);
})();
