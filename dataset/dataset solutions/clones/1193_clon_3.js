// Represents a six-sided block with numbered faces.
class NumberedBlock {
    // Internal representation of the block's current orientation.
    // Order: [up, back, right, left, front, down]
    #currentFaces; // Using private fields for encapsulation.

    /**
     * Initializes a new NumberedBlock instance.
     * @param {number[]} initialConfiguration - An array of 6 numbers for the faces,
     *                                      ordered as [up, back, right, left, front, down].
     * @throws {Error} If the initial configuration is not a valid array of 6 numbers.
     */
    constructor(initialConfiguration) {
        // Validate input array length and type (Type III: added validation)
        if (!Array.isArray(initialConfiguration) || initialConfiguration.length !== 6 || initialConfiguration.some(isNaN)) {
            throw new Error("Initial configuration must be an array of 6 numbers.");
        }
        // Store a deep copy of the configuration for internal state (Type III: using private field)
        this.#currentFaces = [...initialConfiguration];

        // Expose properties for easier access, but derived from the internal array.
        // This is a Type III change: using a private array and getters instead of direct properties.
        Object.defineProperties(this, {
            currentUp: { get: () => this.#currentFaces[0] },
            backFace: { get: () => this.#currentFaces[1] },
            rightSide: { get: () => this.#currentFaces[2] },
            leftSide: { get: () => this.#currentFaces[3] },
            frontFace: { get: () => this.#currentFaces[4] },
            downFace: { get: () => this.#currentFaces[5] }
        });
    }

    // Helper to update faces from an array. (Type III: added helper method)
    #updateFaces(newFaceOrder) {
        this.#currentFaces = [...newFaceOrder];
    }

    /**
     * Creates a deep clone of the current NumberedBlock instance.
     * (Type III addition: helper method for complex orientation logic)
     * @returns {NumberedBlock} A new NumberedBlock instance with the same face values.
     */
    cloneBlock() {
        return new NumberedBlock([...this.#currentFaces]);
    }

    /**
     * Rotates the block clockwise around its vertical axis (up-down).
     * The top and bottom faces remain in place.
     * (Type III addition: helper method for complex orientation logic)
     */
    #spinClockwise() {
        let [up, back, right, left, front, down] = this.#currentFaces;
        // Perform a cyclic swap of side faces
        let tempValue = back;
        back = left;
        left = front;
        front = right;
        right = tempValue;
        this.#updateFaces([up, back, right, left, front, down]);
    }

    /**
     * Performs a rotation of the block in a specified cardinal direction.
     * @param {string} rotationDirection - The direction to rotate ('W', 'N', 'E', 'S').
     *                                 'W' (West): current left becomes top, block rotates left.
     *                                 'N' (North): current front becomes top, block rotates forward.
     *                                 'E' (East): current right becomes top, block rotates right.
     *                                 'S' (South): current back becomes top, block rotates backward.
     */
    performRotation(rotationDirection) {
        // Renamed 'direction' to 'rotationDirection' (Type II)
        // Renamed 'tmp' to 'tempValue' (Type II)
        // Changed 'var' to 'let' (Type II)
        // Added input validation (Type III)
        if (!['W', 'N', 'E', 'S'].includes(rotationDirection)) {
            console.warn(`Attempted invalid rotation direction: ${rotationDirection}. No rotation applied.`);
            return; // Guard clause
        }

        // Using destructuring for more concise assignment (Type III)
        let [up, back, right, left, front, down] = this.#currentFaces;
        let tempValue; // Temporary holder for face values during swap

        // Using a map for rotation patterns instead of switch (Type III)
        const rotationPattern = {
            'W': () => { // Rotates block towards West
                tempValue = left;
                left = up;
                up = right;
                right = down;
                down = tempValue;
            },
            'N': () => { // Rotates block towards North
                tempValue = front;
                front = up;
                up = back;
                back = down;
                down = tempValue;
            },
            'E': () => { // Rotates block towards East
                tempValue = right;
                right = up;
                up = left;
                left = down;
                down = tempValue;
            },
            'S': () => { // Rotates block towards South
                tempValue = back;
                back = up;
                up = front;
                front = down;
                down = tempValue;
            }
        };

        rotationPattern[rotationDirection](); // Execute the specific rotation function

        // Update the internal state after rotation
        this.#updateFaces([up, back, right, left, front, down]);
    }

    /**
     * Orients the block so that a specific value is on the top face,
     * if that value is currently on one of the direct side faces.
     * @param {number} desiredUpValue - The value that should become the new top face.
     */
    alignTopFace(desiredUpValue) {
        // Renamed 'top' parameter to 'desiredUpValue' (Type II)
        // Renamed 'roll' to 'performRotation' (Type II)

        // Using a map to simplify the conditional logic (Type III)
        const directionLookup = {
            [this.rightSide]: 'W', // If right is desired, roll West
            [this.leftSide]: 'E',  // If left is desired, roll East
            [this.backFace]: 'N',  // If back is desired, roll North
            [this.frontFace]: 'S'  // If front is desired, roll South
        };

        const directionToApply = directionLookup[desiredUpValue];

        if (directionToApply) {
            this.performRotation(directionToApply);
        }
        // (Type III: removed redundant checks, implicit handling for top/bottom faces)
    }

    /**
     * Determines the value on the right face if the block were oriented
     * such that a specific value is on top and another on the back.
     * This simulates rotations to achieve the target orientation.
     * @param {number} targetUpValue - The value desired on the top face.
     * @param {number} targetBackValue - The value desired on the back face.
     * @returns {number} The value that would be on the right face in that orientation.
     */
    resolveRightFace(targetUpValue, targetBackValue) {
        // Renamed parameters and method. (Type II)
        // Significant structural change from original: replaces a large conditional tree with simulation (Type III)

        const tempBlock = this.cloneBlock(); // Create a working copy to simulate rotations

        // Step 1: Orient the block so that the targetUpValue is on the top face.
        if (tempBlock.currentUp === targetUpValue) {
            // Already correctly oriented on top.
        } else if (tempBlock.downFace === targetUpValue) {
            // If target is on the bottom, roll twice to bring it to top.
            tempBlock.performRotation('N'); // Brings bottom to front
            tempBlock.performRotation('N'); // Brings front to top
        } else {
            // Target is on one of the four side faces (back, front, right, left).
            // Use alignTopFace to bring it to the top with a single roll.
            tempBlock.alignTopFace(targetUpValue);
        }

        // After Step 1, tempBlock.currentUp === targetUpValue should be true.

        // Step 2: With the correct top face, rotate around the vertical axis
        // until the targetBackValue is on the back face.
        let spinCount = 0;
        const maxSpins = 4; // A face can be brought to back in at most 4 spins (full circle).
        while (tempBlock.backFace !== targetBackValue && spinCount < maxSpins) {
            tempBlock.#spinClockwise();
            spinCount++;
        }

        // After these rotations, tempBlock should be in the desired orientation.
        // Return the value on its right side.
        return tempBlock.rightSide;
    }

    /**
     * Compares this NumberedBlock with another for rotational equivalence.
     * Two blocks are considered equivalent if one can be rotated to match the other's
     * top, back, and right faces.
     * @param {NumberedBlock} comparisonTarget - The other block to compare against.
     * @returns {boolean} True if the blocks are rotationally equivalent, false otherwise.
     */
    compareFaces(comparisonTarget) {
        // Renamed `other` to `comparisonTarget` (Type II)
        // Renamed `isEqual` to `compareFaces` (Type II)
        // Renamed `getRightWithTopAndBack` to `resolveRightFace` (Type II)

        // Add guard clause (Type III: input validation)
        if (!(comparisonTarget instanceof NumberedBlock)) {
            console.error("Comparison target must be a NumberedBlock instance.");
            return false;
        }

        // Store intermediate result for clarity (Type III)
        const targetRightValue = comparisonTarget.resolveRightFace(this.currentUp, this.backFace);

        // Explicit comparison variable (Type III)
        const areRightFacesMatching = this.rightSide === targetRightValue;

        return areRightFacesMatching;
    }
}

// Main execution wrapper (Type III: using a named async function and await)
async function processBlockComparison(inputSource) {
    let rawInputContent;
    try {
        rawInputContent = await inputSource(); // Get input from the provided source function
    } catch (error) {
        console.error("Failed to read input content:", error.message);
        return;
    }

    // Split input into lines and filter out any empty lines (Type III: added filter)
    const inputLines = rawInputContent.split('\n').filter(line => line.trim() !== '');

    if (inputLines.length < 2) {
        console.error("Insufficient input lines provided. Expected at least two lines for block configurations.");
        return;
    }

    // Using `const` and more descriptive names (Type II)
    const faceDataStringA = inputLines.shift();
    const faceDataStringB = inputLines.shift();

    // Helper function for robust parsing (Type III: added helper, error handling)
    const parseFaceData = (dataString, blockIdentifier) => {
        const numbers = dataString.split(' ').map(s => {
            const parsedNum = Number(s);
            if (isNaN(parsedNum)) {
                throw new Error(`Invalid number format in ${blockIdentifier} configuration: '${s}'`);
            }
            return parsedNum;
        });
        if (numbers.length !== 6) {
            throw new Error(`${blockIdentifier} configuration expects 6 numbers, but received ${numbers.length}.`);
        }
        return numbers;
    };

    let blockAConfiguration, blockBConfiguration;
    try {
        blockAConfiguration = parseFaceData(faceDataStringA, 'Block A');
        blockBConfiguration = parseFaceData(faceDataStringB, 'Block B');
    } catch (error) {
        console.error("Error parsing block configuration:", error.message);
        return;
    }

    // Instantiate blocks (Type II)
    const blockA = new NumberedBlock(blockAConfiguration);
    const blockB = new NumberedBlock(blockBConfiguration);

    // Perform comparison and output result (Type II & III)
    const comparisonVerdict = blockA.compareFaces(blockB); // Store result in variable
    process.stdout.write(comparisonVerdict ? 'Yes\n' : 'No\n'); // Use process.stdout.write (Type III)
}

// Input source function (Type III: encapsulated input reading using async/await)
const readStdinContent = async () => {
    // Dynamically import fs.promises for modern async file operations (Type III)
    const fsPromises = require('fs').promises;
    return await fsPromises.readFile('/dev/stdin', 'utf8');
};

// Execute the main function, passing the input source function
processBlockComparison(readStdinContent);