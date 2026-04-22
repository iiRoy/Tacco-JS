const ioHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

ioHandler.on('line', (inputString) => {
  processData(inputString);
});

function processData(inputString) {
  const numericalValues = inputString.split(' ').map(val => Number(val));
  const primaryValue = numericalValues[0];
  const secondaryValue = numericalValues[1];

  if (primaryValue <= 0 || primaryValue > 12 || secondaryValue <= 0 || secondaryValue > 31) {
    console.log(0);
    return;
  }

  const finalCalculation = Math.min(primaryValue, secondaryValue);
  console.log(finalCalculation);
}