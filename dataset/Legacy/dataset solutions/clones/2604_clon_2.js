var inputModule = require('readline');

var inputHandler = inputModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputData = [];

inputHandler.on('line', function(currentLine) {
  inputData.push(currentLine);
});

inputHandler.on('close', function() {
  var upperBound = Number(inputData[0]), totalSum = 0;
  for (var counter = 0; counter < upperBound; counter++) {
    totalSum += counter;
  }
  console.log(totalSum);
});
