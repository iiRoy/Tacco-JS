"use strict"; // Enforce strict mode for better error handling

/**
 * Represents a six-sided cube with faces numbered as follows:
 *
 *      +---+
 *      | 0 |  (Top)
 *   +--+---+--+--+
 *   | 3| 1 | 2| 4|  (Left, Front, Right, Back)
 *   +--+---+--+--+
 *      | 5 |  (Bottom)
 */
class Cube {
    /**
     * Initializes a new Cube instance with an array of face values.
     * @param {Array<string>} faces An array representing the initial state of the cube's faces.
     */
    constructor(faces) {
        this.faces = faces; // Stores the current state of the cube's faces
    }

    /**
     * Aligns the cube so that a specific face is on top and another is in front.
     * @param {string} upper The value of the face that should be on top.
     * @param {string} frontal The value of the face that should be in front.
     */
    align(upper, frontal) {
        // First, rotate the cube to bring the desired 'upper' face to the top (index 0).
        // The switch statement determines the necessary rotation based on the current position of 'upper'.
        switch (this.faces.indexOf(upper)) {
            case 1: // If 'upper' is currently front (index 1)
                this.rotateVertical(1); // Rotate North-South once
                break;
            case 2: // If 'upper' is currently right (index 2)
                this.rotateLateral(1); // Rotate West-East once
                break;
            case 3: // If 'upper' is currently left (index 3)
                this.rotateLateral(-1); // Rotate West-East once in reverse
                break;
            case 4: // If 'upper' is currently back (index 4)
                this.rotateVertical(-1); // Rotate North-South once in reverse
                break;
            case 5: // If 'upper' is currently bottom (index 5)
                this.rotateVertical(2); // Rotate North-South twice
                break;
            // Case 0 (already on top) requires no initial rotation.
        }

        // After the 'upper' face is on top, rotate horizontally until the desired 'frontal' face is in front (index 1).
        while (this.faces[1] !== frontal) {
            this.rotateHorizontal(1); // Perform horizontal rotation until 'frontal' is in place
        }
    }

    /**
     * Rotates the cube horizontally (around the vertical axis).
     * Affects faces: Front (1), Right (2), Back (4), Left (3).
     * @param {number} amount The number of rotations. Positive for clockwise, negative for counter-clockwise.
     */
    rotateHorizontal(amount) {
        // Normalize 'amount' to be a positive value between 0 and 3.
        if (amount < 0) {
            amount += 4 * Math.floor(-amount / 4) + 4;
        }

        const originalIndices = [1, 2, 4, 3]; // Indices of faces involved in horizontal rotation (Front, Right, Back, Left)
        // Calculate the new positions for the faces after rotation.
        const shiftedIndices = [amount, amount + 1, amount + 2, amount + 3].map(element => originalIndices[element % 4]);

        // Destructure assignment to swap face values based on the calculated new positions.
        [this.faces[originalIndices[0]], this.faces[originalIndices[1]], this.faces[originalIndices[2]], this.faces[originalIndices[3]]] =
            [this.faces[shiftedIndices[0]], this.faces[shiftedIndices[1]], this.faces[shiftedIndices[2]], this.faces[shiftedIndices[3]]];
    }

    /**
     * Rotates the cube vertically (North-South, around the horizontal axis passing through Left/Right faces).
     * Affects faces: Top (0), Front (1), Bottom (5), Back (4).
     * @param {number} amount The number of rotations. Positive for forward, negative for backward.
     */
    rotateVertical(amount) {
        // Normalize 'amount' to be a positive value between 0 and 3.
        if (amount < 0) {
            amount += 4 * Math.floor(-amount / 4) + 4;
        }

        const originalIndices = [0, 1, 5, 4]; // Indices of faces involved (Top, Front, Bottom, Back)
        // Calculate the new positions for the faces after rotation.
        const shiftedIndices = [amount, amount + 1, amount + 2, amount + 3].map(element => originalIndices[element % 4]);

        // Destructure assignment to swap face values.
        [this.faces[originalIndices[0]], this.faces[originalIndices[1]], this.faces[originalIndices[2]], this.faces[originalIndices[3]]] =
            [this.faces[shiftedIndices[0]], this.faces[shiftedIndices[1]], this.faces[shiftedIndices[2]], this.faces[shiftedIndices[3]]];
    }

    /**
     * Rotates the cube laterally (West-East, around the horizontal axis passing through Front/Back faces).
     * Affects faces: Top (0), Right (2), Bottom (5), Left (3).
     * @param {number} amount The number of rotations. Positive for rightward, negative for leftward.
     */
    rotateLateral(amount) {
        // Normalize 'amount' to be a positive value between 0 and 3.
        if (amount < 0) {
            amount += 4 * Math.floor(-amount / 4) + 4;
        }

        const originalIndices = [0, 2, 5, 3]; // Indices of faces involved (Top, Right, Bottom, Left)
        // Calculate the new positions for the faces after rotation.
        const shiftedIndices = [amount, amount + 1, amount + 2, amount + 3].map(element => originalIndices[element % 4]);

        // Destructure assignment to swap face values.
        [this.faces[originalIndices[0]], this.faces[originalIndices[1]], this.faces[originalIndices[2]], this.faces[originalIndices[3]]] =
            [this.faces[shiftedIndices[0]], this.faces[shiftedIndices[1]], this.faces[shiftedIndices[2]], this.faces[shiftedIndices[3]]];
    }
}


// Main execution block using a Promise to handle asynchronous input/output.
new Promise(function (resolve, reject) {
    let inputBuffer = ""; // Accumulates input data
    process.stdin.on("data", chunk => {
        inputBuffer += chunk; // Append incoming data chunks
    });
    process.stdin.on("end", () => {
        resolve([inputBuffer, process.stdout]); // Resolve with accumulated input and stdout stream
    });
}).then(function([inputString, outputStream]) {
    // Destructure the input string into initial state, number of queries, and query data.
    const [initialState, numQueries, ...queryData] = inputString.split("\n");

    // Create a new Cube instance with the initial face values.
    const myCube = new Cube(initialState.split(" "));

    // Process each query.
    // Slice queryData to only include the number of queries specified by numQueries.
    for (const [topFace, frontFace] of queryData.slice(0, parseInt(numQueries)).map(element => element.split(" "))) {
        // Align the cube according to the current query's top and front faces.
        myCube.align(topFace, frontFace);
        // Write the value of the right face (index 2) to the output stream, followed by a newline.
        outputStream.write(`${myCube.faces[2]}\n`);
    }
});
