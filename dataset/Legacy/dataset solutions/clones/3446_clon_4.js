process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputAccumulator = [];
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentLine) => {
  inputAccumulator.push(currentLine);
});

inputProcessor.on('close', () => {
  const primaryInput = inputAccumulator[0];
  const segmentArray = primaryInput.split(' ');

  const numericOperands = [
    Number(segmentArray[0]),
    Number(segmentArray[2]) / 2
  ];

  const finalComputation = numericOperands.reduce((summation, element) => summation + element, 0);

  console.log(finalComputation);
});
