let sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw text content from standard input

const processedLines = (sourceContent.trim())
    .split("\n"); // Normalize the input string and break it into an array of lines

let initialNumericValue = parseInt(processedLines.shift(), 10); // Extract and convert the first line, which is typically a count, to an integer

processedLines.sort(function(elementOne, elementTwo) {
    return elementOne - elementTwo;
}); // Sort the remaining lines numerically in ascending order

let computedCombinations = []; // Prepare an array to store all generated number combinations

for (let currentOuterIndex = 0;
     currentOuterIndex < 5;
     currentOuterIndex++) { // Iterate through the first five sorted elements
    for (let currentInnerIndex = currentOuterIndex + 1;
         currentInnerIndex < 5;
         currentInnerIndex++) { // Iterate through subsequent elements to form unique pairs
        // Concatenate the string representations of the two numbers and then convert to an integer
        computedCombinations.push(parseInt(processedLines[currentOuterIndex] + processedLines[currentInnerIndex], 10));
        computedCombinations.push(parseInt(processedLines[currentInnerIndex] + processedLines[currentOuterIndex], 10));
    }
}

computedCombinations.sort(function(valueA, valueB) {
    return valueA - valueB;
}); // Sort the final list of combined numbers numerically

console.log(computedCombinations[2]); // Output the third smallest number from the sorted combinations