var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = (rawData.trim()).split("\n");

// Iterate over each segment (line) of the input
lineSegments.forEach(function(currentLine) {
    // Parse numbers from the current line
    var parsedNumbers = currentLine.split(" ").map(Number);

    // Initialize a collection of digits from 1 to 10
    var availableDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Filter out digits that are already present in the parsed numbers
    availableDigits = availableDigits.filter(function(digitCandidate) {
        return (digitCandidate !== parsedNumbers[0] && digitCandidate !== parsedNumbers[1] && digitCandidate !== parsedNumbers[2]);
    });

    // Initialize counters for successful and failed combinations
    var successfulCombinations = 0;
    var failedCombinations = 0;

    // Check each remaining available digit
    availableDigits.forEach(function(currentDigit) {
        // If the sum of the first two parsed numbers and the current digit is 20 or less
        if ((parsedNumbers[0] + parsedNumbers[1] + currentDigit) <= 20) {
            successfulCombinations++; // Increment successful combinations
        } else {
            failedCombinations++; // Otherwise, increment failed combinations
        }
    });

    // Output "YES" if successful combinations are greater than or equal to failed combinations, otherwise "NO"
    console.log(successfulCombinations >= failedCombinations ? "YES" : "NO");
});
