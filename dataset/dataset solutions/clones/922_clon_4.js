var fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = fileData.trim().split("\n");
var firstLine = lineSegments.shift();
var rawSequence = lineSegments.shift();
var cleanSequence = rawSequence.replace(/ /g, "");

var boolSequence = cleanSequence.split('').map(function(charVal) {
    return charVal === 'T';
});

function deriveValue(antecedent, consequent) {
    return !antecedent || consequent;
}

var finalBooleanResult;
if (boolSequence.length === 0) {
    // If the sequence is empty after cleaning, the original code would enter an infinite loop.
    // To strictly replicate this, a loop would be necessary.
    // However, assuming valid inputs (non-empty sequence after cleaning),
    // this branch implies an edge case not typically handled by functional reduction
    // without an initial value. For the core logic, we proceed with reduction.
    // If an empty string is passed, the original code would loop infinitely.
    // This implementation would throw a TypeError from reduce on an empty array.
    // Assuming inputs guarantee at least one character after cleaning.
    finalBooleanResult = false; // Placeholder, should not be reached with valid inputs.
} else {
    finalBooleanResult = boolSequence.reduce(deriveValue);
}

var outputChar = finalBooleanResult ? 'T' : 'F';

console.log(outputChar);
