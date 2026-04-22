"use strict"; // Enforce strict parsing and error handling for cleaner code.

/**
 * A sophisticated simulator for a six-sided spatial object, akin to a standard die.
 * It manages the values displayed on each face and provides methods for precise
 * rotational manipulation to achieve specific orientations.
 *
 * The internal indexing of the faces is conceptualized for clarity:
 *
 *       +---+
 *       | 0 | (Top face)
 *   +---+---+---+---+
 *   | 3 | 1 | 2 | 4 | (Left, Front, Right, Back faces, respectively)
 *   +---+---+---+---+
 *       | 5 | (Bottom face)
 *       +---+
 *
 * Rotations are performed relative to these fixed indices, allowing for
 * a consistent and predictable state management.
 */
class SpatialObject {
    /**
     * Constructs a new SpatialObject instance with a predefined set of values
     * for its six faces.
     *
     * @param {Array<string>} initialFaceValues - An array containing exactly six string values,
     *                                            each representing the value on a corresponding face index.
     * @throws {Error} If the provided array is not valid (e.g., not an array, incorrect length).
     */
    constructor(initialFaceValues) {
        // Validate the input to ensure it meets the expected structure.
        if (!Array.isArray(initialFaceValues) || initialFaceValues.length !== 6) {
            throw new Error("SpatialObject initialization requires an array of exactly six face values.");
        }

        // Store a deep copy of the initial face configuration to prevent external modification.
        this.faceArrangement = [...initialFaceValues];

        // An optional internal identifier for debugging or tracking instances.
        this.instanceIdentifier = `SO-${Math.random().toString(36).substring(2, 8)}`;
    }

    /**
     * Adjusts the orientation of the spatial object so that a specified value
     * is on the top face (index 0) and another specified value is on the front face (index 1).
     * This involves a sequence of specific rotations.
     *
     * @param {string} desiredTopValue - The value that should ultimately be on the top face.
     * @param {string} desiredFrontValue - The value that should ultimately be on the front face.
     * @returns {void}
     * @throws {Error} If either of the desired values cannot be found on the object's faces.
     */
    alignFaces(desiredTopValue, desiredFrontValue) {
        const currentTopFaceIndex = this.faceArrangement.indexOf(desiredTopValue);

        // Pre-check for existence of desired values to prevent unnecessary operations or infinite loops.
        if (currentTopFaceIndex === -1) {
            throw new Error(`The value '${desiredTopValue}' designated for the top face is not present on this object.`);
        }
        if (this.faceArrangement.indexOf(desiredFrontValue) === -1) {
            throw new Error(`The value '${desiredFrontValue}' designated for the front face is not present on this object.`);
        }

        // First, rotate the entire object to bring the `desiredTopValue` to the actual top (index 0).
        // The rotation needed depends on the current position of the `desiredTopValue`.
        // This is a direct mapping from current face index to the required rotation.
        switch (currentTopFaceIndex) {
            case 1: // If it's currently front, rotate around N-S axis (pitch) by 1 step.
                this.rotateNorthSouth(1);
                break;
            case 2: // If it's currently right, rotate around W-E axis (roll) by 1 step.
                this.rotateWestEast(1);
                break;
            case 3: // If it's currently left, rotate around W-E axis (roll) by -1 step.
                this.rotateWestEast(-1);
                break;
            case 4: // If it's currently back, rotate around N-S axis (pitch) by -1 step.
                this.rotateNorthSouth(-1);
                break;
            case 5: // If it's currently bottom, rotate around N-S axis (pitch) by 2 steps.
                this.rotateNorthSouth(2);
                break;
            case 0: // Already on top, no initial adjustment required.
            default:
                // No action needed for default or already-on-top cases.
                break;
        }

        // After the initial adjustment, the `desiredTopValue` is guaranteed to be at index 0.
        // Next, rotate the object around its vertical axis (yaw) until `desiredFrontValue` is at index 1.
        // This process requires at most 4 rotations (0 to 3 clockwise rotations).
        let currentRotationCount = 0;
        const MAXIMUM_ADJUSTMENT_ROTATIONS = 4; // Safeguard against logical errors or infinite loops.

        while (this.faceArrangement[1] !== desiredFrontValue && currentRotationCount < MAXIMUM_ADJUSTMENT_ROTATIONS) {
            this.rotateSides(1); // Perform a single clockwise rotation of the side faces.
            currentRotationCount++;
        }

        // Optional: Log a warning if the front face couldn't be aligned, which might indicate
        // an issue with the input values or an unexpected state.
        if (this.faceArrangement[1] !== desiredFrontValue) {
            console.warn(`[${this.instanceIdentifier}] Failed to fully align front face. Desired: '${desiredFrontValue}', Actual: '${this.faceArrangement[1]}'.`);
        }
    }

    /**
     * Performs a rotation of the four "side" faces (Front, Right, Back, Left)
     * around the Top-Bottom axis. The Top (0) and Bottom (5) faces remain static.
     *
     * @param {number} rotationQuantity - The number of 90-degree steps to rotate.
     *                                    Positive values indicate clockwise rotation when viewed from top.
     * @returns {void}
     */
    rotateSides(rotationQuantity) {
        // Normalize rotation quantity to a positive value between 0 and 3.
        const effectiveRotationSteps = (rotationQuantity % 4 + 4) % 4;
        if (effectiveRotationSteps === 0) return; // No actual rotation needed.

        // Define the indices of the faces involved in this rotation.
        // Order: Front, Right, Back, Left.
        const affectedFaceIndices = [1, 2, 4, 3];
        const temporaryFaceValues = new Array(4); // Buffer to hold values during rotation.

        // Collect the values from their *source* positions after the rotation.
        for (let i = 0; i < 4; i++) {
            // Calculate the index in `affectedFaceIndices` from which the value for the
            // current target position `i` should originate.
            // (i - effectiveRotationSteps + 4) % 4 ensures a positive modulus result.
            const sourceIndexInAffectedFaces = (i - effectiveRotationSteps + 4) % 4;
            const sourceFaceActualIndex = affectedFaceIndices[sourceIndexInAffectedFaces];
            temporaryFaceValues[i] = this.faceArrangement[sourceFaceActualIndex];
        }

        // Apply the buffered values back to their new positions in the main arrangement.
        for (let i = 0; i < 4; i++) {
            this.faceArrangement[affectedFaceIndices[i]] = temporaryFaceValues[i];
        }
    }

    /**
     * Rotates the spatial object around its North-South axis (pitch).
     * This affects the Top, Front, Bottom, and Back faces (indices 0, 1, 5, 4).
     * The Left (3) and Right (2) faces remain stationary.
     *
     * @param {number} rotationQuantity - Number of 90-degree steps. Positive values rotate the front face upwards.
     * @returns {void}
     */
    rotateNorthSouth(rotationQuantity) {
        const effectiveRotationSteps = (rotationQuantity % 4 + 4) % 4;
        if (effectiveRotationSteps === 0) return;

        // Order: Top, Front, Bottom, Back.
        const affectedFaceIndices = [0, 1, 5, 4];
        const temporaryFaceValues = new Array(4);

        for (let i = 0; i < 4; i++) {
            const sourceIndexInAffectedFaces = (i - effectiveRotationSteps + 4) % 4;
            const sourceFaceActualIndex = affectedFaceIndices[sourceIndexInAffectedFaces];
            temporaryFaceValues[i] = this.faceArrangement[sourceFaceActualIndex];
        }

        for (let i = 0; i < 4; i++) {
            this.faceArrangement[affectedFaceIndices[i]] = temporaryFaceValues[i];
        }
    }

    /**
     * Rotates the spatial object around its West-East axis (roll).
     * This affects the Top, Right, Bottom, and Left faces (indices 0, 2, 5, 3).
     * The Front (1) and Back (4) faces remain stationary.
     *
     * @param {number} rotationQuantity - Number of 90-degree steps. Positive values rotate the right face upwards.
     * @returns {void}
     */
    rotateWestEast(rotationQuantity) {
        const effectiveRotationSteps = (rotationQuantity % 4 + 4) % 4;
        if (effectiveRotationSteps === 0) return;

        // Order: Top, Right, Bottom, Left.
        const affectedFaceIndices = [0, 2, 5, 3];
        const temporaryFaceValues = new Array(4);

        for (let i = 0; i < 4; i++) {
            const sourceIndexInAffectedFaces = (i - effectiveRotationSteps + 4) % 4;
            const sourceFaceActualIndex = affectedFaceIndices[sourceIndexInAffectedFaces];
            temporaryFaceValues[i] = this.faceArrangement[sourceFaceActualIndex];
        }

        for (let i = 0; i < 4; i++) {
            this.faceArrangement[affectedFaceIndices[i]] = temporaryFaceValues[i];
        }
    }

    /**
     * Provides a snapshot of the current arrangement of values on the spatial object's faces.
     *
     * @returns {Array<string>} A new array containing the current face values,
     *                          ensuring the internal state cannot be modified externally.
     */
    getCurrentArrangement() {
        return [...this.faceArrangement];
    }
}

/**
 * Initiates the primary application flow, handling asynchronous input/output operations.
 * It reads configuration and query data from standard input, processes each query
 * using the SpatialObject, and writes the results to standard output.
 */
new Promise((onSuccess, onFailure) => {
    let receivedInputContent = "";
    // Attach event listeners to the standard input stream.
    process.stdin.on("data", (dataChunk) => {
        receivedInputContent += dataChunk; // Accumulate all incoming data.
    });
    process.stdin.on("end", () => {
        // Once the input stream ends, resolve the promise with the full content and stdout stream.
        onSuccess([receivedInputContent, process.stdout]);
    });
    process.stdin.on("error", (err) => {
        // If an error occurs during input, reject the promise.
        onFailure(new Error(`Failed to read from standard input: ${err.message}`));
    });
})
.then(([fullInputString, outputStreamHandle]) => {
    // Process the collected input string.
    const inputLines = fullInputString.trim().split("\n");

    // Extract the initial face values and the number of subsequent queries.
    const initialConfigurationLine = inputLines[0];
    const numberOfQueriesString = inputLines[1];
    const queryInstructionLines = inputLines.slice(2);

    // Validate and parse the number of queries.
    const numQueries = Number.parseInt(numberOfQueriesString, 10);
    if (isNaN(numQueries) || numQueries < 0) {
        throw new Error(`Invalid or missing number of queries provided: '${numberOfQueriesString}'.`);
    }

    // Initialize the SpatialObject with the first line of input.
    const parsedInitialFaces = initialConfigurationLine.split(" ");
    const cubeSimulator = new SpatialObject(parsedInitialFaces);

    // Iterate through each query line and process it.
    for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        const currentQueryLine = queryInstructionLines[queryIdx];

        // Guard against fewer queries than expected.
        if (!currentQueryLine) {
            console.warn(`[Application] Expected ${numQueries} queries, but only ${queryIdx} valid lines were found.`);
            break;
        }

        const queryParameters = currentQueryLine.split(" ");
        // Validate the format of each query line.
        if (queryParameters.length !== 2) {
            console.warn(`[Application] Skipping malformed query line (expected 2 values): '${currentQueryLine}'.`);
            outputStreamHandle.write("ERROR_MALFORMED_QUERY\n"); // Indicate error in output.
            continue;
        }

        const [targetTopFace, targetFrontFace] = queryParameters;

        try {
            // Attempt to align the cube according to the current query.
            cubeSimulator.alignFaces(targetTopFace, targetFrontFace);
            // Write the value of the 'right' face (index 2) to standard output.
            outputStreamHandle.write(`${cubeSimulator.faceArrangement[2]}\n`);
        } catch (processingError) {
            // Catch and report errors specific to a query's processing.
            console.error(`[Application] Error during query '${currentQueryLine}': ${processingError.message}`);
            outputStreamHandle.write("QUERY_PROCESSING_ERROR\n"); // Indicate error in output.
        }
    }
})
.catch((overallExecutionError) => {
    // Catch any unhandled errors from the entire promise chain (e.g., input stream errors,
    // initial object creation errors, or errors not caught per-query).
    console.error("[Application] A critical error occurred during execution:", overallExecutionError.message);
    process.exit(1); // Exit with a non-zero code to signal an application failure.
});