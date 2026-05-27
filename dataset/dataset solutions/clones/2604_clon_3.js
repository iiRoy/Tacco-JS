var inputHandlerModule = require('readline');
var inputInterface = inputHandlerModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

var receivedLines = [];
inputInterface.on('line', function(currentInputLine) {
  receivedLines.push(currentInputLine);
});

inputInterface.on('close', function() {
  const firstLineText = receivedLines[0];
  var inputCount = Number(firstLineText);
  var calculatedSum;

  // The original code calculates the sum of integers from 0 to (inputCount - 1).
  // This can be mathematically expressed as inputCount * (inputCount - 1) / 2.
  // This transformation replaces an iterative loop with a direct formula,
  // which is a significant structural change while preserving exact behavior.
  calculatedSum = (inputCount * (inputCount - 1)) / 2;

  console.log(calculatedSum);
});
