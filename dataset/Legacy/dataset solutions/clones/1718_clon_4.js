function processInputAndDisplay(sourceData) {
  const numericValue = Number(sourceData);

  let accumulatedSum = 0;
  let currentBasePower = 1;

  for (let exponentIndex = 1; exponentIndex <= 3; exponentIndex++) {
    currentBasePower *= numericValue;
    accumulatedSum += currentBasePower;
  }

  console.log(accumulatedSum);
}

processInputAndDisplay(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
