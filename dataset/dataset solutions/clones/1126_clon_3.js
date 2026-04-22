class Vector2D {
    // Initializes a new two-dimensional vector object.
    // It accepts two numeric components, a horizontal (X) and a vertical (Y) value.
    constructor(horizontalComponent, verticalComponent) {
        // Basic validation: ensure components are indeed numbers.
        if (typeof horizontalComponent !== 'number' || typeof verticalComponent !== 'number' || isNaN(horizontalComponent) || isNaN(verticalComponent)) {
            console.error("Vector2D Initialization Error: Both components must be valid numbers.");
            // Assign default values or throw an error based on desired robustness.
            this.xCoord = 0;
            this.yCoord = 0;
            return;
        }
        // Assign the provided values to internal properties.
        this.xCoord = horizontalComponent;
        this.yCoord = verticalComponent;
    }

    // Provides a string representation of the vector for debugging or display.
    toDebugString() {
        return `[X: ${this.xCoord}, Y: ${this.yCoord}]`;
    }

    // Calculates the squared Euclidean distance from the origin (0,0) or another vector.
    // This can be used for distance comparisons without needing a square root.
    getSquaredMagnitude(otherVector = null) {
        let dx, dy;
        if (otherVector) {
            dx = this.xCoord - otherVector.xCoord;
            dy = this.yCoord - otherVector.yCoord;
        } else {
            dx = this.xCoord;
            dy = this.yCoord;
        }
        return (dx * dx) + (dy * dy);
    }
}

/**
 * Determines the relative orientation of three ordered points (pivotalPoint, currentPointA, currentPointB).
 * This function is crucial for algorithms like Graham Scan to sort points by polar angle.
 *
 * @param {Vector2D} pivotalPoint - The reference point (origin for angle calculation).
 * @param {Vector2D} currentPointA - The first point to compare.
 * @param {Vector2D} currentPointB - The second point to compare.
 * @returns {number}
 *   -1: currentPointB is counter-clockwise (left turn) relative to currentPointA from pivotalPoint.
 *    1: currentPointB is clockwise (right turn) relative to currentPointA from pivotalPoint.
 *    0: pivotalPoint, currentPointA, and currentPointB are collinear.
 */
function evaluatePointOrientation(pivotalPoint, currentPointA, currentPointB) {
    // Calculate the difference vectors from the pivotal point.
    const deltaXA = currentPointA.xCoord - pivotalPoint.xCoord;
    const deltaYA = currentPointA.yCoord - pivotalPoint.yCoord;
    const deltaXB = currentPointB.xCoord - pivotalPoint.xCoord;
    const deltaYB = currentPointB.yCoord - pivotalPoint.yCoord;

    // Compute the 2D cross product (Z-component of 3D cross product).
    // A positive value implies CCW turn, negative implies CW, zero implies collinear.
    const crossProductValue = (deltaXA * deltaYB) - (deltaYA * deltaXB);

    // Handle collinear points as a special case.
    if (crossProductValue === 0) {
        // If collinear, sort by Y-coordinate first, then X-coordinate.
        // This ensures a consistent order for points lying on the same ray from the pivotal point.
        if (currentPointA.yCoord !== currentPointB.yCoord) {
            return currentPointA.yCoord < currentPointB.yCoord ? -1 : 1; // Smaller Y comes first
        }
        return currentPointA.xCoord < currentPointB.xCoord ? -1 : 1; // Smaller X comes first
    }

    // For non-collinear points, return based on the cross product sign.
    // A positive cross product indicates a counter-clockwise turn (currentPointA comes before currentPointB).
    // A negative cross product indicates a clockwise turn (currentPointB comes before currentPointA).
    return (crossProductValue > 0) ? -1 : 1;
}

/**
 * Exchanges the positions of two elements within an array.
 * This helper function modifies the array in place.
 *
 * @param {Array<any>} targetArray - The array whose elements are to be swapped.
 * @param {number} indexOne - The index of the first element.
 * @param {number} indexTwo - The index of the second element.
 * @returns {boolean} True if the swap was performed, false if inputs were invalid.
 */
function swapArrayElements(targetArray, indexOne, indexTwo) {
    // Robustness checks for array validity and index bounds.
    if (!Array.isArray(targetArray) || targetArray.length === 0 ||
        indexOne < 0 || indexOne >= targetArray.length ||
        indexTwo < 0 || indexTwo >= targetArray.length) {
        console.warn("Swap Operation Warning: Invalid array or indices provided.");
        return false;
    }

    // No action needed if indices are identical.
    if (indexOne === indexTwo) {
        return true;
    }

    // Perform the actual swap using a temporary variable.
    const temporaryHolder = targetArray[indexOne];
    targetArray[indexOne] = targetArray[indexTwo];
    targetArray[indexTwo] = temporaryHolder;
    return true;
}

/**
 * Locates the point with the minimum Y-coordinate (and minimum X in case of Y-ties)
 * within a list of Vector2D objects and moves it to the very first position in the list.
 * This is a common preparatory step for geometric algorithms like Graham Scan.
 *
 * @param {Array<Vector2D>} vectorCollection - An array of Vector2D objects. Modified in place.
 * @returns {void}
 */
function identifyAndPositionLowestVector(vectorCollection) {
    // Handle edge cases: empty or single-element collections.
    if (!Array.isArray(vectorCollection) || vectorCollection.length < 2) {
        if (vectorCollection.length === 1) {
            console.info("Info: Collection has only one vector; no reordering necessary.");
        } else {
            console.warn("Warning: Cannot process an empty or invalid vector collection.");
        }
        return;
    }

    let minFoundY = vectorCollection[0].yCoord;
    let minFoundX = vectorCollection[0].xCoord;
    let minVectorIndex = 0;

    // Iterate through the collection to find the vector that is "lowest" and "leftmost".
    for (let currentPosition = 1; currentPosition < vectorCollection.length; ++currentPosition) {
        const currentVector = vectorCollection[currentPosition];

        // Check if the current vector has a lower Y-coordinate.
        if (currentVector.yCoord < minFoundY) {
            minFoundY = currentVector.yCoord;
            minFoundX = currentVector.xCoord; // Update X as well for potential future ties
            minVectorIndex = currentPosition;
        }
        // If Y-coordinates are identical, use X-coordinate as a tie-breaker.
        else if (currentVector.yCoord === minFoundY && currentVector.xCoord < minFoundX) {
            minFoundX = currentVector.xCoord;
            minVectorIndex = currentPosition;
        }
    }

    // Move the identified lowest vector to the first position using our swap utility.
    swapArrayElements(vectorCollection, 0, minVectorIndex);
    console.log(`Debug: Identified and moved lowest vector ${vectorCollection[0].toDebugString()} to index 0.`);
}

// Main program execution block.
const filesystemModule = require('fs'); // Alias 'fs' for clarity.

const standardInputFile = '/dev/stdin'; // Default input source path.
let fileContents;

try {
    // Attempt to read all data from the standard input file synchronously.
    // Specifying UTF-8 encoding ensures correct character interpretation.
    fileContents = filesystemModule.readFileSync(standardInputFile, { encoding: 'utf8', flag: 'r' });
} catch (ioError) {
    // Report any I/O errors and terminate the process gracefully.
    console.error(`Fatal Error: Unable to read from standard input (${standardInputFile}). Details: ${ioError.message}`);
    process.exit(1);
}

// Split the entire content into individual lines, filtering out any empty lines.
const inputDataLines = fileContents.split('\n').filter(lineContent => lineContent.trim() !== '');

// Validate input structure: must have at least one line for the count.
if (inputDataLines.length === 0) {
    console.error("Fatal Error: Input data is empty or contains only whitespace.");
    process.exit(1);
}

// Parse the first line to get the total number of vectors expected.
const vectorCount = parseInt(inputDataLines[0].trim(), 10); // Use radix 10 for safety.

// Further validation on the parsed count.
if (isNaN(vectorCount) || vectorCount <= 0) {
    console.error(`Fatal Error: Invalid or non-positive vector count specified: "${inputDataLines[0]}".`);
    process.exit(1);
}

// Check if enough data lines are provided for the declared vector count.
if (inputDataLines.length < vectorCount + 1) {
    console.error(`Fatal Error: Expected ${vectorCount} vectors, but only ${inputDataLines.length - 1} data lines found.`);
    process.exit(1);
}

const collectedVectors = []; // Array to store our parsed Vector2D objects.

// Loop through the remaining lines to parse individual vector coordinates.
for (let currentLineNum = 1; currentLineNum <= vectorCount; ++currentLineNum) {
    const rawLine = inputDataLines[currentLineNum].trim();
    // Split line by one or more spaces to get X and Y components.
    const coordinateStrings = rawLine.split(/\s+/);

    // Validate that exactly two components were found.
    if (coordinateStrings.length !== 2) {
        console.warn(`Parsing Warning: Skipping malformed line ${currentLineNum} ("${rawLine}"). Expected two coordinates.`);
        continue;
    }

    const xVal = parseInt(coordinateStrings[0], 10);
    const yVal = parseInt(coordinateStrings[1], 10);

    // Validate that parsed components are numbers.
    if (isNaN(xVal) || isNaN(yVal)) {
        console.warn(`Parsing Warning: Skipping line ${currentLineNum} ("${rawLine}") due to non-numeric coordinates.`);
        continue;
    }

    // Create a new Vector2D object and add it to our collection.
    collectedVectors.push(new Vector2D(xVal, yVal));
}

console.log("\n--- Initial Collection of Vectors ---");
collectedVectors.forEach(vec => console.log(vec.toDebugString()));
console.log("-------------------------------------");

// Perform the initial reordering step: find the lowest vector and place it first.
identifyAndPositionLowestVector(collectedVectors);

// The first element in the collection is now our pivotal reference point.
const baseReferenceVector = collectedVectors[0];

// Create a new array containing all vectors except the base reference vector.
// This is done to sort them relative to the base reference.
const remainingVectorsForSorting = collectedVectors.slice(1);

// Sort the remaining vectors using the polar angle comparison function.
// The `sort` method will modify `remainingVectorsForSorting` in place.
remainingVectorsForSorting.sort((vecA, vecB) => evaluatePointOrientation(baseReferenceVector, vecA, vecB));

// Reconstruct the final sorted collection by prepending the base reference vector.
const fullyOrderedVectorSet = [baseReferenceVector].concat(remainingVectorsForSorting);

// Output the final, sorted collection of vectors.
console.log("\n--- Final Sorted Vector Collection (Polar Angle from Lowest Point) ---");
fullyOrderedVectorSet.forEach(vec => console.log(vec.toDebugString()));
console.log("--------------------------------------------------------------------");

// The original code only outputted the raw `points` array.
// To match that closely (though with fixed logic and renamed vars),
// one could simply `console.log(fullyOrderedVectorSet);`
// However, the `toDebugString` provides more readable output for Type III.
// This example retains the more informative output.