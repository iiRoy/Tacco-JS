"use strict";

// Initial execution block: reads input from stdin, processes it, and then calls the main logic function.
// The input is read as UTF-8, trailing newlines are removed, and then split into an array of lines.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").replace(/\r?\n$/, "").split(/\r?\n/));

/**
 * Main function to handle the input data and orchestrate the cube comparison.
 * @param {string[]} inputData - An array of strings, where each string represents a line of input.
 */
function processInput(inputData) {

    /**
     * Constructor for a six-sided cube object.
     * It initializes the cube's faces with provided values.
     *
     * @param {string[]|string} faceValues - An array of strings representing the values on each face,
     *                                       or a single string if called incorrectly (a bug in the original `areIdentical` method).
     *                                       The order is expected to be [top, south, east, west, north, bottom].
     */
    function Cube(faceValues) {
        // The original code accesses `labels[index]` directly.
        // If `faceValues` is an array (e.g., `["1", "2", "3", "4", "5", "6"]`), this works as expected.
        // If `faceValues` is a string (e.g., `"1"`, due to a bug in `areIdentical`),
        // then `faceValues[0]` is `"1"`, and `faceValues[1]` through `faceValues[5]` will be `undefined`.
        // This behavior, including the bug, is strictly preserved as per Type II cloning rules.
        this.topFace = faceValues[0];      // Value on the top face
        this.southFace = faceValues[1];    // Value on the south face
        this.eastFace = faceValues[2];     // Value on the east face
        this.westFace = faceValues[3];     // Value on the west face
        this.northFace = faceValues[4];    // Value on the north face
        this.bottomFace = faceValues[5];   // Value on the bottom face
    }

    /**
     * Adds a method to the Cube prototype for rotating the cube in a specified direction.
     * This method modifies the cube's face values to reflect the rotation.
     *
     * @param {string} direction - The direction of rotation ("N" for North, "S" for South, "W" for West, "E" for East).
     */
    Cube.prototype.rotate = function(direction) {
        let temporaryHolder; // A temporary variable used to store a face value during the rotation swap.

        // Perform rotation based on the given direction.
        // Each 'if' block describes how face values shift when the cube is rolled.
        if (direction === "N") { // Roll towards North (top moves to north, north to bottom, bottom to south, south to top)
            temporaryHolder = this.topFace;
            this.topFace = this.southFace;
            this.southFace = this.bottomFace;
            this.bottomFace = this.northFace;
            this.northFace = temporaryHolder;
        }
        else if (direction === "S") { // Roll towards South (top moves to south, south to bottom, bottom to north, north to top)
            temporaryHolder = this.topFace;
            this.topFace = this.northFace;
            this.northFace = this.bottomFace;
            this.bottomFace = this.southFace;
            this.southFace = temporaryHolder;
        }
        else if (direction === "W") { // Roll towards West (top moves to west, west to bottom, bottom to east, east to top)
            temporaryHolder = this.topFace;
            this.topFace = this.eastFace;
            this.eastFace = this.bottomFace;
            this.bottomFace = this.westFace;
            this.westFace = temporaryHolder;
        }
        else if (direction === "E") { // Roll towards East (top moves to east, east to bottom, bottom to west, west to top)
            temporaryHolder = this.topFace;
            this.topFace = this.westFace;
            this.westFace = this.bottomFace;
            this.bottomFace = this.eastFace;
            this.eastFace = temporaryHolder;
        }
    };

    /**
     * Method to check if this cube is identical to another cube by rotating the other cube
     * through all possible orientations (24 total).
     *
     * @param {Cube} anotherCube - The other cube instance to compare against.
     * @returns {boolean} - True if the cubes are identical in any orientation, false otherwise.
     */
    Cube.prototype.areIdentical = function(anotherCube) {
        // Create new cube instances for comparison.
        // IMPORTANT: The original code passes individual face values (e.g., `this.t`, `this.s`, ...)
        // instead of an array to the Cube constructor here. This is a behavioral bug in the original code,
        // which is strictly preserved as per Type II cloning rules.
        // As a result, `firstCubeInstance` and `secondCubeInstance` will likely have `undefined` for most faces
        // if the constructor is called with a single string argument.
        let firstCubeInstance = new Cube(this.topFace, this.southFace, this.eastFace, this.westFace, this.northFace, this.bottomFace);
        let secondCubeInstance = new Cube(anotherCube.topFace, anotherCube.southFace, anotherCube.eastFace, anotherCube.westFace, anotherCube.northFace, anotherCube.bottomFace);

        // A predefined sequence of rotations designed to cover all 24 possible orientations of a cube.
        // This sequence ensures that after all rotations, one cube will have been
        // compared against all possible orientations of the other.
        const rotationSequence = "EEEENEEEENEEEENEEENEEEENNEEEE";

        // Iterate through each rotation in the sequence
        for (const currentRotation of rotationSequence) {
            // Check if all faces of the two cubes match in the current orientation.
            // Due to the constructor bug mentioned above, this comparison might often involve `undefined` values.
            if (firstCubeInstance.topFace === secondCubeInstance.topFace &&
                firstCubeInstance.southFace === secondCubeInstance.southFace &&
                firstCubeInstance.eastFace === secondCubeInstance.eastFace &&
                firstCubeInstance.westFace === secondCubeInstance.westFace &&
                firstCubeInstance.northFace === secondCubeInstance.northFace &&
                firstCubeInstance.bottomFace === secondCubeInstance.bottomFace) {
                return true; // Cubes are identical in this orientation
            }
            // If not identical, rotate the second cube to the next orientation for further comparison.
            secondCubeInstance.rotate(currentRotation);
        }
        return false; // No matching orientation found after all rotations
    };

    // Create the first cube instance from the first line of input.
    // The input line is split by spaces to get individual face values as an array.
    const primaryCube = new Cube(inputData[0].split(" "));
    // Create the second cube instance from the second line of input.
    // Similarly, split the second input line to get its face values.
    const secondaryCube = new Cube(inputData[1].split(" "));

    // Compare the two cubes using the `areIdentical` method and print the result to the console.
    // If they are identical in any orientation, print "Yes"; otherwise, print "No".
    console.log(primaryCube.areIdentical(secondaryCube) ? "Yes" : "No");
}
