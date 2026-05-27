var cupLabels = ["A", "B", "C"];

function exchangePositions(arr, idxA, idxB) {
    var tempVal = arr[idxA];
    arr[idxA] = arr[idxB];
    arr[idxB] = tempVal;
}

var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split('\n');

var cupStates = [1, 0, 0];

var currentLine;
while (currentLine = inputLines.shift()) {
    var swapCommand = currentLine.split(',');
    exchangePositions(cupStates, cupLabels.indexOf(swapCommand[0]), cupLabels.indexOf(swapCommand[1]));
}

for (var k = 0; k < cupStates.length; k++) {
    if (cupStates[k]) {
        console.log(cupLabels[k]);
        break;
    }
}
