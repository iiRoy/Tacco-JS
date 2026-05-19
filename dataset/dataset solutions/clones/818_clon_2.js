process.stdin.resume();
process.stdin.setEncoding('utf8');

// Declare various variables for processing input and calculations.
// `unusedVar` is initialized but not used, mirroring the original's `n`.
// `powerOfTen` is a helper function to calculate 10 raised to a power.
var unusedVar = -1,
    powerOfTen = function(exponent) {
        return Math.pow(10, ~~exponent);
    },
    numCases, // Stores the total number of test cases.
    inputLines, // Holds all input lines after splitting.
    caseIndex, // Loop counter for iterating through test cases.
    resultArray, // An unused array, mirroring the original's `r`.
    currentCaseParams, // Stores parameters for the current test case.
    firstNum, // The first number in the pair (a).
    secondNum, // The second number in the pair (b).
    firstNumUpperLimit, // Upper bound for `firstNum`.
    secondNumUpperLimit, // Upper bound for `secondNum`.
    foundPairsCount; // Counter for pairs that satisfy the condition.

// Event listener for incoming data from standard input.
process.stdin.on('data', function(rawData) {
    // Split the raw input string into an array of lines.
    inputLines = rawData.split('\n');
    // The first line contains the number of test cases.
    numCases = ~~inputLines[0];

    // Loop through each test case.
    for (caseIndex = 0; caseIndex < numCases; ++caseIndex) {
        // Initialize an empty array (unused, but preserves original structure).
        resultArray = [];
        // Parse the parameters for the current case from the input lines.
        currentCaseParams = inputLines[caseIndex + 1].split(' ');
        // Reset the pair counter for the current case.
        foundPairsCount = 0;

        // Calculate the lower and upper bounds for the first number.
        firstNumUpperLimit = powerOfTen(currentCaseParams[0]) - 1;
        // Calculate the lower and upper bounds for the second number.
        secondNumUpperLimit = powerOfTen(currentCaseParams[1]) - 1;

        // Nested loops to iterate through all possible pairs (firstNum, secondNum).
        for (firstNum = powerOfTen(currentCaseParams[0] - 1); firstNum < firstNumUpperLimit; ++firstNum) {
            for (secondNum = powerOfTen(currentCaseParams[1] - 1); secondNum < secondNumUpperLimit; ++secondNum) {
                // Check if the mathematical condition holds true.
                // The condition is (b*b + b - a*a + a) / 2 == (concatenation of a and b as a number).
                if ((secondNum * secondNum + secondNum - firstNum * firstNum + firstNum) / 2 == ('' + firstNum + secondNum)) {
                    // If the condition is met, print the pair and increment the counter.
                    console.log(firstNum + ' ' + secondNum);
                    ++foundPairsCount;
                }
            }
        }

        // If no pairs were found for the current test case, print "No cats.".
        if (!foundPairsCount) {
            console.log('No cats.');
        }
    }
});
