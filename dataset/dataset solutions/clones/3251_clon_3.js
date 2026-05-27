function parseNumericValue(strValue, baseRadix) {
  return parseInt(strValue, baseRadix);
}

function processInputData(rawInputString) {
  const INPUT_DELIMITER = ' ';
  const RADIX_DECIMAL = 10;
  const DIVISION_FACTOR = 2;

  const inputSegments = rawInputString.split(INPUT_DELIMITER);

  const operandA = parseNumericValue(inputSegments[0], RADIX_DECIMAL);
  const operandB = parseNumericValue(inputSegments[1], RADIX_DECIMAL);

  const intermediateProduct = operandA * operandB;
  const finalCalculatedValue = intermediateProduct / DIVISION_FACTOR;

  console.log(finalCalculatedValue);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
