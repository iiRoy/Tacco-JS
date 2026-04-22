const textProcessor = require('readline');

const inputOutputGate = textProcessor.createInterface({
  input: process.stdin,
  output: process.stdout
});

const calculateDimensions = (strInput) => {
  const parts = strInput.trim().split(' ');
  const valA = Number(parts[0]);
  const valB = Number(parts[1]);

  return {
    rectArea: valA * valB,
    rectPerimeter: (valA + valB) * 2
  };
};

inputOutputGate.on('line', (receivedText) => {
  const calculations = calculateDimensions(receivedText);
  const resultString = calculations.rectArea + ' ' + calculations.rectPerimeter;
  process.stdout.write(resultString + '\n');
  inputOutputGate.close();
});