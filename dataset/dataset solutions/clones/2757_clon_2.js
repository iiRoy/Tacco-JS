function processInput(rawData) {
  const parsedValues = rawData.split(' ');
  let productResult = parsedValues[0] * parsedValues[1];
  let comparisonValue = parsedValues[2];
  if (productResult < comparisonValue) {
    console.log(productResult);
  } else {
    console.log(comparisonValue);
  }
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
