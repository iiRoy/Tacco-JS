const fileSystem = require('fs'); // Import the Node.js file system module for input operations.

// Define a constant for the modulo operation to improve readability and maintainability.
const RESULT_MODULO = 100000;

// Function to safely parse an integer from a string.
// This is a common utility in robust parsing.
function parseInteger(strValue) {
    const parsed = parseInt(strValue, 10);
    if (isNaN(parsed)) {
        // Handle cases where conversion fails, perhaps by throwing an error or returning a default.
        // For competitive programming, we often assume valid input, but for Type III,
        // adding robustness demonstrates complexity.
        throw new Error(`Failed to parse integer from: "${strValue}"`);
    }
    return parsed;
}

try {
    // Read the entire standard input as a UTF-8 string.
    // This is the raw data provided to the script.
    const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Split the input content into individual lines, trim whitespace from each line,
    // and filter out any empty lines that might result from extra newlines.
    const processedInputLines = rawInputContent.trim().split('\n').filter(line => line.length > 0);

    // The first line contains grid dimensions (rows and columns).
    // Extract and parse these values.
    const dimensionTokens = processedInputLines.shift().split(' ').map(parseInteger);
    const numGridRows = dimensionTokens[0]; // Represents 'm' from original code.
    const numGridCols = dimensionTokens[1]; // Represents 'n' from original code.

    // Basic validation for grid dimensions.
    if (numGridRows < 1 || numGridCols < 1) {
        console.error("Error: Grid dimensions must be positive.");
        process.exit(1); // Exit with an error code.
    }

    // The next (m-1) lines contain the "cost" or "value" associated with each path segment.
    // Store these in an array.
    const pathSegmentValues = [];
    for (let currentSegmentIndex = 0; currentSegmentIndex < numGridRows - 1; currentSegmentIndex++) {
        pathSegmentValues.push(parseInteger(processedInputLines.shift()));
    }

    // The following 'n' lines contain the movement instructions.
    // Each instruction indicates a direction and magnitude of movement.
    const movementCommandSequence = [];
    for (let commandIndex = 0; commandIndex < numGridCols; commandIndex++) {
        movementCommandSequence.push(parseInteger(processedInputLines.shift()));
    }

    // Initialize variables for tracking the accumulated score and current position.
    let totalAccumulatedScore = 0;
    let currentPathIndex = 0; // Represents 'i' from original code.

    // Iterate through each movement command in the sequence.
    for (const singleMoveInstruction of movementCommandSequence) {
        // Determine the direction of movement based on the instruction's sign.
        // Positive means move right (increment index), negative means move left (decrement index).
        const directionFactor = (singleMoveInstruction > 0) ? 1 : -1;

        // Get the absolute number of steps to take for this instruction.
        let numberOfSteps = Math.abs(singleMoveInstruction);

        // Execute the movement for the specified number of steps.
        for (let stepCounter = 0; stepCounter < numberOfSteps; stepCounter++) {
            // Check for valid index boundaries before accessing the array.
            // This adds robustness, although problem constraints usually ensure valid moves.
            if (currentPathIndex < 0 || currentPathIndex >= pathSegmentValues.length) {
                // This indicates an out-of-bounds access, which shouldn't happen with valid input.
                // Log an error and potentially break or throw.
                console.error(`Warning: Attempted to access path segment out of bounds at index ${currentPathIndex}.`);
                // Depending on requirements, might break here or adjust currentPathIndex.
                // For this problem, we'll assume valid input and let the logic proceed.
                // If it happened, it would likely mean a problem with the input data or problem understanding.
            }

            // Apply the score accumulation logic based on direction.
            // If moving right (directionFactor === 1):
            //   Add the value of the current segment *before* moving past it.
            // If moving left (directionFactor === -1):
            //   First, move to the new segment, then add its value.
            if (directionFactor === 1) {
                // Add the cost of the segment we are *currently on* before advancing.
                totalAccumulatedScore += pathSegmentValues[currentPathIndex];
                currentPathIndex++; // Move to the next segment.
            } else { // Moving left
                currentPathIndex--; // First, move to the previous segment.
                // Then, add the cost of the segment we have just arrived at.
                totalAccumulatedScore += pathSegmentValues[currentPathIndex];
            }
        }
    }

    // Output the final accumulated score modulo the defined constant.
    console.log(totalAccumulatedScore % RESULT_MODULO);

} catch (error) {
    // Catch any errors that occurred during file reading or parsing.
    console.error("An error occurred during script execution:", error.message);
    process.exit(1); // Exit with an error code to indicate failure.
}