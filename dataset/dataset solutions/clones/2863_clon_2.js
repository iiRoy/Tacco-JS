var inputData = []; // Stores lines read from standard input
var PRIME_MODULUS = 1000000007; // A large prime number used for modulo operations

var numSteps, maxJump; // N: total steps, M: number of forbidden steps
var forbiddenSteps; // 'a': array of forbidden step indices
var dpCache; // 'memo': cache for dynamic programming results

// Initialize the readline interface for input processing
var inputReader = require('readline');
var interfaceHandler = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event listener for each line of input
interfaceHandler.on('line', function (currentLine) {
    inputData.push(currentLine); // Add the current line to our input data array
});

// Event listener for when the input stream closes
interfaceHandler.on('close', function () {
    // Parse the first line to get numSteps (N) and maxJump (M)
    numSteps = Number(inputData[0].split(" ")[0]);
    maxJump = Number(inputData[0].split(" ")[1]);

    // Remove the first line as it's already processed
    inputData.shift();

    // Parse the remaining lines to get the forbidden steps
    forbiddenSteps = inputData.map(stepValue => Number(stepValue));

    // Initialize the DP cache with zeros. Size is numSteps.
    dpCache = Array(numSteps).fill(0);

    // Start the path calculation from position 0 and print the result
    console.log(calculatePaths(0));
});

/**
 * Recursively calculates the number of ways to reach 'numSteps' from 'currentPosition',
 * avoiding 'forbiddenSteps', using dynamic programming with memoization.
 *
 * @param {number} currentPosition The current step index.
 * @returns {number} The number of valid paths from 'currentPosition' to 'numSteps'.
 */
function calculatePaths(currentPosition) {
    // If the result for this position is already in cache, return it
    if (dpCache[currentPosition]) {
        return dpCache[currentPosition];
    }

    // If current position is beyond the target, it's an invalid path
    if (numSteps < currentPosition) {
        return 0;
    }

    // If current position is the target, we found one valid path
    if (currentPosition === numSteps) {
        return 1;
    }
    // Otherwise, calculate paths from this position
    else {
        // This loop structure is critical to replicate the original behavior.
        // The 'pathCount' variable is declared inside the loop, and 'dpCache[currentPosition]'
        // is assigned the value of 'pathCount' from the *last* iteration if no early return occurs.
        // If 'maxJump' is 0, 'pathCount' will not be defined, leading to a ReferenceError,
        // which matches the original code's behavior.
        for (var jumpIndex = 0; jumpIndex < maxJump; jumpIndex++) {
            var pathCount = 0; // Re-initialized in each loop iteration

            // If the current position is a forbidden step, no paths are possible from here
            if (currentPosition === forbiddenSteps[jumpIndex]) {
                return 0;
            }
            // If not forbidden, calculate paths by taking 1 or 2 steps
            else {
                pathCount += calculatePaths(currentPosition + 1);
                pathCount %= PRIME_MODULUS;
                pathCount += calculatePaths(currentPosition + 2);
                pathCount %= PRIME_MODULUS;
            }
        }
    }

    // Store the calculated path count in the cache for future use
    // If maxJump was 0, 'pathCount' would be undefined here, causing a ReferenceError.
    dpCache[currentPosition] = pathCount;

    // Return the total number of paths from this position
    return dpCache[currentPosition];
}
