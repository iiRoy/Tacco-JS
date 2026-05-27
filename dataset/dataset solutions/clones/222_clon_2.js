var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
// Process the raw input: trim whitespace, split by newlines, and convert each part to a number.
var numericValues = (rawData.trim()).split("\n").map(Number);

// Iterate over each numerical value obtained from the input.
numericValues.forEach(function (currentVal) {
    // Initialize an array for sequence generation.
    // The first element is 0, the second is the current input value.
    var sequenceData = [0, currentVal];

    // Generate subsequent elements of the sequence up to index 10.
    for (var idx = 2; idx <= 10; idx++) {
        // If the index is even, multiply the previous element by 2.
        // If the index is odd, divide the previous element by 3.
        sequenceData[idx] = (idx % 2 === 0) ? sequenceData[idx - 1] * 2 : sequenceData[idx - 1] / 3;
    }

    // Calculate the sum of all elements in the generated sequence.
    var totalSum = sequenceData.reduce(function (accumulator, currentElement) {
        return accumulator + currentElement;
    });

    // Print the calculated sum, formatted to 8 decimal places.
    console.log(totalSum.toFixed(8));
});
