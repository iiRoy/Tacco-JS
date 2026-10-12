function Cube(faceValues) {
    // Constructor for a Cube object, initializing its six faces.
    this.upper = faceValues[0];     // The value on the top face of the cube.
    this.rear = faceValues[1];      // The value on the back face of the cube.
    this.starboard = faceValues[2]; // The value on the right face of the cube.
    this.port = faceValues[3];      // The value on the left face of the cube.
    this.fore = faceValues[4];      // The value on the front face of the cube.
    this.lower = faceValues[5];     // The value on the bottom face of the cube.
}

Cube.prototype.rotate = function(spinDirection) {
    // This method simulates rotating the cube based on a given direction.
    // It updates the face values according to the rotation.
    switch (spinDirection) {
        case 'W': // Rotate West (around the front-back axis, bringing left to top)
            let temporaryValueW = this.port;
            this.port = this.upper;
            this.upper = this.starboard;
            this.starboard = this.lower;
            this.lower = temporaryValueW;
            break;
        case 'N': // Rotate North (around the left-right axis, bringing front to top)
            let temporaryValueN = this.fore;
            this.fore = this.upper;
            this.upper = this.rear;
            this.rear = this.lower;
            this.lower = temporaryValueN;
            break;
        case 'E': // Rotate East (around the front-back axis, bringing right to top)
            let temporaryValueE = this.starboard;
            this.starboard = this.upper;
            this.upper = this.port;
            this.port = this.lower;
            this.lower = temporaryValueE;
            break;
        case 'S': // Rotate South (around the left-right axis, bringing back to top)
            let temporaryValueS = this.rear;
            this.rear = this.upper;
            this.upper = this.fore;
            this.fore = this.lower;
            this.lower = temporaryValueS;
            break;
        case 'R': // Rotate Right (clockwise around the top-bottom axis)
            let temporaryValueR = this.starboard;
            this.starboard = this.fore;
            this.fore = this.port;
            this.port = this.rear;
            this.rear = temporaryValueR;
            break;
        case 'L': // Rotate Left (counter-clockwise around the top-bottom axis)
            let temporaryValueL = this.port;
            this.port = this.fore;
            this.fore = this.starboard;
            this.starboard = this.rear;
            this.rear = temporaryValueL;
            break;
    }
};

Cube.prototype.duplicate = function() {
    // Creates and returns a new Cube instance with the same face values as the current cube.
    return new Cube([this.upper, this.rear, this.starboard, this.port, this.fore, this.lower]);
};

Cube.prototype.areIdentical = function(anotherCube) {
    // Checks if this cube has the exact same face values as another cube in its current orientation.
    return this.upper === anotherCube.upper &&
           this.rear === anotherCube.rear &&
           this.starboard === anotherCube.starboard &&
           this.port === anotherCube.port &&
           this.fore === anotherCube.fore &&
           this.lower === anotherCube.lower;
};

Cube.prototype.matchAllOrientations = function(anotherCube) {
    // Determines if this cube can be rotated to match the face values of another cube.
    // It systematically tries all 24 possible orientations.
    let currentCube = this.duplicate(); // Create a copy to manipulate without altering the original
    const rotationSequence = 'NEEEN'.split(''); // A sequence of major rotations to cover all top faces
    let outerIndex = 0; // Counter for iterating through the major rotation sequence

    do {
        let innerIndex = 0; // Counter for rotating 90 degrees around the current top face
        do {
            if (currentCube.areIdentical(anotherCube)) {
                return true; // If a matching orientation is found, return true
            }
            currentCube.rotate('R'); // Rotate 90 degrees clockwise around the top-bottom axis
        } while (innerIndex++ < 3); // Perform 4 rotations (0, 1, 2, 3) to cover all 4 side faces as front

        // Apply the next major rotation from the sequence to change the top face
        currentCube.rotate(rotationSequence[outerIndex]);
    } while (outerIndex++ < rotationSequence.length); // Iterate through all major rotations

    return false; // If no matching orientation is found after checking all possibilities
};

Cube.prototype.findStarboardWithUpperAndRear = function(targetUpper, targetRear) {
    // Finds the value on the starboard face when the cube is oriented such that
    // its upper face matches 'targetUpper' and its rear face matches 'targetRear'.
    let currentCube = this.duplicate(); // Work with a copy to avoid modifying the original cube
    const rotationSequence = 'NEEEN'.split(''); // Standard rotation sequence to explore orientations
    let outerIndex = 0; // Loop counter for major rotations

    do {
        let innerIndex = 0; // Loop counter for rotations around the top axis
        do {
            // Check if the current orientation matches the desired upper and rear faces
            if (currentCube.upper === targetUpper && currentCube.rear === targetRear) {
                return currentCube.starboard; // Return the value on the starboard face
            }
            currentCube.rotate('R'); // Rotate 90 degrees clockwise
        } while (innerIndex++ < 3); // Iterate 4 times for a full 360-degree rotation

        // Apply the next major rotation from the sequence
        currentCube.rotate(rotationSequence[outerIndex]);
    } while (outerIndex++ < rotationSequence.length); // Continue through all major rotations

    return null; // If no such orientation is found
};

(function(rawInputData) {
    // This immediately invoked function expression (IIFE) handles the main program logic.
    const inputLines = rawInputData.split('\n'); // Split the entire input string into an array of lines.
    const numberOfCubes = Number(inputLines.shift()); // The first line contains the count of cubes.

    const cubeCollection = []; // An array to store all the Cube objects created from input.
    // Loop to read and create each Cube object.
    for (let outerLoopCounter = 0; outerLoopCounter < numberOfCubes; outerLoopCounter++) {
        const cubeFaceValues = inputLines.shift().split(' ').map(Number); // Parse face values for the current cube.
        const newCube = new Cube(cubeFaceValues); // Create a new Cube instance.
        cubeCollection.push(newCube); // Add the newly created cube to the collection.
    }

    // Nested loops to compare each cube with every other cube for duplication.
    for (let firstCubeIndex = 0; firstCubeIndex < numberOfCubes; firstCubeIndex++) {
        for (let secondCubeIndex = firstCubeIndex + 1; secondCubeIndex < numberOfCubes; secondCubeIndex++) {
            // If two cubes are found to be identical in any orientation, then duplicates exist.
            if (cubeCollection[firstCubeIndex].matchAllOrientations(cubeCollection[secondCubeIndex])) {
                console.log('No'); // Output 'No' indicating duplicates were found.
                return; // Exit the function immediately as the condition is met.
            }
        }
    }

    console.log('Yes'); // If the loops complete without finding any duplicates, output 'Yes'.
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input using Node.js 'fs' module.
