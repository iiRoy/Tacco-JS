function readStandardInputSource() {
  return require('fs').readFileSync('/dev/stdin', 'utf8').trim();
}

function extractNumericValues(inputStringData) {
  return inputStringData.split(' ').map(Number);
}

function processCalculationAndOutput(inputString) {
  const parsedNumbers = extractNumericValues(inputString);
  let [firstVal, secondVal, thirdVal, targetVal] = parsedNumbers;

  let computedResult;

  if (firstVal >= targetVal) {
    computedResult = targetVal;
  } else {
    const sumOfFirstTwo = firstVal + secondVal;
    if (sumOfFirstTwo >= targetVal) {
      computedResult = firstVal;
    } else {
      const deficitFromThird = targetVal - sumOfFirstTwo;
      computedResult = firstVal - deficitFromThird;
    }
  }
  console.log(computedResult);
}

processCalculationAndOutput(readStandardInputSource());
