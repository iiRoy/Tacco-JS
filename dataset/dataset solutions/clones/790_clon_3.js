const fileSystemModule = require('fs'); // Import the File System module for file operations

// Read all input data from standard input ('/dev/stdin') as a UTF-8 string.
// The .trim() method is used to remove any leading or trailing whitespace (like a final newline).
const rawInputDataBuffer = fileSystemModule.readFileSync('/dev/stdin', { encoding: 'utf8' }).trim();

// Split the raw input string into an array of individual lines.
// Each element in 'processedInputLines' will be a string representing a line from the input.
const processedInputLines = rawInputDataBuffer.split('\n');

// Iterate over each line obtained from the input.
// The loop variable 'lineIndex' tracks the current line number (0-indexed).
for (let lineIndex = 0; lineIndex < processedInputLines.length; ++lineIndex) {
    // Attempt to convert the current line string into an integer.
    // Using parseInt with radix 10 ensures that the number is parsed in base 10.
    const currentTargetValue = parseInt(processedInputLines[lineIndex], 10);

    // Validate the parsed value:
    // If it's not a valid number (NaN) or if it's zero, skip this line.
    // The original problem context implies processing only non-zero, positive integers.
    if (isNaN(currentTargetValue) || currentTargetValue === 0) {
        // Continue to the next iteration of the outer loop, ignoring this invalid/zero input.
        continue;
    }

    // Initialize the variable to store the minimum sum found for the current 'currentTargetValue'.
    // The 'currentTargetValue' itself is a valid initial upper bound for the sum (when y=0, z=0, x=currentTargetValue).
    let minimumAchievedSum = currentTargetValue;

    // --- Outer Loop: Iterating for possible integer values of 'z' ---
    // The constraint is that z^3 must not exceed 'currentTargetValue'.
    // We calculate the maximum possible integer 'z' by taking the cube root of 'currentTargetValue'.
    const maximumZCandidate = Math.floor(Math.pow(currentTargetValue, 1 / 3));

    for (let currentZ = 0; currentZ <= maximumZCandidate; ++currentZ) {
        // Calculate the cube of the current 'z' value.
        const zCubedTerm = Math.pow(currentZ, 3);

        // Calculate the remaining value needed for y^2 + x.
        // This is 'currentTargetValue' minus 'zCubedTerm'.
        const remainingValueAfterZCubed = currentTargetValue - zCubedTerm;

        // Optimization/Guard Clause: If 'remainingValueAfterZCubed' is negative,
        // it means 'currentZ' is already too large. Since 'currentZ' only increases,
        // all subsequent 'z' values will also result in a negative remaining value.
        // Thus, we can break out of the 'z' loop early.
        if (remainingValueAfterZCubed < 0) {
            break;
        }

        // --- Inner Loop: Iterating for possible integer values of 'y' ---
        // The constraint is that y^2 must not exceed 'remainingValueAfterZCubed'.
        // We calculate the maximum possible integer 'y' by taking the square root.
        const maximumYCandidate = Math.floor(Math.sqrt(remainingValueAfterZCubed));

        for (let currentY = 0; currentY <= maximumYCandidate; ++currentY) {
            // Calculate the square of the current 'y' value.
            const ySquaredTerm = Math.pow(currentY, 2);

            // Calculate the value of 'x' based on the equation: x = E - z^3 - y^2.
            const derivedXValue = remainingValueAfterZCubed - ySquaredTerm;

            // Constraint Check: 'x' must be a non-negative integer.
            // If 'derivedXValue' is negative, this combination of 'y' and 'z' is invalid.
            // Since 'currentY' only increases, further increments will also lead to negative 'x'.
            // Therefore, we can break out of the 'y' loop for the current 'z'.
            if (derivedXValue < 0) {
                break;
            }

            // Calculate the sum of x, y, and z for the current valid combination.
            const currentIterationSum = derivedXValue + currentY + currentZ;

            // Compare the current sum with the minimum sum found so far.
            // If the current sum is smaller, update 'minimumAchievedSum'.
            if (currentIterationSum < minimumAchievedSum) {
                minimumAchievedSum = currentIterationSum;
            }
        }
    }
    // After checking all possible combinations for the current 'currentTargetValue',
    // print the smallest sum found to standard output, followed by a newline.
    // Using process.stdout.write for direct output.
    process.stdout.write(minimumAchievedSum.toString() + '\n');
}