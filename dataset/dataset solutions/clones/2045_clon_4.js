const obtainProcessedValue = (dim) => {
  return Math.pow(dim, 3) / 27;
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const firstLineText = rawInputContent.split('\n')[0].trim();
const numericDimension = parseFloat(firstLineText);

const finalOutput = obtainProcessedValue(numericDimension).toFixed(12);
console.log(finalOutput);
