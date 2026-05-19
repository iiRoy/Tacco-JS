var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataRows = rawData.split('\n');

var widthVal = +dataRows.shift();
var numOperations = +dataRows.shift();

var operationList = [];
var currentLine = null;
while (currentLine = dataRows.shift()) {
    var lineParts = currentLine.split(',');
    operationList.push(lineParts);
}

var resultArray = [];
for (var idx = 1; idx <= widthVal; idx++) {
    var currentVal = idx;
    operationList.forEach(function(opArgs) {
        if (opArgs[0] == currentVal) {
            currentVal = opArgs[1];
        } else if (opArgs[1] == currentVal) {
            currentVal = opArgs[0];
        }
    });
    resultArray[currentVal] = idx;
}
resultArray.shift();
console.log(resultArray.join('\n'));
