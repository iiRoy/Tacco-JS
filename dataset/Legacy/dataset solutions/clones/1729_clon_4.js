var fileSystem = require("fs");
var inputLine = fileSystem.readFileSync("/dev/stdin");
var upperBound = Number(inputLine);
var finalResult = 0;

var currentIteration = 1;
while (currentIteration <= upperBound) {
  var blockValue = Math.floor(upperBound / currentIteration);
  var nextBlockStart = Math.floor(upperBound / blockValue);

  var sumOfIndices = (nextBlockStart * (nextBlockStart + 1) / 2) - ((currentIteration - 1) * currentIteration / 2);
  var termSum = blockValue * (blockValue + 1) / 2;

  finalResult += termSum * sumOfIndices;

  currentIteration = nextBlockStart + 1;
}

console.log(finalResult);
