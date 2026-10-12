function processSequence(currentSequence) {
    // This loop continues as long as the current sequence contains
    // four or more consecutive identical digits (1s, 2s, or 3s).
    while (/(1{4,}|2{4,}|3{4,})/.test(currentSequence)) {
        // All occurrences of such patterns are removed from the sequence.
        currentSequence = currentSequence.replace(/(1{4,}|2{4,}|3{4,})/g, "");
    }
    // After all reductions, the length of the resulting sequence is compared
    // with the globally tracked minimum length, and the minimum is updated.
    minimumLength = Math.min(minimumLength, currentSequence.length);
}

// The 'fs' module is used to read data from the standard input.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw input string is trimmed of leading/trailing whitespace
// and then split into an array of strings, one for each line.
var lineArray = (rawData.trim()).split("\n");

// The first element of the lineArray is shifted off, converted to a number,
// and stored as the total count of sequences to process.
var sequenceCount = lineArray.shift() - 0;

// An empty array is initialized to hold the numerical sequence elements.
var initialNumbers = [];

// A loop iterates 'sequenceCount' times to populate the 'initialNumbers' array.
for (var idx = 0; idx < sequenceCount; idx++) {
    // Each line from the input (after the first) is shifted, converted to a number,
    // and added to the 'initialNumbers' array.
    var currentNumber = lineArray.shift() - 0;
    initialNumbers.push(currentNumber);
}

// A global variable to store the smallest sequence length found,
// initialized to positive infinity to ensure any valid length will be smaller.
var minimumLength = Infinity;

// The array of numbers is joined into a single string. This variable is not directly used
// in the subsequent logic but reflects a potential intermediate state.
var initialString = initialNumbers.join("");

// This main loop iterates through each element position in the 'initialNumbers' array.
for (var idx = 0; idx < sequenceCount; idx++) {
    // Two distinct copies of the 'initialNumbers' array are created for modification.
    var modifiedA = initialNumbers.slice();
    var modifiedB = initialNumbers.slice();

    // Modification A: If the current index is not the last element,
    // the element at the current index is replaced by the element at the next index.
    if (idx < sequenceCount - 1) {
        modifiedA[idx] = modifiedA[idx + 1];
    }

    // Modification B: If the current index is not the first element,
    // the element at the current index is replaced by the element at the previous index.
    if (idx > 0) {
        modifiedB[idx] = modifiedB[idx - 1];
    }

    // The modified array 'modifiedA' is joined into a string and passed to the processing function.
    processSequence(modifiedA.join(""));

    // The modified array 'modifiedB' is joined into a string and passed to the processing function.
    processSequence(modifiedB.join(""));
}

// Finally, the calculated minimum length is printed to the console.
console.log(minimumLength);
