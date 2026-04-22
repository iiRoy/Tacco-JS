// Function to update the orientation of a six-sided cube based on a directional command.
// The cube faces are represented as an array: [top, front, right, left, back, bottom].
function adjustOrientation(moveInstruction, currentDiceFaces) {
    // Basic validation for the input array structure to ensure expected format.
    if (!Array.isArray(currentDiceFaces) || currentDiceFaces.length !== 6) {
        console.error("Invalid cube face configuration provided. Expected an array of 6 elements.");
        // In case of invalid input, return a copy of the original state or throw an error.
        // Returning a copy here to prevent further issues and allow execution to continue.
        return [...currentDiceFaces];
    }

    // Destructure the current face values into named constants for better readability.
    const [
        topFaceValue,    // Represents the value on the top face (index 0)
        frontFaceValue,  // Represents the value on the front face (index 1)
        rightFaceValue,  // Represents the value on the right face (index 2)
        leftFaceValue,   // Represents the value on the left face (index 3)
        backFaceValue,   // Represents the value on the back face (index 4)
        bottomFaceValue  // Represents the value on the bottom face (index 5)
    ] = currentDiceFaces;

    let newDiceFaces = []; // This array will hold the cube's state after the rotation.

    // Use a switch statement for clear and efficient handling of different movement commands.
    switch (moveInstruction) {
        case "N": // Northward rotation: Top moves to Front, Front to Bottom, Bottom to Back, Back to Top.
            newDiceFaces = [frontFaceValue, bottomFaceValue, rightFaceValue, leftFaceValue, topFaceValue, backFaceValue];
            break;
        case "S": // Southward rotation: Top moves to Back, Front to Top, Bottom to Front, Back to Bottom.
            newDiceFaces = [backFaceValue, topFaceValue, rightFaceValue, leftFaceValue, bottomFaceValue, frontFaceValue];
            break;
        case "E": // Eastward rotation: Top moves to Right, Right to Bottom, Bottom to Left, Left to Top.
            newDiceFaces = [leftFaceValue, frontFaceValue, topFaceValue, bottomFaceValue, backFaceValue, rightFaceValue];
            break;
        case "W": // Westward rotation: Top moves to Left, Left to Bottom, Bottom to Right, Right to Top.
            newDiceFaces = [rightFaceValue, frontFaceValue, bottomFaceValue, topFaceValue, backFaceValue, leftFaceValue];
            break;
        default:
            // Log a warning for unrecognized commands and return the current state unchanged.
            console.warn(`Unknown movement command: '${moveInstruction}'. Cube orientation remains unchanged.`);
            return [...currentDiceFaces]; // Return a copy of the original state.
    }

    return newDiceFaces;
}

// Helper function to parse target coordinates (top and front face values) from a text line.
const parseTargetCoordinates = (lineContent) => {
    const parts = lineContent.split(" "); // Split the line by space.
    if (parts.length < 2) {
        // Log an error if the line format is invalid and return NaN for coordinates.
        console.error(`Invalid line format for target coordinates: "${lineContent}"`);
        return { targetTop: NaN, targetFront: NaN };
    }
    // Convert string parts to numbers.
    return {
        targetTop: Number(parts[0]),
        targetFront: Number(parts[1])
    };
};

// Helper function to determine if the current cube configuration matches the desired target state.
const isTargetStateReached = (currentConfig, expectedTop, expectedFront) => {
    // Ensure both target values are valid numbers before comparison.
    if (isNaN(expectedTop) || isNaN(expectedFront)) {
        return false; // Cannot match if target is undefined or invalid.
    }
    // Check if the top face (index 0) and front face (index 1) match the expected values.
    return currentConfig[0] === expectedTop && currentConfig[1] === expectedFront;
};

// Helper function to randomly select a direction from a given array of options.
const pickRandomDirection = (availableDirections) => {
    const randomIndex = Math.floor(Math.random() * availableDirections.length);
    return availableDirections[randomIndex];
};


// --- Main Program Execution Flow ---

// Explicitly import the 'fs' module for file system operations.
const fsModule = require('fs');
// Define the standard input file path, common in competitive programming.
const inputFilePath = '/dev/stdin';

let rawFileContent = '';
try {
    // Attempt to read the entire content of the input file synchronously.
    rawFileContent = fsModule.readFileSync(inputFilePath, 'utf8');
} catch (readError) {
    // Handle potential errors during file reading.
    console.error(`Failed to read input file at "${inputFilePath}": ${readError.message}`);
    process.exit(1); // Terminate the program if input cannot be read.
}

// Process the raw input content by trimming whitespace and splitting into an array of lines.
const allInputLines = rawFileContent.trim().split("\n");

// Initialize the cube's starting configuration from the first line of input.
let initialDiceState;
try {
    // Parse the first line, splitting by space and converting to numbers.
    initialDiceState = allInputLines[0].split(" ").map(Number);
    // Validate the parsed initial state to ensure it's a 6-element array of numbers.
    if (initialDiceState.length !== 6 || initialDiceState.some(isNaN)) {
        throw new Error("Initial dice state line is malformed or incomplete or contains non-numeric values.");
    }
} catch (parseError) {
    console.error(`Error parsing initial dice state: ${parseError.message}`);
    process.exit(1); // Exit if the initial state is invalid.
}

// Define the set of possible cardinal movement commands for the cube.
const cardinalMovementOptions = ["N", "S", "E", "W"];

// The original logic skipped the first three lines (initial dice state and two subsequent lines).
// We use slice(3) to get only the lines containing target specifications.
const actualTargetLines = allInputLines.slice(2); // Skips line 0 (dice state), line 1, and starts from line 2

// Create a mutable copy of the initial dice state for current operations.
let currentDiceConfiguration = [...initialDiceState];

// Iterate through each line that specifies a target cube configuration.
actualTargetLines.forEach((targetSpecificationLine, index) => {
    // Skip any empty lines to prevent parsing errors.
    if (!targetSpecificationLine.trim()) {
        console.warn(`Skipping empty line at target specification index ${index}.`);
        return; // Move to the next line.
    }

    // Parse the top and front face values for the current target.
    const { targetTop, targetFront } = parseTargetCoordinates(targetSpecificationLine);

    // Validate the parsed target coordinates.
    if (isNaN(targetTop) || isNaN(targetFront)) {
        console.error(`Skipping invalid target coordinates on target line ${index}: "${targetSpecificationLine}"`);
        return; // Move to the next line if targets are invalid.
    }

    let rotationAttemptCount = 0; // Counter for rotations performed for the current target.
    const maxRotationAttempts = 100000; // Define a safeguard limit for rotations.

    // Continuously rotate the cube until its top and front faces match the target values.
    while (!isTargetStateReached(currentDiceConfiguration, targetTop, targetFront)) {
        // Randomly select a direction for the next rotation.
        const chosenDirection = pickRandomDirection(cardinalMovementOptions);
        // Apply the rotation and update the cube's configuration.
        currentDiceConfiguration = adjustOrientation(chosenDirection, currentDiceConfiguration);
        rotationAttemptCount++;

        // Implement a safeguard to prevent infinite loops, especially for impossible targets.
        if (rotationAttemptCount > maxRotationAttempts) {
            console.error(`Exceeded maximum rotation attempts (${maxRotationAttempts}) for target [${targetTop}, ${targetFront}]. This target might be impossible to reach or indicates a logic error.`);
            break; // Exit the while loop to prevent hanging.
        }
    }

    // After reaching the target state (or hitting the rotation limit),
    // output the value of the right face (which is at index 2 in our array representation).
    console.log(currentDiceConfiguration[2]);
});