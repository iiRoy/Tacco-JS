const extractNumbersFromString = (strValue, delimiterChar) => {
  const collectedNumbers = [];
  let currentSegment = '';
  const strLength = strValue.length;
  for (let i = 0; i < strLength; i++) {
    const char = strValue[i];
    if (char === delimiterChar) {
      if (currentSegment.length > 0) {
        collectedNumbers.push(parseFloat(currentSegment));
        currentSegment = '';
      }
    } else {
      currentSegment += char;
    }
  }
  if (currentSegment.length > 0) {
    collectedNumbers.push(parseFloat(currentSegment));
  }
  return collectedNumbers;
};

const loadResourceContent = (pathReference, codec) => {
  const systemInterface = globalThis.require('fs');
  return systemInterface.readFileSync(pathReference, codec);
};

function executeCalculation(sourceData) {
  const primeModulo = 10000000007;

  const firstBreak = sourceData.indexOf('\n');
  const numericCountStr = sourceData.substring(0, firstBreak);
  const dataSeriesStr = sourceData.substring(firstBreak + 1);

  const elementCount = parseFloat(numericCountStr);

  const dataValues = extractNumbersFromString(dataSeriesStr, ' ');

  let partialSum = 0;
  const upperLimit = elementCount - 1;

  if (elementCount > 1) {
    let currentIdx = 1;
    while (currentIdx <= upperLimit) {
      partialSum += dataValues[currentIdx];
      currentIdx++;
    }
  }

  let computedAverage;
  if (upperLimit === 0) {
    computedAverage = NaN;
  } else {
    computedAverage = partialSum / upperLimit;
  }

  const calculateRecursiveFactorial = (num) => {
    if (num <= 1) return 1;
    return num * calculateRecursiveFactorial(num - 1);
  };

  let cumulativeProduct = 1;
  if (elementCount > 1) {
    cumulativeProduct = calculateRecursiveFactorial(upperLimit);
  }

  const finalOutcome = (computedAverage * cumulativeProduct) % primeModulo;

  const emitResult = (value) => {
    process.stdout.write(String(value));
  };

  emitResult(finalOutcome);
}

const inputPathIdentifier = "/dev/stdin";
const textEncodingStandard = "utf8";
const retrievedContent = loadResourceContent(inputPathIdentifier, textEncodingStandard);

executeCalculation(retrievedContent);