const ioInterface = require('readline');

let statefulRegister = 'A';

const streamProcessor = ioInterface.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

streamProcessor.on('line', (dataLine) => {
  const lineParts = dataLine.split(',');
  if (lineParts.length === 2) {
    const [elementOne, elementTwo] = lineParts;
    const comparisonSet = [elementOne, elementTwo];
    const foundIndex = comparisonSet.indexOf(statefulRegister);

    if (foundIndex !== -1) {
      statefulRegister = comparisonSet[1 - foundIndex];
    }
  }
});

streamProcessor.on('close', () => {
  console.log(statefulRegister);
});