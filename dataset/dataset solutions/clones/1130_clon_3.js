// Import the file system module to read standard input.
const initialDataString = require('fs').readFileSync('/dev/stdin', 'utf8');

// A large number representing an unreachable state or infinity for step counting.
const maxPossibleSteps = Number.MAX_SAFE_INTEGER;

// Helper function to safely parse an integer, returning 0 if parsing fails or input is invalid.
// This also handles cases where an empty string might be passed, treating it as 0.
const safeParseInteger = (inputStr) => {
    const parsed = parseInt(inputStr, 10);
    // Return 0 for NaN or undefined/null input, otherwise the parsed value.
    return isNaN(parsed) ? 0 : parsed;
};

// Process the raw input string into individual lines, removing leading/trailing whitespace.
const processedLines = initialDataString.trim().split('\n');

// Perform a basic validation to ensure sufficient input lines are present.
if (processedLines.length < 2) {
    // Log an error and exit if the input format is unexpected.
    console.error("Input error: Expected at least two lines of data, but received fewer.");
    process.exit(1);
}

// Extract and parse the primary parameters from the first line of input.
// These represent the target sum and the count of available operations.
const [ finalGoalStr, operationCountStr ] = processedLines[0].split(' ');
const finalGoal = safeParseInteger(finalGoalStr);
const operationCount = safeParseInteger(operationCountStr); // This variable is not strictly used later but parsed for completeness.

// Parse the list of available operation costs from the second line.
let availableOperations = processedLines[1].trim().split(' ');

// Convert operation cost strings to numbers using the safe parser.
// Filter out any invalid (zero or negative) entries, as operations should typically be positive.
availableOperations = availableOperations
    .map(opStr => safeParseInteger(opStr))
    .filter(val => val > 0);

// Initialize a cache (dynamic programming table) to store the minimum steps
// required to reach each possible objective sum.
const stepTracker = new Map();

// Base case: It takes 0 steps to reach an objective of 0.
stepTracker.set(0, 0);

// Initialize all other objectives up to the final goal with an 'infinity' marker.
// This signifies that these objectives are currently unreachable.
for (let k = 1; k <= finalGoal; k++) {
    stepTracker.set(k, maxPossibleSteps);
}

// Early exit if no valid operations are available, as no progress can be made.
if (availableOperations.length === 0) {
    // If the final goal is 0, it's 0 steps. Otherwise, it's unreachable (-1).
    console.log(finalGoal === 0 ? 0 : -1);
    process.exit(0);
}

// Main dynamic programming loop: Iterate through each possible objective from 1 up to the final goal.
for (let currentObjective = 1; currentObjective <= finalGoal; currentObjective++) {
    // Initialize the minimum steps for the current objective to its current (possibly infinite) value.
    let minStepsForCurrent = stepTracker.get(currentObjective);

    // Iterate through each available operation cost to see if it can lead to a shorter path.
    for (let opIndex = 0; opIndex < availableOperations.length; opIndex++) {
        const currentOpCost = availableOperations[opIndex];

        // Calculate the previous objective state that would lead to the current objective
        // by applying the current operation.
        const previousObjective = currentObjective - currentOpCost;

        // Check for invalid previous states:
        // 1. If previousObjective is negative, it means the operation cost is too large.
        // 2. If the previousObjective is unreachable (still maxPossibleSteps), it's not a valid path.
        if (previousObjective < 0 || stepTracker.get(previousObjective) === maxPossibleSteps) {
            continue; // Skip this operation, it doesn't provide a valid path.
        }

        // Retrieve the number of steps required to reach the previous objective.
        const stepsFromPrevious = stepTracker.get(previousObjective);

        // Calculate the total steps if we use this operation (stepsFromPrevious + 1 for the current operation).
        const potentialNewSteps = stepsFromPrevious + 1;

        // If this new path is shorter than the current minimum found for currentObjective, update it.
        if (potentialNewSteps < minStepsForCurrent) {
            minStepsForCurrent = potentialNewSteps;
        }
    }

    // After evaluating all operations, update the stepTracker with the true minimum steps for currentObjective.
    // Only update if a valid, finite path was discovered.
    if (minStepsForCurrent < maxPossibleSteps) {
        stepTracker.set(currentObjective, minStepsForCurrent);
    }
}

// Retrieve the final result: the minimum steps to reach the specified final goal.
const finalResult = stepTracker.get(finalGoal);

// Output the result. If the final goal is unreachable (indicated by maxPossibleSteps),
// output -1 as per common problem conventions; otherwise, output the calculated steps.
console.log(finalResult === maxPossibleSteps ? -1 : finalResult);