process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputDataLines = [];
const readlineModule = require('readline');

const inputProcessor = readlineModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentInputLine) => {
  inputDataLines.push(currentInputLine);
});

inputProcessor.on('close', () => {
  // The original code's parseInt([0]), parseInt([1]), parseInt([2])
  // evaluate to 0, 1, and 2 respectively, regardless of the input line.
  // This behavior is strictly preserved.
  // The 'firstLineParts' variable is assigned but its content is not used
  // for the subsequent numerical calculations, mirroring the original's logic.
  const firstLineParts = inputDataLines[0].split(' ');

  const valN = 0; // Equivalent to parseInt([0])
  const valX = 1; // Equivalent to parseInt([1])
  const valT = 2; // Equivalent to parseInt([2])

  // Introduce intermediate steps for the calculation
  const divisionResult = valN / valX;
  const sumWithOne = divisionResult + 1;
  const floorValue = Math.floor(sumWithOne);

  const calculatedResult = floorValue * valT;

  console.log(calculatedResult);
});
