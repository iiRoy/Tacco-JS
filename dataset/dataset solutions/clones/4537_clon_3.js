function processInputData(rawData) {
  const inputLines = rawData.split('\n');
  const firstInputLine = inputLines[0];

  const extractAndConvertNumbers = (lineContent) => {
    const stringValues = lineContent.split(' ');
    const firstNumericValue = Number(stringValues[0]);
    const secondNumericValue = Number(stringValues[1]);
    return { first: firstNumericValue, second: secondNumericValue };
  };

  const { first: valA, second: valB } = extractAndConvertNumbers(firstInputLine);

  const sumResult = valA + valB;
  const comparisonThreshold = 10;

  if (sumResult >= comparisonThreshold) {
    console.log('error');
  } else {
    console.log(sumResult);
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
