const readline = require('readline');

const inputReader = readline.createInterface({
  input: process.stdin,
  terminal: false
});

let storedInputLine = '';

inputReader.on('line', (currentLine) => {
  if (!storedInputLine) {
    storedInputLine = currentLine;
  }
  inputReader.close();
});

inputReader.on('close', () => {
  const numericTokens = storedInputLine.split(' ').filter(Boolean).map(str => Number(str));

  const firstCoordX = numericTokens[0];
  const firstCoordY = numericTokens[1];
  const secondCoordX = numericTokens[2];
  const secondCoordY = numericTokens[3];

  const absoluteVal = (val) => val < 0 ? -val : val;

  const deltaXVal = secondCoordX - firstCoordX;
  const deltaYVal = secondCoordY - firstCoordY;

  const absoluteDeltaXVal = absoluteVal(deltaXVal);
  const absoluteDeltaYVal = absoluteVal(deltaYVal);

  const sumOfAbsolutes = absoluteDeltaXVal + absoluteDeltaYVal;

  const finalComputedValue = sumOfAbsolutes ** 0.5;

  const formattedOutput = finalComputedValue.toLocaleString('en-US', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
    useGrouping: false
  });

  process.stdout.write(formattedOutput + '\n');
});