const lineProcessorModule = require('readline');
const interactiveSession = lineProcessorModule.createInterface(
  {
    input:  process.stdin,
    output: process.stdout
  }
);

let numericDataStorage = [];

const calculateProduct = (incomingValues) => {
  const firstFactor = incomingValues[0];
  const secondFactor = incomingValues[1];

  if (firstFactor > 9 || secondFactor > 9) {
    return -1;
  }
  return firstFactor * secondFactor;
};

interactiveSession
  .on('line', function (receivedLine) {
    numericDataStorage = receivedLine.split(' ').map((elementString) => parseInt(elementString, 10));
  })
  .on('close', function () {
    console.log(calculateProduct(numericDataStorage));

    process.exit(0);
  });