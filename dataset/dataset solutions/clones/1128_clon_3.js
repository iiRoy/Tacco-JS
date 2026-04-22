// A fundamental construct for representing a two-dimensional coordinate pair.
class CartesianPoint {
    // Constructor to initialize a new CartesianPoint instance.
    constructor(abscissaValue, ordinateValue) {
        // Validate that both coordinates are indeed numerical values.
        if (typeof abscissaValue !== 'number' || typeof ordinateValue !== 'number') {
            // Throw an error for invalid input types, ensuring data integrity.
            throw new Error("Coordinate values must be numerical for a CartesianPoint.");
        }
        this.coordX = abscissaValue; // Stores the horizontal position (x-coordinate).
        this.coordY = ordinateValue; // Stores the vertical position (y-coordinate).
    }

    // Method to provide a user-friendly string representation of the point.
    displayCoordinates() {
        return `(${this.coordX}, ${this.coordY})`;
    }
}

/**
 * Compares the angular orientation of two points (point_A, point_B) relative to a fixed reference point (anchor_Point).
 * This function is typically used as a comparator for sorting points in geometric algorithms
 * such as the Graham Scan for convex hulls.
 *
 * The comparison is based on the 2D cross product of vectors (anchor_Point -> point_A) and (anchor_Point -> point_B).
 * A positive cross product implies point_B is counter-clockwise to point_A.
 * A negative cross product implies point_B is clockwise to point_A.
 * A zero cross product implies that anchor_Point, point_A, and point_B are collinear.
 *
 * @param {CartesianPoint} point_A - The first point for angular comparison.
 * @param {CartesianPoint} point_B - The second point for angular comparison.
 * @param {CartesianPoint} anchor_Point - The fixed reference point around which the angular order is determined.
 * @returns {number} - Returns -1 if point_A should come before point_B (counter-clockwise),
 *                     1 if point_A should come after point_B (clockwise),
 *                     or -1/1 based on Y and then X coordinates if they are collinear.
 */
function determineAngularOrder(point_A, point_B, anchor_Point) {
    // Calculate the components of the vector from anchor_Point to point_A.
    const vectorAX = point_A.coordX - anchor_Point.coordX;
    const vectorAY = point_A.coordY - anchor_Point.coordY;

    // Calculate the components of the vector from anchor_Point to point_B.
    const vectorBX = point_B.coordX - anchor_Point.coordX;
    const vectorBY = point_B.coordY - anchor_Point.coordY;

    // Compute the 2D cross product: (vectorAX * vectorBY) - (vectorAY * vectorBX).
    // This value indicates the orientation of point_B relative to point_A with respect to anchor_Point.
    const orientationResult = (vectorAX * vectorBY) - (vectorAY * vectorBX);

    // If the points are collinear (cross product is zero),
    // we use their Y-coordinates (and then X-coordinates for tie-breaking) to sort them.
    if (orientationResult === 0) {
        // If Y-coordinates are identical, sort by X-coordinate.
        if (point_A.coordY === point_B.coordY) {
            return point_A.coordX <= point_B.coordX ? -1 : 1;
        }
        // Otherwise, sort by Y-coordinate.
        return point_A.coordY <= point_B.coordY ? -1 : 1;
    }

    // For non-collinear points, sort based on the sign of the cross product.
    // A positive value means point_B is counter-clockwise from point_A (point_A comes first).
    // A negative value means point_B is clockwise from point_A (point_B comes first).
    return orientationResult > 0 ? -1 : 1;
}

/**
 * Exchanges the element at the first position of an array with an element at a specified target index.
 * This is a utility function used to move a particular element to the front of a collection.
 *
 * @param {Array<any>} dataArray - The array in which elements are to be swapped.
 * @param {number} targetElementIndex - The index of the element that will be moved to the first position.
 * @returns {Array<any>} The modified array with the elements swapped.
 */
function repositionFirstElement(dataArray, targetElementIndex) {
    // Implement a guard clause to prevent operations with invalid indices.
    if (targetElementIndex < 0 || targetElementIndex >= dataArray.length) {
        console.warn(`Warning: Attempted to swap using an out-of-bounds index: ${targetElementIndex}. No operation performed.`);
        return dataArray; // Return the array unchanged if index is invalid.
    }

    // Utilize array destructuring assignment for a clean and efficient swap.
    [dataArray[0], dataArray[targetElementIndex]] = [dataArray[targetElementIndex], dataArray[0]];
    return dataArray; // Return the array after the swap.
}

/**
 * Scans a collection of Cartesian points to identify the "lowest-most" point
 * (i.e., the point with the smallest Y-coordinate, and for ties, the smallest X-coordinate).
 * Once identified, this point is moved to the very beginning of the collection.
 * This operation is often a preparatory step in geometric algorithms, establishing an anchor point.
 *
 * @param {Array<CartesianPoint>} pointCollection - An array of CartesianPoint objects to be processed.
 * @param {number} totalPointCount - The total number of points in the collection.
 * @returns {void} This function modifies the input array directly (in-place) and does not return a value.
 */
function establishGeometricAnchor(pointCollection, totalPointCount) {
    // Immediate return if the collection is empty, null, or has an invalid size.
    if (!pointCollection || totalPointCount <= 0) {
        // Log a warning if the input is not suitable for processing.
        console.warn("Cannot establish an anchor point for an empty or invalid point collection.");
        return;
    }

    // Initialize tracking variables with the first point's data.
    let currentMinimumY = pointCollection[0].coordY;
    let indexOfTheAnchor = 0;

    // Iterate through the collection starting from the second point (index 1).
    for (let currentIterationIndex = 1; currentIterationIndex < totalPointCount; currentIterationIndex++) {
        const candidatePoint = pointCollection[currentIterationIndex]; // The point currently being examined.
        const candidateYCoord = candidatePoint.coordY;
        const candidateXCoord = candidatePoint.coordX;

        // Check if the current candidate point has a lower Y-coordinate.
        if (candidateYCoord < currentMinimumY) {
            currentMinimumY = candidateYCoord;
            indexOfTheAnchor = currentIterationIndex;
        }
        // If Y-coordinates are identical, use the X-coordinate as a tie-breaker.
        else if (candidateYCoord === currentMinimumY) {
            const existingAnchorXCoord = pointCollection[indexOfTheAnchor].coordX;
            if (candidateXCoord < existingAnchorXCoord) {
                indexOfTheAnchor = currentIterationIndex;
            }
        }
    }

    // If the identified anchor point is not already at the first position, perform a swap.
    if (indexOfTheAnchor !== 0) {
        repositionFirstElement(pointCollection, indexOfTheAnchor);
    }
    // The array `pointCollection` is modified by reference.
}


// --- Main Program Execution Section ---

// Acquire the Node.js file system module for reading input.
const fsModule = require('fs');

// Define the standard input file path for competitive programming environments.
const standardInputPath = '/dev/stdin';

let rawTextualInput;
try {
    // Attempt to read the entire content of the input file synchronously.
    // Specifying 'utf8' encoding ensures proper character interpretation.
    rawTextualInput = fsModule.readFileSync(standardInputPath, 'utf8');
} catch (readingError) {
    // Handle potential errors during file reading gracefully.
    console.error(`Fatal Error: Unable to read input data from ${standardInputPath}. Details: ${readingError.message}`);
    process.exit(1); // Terminate the program with an error code.
}

// Split the raw input string into an array of individual lines.
const inputLineArray = rawTextualInput.split("\n");

// Perform initial validation on the input structure.
if (inputLineArray.length === 0 || inputLineArray[0].trim() === '') {
    console.error("Input file is either empty or the first line (expected point count) is missing.");
    process.exit(1);
}

// Parse the first line to determine the expected count of geometric points.
const declaredPointCount = parseInt(inputLineArray[0].trim(), 10);

// Validate the parsed number of points.
if (isNaN(declaredPointCount) || declaredPointCount < 0) {
    console.error("Error: The declared number of points in the input is invalid or non-numeric.");
    process.exit(1);
}

// Initialize an empty array to store the parsed CartesianPoint objects.
const geometricPointsCollection = [];

// Loop through the input lines, starting from the second line (index 1),
// up to the declared number of points plus one (for the header line).
for (let currentLineNum = 1; currentLineNum <= declaredPointCount; currentLineNum++) {
    // Ensure that the current line actually exists in the input array.
    if (currentLineNum >= inputLineArray.length || inputLineArray[currentLineNum].trim() === '') {
        console.warn(`Warning: Input data ended prematurely or line ${currentLineNum} is empty. Expected ${declaredPointCount} points.`);
        break; // Stop processing if input is exhausted or line is blank.
    }

    // Split the current line by space to separate X and Y coordinates.
    const coordinateStrings = inputLineArray[currentLineNum].trim().split(" ");

    // Validate that at least two coordinate values are present.
    if (coordinateStrings.length < 2) {
        console.warn(`Warning: Skipping malformed point data on line ${currentLineNum}: "${inputLineArray[currentLineNum]}". Requires two numerical values.`);
        continue; // Skip to the next line if data is incomplete.
    }

    // Parse the X and Y coordinates from their string representations.
    const parsedX = parseInt(coordinateStrings[0], 10);
    const parsedY = parseInt(coordinateStrings[1], 10);

    // Validate that the parsed coordinates are indeed numbers.
    if (isNaN(parsedX) || isNaN(parsedY)) {
        console.warn(`Warning: Skipping point on line ${currentLineNum} due to non-numeric coordinate values.`);
        continue; // Skip if coordinates are not valid numbers.
    }

    // Create a new CartesianPoint object and add it to our collection.
    geometricPointsCollection.push(new CartesianPoint(parsedX, parsedY));
}

// After parsing, check if the actual number of collected points matches the declared count.
const actualCollectedCount = geometricPointsCollection.length;
if (actualCollectedCount !== declaredPointCount) {
    console.warn(`Note: Declared ${declaredPointCount} points, but successfully parsed and collected ${actualCollectedCount} points.`);
}

// Phase 1: Locate the lowest-most (and then left-most) point and place it at the array's beginning.
// This point will serve as the anchor for subsequent angular sorting.
establishGeometricAnchor(geometricPointsCollection, actualCollectedCount);

// Phase 2: The point now at index 0 is our established anchor.
const referenceAnchorPoint = geometricPointsCollection[0];

// Phase 3: Sort all other points (from index 1 onwards) based on their angular position
// relative to the `referenceAnchorPoint`.
// First, extract the subset of points to be sorted.
const pointsForAngularSorting = geometricPointsCollection.slice(1);

// Apply the custom angular comparison function for sorting.
pointsForAngularSorting.sort((ptA, ptB) => determineAngularOrder(ptA, ptB, referenceAnchorPoint));

// Phase 4: Reconstruct the final sorted array by combining the anchor point
// with the now angularly sorted remaining points.
const finalOrderedPointSet = [referenceAnchorPoint, ...pointsForAngularSorting];

// Output the results in a descriptive format.
console.log("--- Final Processed Point Data ---");
console.log(`Total points in the final set: ${finalOrderedPointSet.length}`);
console.log(`The primary anchor point is: ${finalOrderedPointSet[0].displayCoordinates()}`);

// Iterate through the final sorted collection and display each point.
finalOrderedPointSet.forEach((pointItem, index) => {
    console.log(`Entry ${index}: ${pointItem.displayCoordinates()}`);
});