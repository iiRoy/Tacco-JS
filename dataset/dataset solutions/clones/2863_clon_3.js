let inputBuffer = [];
const PRIME_MODULUS = 1000000007;

let maxStair;
let forbiddenCount;
let blockedStepsSet;
let waysMemo;

const ioHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioHandler.on('line', (incomingLine) => {
    inputBuffer.push(incomingLine);
});

ioHandler.on('close', () => {
    // Parse the first line to get the target step count and the number of blocked steps.
    const initialParams = inputBuffer[0].split(" ").map(Number);
    maxStair = initialParams[0];
    forbiddenCount = initialParams[1];

    // Early exit for invalid problem configurations.
    if (maxStair < 0 || forbiddenCount < 0) {
        console.log(0);
        return;
    }
    // If target is 0, there's 1 way (do nothing), unless 0 itself is blocked.
    if (maxStair === 0) {
        // We handle this within calculateCombinations, but could add a specific check here.
    }


    // Extract and store the forbidden steps into a Set for efficient O(1) lookup.
    // We slice from index 1 up to (1 + forbiddenCount) to get exactly 'forbiddenCount' lines.
    const rawForbiddenSteps = inputBuffer.slice(1, 1 + forbiddenCount).map(Number);
    blockedStepsSet = new Set(rawForbiddenSteps);

    // Initialize the memoization table. Using 'null' to clearly distinguish between
    // an uncomputed state and a computed state that happens to be 0 (e.g., a blocked step).
    // The array needs to be of size (maxStair + 1) to cover steps from 0 to maxStair.
    waysMemo = new Array(maxStair + 1).fill(null);

    // Initiate the recursive calculation starting from step 0 and print the final result.
    console.log(calculateCombinations(0));
});

/**
 * A utility function to perform modular addition, ensuring results stay within the prime modulus.
 * @param {number} term1 - The first number to add.
 * @param {number} term2 - The second number to add.
 * @returns {number} The sum modulo PRIME_MODULUS.
 */
function addMod(term1, term2) {
    return (term1 + term2) % PRIME_MODULUS;
}

/**
 * Recursively computes the total number of distinct ways to reach 'maxStair'
 * starting from 'currentStep', considering 'blockedStepsSet'. Results are cached.
 * This is a dynamic programming approach using memoization.
 * @param {number} currentStep - The current position on the staircase.
 * @returns {number} The count of valid paths from 'currentStep' to 'maxStair'.
 */
function calculateCombinations(currentStep) {
    // Guard against invalid negative step values, which should not occur with valid input.
    if (currentStep < 0) {
        return 0;
    }

    // Check if this subproblem has already been solved and its result cached.
    if (waysMemo[currentStep] !== null) {
        return waysMemo[currentStep];
    }

    // Base Case 1: If the current step has gone beyond the target, it's an invalid path.
    if (currentStep > maxStair) {
        return 0;
    }

    // Base Case 2: If the current step is exactly the target, one valid path has been found.
    if (currentStep === maxStair) {
        return 1;
    }

    // Check if the current step is one of the forbidden steps.
    if (blockedStepsSet.has(currentStep)) {
        waysMemo[currentStep] = 0; // Cache 0 as the result for a blocked step.
        return 0;
    }

    // Recursive Step: Sum the ways from taking a single step forward and a double step forward.
    // Each addition is performed with modulo to prevent integer overflow.
    let currentStepTotalWays = 0;
    currentStepTotalWays = addMod(currentStepTotalWays, calculateCombinations(currentStep + 1));
    currentStepTotalWays = addMod(currentStepTotalWays, calculateCombinations(currentStep + 2));

    // Cache the computed result for the current step before returning it.
    waysMemo[currentStep] = currentStepTotalWays;
    return currentStepTotalWays;
}