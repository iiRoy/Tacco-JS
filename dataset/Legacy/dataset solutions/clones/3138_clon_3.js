const computeWeightedSum = (valueStrings, coefficientStrings) => {
  let currentSum = 0;
  for (let i = 0; i < valueStrings.length; i++) {
    const value = parseFloat(valueStrings[i]);
    const coefficient = parseFloat(coefficientStrings[i]);
    currentSum += value * coefficient;
  }
  return currentSum;
};

const processInputData = (rawInputString) => {
  const allInputLines = rawInputString.split('\n');

  const configurationParameters = allInputLines[0].split(' ');

  const weightCoefficients = allInputLines[1].split(' ');

  const dataEntries = allInputLines.slice(2);

  const positiveSumEntries = dataEntries.filter(singleEntryLine => {
    const entryValues = singleEntryLine.split(' ');
    const calculatedSum = computeWeightedSum(entryValues, weightCoefficients);
    return calculatedSum > 0;
  });

  console.log(positiveSumEntries.length);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
