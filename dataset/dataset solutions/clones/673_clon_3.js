var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawData.split('\n');

// Helper function to compute triplets and remainder for a given value and divisor
function extractTripletsAndRemainder(valueToProcess, divisorConstant) {
    const extractedTriplets = Math.floor(valueToProcess / divisorConstant);
    const remainingPart = valueToProcess % divisorConstant;
    return {
        triplets: extractedTriplets,
        remainder: remainingPart
    };
}

const DIVISOR_CONSTANT = 3; // Define a constant for the divisor

while (currentLine = inputLines.shift()) {
    // Parse the numbers from the current line, ensuring base 10
    const parsedNumbers = currentLine.split(' ').map(function(numStr) {
        return parseInt(numStr, 10);
    });

    // Calculate the initial sums of pairs from the parsed numbers
    const initialPairSums = [
        parsedNumbers[0] + parsedNumbers[1],
        parsedNumbers[2] + parsedNumbers[3],
        parsedNumbers[4] + parsedNumbers[5]
    ];

    let accumulatedTriplets = 0;
    const processedRemainders = []; // Array to store remainders after the first pass

    // Iterate through each initial pair sum to extract triplets and remainders
    for (let idx = 0; idx < initialPairSums.length; idx++) {
        const calculationResult = extractTripletsAndRemainder(initialPairSums[idx], DIVISOR_CONSTANT);
        accumulatedTriplets += calculationResult.triplets;
        processedRemainders.push(calculationResult.remainder);
    }

    // Sum the remaining parts from the first pass
    const totalRemainderSum = processedRemainders[0] + processedRemainders[1] + processedRemainders[2];

    // Add any additional triplets that can be formed from the total remainder sum
    accumulatedTriplets += Math.floor(totalRemainderSum / DIVISOR_CONSTANT);

    console.log(accumulatedTriplets);
}
