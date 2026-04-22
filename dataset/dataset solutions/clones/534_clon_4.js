const ioInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const calculateResult = (operandX, operandY) => {
  const numericValues = [parseFloat(operandX), parseFloat(operandY)];
  const totalAmount = numericValues.reduce((accumulator, current) => accumulator + current, 0);
  return totalAmount / numericValues.length;
};

let collectedData = '';

ioInterface.on('line', (segment) => {
  collectedData += segment;
});

ioInterface.on('close', () => {
  const processedContent = collectedData.trim();
  const numericalTokens = processedContent.match(/\S+/g);

  const [elementA, elementB] = numericalTokens;

  const finalOutcome = calculateResult(elementA, elementB);

  process.stdout.write(finalOutcome.toString() + '\n');
});