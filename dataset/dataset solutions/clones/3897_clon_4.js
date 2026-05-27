var inputLines = [];
var lineCursor = 0;
require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
}).on('line', function(lineContent){
  inputLines.push(lineContent);
}).on('close', function(){
  console.error("\n");
  var startTime = new Date();
  processData();
  var elapsedTime = new Date() - startTime;
  
  displayDiagnostic("time : " + (elapsedTime) + "ms");
  displayDiagnostic("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function obtainLine() {
  if (lineCursor >= inputLines.length) {
    throw new Error("End of input reached.");
  }
  return inputLines[lineCursor++];
}

function convertToInt(str) {
  return parseInt(str, 10);
}

function convertToArrayOfNumbers(str) {
  return str.split(" ").map(Number);
}

function displayResult(content) {
  console.log(content);
}

function displayDiagnostic(content) {
  console.error("debug:" + require("util").inspect(content, false, null));
}

function processData() {
  var countElements = convertToInt(obtainLine());
  var sourceValues = convertToArrayOfNumbers(obtainLine());

  var orderedValues = Array.from(sourceValues).sort((a, b) => a - b);

  displayDiagnostic(orderedValues);

  var upperMidIndex = Math.floor(countElements / 2);
  var lowerMidIndex = upperMidIndex - 1;

  var upperMidValue = orderedValues[upperMidIndex];
  var lowerMidValue = orderedValues[lowerMidIndex];

  displayDiagnostic({upperMidValue, lowerMidValue});

  var resultValues = sourceValues.map(currentValue => {
    return (upperMidValue === lowerMidValue || currentValue <= lowerMidValue) ? upperMidValue : lowerMidValue;
  });

  displayResult(resultValues.join('\n'));
}
