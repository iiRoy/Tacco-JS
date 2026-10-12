"use strict";

// Entry point for processing input data from standard input
processInput(require("fs").readFileSync("/dev/stdin", "utf8").replace(/\r?\n$/, "").split(/\r?\n/));

/**
 * Main function to handle the dice rolling logic.
 * @param {string[]} inputData - An array of strings, where each string is a line from the input.
 */
function processInput(inputData) {

    /**
     * Represents a six-sided cube (dice) with labeled faces.
     * @class
     * @param {string[]} faceValues - An array of 6 strings representing the labels for top, south, east, west, north, bottom faces.
     */
    function Cube(faceValues) {
        // Initialize the faces of the cube
        this.topFace = faceValues[0];    // Top face
        this.southFace = faceValues[1];  // South face
        this.eastFace = faceValues[2];   // East face
        this.westFace = faceValues[3];   // West face
        this.northFace = faceValues[4];  // North face
        this.bottomFace = faceValues[5]; // Bottom face
    }

    /**
     * Rotates the cube in a specified direction.
     * @param {string} direction - The direction to rotate ("N", "S", "W", "E").
     */
    Cube.prototype.rotate = function(direction) {
        let temporaryValue; // A temporary variable to hold a face value during rotation

        if (direction === "N") {
            // Roll North: T -> S, S -> B, B -> N, N -> T
            temporaryValue = this.topFace;
            this.topFace = this.southFace;
            this.southFace = this.bottomFace;
            this.bottomFace = this.northFace;
            this.northFace = temporaryValue;
        } else if (direction === "S") {
            // Roll South: T -> N, N -> B, B -> S, S -> T
            temporaryValue = this.topFace;
            this.topFace = this.northFace;
            this.northFace = this.bottomFace;
            this.bottomFace = this.southFace;
            this.southFace = temporaryValue;
        } else if (direction === "W") {
            // Roll West: T -> E, E -> B, B -> W, W -> T
            temporaryValue = this.topFace;
            this.topFace = this.eastFace;
            this.eastFace = this.bottomFace;
            this.bottomFace = this.westFace;
            this.westFace = temporaryValue;
        } else if (direction === "E") {
            // Roll East: T -> W, W -> B, B -> E, E -> T
            temporaryValue = this.topFace;
            this.topFace = this.westFace;
            this.westFace = this.bottomFace;
            this.bottomFace = this.eastFace;
            this.eastFace = temporaryValue;
        }
    };

    // Create a new cube instance using the first line of input
    const myCube = new Cube(inputData[0].split(" "));

    // Process subsequent query lines (starting from the third line)
    inputData.slice(2).forEach(function(currentLine) {
        currentLine = currentLine.split(" ");
        const targetTop = currentLine[0];    // Desired value for the top face
        const targetSouth = currentLine[1];  // Desired value for the south face

        // Rotate the cube until the south face matches the target south value
        // This loop rotates N, N, N, W, N, N, N, W (up to 8 times)
        for (let iterationCount = 0; iterationCount < 8; iterationCount++) {
            if (myCube.southFace === targetSouth) {
                break; // Stop if the south face is correct
            }
            // The expression "NW"[iterationCount % 4 / 3 | 0] generates "N" for i=0,1,2 and "W" for i=3
            myCube.rotate("NW"[iterationCount % 4 / 3 | 0]);
        }

        // Once the south face is correct, rotate the cube around its vertical axis
        // until the top face matches the target top value.
        while (myCube.topFace !== targetTop) {
            myCube.rotate("W"); // Keep rolling West until the top is correct
        }

        // Output the value of the east face after achieving the target top and south faces
        console.log(myCube.eastFace);
    });
}
