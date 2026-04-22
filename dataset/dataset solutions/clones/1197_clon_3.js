// Represents a six-sided die with specific face values.
function SpatialDie(faceValues) {
    // Basic validation for the input array.
    if (!Array.isArray(faceValues) || faceValues.length !== 6) {
        throw new Error("A spatial die must be initialized with exactly six face values.");
    }

    // Assigning initial face values to distinct properties.
    this.upperFace = faceValues[0];   // The face currently on top.
    this.rearFace = faceValues[1];    // The face at the back.
    this.starboardFace = faceValues[2]; // The face on the right.
    this.portFace = faceValues[3];    // The face on the left.
    this.forwardFace = faceValues[4]; // The face at the front.
    this.lowerFace = faceValues[5];   // The face currently at the bottom.
}

// Rotates the spatial die in a specified direction.
SpatialDie.prototype.shiftFaces = function(rotationCommand) {
    // Temporary variable to assist with face value swaps.
    let temporaryHolder;

    // Determine the rotation based on the command.
    if (rotationCommand === 'W') { // Rotate West (around the front-back axis)
        temporaryHolder = this.portFace;
        this.portFace = this.upperFace;
        this.upperFace = this.starboardFace;
        this.starboardFace = this.lowerFace;
        this.lowerFace = temporaryHolder;
    } else if (rotationCommand === 'N') { // Rotate North (around the left-right axis)
        temporaryHolder = this.forwardFace;
        this.forwardFace = this.upperFace;
        this.upperFace = this.rearFace;
        this.rearFace = this.lowerFace;
        this.lowerFace = temporaryHolder;
    } else if (rotationCommand === 'E') { // Rotate East
        temporaryHolder = this.starboardFace;
        this.starboardFace = this.upperFace;
        this.upperFace = this.portFace;
        this.portFace = this.lowerFace;
        this.lowerFace = temporaryHolder;
    } else if (rotationCommand === 'S') { // Rotate South
        temporaryHolder = this.rearFace;
        this.rearFace = this.upperFace;
        this.upperFace = this.forwardFace;
        this.forwardFace = this.lowerFace;
        this.lowerFace = temporaryHolder;
    } else if (rotationCommand === 'R') { // Rotate Right (clockwise around the top-bottom axis)
        temporaryHolder = this.starboardFace;
        this.starboardFace = this.forwardFace;
        this.forwardFace = this.portFace;
        this.portFace = this.rearFace;
        this.rearFace = temporaryHolder;
    } else if (rotationCommand === 'L') { // Rotate Left (counter-clockwise around the top-bottom axis)
        temporaryHolder = this.portFace;
        this.portFace = this.forwardFace;
        this.forwardFace = this.starboardFace;
        this.starboardFace = this.rearFace;
        this.rearFace = temporaryHolder;
    } else {
        // Log an error for an unrecognized rotation command.
        console.warn(`Unrecognized rotation command: ${rotationCommand}. No rotation performed.`);
    }
};

// Creates an independent copy of the current spatial die's state.
SpatialDie.prototype.createCopy = function() {
    return new SpatialDie([
        this.upperFace,
        this.rearFace,
        this.starboardFace,
        this.portFace,
        this.forwardFace,
        this.lowerFace
    ]);
};

// Checks if this spatial die has the exact same face configuration as another.
SpatialDie.prototype.hasSameConfiguration = function(targetDie) {
    // Ensure the comparison is with another valid SpatialDie instance.
    if (!(targetDie instanceof SpatialDie)) {
        return false;
    }

    // Compare all six face values directly.
    const faceProperties = [
        'upperFace', 'rearFace', 'starboardFace',
        'portFace', 'forwardFace', 'lowerFace'
    ];

    // Use Array.prototype.every for a concise comparison.
    return faceProperties.every(prop => this[prop] === targetDie[prop]);
};

// Determines if this spatial die can achieve the same face configuration as another
// through any series of rotations.
SpatialDie.prototype.isCongruentTo = function(targetDie) {
    // Guard clause: if targetDie is not a SpatialDie, they cannot be congruent.
    if (!(targetDie instanceof SpatialDie)) {
        return false;
    }

    // Create a working copy to perform rotations without altering the original.
    const exploringDie = this.createCopy();
    // Predefined sequence of rotations to explore all 24 possible orientations.
    // 'NEEEN' covers rotations to expose each of the 6 faces to the top,
    // and 'R' covers 4 rotations around the top-bottom axis.
    const predefinedRotations = Array.from('NEEEN');

    let isMatchFound = false; // Flag to indicate if a match is found.

    // Outer loop: iterates through rotations that change the 'upperFace'.
    // This sequence (N, E, E, E, N) effectively brings each of the 6 faces
    // to the 'upperFace' position once.
    for (let outerIndex = 0; outerIndex <= predefinedRotations.length; outerIndex++) {
        // Inner loop: rotates the exploring die around its vertical axis (top-bottom).
        // This covers the 4 possible rotations for the current 'upperFace'.
        for (let innerIndex = 0; innerIndex < 4; innerIndex++) {
            // Check if the current orientation matches the target die.
            if (exploringDie.hasSameConfiguration(targetDie)) {
                isMatchFound = true;
                break; // Exit inner loop if a match is found.
            }
            exploringDie.shiftFaces('R'); // Rotate clockwise around the vertical axis.
        }

        if (isMatchFound) {
            break; // Exit outer loop if a match is found.
        }

        // Apply the next rotation from the predefined sequence, if available.
        if (outerIndex < predefinedRotations.length) {
            exploringDie.shiftFaces(predefinedRotations[outerIndex]);
        }
    }
    return isMatchFound;
};

// Retrieves the value of the starboard (right) face when the die is oriented
// such that specific values are on the upper and rear faces.
SpatialDie.prototype.retrieveStarboardFaceByUpperAndRear = function(desiredUpper, desiredRear) {
    const exploringDie = this.createCopy(); // Work with a copy to preserve original state.
    const rotationPath = Array.from('NEEEN'); // Standard path to explore orientations.

    // Loop through various orientations to find the desired upper and rear faces.
    for (let pathStep = 0; pathStep <= rotationPath.length; pathStep++) {
        for (let axialRot = 0; axialRot < 4; axialRot++) {
            // If the current orientation matches the desired upper and rear values.
            if (exploringDie.upperFace === desiredUpper && exploringDie.rearFace === desiredRear) {
                return exploringDie.starboardFace; // Return the value of the starboard face.
            }
            exploringDie.shiftFaces('R'); // Rotate around the vertical axis.
        }

        // Apply the next rotation from the path, if not at the end.
        if (pathStep < rotationPath.length) {
            exploringDie.shiftFaces(rotationPath[pathStep]);
        }
    }

    // If no orientation matches the desired upper and rear faces, return null.
    // This implies an invalid input combination for a standard die.
    return null;
};

// Main execution block: reads input, processes cube data, and checks for duplicates.
(function(rawInputData) {
    // Helper function to check if any two cubes in a collection are congruent.
    const checkDuplicateCubes = (cubeCollectionToCheck) => {
        const totalCubes = cubeCollectionToCheck.length;
        // Iterate through all unique pairs of cubes.
        for (let firstIdx = 0; firstIdx < totalCubes; firstIdx++) {
            for (let secondIdx = firstIdx + 1; secondIdx < totalCubes; secondIdx++) {
                // If two cubes are found to be congruent, it's a duplicate set.
                if (cubeCollectionToCheck[firstIdx].isCongruentTo(cubeCollectionToCheck[secondIdx])) {
                    return true; // Duplicates found.
                }
            }
        }
        return false; // No duplicates found.
    };

    const inputLines = rawInputData.trim().split('\n'); // Split input into lines and trim whitespace.

    // Retrieve the number of cubes from the first line.
    const numberOfCubesStr = inputLines.shift();
    const numberOfCubes = parseInt(numberOfCubesStr, 10);

    // Input validation: Ensure a positive number of cubes.
    if (isNaN(numberOfCubes) || numberOfCubes <= 0) {
        process.stdout.write('Invalid or non-positive number of cubes provided.\n');
        return;
    }

    const spatialDieInstances = []; // Array to store created SpatialDie objects.

    // Parse each subsequent line to create SpatialDie instances.
    for (let i = 0; i < numberOfCubes; i++) {
        // Ensure there are enough lines for the specified number of cubes.
        if (inputLines.length === 0) {
            process.stdout.write('Insufficient input lines for the specified number of cubes.\n');
            return;
        }
        const currentFaceValues = inputLines.shift()
                                            .split(' ')
                                            .map(val => parseInt(val.trim(), 10)); // Parse face values as numbers.

        // Additional validation for face values.
        if (currentFaceValues.some(isNaN) || currentFaceValues.length !== 6) {
            process.stdout.write(`Invalid face values on line ${i + 2}. Expected 6 numbers separated by spaces.\n`);
            return;
        }

        try {
            const newSpatialDie = new SpatialDie(currentFaceValues);
            spatialDieInstances.push(newSpatialDie);
        } catch (error) {
            process.stdout.write(`Error creating SpatialDie: ${error.message}\n`);
            return;
        }
    }

    // Check for any congruent cube pairs in the collection.
    if (checkDuplicateCubes(spatialDieInstances)) {
        process.stdout.write('No\n'); // Output 'No' if duplicates are found.
    } else {
        process.stdout.write('Yes\n'); // Output 'Yes' if all cubes are unique in orientation.
    }

})((typeof process !== 'undefined' && process.versions != null && process.versions.node != null)
    ? require('fs').readFileSync('/dev/stdin', 'utf8')
    : "/* Mock input for browser testing: */\n2\n1 2 3 4 5 6\n1 2 3 4 5 6"
); // Use Node.js fs module if available, otherwise a mock string.