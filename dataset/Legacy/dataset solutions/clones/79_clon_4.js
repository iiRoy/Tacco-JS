const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedNumericValue = Number(rawInputContent.trim());

function computeSeriesProduct(limitValue) {
  let accumulatedProduct = 1;

  for (let currentMultiplier = 2; currentMultiplier <= limitValue; currentMultiplier++) {
    accumulatedProduct *= currentMultiplier;
  }
  return accumulatedProduct;
}

console.log(computeSeriesProduct(processedNumericValue));
