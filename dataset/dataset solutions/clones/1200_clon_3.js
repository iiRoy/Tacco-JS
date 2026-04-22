"use strict";

// This class represents a six-sided block, similar to a die,
// with distinct numerical values on each of its faces.
// The internal indexing for the faces is based on a standard net layout:
//
//       +---+
//       | 0 | (Top face)
//   +---+---+---+---+
//   | 3 | 1 | 2 | 4 | (Left, Front, Right, Back faces, respectively)
//   +---+---+---+---+
//       | 5 | (Bottom face)
//       +---+
//
// Rotational operations on the block will consistently update these face positions.
class OrientableBlock {
    /**
     * Constructs a new OrientableBlock instance.
     * It takes an array of values to assign to its six faces.
     * @param {number[]} initialFaceValues - An array of 6 numbers representing the values
     *                                       on the Top, Front, Right, Back, Left, and Bottom faces.
     * @throws {Error} If the provided array is not valid or does not contain enough values.
     */
    constructor(initialFaceValues) {
        // Input validation: ensure a proper array is provided.
        if (!Array.isArray(initialFaceValues) || initialFaceValues.length < 6) {
            console.error("Debug: Invalid input for OrientableBlock constructor:", initialFaceValues);
            throw new Error("Initial face values must be an array containing at least 6 numeric elements.");
        }
        // Store a deep copy of the first 6 values to prevent external modification.
        this.currentConfiguration = initialFaceValues.slice(0, 6);
    }

    /**
     * Reorients the block so that a specified value is on the top face (index 0)
     * and another specified value is on the front face (index 1).
     * @param {number} desiredTopValue - The numeric value to be placed on the top face.
     * @param {number} desiredFrontValue - The numeric value to be placed on the front face.
     * @returns {boolean} - True if the block was successfully aligned, false otherwise
     *                      (e.g., if a desired value is not found on any face).
     */
    alignFaces(desiredTopValue, desiredFrontValue) {
        let currentTopFaceIndex = this.currentConfiguration.indexOf(desiredTopValue);

        // Pre-check: If the desired top value is not on any face, alignment is impossible.
        if (currentTopFaceIndex === -1) {
            return false;
        }

        // Perform initial rotations to bring the `desiredTopValue` to the top face (index 0).
        // This logic mirrors the original 'fix' method's switch-case.
        switch (currentTopFaceIndex) {
            case 1: this._rotateNorthSouth(1); break;   // Front becomes Top
            case 2: this._rotateWestEast(1); break;     // Right becomes Top
            case 3: this._rotateWestEast(-1); break;    // Left becomes Top
            case 4: this._rotateNorthSouth(-1); break;  // Back becomes Top
            case 5: this._rotateNorthSouth(2); break;   // Bottom becomes Top
            case 0: /* Value is already on top, no primary rotation needed. */ break;
            default:
                // This case should ideally not be reached if currentTopFaceIndex is valid.
                // It indicates an unexpected state.
                return false;
        }

        // With the correct value on top, now rotate horizontally until `desiredFrontValue` is front.
        let attemptsToOrientFront = 0;
        const MAXIMUM_FRONT_ORIENTATIONS = 4; // A cube has 4 possible front faces for a fixed top.

        while (attemptsToOrientFront < MAXIMUM_FRONT_ORIENTATIONS) {
            // Check if the front face (index 1) currently holds the desired value.
            if (this.currentConfiguration[1] === desiredFrontValue) {
                return true; // Both top and front are correctly aligned.
            }
            this._rotateHorizontal(1); // Rotate block 90 degrees clockwise horizontally.
            attemptsToOrientFront++;
        }

        // If the loop finishes, it means the desired front value could not be found,
        // even after exhausting all 4 horizontal orientations.
        return false;
    }

    /**
     * Rotates the block around its vertical axis (passing through the top and bottom faces).
     * This affects the four side faces: Front, Right, Back, Left.
     * @param {number} numberOfSteps - The number of 90-degree rotations. Positive for clockwise, negative for counter-clockwise.
     */
    _rotateHorizontal(numberOfSteps) {
        // Normalize rotation steps to be within [0, 3] to simplify calculations.
        const effectiveSteps = (numberOfSteps % 4 + 4) % 4;
        if (effectiveSteps === 0) return; // No actual rotation needed.

        // Indices of the faces involved in horizontal rotation: Front, Right, Back, Left.
        const horizontalFacesIndices = [1, 2, 4, 3];
        const temporaryFaceValues = new Array(4);

        // Capture current values of the affected faces into a temporary array.
        for (let j = 0; j < 4; j++) {
            temporaryFaceValues[j] = this.currentConfiguration[horizontalFacesIndices[j]];
        }

        // Assign values back to their new rotated positions.
        // The value at `j` moves to `(j + effectiveSteps) % 4` in the `affectedIndices` order.
        for (let j = 0; j < 4; j++) {
            const sourcePosition = (j - effectiveSteps + 4) % 4; // Calculate where the value *came from*.
            this.currentConfiguration[horizontalFacesIndices[j]] = temporaryFaceValues[sourcePosition];
        }
    }

    /**
     * Rotates the block along its North-South axis (passing through the front and back faces).
     * This affects the Top, Front, Bottom, and Back faces.
     * @param {number} numberOfSteps - The number of 90-degree rotations.
     */
    _rotateNorthSouth(numberOfSteps) {
        const effectiveSteps = (numberOfSteps % 4 + 4) % 4;
        if (effectiveSteps === 0) return;

        // Indices of faces involved: Top, Front, Bottom, Back.
        const northSouthFacesIndices = [0, 1, 5, 4];
        const temporaryFaceValues = new Array(4);

        for (let j = 0; j < 4; j++) {
            temporaryFaceValues[j] = this.currentConfiguration[northSouthFacesIndices[j]];
        }

        for (let j = 0; j < 4; j++) {
            const sourcePosition = (j - effectiveSteps + 4) % 4;
            this.currentConfiguration[northSouthFacesIndices[j]] = temporaryFaceValues[sourcePosition];
        }
    }

    /**
     * Rotates the block along its West-East axis (passing through the left and right faces).
     * This affects the Top, Right, Bottom, and Left faces.
     * @param {number} numberOfSteps - The number of 90-degree rotations.
     */
    _rotateWestEast(numberOfSteps) {
        const effectiveSteps = (numberOfSteps % 4 + 4) % 4;
        if (effectiveSteps === 0) return;

        // Indices of faces involved: Top, Right, Bottom, Left.
        const westEastFacesIndices = [0, 2, 5, 3];
        const temporaryFaceValues = new Array(4);

        for (let j = 0; j < 4; j++) {
            temporaryFaceValues[j] = this.currentConfiguration[westEastFacesIndices[j]];
        }

        for (let j = 0; j < 4; j++) {
            const sourcePosition = (j - effectiveSteps + 4) % 4;
            this.currentConfiguration[westEastFacesIndices[j]] = temporaryFaceValues[sourcePosition];
        }
    }

    /**
     * Determines if this OrientableBlock is congruent (can be rotated to match)
     * another OrientableBlock. It checks all 24 possible orientations.
     * @param {OrientableBlock} otherBlock - The other block to compare against.
     * @returns {boolean} - True if the blocks are congruent, false otherwise.
     */
    isCongruent(otherBlock) {
        // Helper function to perform a direct element-by-element comparison of two face arrays.
        const checkFaceConfigurationMatch = (configA, configB) => {
            if (configA.length !== configB.length) return false;
            let currentIdx = 0;
            while (currentIdx < configA.length) {
                if (configA[currentIdx] !== configB[currentIdx]) {
                    return false;
                }
                currentIdx++;
            }
            return true;
        };

        // Create a working copy of the current block to perform rotations without modifying 'this'.
        const workingCopyOfThisBlock = new OrientableBlock(this.currentConfiguration);

        let nsRotationCycleCount = 0;
        const TOTAL_NS_ROTATION_CYCLES = 4; // Covers 4 initial top face possibilities (e.g., 0, 1, 5, 4)

        // The sequence of rotations is designed to systematically explore all 24 unique orientations.
        // This specific pattern was present in the original code and is mathematically sound.
        while (nsRotationCycleCount < TOTAL_NS_ROTATION_CYCLES) {
            // 1. Check the block in its current orientation.
            if (checkFaceConfigurationMatch(workingCopyOfThisBlock.currentConfiguration, otherBlock.currentConfiguration)) {
                return true;
            }

            // 2. Rotate North-South once to present a new face as 'top'.
            // This is part of the strategy to cycle through different primary top faces.
            workingCopyOfThisBlock._rotateNorthSouth(1);

            let horizontalRotationCount = 0;
            const MAX_HORIZONTAL_ROTATIONS = 4; // For each top face, there are 4 front face possibilities.

            // 3. For the current top face, check all 4 horizontal orientations.
            while (horizontalRotationCount < MAX_HORIZONTAL_ROTATIONS) {
                if (checkFaceConfigurationMatch(workingCopyOfThisBlock.currentConfiguration, otherBlock.currentConfiguration)) {
                    return true;
                }
                workingCopyOfThisBlock._rotateHorizontal(1); // Rotate horizontally.
                horizontalRotationCount++;
            }

            // 4. After completing horizontal checks for a given NS rotation:
            //    Undo the last NS rotation. This helps in systematically advancing the overall state.
            workingCopyOfThisBlock._rotateNorthSouth(-1);
            //    Apply an additional horizontal rotation. This is a crucial step in the original
            //    algorithm's efficient traversal of orientations.
            workingCopyOfThisBlock._rotateHorizontal(1);

            nsRotationCycleCount++;
        }

        // The above loop covers a significant portion of orientations.
        // The original algorithm then makes one final adjustment to check the opposite initial top face.
        // For example, if the initial top was index 0, this brings index 5 to the top.
        workingCopyOfThisBlock._rotateNorthSouth(2); // Rotate N-S twice (e.g., top 0 becomes bottom 5, bottom 5 becomes top 0)

        // Check all 4 horizontal rotations for this final top face configuration.
        let finalHorizontalCheckIndex = 0;
        while (finalHorizontalCheckIndex < MAX_HORIZONTAL_ROTATIONS) {
            if (checkFaceConfigurationMatch(workingCopyOfThisBlock.currentConfiguration, otherBlock.currentConfiguration)) {
                return true;
            }
            workingCopyOfThisBlock._rotateHorizontal(1);
            finalHorizontalCheckIndex++;
        }

        // If no match was found after checking all 24 orientations, the blocks are not congruent.
        return false;
    }
}


// Asynchronous main execution block to handle input/output operations.
// This structure replaces the traditional Promise chain for better readability.
(async () => {
    let collectedInputData = "";
    // Event listener to accumulate all data received from standard input.
    process.stdin.on("data", (dataChunk) => {
        collectedInputData += dataChunk;
    });

    // Wait for the 'end' event of the standard input stream, indicating all data has been received.
    await new Promise((resolve) => process.stdin.on("end", resolve));

    // Process the raw input data:
    // 1. Remove any leading/trailing whitespace (like a final newline).
    // 2. Split into individual lines.
    // 3. Filter out any empty lines that might result from splitting.
    // 4. For each line, split by space and convert each part to an integer with base 10.
    const parsedNumericLines = collectedInputData
        .trim()
        .split("\n")
        .filter(line => line.length > 0)
        .map((line) => line.split(" ").map((valueString) => parseInt(valueString, 10)));

    // The first line contains a single number: the total count of blocks (dice).
    const [totalBlockCount] = parsedNumericLines[0];

    // Input validation: ensure the block count is a valid non-negative number.
    if (isNaN(totalBlockCount) || totalBlockCount < 0) {
        process.stdout.write("Error: The specified number of blocks is invalid.\n");
        return; // Exit early due to bad input.
    }

    // Create an array of OrientableBlock objects from the subsequent input lines.
    // `slice(1, totalBlockCount + 1)` correctly extracts the data for `totalBlockCount` blocks.
    const blockCollection = parsedNumericLines
        .slice(1, totalBlockCount + 1)
        .map((faceValuesArray) => new OrientableBlock(faceValuesArray));

    // Flag to track if any congruent blocks are found.
    let hasCongruentBlocksFound = false;

    // Iterate through all unique pairs of blocks to check for congruence.
    let currentOuterBlockIndex = 0;
    while (currentOuterBlockIndex < blockCollection.length) {
        let currentInnerBlockIndex = currentOuterBlockIndex + 1; // Start from the next block to avoid self-comparison and duplicate pairs.
        while (currentInnerBlockIndex < blockCollection.length) {
            // If two blocks are found to be congruent, set the flag and break from both loops.
            if (blockCollection[currentOuterBlockIndex].isCongruent(blockCollection[currentInnerBlockIndex])) {
                hasCongruentBlocksFound = true;
                break; // Exit inner loop.
            }
            currentInnerBlockIndex++;
        }
        if (hasCongruentBlocksFound) {
            break; // Exit outer loop.
        }
        currentOuterBlockIndex++;
    }

    // Output the final result to standard output.
    if (hasCongruentBlocksFound) {
        process.stdout.write("No\n"); // Output "No" if any pair of blocks is congruent.
    } else {
        process.stdout.write("Yes\n"); // Output "Yes" if all blocks are unique (not congruent).
    }
})();