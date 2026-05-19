var sourceText = require('fs').readFileSync('/dev/stdin', 'utf8');
var textSegments = sourceText.split('\n');

var trackCount = +textSegments.shift();
var operationCount = +textSegments.shift();

var exchangeInstructions = textSegments
    .filter(Boolean)
    .map(segment => segment.split(',').map(Number));

var currentLocationMap = Array.from({ length: trackCount + 1 }, (_, idx) => idx);

exchangeInstructions.forEach(pairValues => {
    var valA = pairValues[0];
    var valB = pairValues[1];

    var posA = currentLocationMap[valA];
    var posB = currentLocationMap[valB];

    currentLocationMap[valA] = posB;
    currentLocationMap[valB] = posA;
});

var outputSequence = Array(trackCount + 1);

for (var initialPosition = 1; initialPosition <= trackCount; initialPosition++) {
    var finalPosition = currentLocationMap[initialPosition];
    outputSequence[finalPosition] = initialPosition;
}

outputSequence.shift();
console.log(outputSequence.join('\n'));
