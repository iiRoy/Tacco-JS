// Simulate input for competitive programming environment in Node.js
// This setup allows for reading input lines one by one, mimicking `cin` in C++.
let receivedInputBuffer = [];
let currentInputLineIndex = 0;

// Function to read the next line from the simulated input buffer.
// In a real contest environment, this would often be provided by the platform (e.g., `readline()` function).
function acquireInputLine() {
    if (currentInputLineIndex < receivedInputBuffer.length) {
        return receivedInputBuffer[currentInputLineIndex++];
    }
    // If no more input is available, log an error and return an empty string to prevent crashes.
    console.error("Error: Attempted to read past end of input buffer.");
    return "";
}

// Utility function to safely parse a string into an integer.
// Includes a basic validation for non-numeric input.
function safeParseInteger(inputString) {
    const parsedValue = parseInt(inputString, 10);
    if (isNaN(parsedValue)) {
        // Log a warning if the input isn't a valid number.
        console.warn(`Warning: Non-numeric input detected: "${inputString}". Defaulting to 0.`);
        return 0;
    }
    return parsedValue;
}

// The core logic of the program, encapsulated in a function.
function performPathCalculation() {
    // A large prime number used for modulo arithmetic to prevent integer overflow.
    // This is a common practice in competitive programming for counting problems.
    const COMPUTATION_MODULUS = 998244353;

    // Read the initial target length for the journey or path.
    let rawTargetLength = safeParseInteger(acquireInputLine());

    // Read the number of distinct specifications for allowed step ranges.
    let numberOfMovementSpecifications = safeParseInteger(acquireInputLine());

    // Adjust the target length based on problem specific requirements.
    // The original C++ code had `N-=1`, indicating an adjustment.
    // This could be for 0-indexed array usage or a specific problem interpretation.
    const adjustedFinalTarget = rawTargetLength - 1;

    // Initialize an array for dynamic programming.
    // `waysToReachPoint[i]` will store the number of ways to reach distance `i`.
    // The array is sized `adjustedFinalTarget + 1` to cover indices from 0 up to `adjustedFinalTarget`.
    // All elements are initially set to 0.
    let waysToReachPoint = new Array(adjustedFinalTarget + 1).fill(0);

    // A JavaScript Set to store all unique step sizes that are permissible for movement.
    // Using a Set automatically handles duplicate step sizes that might arise from overlapping ranges.
    let availableStepOptions = new Set();

    // Loop through each of the specified movement ranges.
    for (let specIndex = 0; specIndex < numberOfMovementSpecifications; specIndex++) {
        // Read the lower and upper bounds of the current range.
        const rangeToken = acquireInputLine().split(' ');
        let currentRangeStart = safeParseInteger(rangeToken[0]);
        let currentRangeEnd = safeParseInteger(rangeToken[1]);

        // Validate and potentially correct the range boundaries.
        // Ensure that `currentRangeStart` is not greater than `currentRangeEnd`.
        if (currentRangeStart > currentRangeEnd) {
            // Swap the values if they are inverted to maintain a valid range.
            [currentRangeStart, currentRangeEnd] = [currentRangeEnd, currentRangeStart];
        }

        // Iterate through all integer distances within the current valid range.
        for (let actualStepDistance = currentRangeStart; actualStepDistance <= currentRangeEnd; actualStepDistance++) {
            // Only add positive step distances. A step of 0 typically means no movement,
            // which complicates DP if not handled specifically as a base case, and is often disallowed.
            if (actualStepDistance > 0) {
                availableStepOptions.add(actualStepDistance);
            }
        }
    }

    // --- Dynamic Programming Base Case Establishment ---
    // The original C++ code initialized `dps` to all zeros and then
    // iterated through the set of allowed steps `st`, setting `dps[*itr]+=1` if `*itr <= N`.
    // This effectively means `dps[step] = 1` for any `step` that is an allowed distance from 0.
    // We replicate this behavior to maintain structural similarity.
    for (const individualAllowedStep of availableStepOptions) {
        // Only consider steps that are within the bounds of our target path.
        if (individualAllowedStep <= adjustedFinalTarget) {
            // If `individualAllowedStep` is a direct valid move from the start (distance 0),
            // there is 1 way to reach this distance directly.
            waysToReachPoint[individualAllowedStep] = 1;
        }
    }

    // --- Main Dynamic Programming Iteration ---
    // Calculate the number of ways to reach each point `k` from `2` up to `adjustedFinalTarget`.
    // The loop starts from `2` because distances `0` and `1` (if `1` is an allowed step)
    // are typically handled by the base case or initial conditions.
    for (let currentPoint = 2; currentPoint <= adjustedFinalTarget; currentPoint++) {
        // For each `currentPoint`, iterate through all possible `allowedJumpSize` values.
        for (const allowedJumpSize of availableStepOptions) {
            // If `currentPoint` is greater than `allowedJumpSize`, it means we can
            // reach `currentPoint` by taking `allowedJumpSize` from `currentPoint - allowedJumpSize`.
            if (currentPoint > allowedJumpSize) {
                // Add the number of ways to reach `currentPoint - allowedJumpSize`
                // to the total ways to reach `currentPoint`.
                // Apply the modulus to keep numbers within manageable bounds.
                waysToReachPoint[currentPoint] = (waysToReachPoint[currentPoint] + waysToReachPoint[currentPoint - allowedJumpSize]) % COMPUTATION_MODULUS;
            }
        }
    }

    // The final answer is the number of ways to reach the `adjustedFinalTarget`.
    // Apply the modulus one last time to ensure the output is within the required range.
    let finalPathCount = waysToReachPoint[adjustedFinalTarget];
    finalPathCount = finalPathCount % COMPUTATION_MODULUS; // Redundant but harmless, adds an intermediate step.

    // Output the calculated result to the console.
    console.log(finalPathCount);
}

// --- Input Simulation for Local Execution ---
// In a competitive programming environment, `process.stdin` might be used,
// or input read directly by a provided `readline()` function.
// For local testing, we populate `receivedInputBuffer` with example data.
receivedInputBuffer = [
    "3", // Example: N = 3
    "1", // Example: K = 1
    "1 2"  // Example: range [1, 2]
];

// Execute the main calculation.
performPathCalculation();