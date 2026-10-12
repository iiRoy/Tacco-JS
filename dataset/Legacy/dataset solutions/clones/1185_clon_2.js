"use strict";

class GeometricSolid {
    /*
     *  Visual representation of the cube's faces:
     *      +---+
     *      | 0 |  (Top)
     *  +---+---+---+---+
     *  | 3 | 1 | 2 | 4 |  (Left, Front, Right, Back)
     *  +---+---+---+---+
     *      | 5 |  (Bottom)
     *      +---+
     *  Indices correspond to the `faceValues` array.
     */
    constructor(faceValuesArray) {
        // Stores the numeric values on each face of the solid.
        this.faceValues = faceValuesArray;
    }

    // Rotates the solid along the North-South axis (vertical rotation).
    rotateVertical(rotationAmount) {
        // Normalize rotationAmount to be positive and within [0, 3]
        if (rotationAmount < 0) {
            rotationAmount += 4 * Math.floor(-rotationAmount / 4) + 4;
        }

        // Define the indices of the faces involved in this rotation: Top, Front, Bottom, Back
        const currentFaceIndices = [0, 1, 5, 4];
        // Calculate the new positions for these faces after rotation
        const nextFaceIndices = [rotationAmount, rotationAmount + 1, rotationAmount + 2, rotationAmount + 3].map(
            (indexOffset) => currentFaceIndices[indexOffset % 4]
        );

        // Perform the actual rotation by reassigning face values
        [
            this.faceValues[currentFaceIndices[0]],
            this.faceValues[currentFaceIndices[1]],
            this.faceValues[currentFaceIndices[2]],
            this.faceValues[currentFaceIndices[3]],
        ] = [
            this.faceValues[nextFaceIndices[0]],
            this.faceValues[nextFaceIndices[1]],
            this.faceValues[nextFaceIndices[2]],
            this.faceValues[nextFaceIndices[3]],
        ];
    }

    // Rotates the solid along the West-East axis (horizontal rotation).
    rotateHorizontal(rotationAmount) {
        // Normalize rotationAmount to be positive and within [0, 3]
        if (rotationAmount < 0) {
            rotationAmount += 4 * Math.floor(-rotationAmount / 4) + 4;
        }

        // Define the indices of the faces involved in this rotation: Top, Right, Bottom, Left
        const currentFaceIndices = [0, 2, 5, 3];
        // Calculate the new positions for these faces after rotation
        const nextFaceIndices = [rotationAmount, rotationAmount + 1, rotationAmount + 2, rotationAmount + 3].map(
            (indexOffset) => currentFaceIndices[indexOffset % 4]
        );

        // Perform the actual rotation by reassigning face values
        [
            this.faceValues[currentFaceIndices[0]],
            this.faceValues[currentFaceIndices[1]],
            this.faceValues[currentFaceIndices[2]],
            this.faceValues[currentFaceIndices[3]],
        ] = [
            this.faceValues[nextFaceIndices[0]],
            this.faceValues[nextFaceIndices[1]],
            this.faceValues[nextFaceIndices[2]],
            this.faceValues[nextFaceIndices[3]],
        ];
    }
}

// Asynchronously handle input and output operations.
new Promise(function (resolveInput, rejectInput) {
    let bufferedInput = "";
    // Accumulate data chunks from standard input.
    process.stdin.on("data", (dataPiece) => {
        bufferedInput += dataPiece;
    });
    // When input stream ends, resolve the promise with the full input and stdout stream.
    process.stdin.on("end", () => {
        resolveInput([bufferedInput, process.stdout]);
    });
}).then(function ([fullInputString, outputChannel]) {
    // Split the input into initial face configuration and movement instructions.
    const [initialFaceConfiguration, movementInstructions] = fullInputString.split("\n").slice(0, 2);

    // Create a new GeometricSolid instance with parsed initial face values.
    const mySolid = new GeometricSolid(
        initialFaceConfiguration.split(" ").map((faceString) => parseInt(faceString, 10))
    );

    // Process each instruction character.
    for (const currentInstruction of movementInstructions) {
        switch (currentInstruction) {
            case "N": // Move North (rotate vertical clockwise)
                mySolid.rotateVertical(1);
                break;
            case "S": // Move South (rotate vertical counter-clockwise)
                mySolid.rotateVertical(-1);
                break;
            case "W": // Move West (rotate horizontal clockwise)
                mySolid.rotateHorizontal(1);
                break;
            case "E": // Move East (rotate horizontal counter-clockwise)
                mySolid.rotateHorizontal(-1);
                break;
        }
    }

    // Write the value of the top face (index 0) to the output channel, followed by a newline.
    outputChannel.write(`${mySolid.faceValues[0]}\n`);
});
