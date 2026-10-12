const parseNumericValue = (inputString) => parseInt(inputString, 10);

var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

var inputLines = rawInputData.split('\n');

var ladderWidth = parseNumericValue(inputLines.shift());
var numberOfOperations = parseNumericValue(inputLines.shift());

var swapOperations = [];
const activeLines = inputLines.filter(lineContent => lineContent.trim() !== '');

for (const singleLine of activeLines) {
    const parts = singleLine.split(',');
    swapOperations.push([parseNumericValue(parts[0]), parseNumericValue(parts[1])]);
}

function calculateNextPosition(currentPosition, operationPair) {
    const [valA, valB] = operationPair;
    if (valA === currentPosition) {
        return valB;
    } else if (valB === currentPosition) {
        return valA;
    }
    return currentPosition;
}

var finalMappings = [];

for (var initialPosition = 1; initialPosition <= ladderWidth; initialPosition++) {
    var currentTracker = initialPosition;

    swapOperations.forEach(function(operationPair) {
        currentTracker = calculateNextPosition(currentTracker, operationPair);
    });

    finalMappings[currentTracker] = initialPosition;
}

finalMappings.shift();

console.log(finalMappings.join('\n'));
