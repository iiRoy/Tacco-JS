"use strict";

// Wrap the primary execution in a try-catch block for robust error handling.
try {
    // Utilize the Node.js 'fs' module to synchronously read the input from standard input.
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    
    // Process the raw input: remove any trailing newline characters (CRLF or LF)
    // and then split the content into an array of strings, where each string is a line.
    const processedDataRows = rawInputContent.replace(/\r?\n$/, "").split(/\r?\n/);
    
    // Invoke the main processing function with the prepared array of input lines.
    handleCubeComparison(processedDataRows);
} catch (executionError) {
    // If any error occurs during input reading or processing, log it to standard error
    // and exit the process with a non-zero status code to indicate failure.
    console.error(`An unexpected error occurred during program execution: ${executionError.message}`);
    process.exit(1);
}

/**
 * Serves as the primary entry point for processing the input data
 * and orchestrating the cube comparison logic.
 * @param {string[]} inputLines - An array of strings, where each string represents a line of input.
 */
function handleCubeComparison(inputLines) {
    // Implement a guard clause to ensure sufficient input data is provided.
    // We expect at least two lines for two distinct cube configurations.
    if (!inputLines || inputLines.length < 2) {
        console.error("Error: Insufficient input data provided. Expected at least two lines for cube definitions.");
        return; // Terminate execution gracefully if input is invalid.
    }

    /**
     * Defines a representation of a six-sided spatial object (a cube)
     * with unique labels on each face.
     * The faces are internally mapped to specific orientations: Top, South, East, West, North, Bottom.
     * @constructor
     * @param {string[]} initialFaceLabels - An array of exactly six strings,
     *                                       representing the labels for each face in order.
     */
    function SpatialObject(initialFaceLabels) {
        // Enforce the requirement of exactly six face labels for a valid cube.
        if (!initialFaceLabels || initialFaceLabels.length !== 6) {
            throw new Error("SpatialObject must be initialized with exactly 6 face labels.");
        }
        
        // Assign the provided labels to specific, descriptive properties of the cube's faces.
        this.faceUp = initialFaceLabels[0]; // The label currently on the top face.
        this.faceSouth = initialFaceLabels[1]; // The label on the south-facing side.
        this.faceEast = initialFaceLabels[2]; // The label on the east-facing side.
        this.faceWest = initialFaceLabels[3]; // The label on the west-facing side.
        this.faceNorth = initialFaceLabels[4]; // The label on the north-facing side.
        this.faceDown = initialFaceLabels[5]; // The label currently on the bottom face.
    }

    /**
     * Rotates the spatial object around its central axis, effectively changing its orientation.
     * This method updates the labels on the affected faces based on the rotation direction.
     * @param {string} rotationDirection - A single character ("N", "S", "W", "E") indicating
     *                                     the direction of rotation relative to the current top face.
     */
    SpatialObject.prototype.performRotation = function(rotationDirection) {
        let temporarilyHeldValue; // A temporary variable to hold a face's value during the swap.

        // Utilize a switch statement for a clear and organized handling of different rotation types.
        switch (rotationDirection) {
            case "N": // Rotate towards North: Top becomes South, South becomes Bottom, etc.
                temporarilyHeldValue = this.faceUp;
                this.faceUp = this.faceSouth;
                this.faceSouth = this.faceDown;
                this.faceDown = this.faceNorth;
                this.faceNorth = temporarilyHeldValue;
                break;
            case "S": // Rotate towards South: Top becomes North, North becomes Bottom, etc.
                temporarilyHeldValue = this.faceUp;
                this.faceUp = this.faceNorth;
                this.faceNorth = this.faceDown;
                this.faceDown = this.faceSouth;
                this.faceSouth = temporarilyHeldValue;
                break;
            case "W": // Rotate towards West: Top becomes East, East becomes Bottom, etc.
                temporarilyHeldValue = this.faceUp;
                this.faceUp = this.faceEast;
                this.faceEast = this.faceDown;
                this.faceDown = this.faceWest;
                this.faceWest = temporarilyHeldValue;
                break;
            case "E": // Rotate towards East: Top becomes West, West becomes Bottom, etc.
                temporarilyHeldValue = this.faceUp;
                this.faceUp = this.faceWest;
                this.faceWest = this.faceDown;
                this.faceDown = this.faceEast;
                this.faceEast = temporarilyHeldValue;
                break;
            default:
                // Log a warning for any unrecognized rotation commands,
                // ensuring the cube's state remains unchanged for invalid inputs.
                console.warn(`Unrecognized rotation command: '${rotationDirection}'. Cube orientation unchanged.`);
                break;
        }
    };

    /**
     * Determines if this spatial object can achieve the same orientation (face configuration)
     * as another given spatial object through a series of rotations.
     * @param {SpatialObject} otherObject - The other spatial object to compare against.
     * @returns {boolean} - Returns `true` if an equivalent orientation can be found, `false` otherwise.
     */
    SpatialObject.prototype.canMatchOrientation = function(otherObject) {
        // Create a mutable copy of the current object to avoid altering the original instance.
        // This is crucial for comparison logic that involves rotating one of the objects.
        const currentObjectSnapshot = new SpatialObject([
            this.faceUp, this.faceSouth, this.faceEast, this.faceWest, this.faceNorth, this.faceDown
        ]);
        
        // Create a mutable copy of the target object for comparison and rotation.
        const comparisonTargetSnapshot = new SpatialObject([
            otherObject.faceUp, otherObject.faceSouth, otherObject.faceEast,
            otherObject.faceWest, otherObject.faceNorth, otherObject.faceDown
        ]);

        // Add an early exit condition: If the objects are already identical in their initial state,
        // there's no need to perform any rotations.
        if (currentObjectSnapshot.faceUp === comparisonTargetSnapshot.faceUp &&
            currentObjectSnapshot.faceSouth === comparisonTargetSnapshot.faceSouth &&
            currentObjectSnapshot.faceEast === comparisonTargetSnapshot.faceEast &&
            currentObjectSnapshot.faceWest === comparisonTargetSnapshot.faceWest &&
            currentObjectSnapshot.faceNorth === comparisonTargetSnapshot.faceNorth &&
            currentObjectSnapshot.faceDown === comparisonTargetSnapshot.faceDown) {
            return true;
        }

        // A predefined sequence of rotations designed to cycle through all 24 unique orientations
        // of a standard cube relative to a fixed observer.
        const comprehensiveRotationSequence = "EEEENEEEENEEEENEEENEEEENNEEEE";
        let equivalenceFound = false; // A flag to track if a matching orientation is discovered.

        // Iterate through each rotation instruction in the sequence.
        // The original `for...of` loop is rewritten as a traditional `for` loop.
        for (let i = 0; i < comprehensiveRotationSequence.length; i++) {
            const singleRotationCommand = comprehensiveRotationSequence[i];
            
            // After each rotation (or before the first), check if the objects match.
            if (currentObjectSnapshot.faceUp === comparisonTargetSnapshot.faceUp &&
                currentObjectSnapshot.faceSouth === comparisonTargetSnapshot.faceSouth &&
                currentObjectSnapshot.faceEast === comparisonTargetSnapshot.faceEast &&
                currentObjectSnapshot.faceWest === comparisonTargetSnapshot.faceWest &&
                currentObjectSnapshot.faceNorth === comparisonTargetSnapshot.faceNorth &&
                currentObjectSnapshot.faceDown === comparisonTargetSnapshot.faceDown) {
                equivalenceFound = true;
                break; // If a match is found, we can stop iterating early.
            }
            
            // Apply the next rotation to the target object's snapshot.
            comparisonTargetSnapshot.performRotation(singleRotationCommand);
        }
        
        // It's possible the last rotation in the sequence resulted in a match,
        // so a final check after the loop ensures no potential match is missed.
        if (!equivalenceFound &&
            currentObjectSnapshot.faceUp === comparisonTargetSnapshot.faceUp &&
            currentObjectSnapshot.faceSouth === comparisonTargetSnapshot.faceSouth &&
            currentObjectSnapshot.faceEast === comparisonTargetSnapshot.faceEast &&
            currentObjectSnapshot.faceWest === comparisonTargetSnapshot.faceWest &&
            currentObjectSnapshot.faceNorth === comparisonTargetSnapshot.faceNorth &&
            currentObjectSnapshot.faceDown === comparisonTargetSnapshot.faceDown) {
            equivalenceFound = true;
        }

        return equivalenceFound;
    };

    // Extract the face labels for the first cube from the first line of input.
    const firstCubeLabelSet = inputLines[0].split(" ");
    // Instantiate the primary spatial object using the parsed labels.
    const firstSpatialInstance = new SpatialObject(firstCubeLabelSet);

    // Extract the face labels for the second cube from the second line of input.
    const secondCubeLabelSet = inputLines[1].split(" ");
    // Instantiate the secondary spatial object for comparison.
    const secondSpatialInstance = new SpatialObject(secondCubeLabelSet);

    // Perform the comparison operation between the two instantiated spatial objects.
    const finalComparisonResult = firstSpatialInstance.canMatchOrientation(secondSpatialInstance);
    
    // Output the result to standard output as "Yes" or "No", matching the original format.
    console.log(finalComparisonResult ? "Yes" : "No");
}