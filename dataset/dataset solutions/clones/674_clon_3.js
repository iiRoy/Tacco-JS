var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.split('\n');

// Helper function to parse a line and sum specific segments
function parseAndSumSegments(lineString) {
    const stringSegments = lineString.split(' ');
    // Explicitly parse each segment to an integer with base 10
    const numericSegments = stringSegments.map(segment => parseInt(segment, 10));

    // Calculate the initial sums based on specific indices
    const calculatedSums = [
        numericSegments[0] + numericSegments[3],
        numericSegments[1] + numericSegments[4],
        numericSegments[2] + numericSegments[5]
    ];
    return calculatedSums;
}

// Main processing loop for each line of input
while (true) {
    const currentInputLine = inputLines.shift();

    // Terminate loop if no more lines or an empty line is encountered
    // (An empty string '' is falsy, replicating original 'while (line = lines.shift())' behavior)
    if (!currentInputLine) {
        break;
    }

    let processedValues = parseAndSumSegments(currentInputLine);

    // Check for the exit condition: if sum of all processed values is zero
    const totalSumForExitCheck = processedValues[0] + processedValues[1] + processedValues[2];
    if (totalSumForExitCheck === 0) {
        process.exit();
    }

    let finalCount = 0;

    // First phase of calculation: count groups of three and update remainders
    const numberOfValues = processedValues.length; // Store length in a constant
    for (let valueIndex = 0; valueIndex < numberOfValues; valueIndex++) {
        const currentValue = processedValues[valueIndex];
        finalCount += Math.floor(currentValue / 3); // Add full groups
        processedValues[valueIndex] = currentValue % 3; // Update value to its remainder
    }

    // Second phase of calculation: count groups of (1,1,1) from remainders
    // Continue as long as there's at least one of each (1,1,1) available
    while (processedValues[0] >= 1 && processedValues[1] >= 1 && processedValues[2] >= 1) {
        finalCount++; // Increment count for each (1,1,1) group
        processedValues[0]--; // Decrement each value
        processedValues[1]--;
        processedValues[2]--;
    }

    // Output the final calculated count for the current line
    console.log(finalCount);
}
