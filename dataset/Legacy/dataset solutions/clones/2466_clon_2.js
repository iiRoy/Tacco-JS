const nodeReader = require('readline');

const ioHandler = nodeReader.createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataBuffer = [];

const calculateProduct = (incomingValues) => {
  const firstVal = incomingValues[0];
  const secondVal = incomingValues[1];

  if (firstVal > 9 || secondVal > 9) {
    return -1;
  }
  return firstVal * secondVal;
};

ioHandler.on('line', function (currentLineText) {
    dataBuffer = currentLineText.split(' ').map((elementString) => parseInt(elementString, 10));
  })
  .on('close', function () {
    console.log(calculateProduct(dataBuffer));

    process.exit(0);
  });
