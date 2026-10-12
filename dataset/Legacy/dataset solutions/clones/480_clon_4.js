var externalInput = require('fs').readFileSync('/dev/stdin', 'utf8');
var initialData = externalInput.trim().split("\n");

function processRemainingSegments(segmentCollection, currentPosition) {
    var currentLine = segmentCollection[currentPosition];

    var controlPair = currentLine.split(" ").map(Number);

    var firstValue = controlPair[0];
    var secondValue = controlPair[1];

    if (firstValue === 0 && secondValue === 0) {
        return;
    }

    processRemainingSegments(segmentCollection, currentPosition + 1 + secondValue);
}

processRemainingSegments(initialData, 0);
