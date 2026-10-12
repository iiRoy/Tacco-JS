// Defines a constructor for a six-sided object, initializing its faces with provided values.
function Cube(faceValues) {
    this.upperFace = faceValues[0]; // The value on the top side of the cube.
    this.rearFace = faceValues[1];  // The value on the back side of the cube.
    this.starboardFace = faceValues[2]; // The value on the right side of the cube.
    this.portFace = faceValues[3];  // The value on the left side of the cube.
    this.forwardFace = faceValues[4]; // The value on the front side of the cube.
    this.lowerFace = faceValues[5]; // The value on the bottom side of the cube.
}

// Method to simulate rolling the cube in a specific cardinal direction.
Cube.prototype.rotate = function(movementDirection) {
    switch (movementDirection) {
        case 'W': // Roll West: left becomes top, top becomes right, right becomes bottom, bottom becomes left.
            let temporaryHolder = this.portFace;
            this.portFace = this.upperFace;
            this.upperFace = this.starboardFace;
            this.starboardFace = this.lowerFace;
            this.lowerFace = temporaryHolder;
            break;
        case 'N': // Roll North: front becomes top, top becomes back, back becomes bottom, bottom becomes front.
            let tempVal = this.forwardFace;
            this.forwardFace = this.upperFace;
            this.upperFace = this.rearFace;
            this.rearFace = this.lowerFace;
            this.lowerFace = tempVal;
            break;
        case 'E': // Roll East: right becomes top, top becomes left, left becomes bottom, bottom becomes right.
            let currentTemp = this.starboardFace;
            this.starboardFace = this.upperFace;
            this.upperFace = this.portFace;
            this.portFace = this.lowerFace;
            this.lowerFace = currentTemp;
            break;
        case 'S': // Roll South: back becomes top, top becomes front, front becomes bottom, bottom becomes back.
            let storageUnit = this.rearFace;
            this.rearFace = this.upperFace;
            this.upperFace = this.forwardFace;
            this.forwardFace = this.lowerFace;
            this.lowerFace = storageUnit;
            break;
    }
};

// Adjusts the cube's orientation so a specific face value becomes the top face.
Cube.prototype.orientToTop = function(targetUpper) {
    if (targetUpper === this.starboardFace) {
        this.rotate('W'); // Rotate West to bring the right face to the top.
    } else if (targetUpper === this.portFace) {
        this.rotate('E'); // Rotate East to bring the left face to the top.
    } else if (targetUpper === this.rearFace) {
        this.rotate('N'); // Rotate North to bring the back face to the top.
    } else if (targetUpper === this.forwardFace) {
        this.rotate('S'); // Rotate South to bring the front face to the top.
    }
};

// Determines the value of the starboard face given specific top and back face values.
Cube.prototype.determineStarboardWithUpperAndRear = function(currentUpper, currentRear) {
    // Case 1: The current upper face is the cube's inherent upper face.
    if (currentUpper === this.upperFace) {
        if (currentRear === this.rearFace) {
            return this.starboardFace;
        }
        if (currentRear === this.portFace) {
            return this.rearFace;
        }
        if (currentRear === this.forwardFace) {
            return this.portFace;
        }
        if (currentRear === this.starboardFace) {
            return this.forwardFace;
        }
    }
    // Case 2: The current upper face is the cube's inherent front face.
    if (currentUpper === this.forwardFace) {
        if (currentRear === this.upperFace) {
            return this.starboardFace;
        }
        if (currentRear === this.portFace) {
            return this.upperFace;
        }
        if (currentRear === this.lowerFace) {
            return this.portFace;
        }
        if (currentRear === this.starboardFace) {
            return this.lowerFace;
        }
    }
    // Case 3: The current upper face is the cube's inherent bottom face.
    if (currentUpper === this.lowerFace) {
        if (currentRear === this.forwardFace) {
            return this.starboardFace;
        }
        if (currentRear === this.portFace) {
            return this.forwardFace;
        }
        if (currentRear === this.rearFace) {
            return this.portFace;
        }
        if (currentRear === this.starboardFace) {
            return this.rearFace;
        }
    }
    // Case 4: The current upper face is the cube's inherent back face.
    if (currentUpper === this.rearFace) {
        if (currentRear === this.lowerFace) {
            return this.starboardFace;
        }
        if (currentRear === this.portFace) {
            return this.lowerFace;
        }
        if (currentRear === this.upperFace) {
            return this.portFace;
        }
        if (currentRear === this.starboardFace) {
            return this.upperFace;
        }
    }
    // Case 5: The current upper face is the cube's inherent right face.
    if (currentUpper === this.starboardFace) {
        if (currentRear === this.lowerFace) {
            return this.forwardFace;
        }
        if (currentRear === this.rearFace) {
            return this.lowerFace;
        }
        if (currentRear === this.upperFace) {
            return this.rearFace;
        }
        if (currentRear === this.forwardFace) {
            return this.upperFace;
        }
    }
    // Case 6: The current upper face is the cube's inherent left face.
    if (currentUpper === this.portFace) {
        if (currentRear === this.upperFace) {
            return this.forwardFace;
        }
        if (currentRear === this.forwardFace) {
            return this.lowerFace;
        }
        if (currentRear === this.lowerFace) {
            return this.rearFace;
        }
        if (currentRear === this.rearFace) {
            return this.upperFace;
        }
    }
};

// Checks if this cube is identical to another cube in terms of face values and orientation.
Cube.prototype.areIdentical = function(anotherObject) {
    // Compares the right face of this cube with the calculated right face of the other cube
    // based on this cube's top and back faces.
    return this.starboardFace === anotherObject.determineStarboardWithUpperAndRear(this.upperFace, this.rearFace);
};

// Main execution block for processing input and comparing two cubes.
(function(rawData) {
    // Split the raw input string into an array of lines.
    const inputLines = rawData.split('\n');

    // Parse the first line for the initial face values of the first cube.
    const valuesA = inputLines.shift().split(' ').map(Number);
    // Parse the second line for the initial face values of the second cube.
    const valuesB = inputLines.shift().split(' ').map(Number);

    // Create instances of the Cube object using the parsed values.
    const cubeA = new Cube(valuesA);
    const cubeB = new Cube(valuesB);

    // Output "Yes" if the cubes are identical in orientation and values, otherwise "No".
    console.log(cubeA.areIdentical(cubeB) ? 'Yes' : 'No');
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
