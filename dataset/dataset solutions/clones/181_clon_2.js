var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataRows = sourceData.trim().split('\n');

var numberArrays = dataRows.map(function(currentLine) {
  return currentLine.split(',').map(function(numStr) {
    return +numStr;
  });
});

var totalProduct = numberArrays.reduce(function(accumulator, currentPair) {
  return accumulator + currentPair[0] * currentPair[1];
}, 0);

var secondElementSum = numberArrays.reduce(function(runningQuantity, dataItem) {
  return runningQuantity + dataItem[1];
}, 0);

console.log(totalProduct);
console.log(Math.round(secondElementSum / numberArrays.length));