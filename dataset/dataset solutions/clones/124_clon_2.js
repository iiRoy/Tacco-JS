// This module manages input acquisition for subsequent processing.
let receivedDataString = '';

// Begin listening for data from standard input.
process.stdin.resume();

// Ensure data is interpreted as UTF-8 text.
process.stdin.setEncoding('utf8');

// Event handler for incoming data segments.
process.stdin.on(
    'data',
    (dataFragment) => {
        // Append each new fragment to our accumulating string.
        receivedDataString += dataFragment;
    }
);

// Event handler for when all input has been received.
process.stdin.on(
    'end',
    () => {
        // Once input is complete, trigger the main processing routine.
        processInputLines(receivedDataString);
    }
);


// Primary function to parse and process each line of input.
function processInputLines(fullContent) {

    // Parse the entire input content into an array of individual lines.
    const lineSegments = fullContent.trim().split('\n');

    // Iterate through each line to extract numerical parameters.
    for ( let currentLineIndex = 0;
          currentLineIndex < lineSegments.length;
          currentLineIndex = currentLineIndex + 1 )
    {
        // Split the line by space and convert parts to numbers.
        const numericPair = lineSegments[currentLineIndex].split(' ').map(Number);

        // Extract the two key values from the parsed pair.
        const stepsGoal = numericPair[0];
        const desiredTotal = numericPair[1];

        // Check for termination condition: both values are zero.
        if ( !stepsGoal && !desiredTotal ) {
            // If both are zero, exit the function.
            return;
        }

        // Output the result of the combination calculation for the current pair.
        console.log( calculateCombinations(stepsGoal, desiredTotal) );
    }
}


// Function to orchestrate the recursive counting process.
function calculateCombinations(countLimit, sumRequirement) {
    // Initiate the recursive search with appropriate starting parameters.
    // The -1 signifies that any digit from 0 to 9 can be the first digit.
    return computeRecursiveCount(sumRequirement, -1, countLimit);
}


// Recursive helper function to determine digit combinations.
function computeRecursiveCount(remainingSum, previousDigit, digitsToPlace) {

    // Base case: If no more digits need to be placed.
    if ( digitsToPlace === 0 ) {
        // Check if the remaining sum is exactly zero (successful combination).
        const isGoalAchieved = remainingSum === 0;
        // Return 1 for success, 0 for failure.
        return isGoalAchieved ? 1 : 0;
    }

    // Initialize a counter for the total valid combinations found.
    let cumulativeCount = 0;

    // Iterate through possible digits (0-9) to add.
    // Start from `previousDigit + 1` to ensure digits are strictly increasing.
    for ( let digitCandidate = previousDigit + 1;
          digitCandidate <= 9;
          digitCandidate = digitCandidate + 1 )
    {
        // If the current digit can be subtracted without making the sum negative.
        if ( remainingSum >= digitCandidate ) {
            // Recursively call with reduced sum, current digit as the 'previous', and one less digit to place.
            cumulativeCount += computeRecursiveCount(remainingSum - digitCandidate, digitCandidate, digitsToPlace - 1);
        }
    }

    // Return the accumulated count of combinations.
    return cumulativeCount;
}