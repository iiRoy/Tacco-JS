function processInputData(inputContent) {
  const numberStrings = inputContent.split('\n')[1].split(' ');

  const calculateTwoFactors = (valueString) => {
    let currentNumericalValue = Number(valueString);
    let divisionCount = 0;

    if (currentNumericalValue === 0) {
      return 0;
    }

    let absoluteValue = Math.abs(currentNumericalValue);
    while (absoluteValue > 0 && absoluteValue % 2 === 0) {
      absoluteValue /= 2;
      divisionCount++;
    }
    return divisionCount;
  };

  const allFactorCounts = numberStrings.map(calculateTwoFactors);

  const leastCommonDivisions = Math.min(...allFactorCounts);

  console.log(leastCommonDivisions);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
