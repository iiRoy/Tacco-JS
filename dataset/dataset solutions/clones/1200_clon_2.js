"use strict";

class Cube {
    /*
     *  +---+
     *  | T |
     *+---+---+---+---+
     *| L | F | R | B |
     *+---+---+---+---+
     *  | D |
     *  +---+
     *
     *  Mapping:
     *  0: Top
     *  1: Front
     *  2: Right
     *  3: Left
     *  4: Back
     *  5: Bottom
     */
    constructor(initialFaces) {
        // Store the face values, ensuring we only take the first six.
        this.faces = initialFaces.slice(0, 6);
    }

    // Method to align the cube so a specific value is on top and another on front.
    align(topValue, frontValue) {
        // Determine the current index of the desired top face.
        switch (this.faces.indexOf(topValue)) {
            case 1: // Front face is currently top
                this.rotateNorthSouth(1);
                break;
            case 2: // Right face is currently top
                this.rotateWestEast(1);
                break;
            case 3: // Left face is currently top
                this.rotateWestEast(-1);
                break;
            case 4: // Back face is currently top
                this.rotateNorthSouth(-1);
                break;
            case 5: // Bottom face is currently top
                this.rotateNorthSouth(2);
                break;
            case 0: // Top face is already top, no initial rotation needed
            default:
                break;
        }

        // Now that the top face is correct, rotate around the vertical axis
        // until the desired front face is in position.
        for (let k = 0; k < 0b100; ++k) {
            if (this.faces[0b1] === frontValue) {
                return true; // Successfully aligned
            }
            this.rotateAroundAxis(0b1); // Rotate 90 degrees clockwise
        }
        return false; // Should not happen if topValue and frontValue are valid and distinct
    }

    // Rotates the cube around its vertical axis (top/bottom faces stay in place).
    rotateAroundAxis(rotationAmount) {
        // Normalize rotation amount to be positive and within [0, 3].
        if (rotationAmount < 0) {
            rotationAmount += 0b100 * Math.floor(-rotationAmount / 0b100) + 0b100;
        }
        // Indices of faces involved in this rotation: Front, Right, Back, Left.
        const originalIndices = [0b1, 0b10, 0b100, 0b11];
        // Calculate new positions based on rotation amount.
        const shiftedIndices = [rotationAmount, rotationAmount + 0b1, rotationAmount + 0b10, rotationAmount + 0b11].map(
            (element) => originalIndices[element % 0b100]
        );
        // Perform the swap using array destructuring.
        [this.faces[originalIndices[0b0]], this.faces[originalIndices[0b1]], this.faces[originalIndices[0b10]], this.faces[originalIndices[0b11]]] =
            [this.faces[shiftedIndices[0b0]], this.faces[shiftedIndices[0b1]], this.faces[shiftedIndices[0b10]], this.faces[shiftedIndices[0b11]]];
    }

    // Rotates the cube along the North-South axis (left/right faces stay in place).
    rotateNorthSouth(shiftValue) {
        // Normalize shift value.
        if (shiftValue < 0) {
            shiftValue += 0b100 * Math.floor(-shiftValue / 0b100) + 0b100;
        }
        // Indices involved: Top, Front, Bottom, Back.
        const initialPositions = [0b0, 0b1, 0b101, 0b100];
        // Determine the new order of faces.
        const finalPositions = [shiftValue, shiftValue + 0b1, shiftValue + 0b10, shiftValue + 0b11].map(
            (item) => initialPositions[item % 0b100]
        );
        // Apply the rotation.
        [this.faces[initialPositions[0b0]], this.faces[initialPositions[0b1]], this.faces[initialPositions[0b10]], this.faces[initialPositions[0b11]]] =
            [this.faces[finalPositions[0b0]], this.faces[finalPositions[0b1]], this.faces[finalPositions[0b10]], this.faces[finalPositions[0b11]]];
    }

    // Rotates the cube along the West-East axis (top/bottom faces stay in place, but different from rotateAroundAxis).
    rotateWestEast(turnValue) {
        // Normalize turn value.
        if (turnValue < 0) {
            turnValue += 0b100 * Math.floor(-turnValue / 0b100) + 0b100;
        }
        // Indices involved: Top, Right, Bottom, Left.
        const startIndices = [0b0, 0b10, 0b101, 0b11];
        // Calculate the new face arrangement.
        const endIndices = [turnValue, turnValue + 0b1, turnValue + 0b10, turnValue + 0b11].map(
            (entry) => startIndices[entry % 0b100]
        );
        // Update the face array.
        [this.faces[startIndices[0b0]], this.faces[startIndices[0b1]], this.faces[startIndices[0b10]], this.faces[startIndices[0b11]]] =
            [this.faces[endIndices[0b0]], this.faces[endIndices[0b1]], this.faces[endIndices[0b10]], this.faces[endIndices[0b11]]];
    }

    // Checks if this cube is rotationally equivalent to another cube.
    isEquivalentTo(otherCube) {
        // Helper function to compare two arrays element by element.
        const areArraysEqual = (arr1, arr2) => arr1.map((e, i) => e === arr2[i]).reduce((accumulator, current) => accumulator && current, true);

        // Create a temporary cube to perform rotations without altering the original.
        const currentCubeState = new Cube(this.faces);

        // Iterate through all possible top face orientations (4 rotations around N-S axis).
        for (let idx1 = 0; idx1 < 0b100; ++idx1) {
            if (areArraysEqual(currentCubeState.faces, otherCube.faces)) {
                return true;
            }
            currentCubeState.rotateNorthSouth(0b1); // Rotate N-S by 90 degrees.

            // For each N-S orientation, iterate through all 4 rotations around the vertical axis.
            for (let idx2 = 0; idx2 < 0b100; ++idx2) {
                if (areArraysEqual(currentCubeState.faces, otherCube.faces)) {
                    return true;
                }
                currentCubeState.rotateAroundAxis(0b1); // Rotate around vertical axis by 90 degrees.
            }
            // After checking all vertical rotations for a given N-S state,
            // rotate N-S back to its original position relative to the previous N-S state,
            // and then rotate vertical once more to prepare for the next N-S rotation.
            currentCubeState.rotateNorthSouth(-0b1);
            currentCubeState.rotateAroundAxis(0b1);
        }

        // Handle the case where the bottom face is now the top face (180 degree N-S rotation).
        currentCubeState.rotateNorthSouth(0b10); // Rotate N-S by 180 degrees.
        for (let idx2 = 0; idx2 < 0b100; ++idx2) {
            if (areArraysEqual(currentCubeState.faces, otherCube.faces)) {
                return true;
            }
            currentCubeState.rotateAroundAxis(0b1);
        }

        return false; // No rotational equivalence found.
    }
}


// Main program execution wrapped in a Promise for asynchronous input handling.
new Promise(function (resolveInput, rejectInput) {
    let receivedData = "";
    process.stdin.on("data", dataChunk => { receivedData += dataChunk; });
    process.stdin.on("end", () => { resolveInput([receivedData, process.stdout]); });
}).then(function([inputContent, outputStream]) {
    // Parse the input: first line is count, subsequent lines are cube face values.
    const [[count], ...rawInputData] = inputContent
        .split("\n")
        .map(lineStr => lineStr.split(" ").map(numStr => parseInt(numStr)));

    // Create Cube objects from the parsed data.
    const allCubes = rawInputData.slice(0, count).map(itemStr => new Cube(itemStr));

    // Compare each cube with every other cube to find duplicates.
    for (let outerIdx = 0; outerIdx < count; ++outerIdx) {
        for (let innerIdx = outerIdx + 0b1; innerIdx < count; ++innerIdx) {
            if (allCubes[outerIdx].isEquivalentTo(allCubes[innerIdx])) {
                outputStream.write("No\n"); // Found two identical cubes.
                return; // Exit early.
            }
        }
    }

    outputStream.write("Yes\n"); // No identical cubes found.
});
