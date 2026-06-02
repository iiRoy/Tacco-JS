function computeOddCountForNumber(inputNumber) {
  const divisionFactor = 2;
  const isValueEven = (inputNumber % divisionFactor === 0);
  const flooredHalfValue = Math.floor(inputNumber / divisionFactor);

  if (isValueEven) {
    return flooredHalfValue;
  } else {
    const incrementForOdd = 1;
    return flooredHalfValue + incrementForOdd;
  }
}

function processInputData(rawInputString) {
  const allInputLines = rawInputString.split("\n");
  const lastRelevantLine = allInputLines.pop();

  const numericValue = Number(lastRelevantLine);

  const calculatedOddCount = computeOddCountForNumber(numericValue);

  const intermediateRatio = calculatedOddCount / numericValue;
  const finalComputedRatio = parseFloat(intermediateRatio);

  const outputPrecision = 11;
  const formattedResult = finalComputedRatio.toFixed(outputPrecision);

  console.log(formattedResult + '\n');
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
