const calculateAdjustedProduct = (rawInputString) => {
  const trimmedInput = rawInputString.trim();
  const stringParts = trimmedInput.split(' ');
  const numericValues = stringParts.map(currentPart => {
    const parsedNumber = Number(currentPart);
    return parsedNumber - 2;
  });
  const [firstAdjustedValue, secondAdjustedValue] = numericValues;
  const productOfAdjustedValues = firstAdjustedValue * secondAdjustedValue;
  const absoluteProduct = Math.abs(productOfAdjustedValues);
  const finalResultString = String(absoluteProduct);
  return finalResultString;
};

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const finalOutput = calculateAdjustedProduct(rawInput);
console.log(finalOutput);
