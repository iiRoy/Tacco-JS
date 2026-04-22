outputPrinter = console.log;

var sourceContent = require("fs").readFileSync("/dev/stdin", "UTF-8");
var dataSegments = sourceContent
  .split("\n")
  .filter(currentSegment => currentSegment !== "")
  .map(rowSegment => rowSegment.split(" "));

var initialCount = dataSegments[0][0];
var targetPosition = dataSegments[0][1];
dataSegments = dataSegments.slice(1);

var valueList = [];

dataSegments.forEach(pairEntry => {
  var elementVal = parseInt(pairEntry[0]);
  var repeatTimes = parseInt(pairEntry[1]);
  var generatedBlock = Array(repeatTimes).fill(elementVal);
  valueList.push(...generatedBlock);
});

outputPrinter(valueList[targetPosition - 1]);