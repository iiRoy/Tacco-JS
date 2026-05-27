process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var streamProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

streamProcessor.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

streamProcessor.on('close', () => {
  var totalItemsToProcess = Number(inputLines[0]);
  
  var distinctElementsRegistry = inputLines.slice(1, totalItemsToProcess + 1).reduce((accumulator, currentItem) => {
    accumulator[currentItem] = true;
    return accumulator;
  }, {});

  var finalUniqueCount = Object.keys(distinctElementsRegistry).length;

  console.log(finalUniqueCount);
});
