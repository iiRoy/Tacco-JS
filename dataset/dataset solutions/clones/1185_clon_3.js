// This module defines a class for a rotatable numbered block and handles
// processing command-line input to simulate its rotations, finally
// reporting the value on its top face.

"use strict"; // Ensures code runs in strict mode for improved quality.

/**
 * Represents a six-sided block, each face displaying a unique number.
 * The internal `faceVals` array maintains the state of the block's faces.
 *
 * Face Index Mapping:
 *
 *       +-----+
 *       |  0  | (Top surface)
 *    +--+-----+-----+--+
 *    | 3|  1  |  2  | 4| (Left, Front, Right, Back surfaces)
 *    +--+-----+-----+--+
 *       |  5  | (Bottom surface)
 *       +-----+
 *
 * This visual representation aids in understanding the rotation logic.
 */
class NumberedBlock {
    /**
     * Constructs a new NumberedBlock instance.
     * @param {number[]} initialValues - An array containing six integers,
     *                                   representing the starting values for each face.
     *                                   Order corresponds to the face index mapping.
     */
    constructor(initialValues) {
        // Enforce input validity for initial face values.
        if (!Array.isArray(initialValues) || initialValues.length !== 6 || initialValues.some(val => typeof val !== 'number' || !Number.isInteger(val))) {
            console.error("Initialization Error: Expected an array of 6 integers for face values.");
            // Fallback to a default arrangement or throw to halt execution.
            this.faceVals = [1, 2, 3, 4, 5, 6]; // Default cube state
            return;
        }
        // Create a shallow copy to prevent external modification of the internal state.
        this.faceVals = Array.from(initialValues);
    }

    /**
     * Internal utility method to normalize rotation steps.
     * Ensures rotation steps are a positive integer within the range [0, 3].
     * @param {number} rawSteps - The number of steps for rotation (can be negative).
     * @returns {number} The normalized, positive rotation steps.
     */
    #normalizeRotationSteps(rawSteps) {
        let normalized = rawSteps % 4;
        // Adjust negative results from modulo to be positive.
        if (normalized < 0) {
            normalized += 4;
        }
        return normalized;
    }

    /**
     * Rotates the block along its vertical (North-South) axis.
     * This affects the Top, Front, Bottom, and Back faces.
     * @param {number} rotationAmount - Number of rotations. Positive for 'North' (forward), negative for 'South' (backward).
     */
    shiftVerticalFaces(rotationAmount) {
        const effectiveRotations = this.#normalizeRotationSteps(rotationAmount);
        if (effectiveRotations === 0) {
            return; // No actual rotation needed.
        }

        // Indices directly involved in a vertical rotation.
        const verticalFaceOrder = [0, 1, 5, 4]; // Top, Front, Bottom, Back
        const cachedFaceValues = new Array(4);

        // Store the current values of the affected faces to avoid overwriting during rotation.
        for (let i = 0; i < 4; i++) {
            cachedFaceValues[i] = this.faceVals[verticalFaceOrder[i]];
        }

        // Apply the rotation by assigning cached values to new positions.
        for (let i = 0; i < 4; i++) {
            // Calculate the source index in the cached array based on rotation.
            const sourceValueIdx = (i + effectiveRotations) % 4;
            this.faceVals[verticalFaceOrder[i]] = cachedFaceValues[sourceValueIdx];
        }
    }

    /**
     * Rotates the block along its horizontal (West-East) axis.
     * This affects the Top, Right, Bottom, and Left faces.
     * @param {number} rotationSteps - Number of rotations. Positive for 'West' (right), negative for 'East' (left).
     */
    shiftHorizontalFaces(rotationSteps) {
        const actualSteps = this.#normalizeRotationSteps(rotationSteps);
        if (actualSteps === 0) {
            return; // No operation if rotation is zero.
        }

        // Indices for faces affected by horizontal rotation.
        const horizontalFaceOrder = [0, 2, 5, 3]; // Top, Right, Bottom, Left
        // Extract current values from the affected faces.
        const valuesToShift = horizontalFaceOrder.map(idx => this.faceVals[idx]);

        // Reassign values to simulate the rotation.
        for (let i = 0; i < 4; i++) {
            const targetFaceIndex = horizontalFaceOrder[i];
            // Determine which value from `valuesToShift` moves to the current target face.
            const sourceIndex = (i + actualSteps) % 4;
            this.faceVals[targetFaceIndex] = valuesToShift[sourceIndex];
        }
    }
}

// --- Main Program Execution Flow ---

// Utilize a Promise to manage asynchronous standard input/output operations.
new Promise((fulfillOperation, failOperation) => {
    let collectedInput = ""; // Buffer to accumulate all incoming data.
    const stdInputSource = process.stdin;

    // Event handler for data chunks received from stdin.
    stdInputSource.on("data", (dataSegment) => {
        collectedInput += dataSegment.toString(); // Convert Buffer to string and append.
    });

    // Event handler for end of stdin stream.
    stdInputSource.on("end", () => {
        fulfillOperation([collectedInput, process.stdout]); // Resolve with input string and stdout stream.
    });

    // Error handling for stdin stream.
    stdInputSource.on("error", (inputError) => {
        console.error("An error occurred during standard input reading:", inputError);
        failOperation(inputError); // Reject the promise on input error.
    });

})
.then(([fullInputString, outputChannel]) => {
    // Process the received input data.
    const inputLines = fullInputString.trim().split("\n");

    // Validate minimum number of input lines.
    if (inputLines.length < 2) {
        console.error("Input format error: Expected at least two lines of input.");
        outputChannel.write("Execution Aborted: Insufficient input.\n");
        return; // Exit processing.
    }

    const initialFaceValuesLine = inputLines[0];
    const movementCommandSequence = inputLines[1];

    // Define a utility function to parse space-separated numbers safely.
    const parseIntegerArray = (numericString) => {
        return numericString.split(" ").map(segment => {
            const parsedNum = parseInt(segment, 10); // Always specify radix.
            if (isNaN(parsedNum)) {
                throw new Error(`Non-numeric value detected: '${segment}'`);
            }
            return parsedNum;
        });
    };

    let startingBlockValues;
    try {
        startingBlockValues = parseIntegerArray(initialFaceValuesLine);
    } catch (parsingErr) {
        console.error("Data parsing failure for initial values:", parsingErr.message);
        outputChannel.write("Execution Aborted: Malformed initial block data.\n");
        return; // Exit due to bad input.
    }

    // Instantiate our custom numbered block.
    const blockSimulator = new NumberedBlock(startingBlockValues);

    // Map command characters to their respective rotation methods.
    const commandToFunctionMap = {
        "N": () => blockSimulator.shiftVerticalFaces(1),
        "S": () => blockSimulator.shiftVerticalFaces(-1),
        "W": () => blockSimulator.shiftHorizontalFaces(1),
        "E": () => blockSimulator.shiftHorizontalFaces(-1),
    };

    // Iterate through each command in the sequence and apply rotations.
    for (const singleCommand of movementCommandSequence) {
        const executeRotation = commandToFunctionMap[singleCommand];
        if (executeRotation) {
            executeRotation(); // Perform the rotation.
        } else {
            // Log a warning for unrecognized commands but continue processing.
            console.warn(`Unrecognized command character '${singleCommand}' encountered. Skipping.`);
        }
    }

    // Retrieve the final value on the top face (index 0).
    const resultantTopFaceValue = blockSimulator.faceVals[0];
    // Construct the output message using string concatenation.
    const finalOutputMessage = "The top face value is: " + String(resultantTopFaceValue) + "\n";

    // Write the final result to the standard output stream.
    outputChannel.write(finalOutputMessage);
})
.catch((processingError) => {
    // Catch any errors that occur during the promise chain execution.
    console.error("An unexpected error halted the program:", processingError);
    process.stdout.write("An unrecoverable error occurred during processing.\n");
});