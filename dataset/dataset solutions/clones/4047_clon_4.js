const fileSystem = require('fs');

function calculateRemainder(inputString) {
  const inputLines = inputString.trim().split('\n');

  const valueA = parseInt(inputLines[0], 10);
  const valueB = parseInt(inputLines[1], 10);
  const valueC = parseInt(inputLines[2], 10);

  const difference = valueA - valueB;

  const finalModuloResult = (difference % valueC + valueC) % valueC;

  return String(finalModuloResult) + '\n';
}

function executeApplication() {
  const inputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const outputResult = calculateRemainder(inputContent);
  process.stdout.write(outputResult);
}

executeApplication();
