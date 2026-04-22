const textHandler = require('readline');

const inputStream = textHandler.createInterface({
  input: process.stdin
});

const productAggregator = (currentTotal, newFactor) => currentTotal * newFactor;

inputStream.on('line', (incomingString) => {
  const numericalValue = Number(incomingString);
  const elements = [numericalValue, numericalValue, numericalValue];
  const calculatedResult = elements.reduce(productAggregator);
  process.stdout.write(String(calculatedResult) + '\n');
});