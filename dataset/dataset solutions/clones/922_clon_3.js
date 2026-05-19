var fileSystemModule = require('fs');
var rawData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

var trimmedInput = rawData.trim();
var lineSegments = trimmedInput.split("\n");

var firstLineValue = lineSegments.shift();

var initialSequenceWithSpaces = lineSegments.shift();
var currentSequence = initialSequenceWithSpaces.replace(/ /g, "");

function transformPair(pairStr) {
    const firstCharIsF = pairStr[0] === 'F';
    const secondCharIsT = pairStr[1] === 'T';

    if (firstCharIsF || secondCharIsT) {
        return 'T';
    } else {
        return 'F';
    }
}

while (currentSequence.length !== 1) {
    currentSequence = currentSequence.replace(/../, function(pairString) {
        return transformPair(pairString);
    });
}

console.log(currentSequence);
