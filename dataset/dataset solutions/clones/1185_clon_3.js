"use strict";

class Cube {
    /**
     *    +--+
     *    |0 |
     * +--+--+--+--+
     * |3 |1 |2 |4 |
     * +--+--+--+--+
     *    |5 |
     *    +--+
     */
    constructor(initialFaces) {
        this.faces = initialFaces;
    }

    // Private helper method to normalize rotation values to be within [0, 3]
    _getNormalizedRotation(inputRotationValue) {
        let normalizedValue = inputRotationValue;
        if (normalizedValue < 0) {
            // Adjust negative values to their positive equivalent within a 4-step cycle
            normalizedValue += 4 * Math.floor(-normalizedValue / 4) + 4;
        }
        return normalizedValue;
    }

    // Private helper method to encapsulate the common face rotation logic
    _performFaceRotation(axisIndices, rotationAmount) {
        const effectiveRotation = this._getNormalizedRotation(rotationAmount);
        const currentFaceValues = this.faces;

        // Calculate the values that will move into each of the four positions on the axis
        const valueForPosition0 = currentFaceValues[axisIndices[(effectiveRotation + 0) % 4]];
        const valueForPosition1 = currentFaceValues[axisIndices[(effectiveRotation + 1) % 4]];
        const valueForPosition2 = currentFaceValues[axisIndices[(effectiveRotation + 2) % 4]];
        const valueForPosition3 = currentFaceValues[axisIndices[(effectiveRotation + 3) % 4]];

        // Apply the rotation using array destructuring for simultaneous assignment
        [
            currentFaceValues[axisIndices[0]],
            currentFaceValues[axisIndices[1]],
            currentFaceValues[axisIndices[2]],
            currentFaceValues[axisIndices[3]]
        ] = [
            valueForPosition0,
            valueForPosition1,
            valueForPosition2,
            valueForPosition3
        ];
    }

    rotateNorthSouth(rotationValue) {
        // Indices for faces involved in North-South rotation: Top, Front, Bottom, Back
        const northSouthAxisIndices = [0, 1, 5, 4];
        this._performFaceRotation(northSouthAxisIndices, rotationValue);
    }

    rotateWestEast(rotationValue) {
        // Indices for faces involved in West-East rotation: Top, Right, Bottom, Left
        const westEastAxisIndices = [0, 2, 5, 3];
        this._performFaceRotation(westEastAxisIndices, rotationValue);
    }
}


new Promise(function (resolve, reject) {
    let inputBuffer = "";
    process.stdin.on("data", dataChunk => { inputBuffer += dataChunk; });
    process.stdin.on("end", () => { resolve([inputBuffer, process.stdout]); });
}).then(function([inputContent, outputStream]) {
    // Split the input content into individual lines
    const allInputLines = inputContent.split("\n");
    const initialFacesString = allInputLines[0];
    const movementSequence = allInputLines[1];

    // Parse the initial face values from the string
    const initialFaceValues = initialFacesString.split(" ").map(faceStr => Number.parseInt(faceStr, 10));
    const cubeInstance = new Cube(initialFaceValues);

    // Define a local helper function to process each movement character
    const applySingleMovement = (currentCube, moveCharacter) => {
        switch (moveCharacter) {
            case "N": currentCube.rotateNorthSouth(1); break;
            case "S": currentCube.rotateNorthSouth(-1); break;
            case "W": currentCube.rotateWestEast(1); break;
            case "E": currentCube.rotateWestEast(-1); break;
            // No default case needed as per original behavior (ignores unknown characters)
        }
    };

    // Iterate through the movement sequence and apply each rotation
    for (const moveCharacter of movementSequence) {
        applySingleMovement(cubeInstance, moveCharacter);
    }

    // Write the value of the top face (index 0) to the output stream
    outputStream.write(`${cubeInstance.faces[0]}\n`);
});
