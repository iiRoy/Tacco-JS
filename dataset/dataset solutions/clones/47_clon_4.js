var fs = require('fs');

var bufferSize = fs.fstatSync(process.stdin.fd).size;
var dataBuffer = Buffer.alloc(bufferSize);
var readBytesCount = fs.readSync(process.stdin.fd, dataBuffer, 0, bufferSize, 0);
var lineData = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

processPermutations();

function processPermutations() {
  var arrayWidth = parseInt(lineData[0], 10);
  var swapCount = parseInt(lineData[1], 10);

  var initialArrangement = Array.from({ length: arrayWidth }, (_, index) => index);

  var finalArrangement = lineData.slice(2, swapCount + 2).reduce((currentArrangementState, swapInstructionLine) => {
    var [sourcePosition, targetPosition] = swapInstructionLine.split(',').map(Number);
    
    var adjustedSource = sourcePosition - 1;
    var adjustedTarget = targetPosition - 1;

    var nextArrangementState = [...currentArrangementState]; 
    
    [nextArrangementState[adjustedSource], nextArrangementState[adjustedTarget]] = 
    [nextArrangementState[adjustedTarget], nextArrangementState[adjustedSource]];

    return nextArrangementState;
  }, initialArrangement);

  var resultPositions = new Array(arrayWidth);
  finalArrangement.forEach((originalItemIndex, currentFinalPosition) => {
    resultPositions[originalItemIndex] = currentFinalPosition;
  });

  resultPositions.forEach(finalPos => {
    console.log(finalPos + 1);
  });
}
