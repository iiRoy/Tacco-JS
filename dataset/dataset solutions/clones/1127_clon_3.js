class CoordinatePair {
    // A constructor for initializing two-dimensional coordinate objects.
    constructor(coordXValue, coordYValue) {
        // Input validation: Ensure coordinates are numbers.
        if (typeof coordXValue !== 'number' || typeof coordYValue !== 'number') {
            console.warn("Invalid coordinate type provided. Defaulting to (0,0).");
            this.coordX = 0;
            this.coordY = 0;
        } else {
            this.coordX = coordXValue; // Storing the horizontal component.
            this.coordY = coordYValue; // Storing the vertical component.
        }
    }

    // New fragment: A method to represent the coordinate pair as a string.
    asString() {
        return `(${this.coordX}, ${this.coordY})`;
    }

    // New fragment: A method to calculate squared Euclidean distance from the origin (0,0).
    // This could be useful for sorting collinear points relative to a base point.
    getSquaredDistanceFromOrigin() {
        return this.coordX * this.coordX + this.coordY * this.coordY;
    }
}

// --- Helper function for element rearrangement ---
// Renamed function, parameters, and added a guard clause.
// Using destructuring for swap.
function rearrangeElements(dataCollection, targetPosition) {
    // Ensure the collection is an array and targetPosition is valid.
    if (!Array.isArray(dataCollection) || dataCollection.length === 0 || targetPosition < 0 || targetPosition >= dataCollection.length) {
        console.error("Cannot rearrange: Invalid collection or target position.");
        return dataCollection; // Return original collection on error.
    }

    // Retrieve the initial element for swapping.
    const primaryElement = dataCollection[0];
    // Retrieve the element at the target position.
    const secondaryElement = dataCollection[targetPosition];

    // Perform the swap using array destructuring assignment.
    [dataCollection[0], dataCollection[targetPosition]] = [secondaryElement, primaryElement];

    // The modified collection is returned.
    return dataCollection;
}

// --- Helper function for finding and prioritizing the lowest point ---
// Renamed function, parameters, variables. Added intermediate steps,
// and refined the comparison logic.
function locateAndPrioritizeLowest(datasetOfPoints, totalPointCount) {
    // Pre-check for empty or invalid dataset.
    if (!Array.isArray(datasetOfPoints) || totalPointCount <= 0) {
        console.warn("Input dataset is empty or invalid for lowest point identification.");
        return []; // Return an empty array if no data.
    }

    let lowestYValue = datasetOfPoints[0].coordY; // Initialize with the first point's Y-coordinate.
    let lowestPointIndex = 0; // Index of the point currently considered lowest.

    // Iterate through the collection to find the point with the minimal Y-coordinate.
    // In case of a tie in Y, the point with the minimal X-coordinate is chosen.
    for (let currentIdx = 1; currentIdx < totalPointCount; currentIdx++) {
        const currentPoint = datasetOfPoints[currentIdx]; // Get the current point for comparison.
        const currentY = currentPoint.coordY;
        const currentX = currentPoint.coordX;

        const candidateLowestPoint = datasetOfPoints[lowestPointIndex]; // Get the current lowest point.
        const candidateLowestY = candidateLowestPoint.coordY;
        const candidateLowestX = candidateLowestPoint.coordX;

        // Condition for updating the lowest point:
        // 1. Current point has a strictly lower Y-coordinate.
        // 2. Current point has the same Y-coordinate but a strictly lower X-coordinate.
        const isYLower = currentY < candidateLowestY;
        const isYEqualAndXLower = (currentY === candidateLowestY) && (currentX < candidateLowestX);

        if (isYLower || isYEqualAndXLower) {
            lowestYValue = currentY; // Update the lowest Y-value found so far.
            lowestPointIndex = currentIdx; // Update the index of the lowest point.
        }
    }

    // After finding the lowest point, move it to the beginning of the array
    // using the dedicated rearrangement function.
    return rearrangeElements(datasetOfPoints, lowestPointIndex);
}

// --- New helper function for geometric orientation (cross product) ---
// This is added to support a more sophisticated sorting algorithm.
function calculateOrientation(p_a, p_b, p_c) {
    // Calculates the cross product (p_b - p_a) x (p_c - p_a).
    // A positive value means p_c is to the left of vector p_a->p_b.
    // A negative value means p_c is to the right.
    // Zero means p_a, p_b, p_c are collinear.
    const val = (p_b.coordY - p_a.coordY) * (p_c.coordX - p_b.coordX) -
                (p_b.coordX - p_a.coordX) * (p_c.coordY - p_b.coordY);
    return val;
}

// --- Main Program Execution Block ---
(async () => { // Using an async IIFE for potential future async operations (like fs.promises)
    const fileSystem = require('fs'); // Renamed module import variable.
    let rawInputData;
    try {
        // Read raw data from standard input, ensuring UTF-8 encoding.
        rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
    } catch (readError) {
        console.error("Failed to read input from /dev/stdin:", readError.message);
        process.exit(1); // Terminate if input cannot be read.
    }

    // Split the entire input string into individual lines.
    const inputLines = rawInputData.split("\n");

    // Guard clause: Ensure there's at least one line for the size.
    if (inputLines.length === 0 || inputLines[0].trim() === '') {
        console.error("Input data is empty or malformed (missing size).");
        process.exit(1);
    }

    // Parse the first line to get the total number of points.
    const totalPointCount = parseInt(inputLines[0].trim(), 10); // Explicit radix for parseInt.

    // Validate the parsed count.
    if (isNaN(totalPointCount) || totalPointCount < 0) {
        console.error("Invalid number of points specified in input.");
        process.exit(1);
    }

    const collectionOfPoints = []; // Use 'const' for the array itself.

    // Loop through subsequent lines to parse and create CoordinatePair objects.
    // Start from index 1 for input lines as index 0 is the size.
    // Loop up to totalPointCount + 1 to include all point lines.
    for (let currentLineIndex = 1; currentLineIndex <= totalPointCount; currentLineIndex++) {
        const currentLine = inputLines[currentLineIndex];
        // Skip empty lines that might occur at the end of input or due to formatting.
        if (!currentLine || currentLine.trim() === '') {
            continue;
        }

        // Split each line by space to get X and Y string components.
        const coordinateStrings = currentLine.split(" ");
        if (coordinateStrings.length < 2) {
            console.warn(`Skipping malformed line ${currentLineIndex}: "${currentLine}"`);
            continue;
        }

        // Parse string components to integers.
        const parsedX = parseInt(coordinateStrings[0], 10);
        const parsedY = parseInt(coordinateStrings[1], 10);

        // Validate parsed coordinates.
        if (isNaN(parsedX) || isNaN(parsedY)) {
            console.warn(`Skipping line ${currentLineIndex} due to invalid coordinate values.`);
            continue;
        }

        // Create a new CoordinatePair object and add it to the collection.
        collectionOfPoints.push(new CoordinatePair(parsedX, parsedY));
    }

    // Ensure the number of parsed points matches the declared size.
    if (collectionOfPoints.length !== totalPointCount) {
        console.warn(`Warning: Declared point count (${totalPointCount}) does not match actual parsed points (${collectionOfPoints.length}). Proceeding with parsed points.`);
    }

    // Step 1: Find the lowest-most point and place it at the beginning of the array.
    // This modifies 'collectionOfPoints' in place.
    const processedCollection = locateAndPrioritizeLowest(collectionOfPoints, collectionOfPoints.length);

    // Guard clause: Check if processing resulted in an empty collection.
    if (processedCollection.length === 0) {
        console.log("No points to process after initial filtering.");
        return; // Exit if no points are available.
    }

    // Store the reference point (the lowest-most point) which is now at index 0.
    // This fixes the 'parseInt(points[0])' bug from the original code.
    const referencePointForSorting = processedCollection[0];

    // Extract the remaining points (all except the reference point).
    // 'slice(1)' is the correct method, not 'subarray(1)'.
    let pointsToAngularSort = processedCollection.slice(1);

    // New intermediate step: Check if there are points to sort.
    if (pointsToAngularSort.length === 0) {
        console.log("Only one unique point found. No further sorting needed for remaining points.");
        // Output the single point found.
        console.log(`[${referencePointForSorting.asString()}]`);
        return;
    }

    // Step 2: Sort the remaining points based on their polar angle relative to the reference point.
    // If points are collinear with the reference, sort them by distance from the reference.
    pointsToAngularSort.sort((pointA, pointB) => {
        // Calculate orientation (cross product) for points A and B relative to the reference point.
        const orientationValue = calculateOrientation(referencePointForSorting, pointA, pointB);

        if (orientationValue === 0) {
            // Points are collinear with the reference point.
            // Sort by squared distance from the reference point.
            const distSqA = (pointA.coordX - referencePointForSorting.coordX) ** 2 +
                            (pointA.coordY - referencePointForSorting.coordY) ** 2;
            const distSqB = (pointB.coordX - referencePointForSorting.coordX) ** 2 +
                            (pointB.coordY - referencePointForSorting.coordY) ** 2;
            return distSqA - distSqB; // Sort closer points first.
        }
        // If orientation is positive, pointB is to the left of (ref -> pointA), so pointA comes first.
        // If orientation is negative, pointB is to the right, so pointB comes first.
        // We want counter-clockwise order, so positive orientation means pointA is 'less than' pointB.
        // The `sort` method expects a negative value if a < b, positive if a > b, zero if a == b.
        // Thus, a positive cross product (pointB left of ref->pointA) implies pointA should come *before* pointB.
        // A negative cross product (pointB right of ref->pointA) implies pointA should come *after* pointB.
        // We return -orientationValue for a counter-clockwise sort.
        return -orientationValue;
    });

    // Reconstruct the final ordered array by putting the reference point back at the start.
    const finalOrderedSet = [referencePointForSorting, ...pointsToAngularSort];

    // Output the final ordered set of points.
    // Using a different output format for variety.
    console.log("Final ordered sequence of points:");
    finalOrderedSet.forEach((coordP, idx) => {
        console.log(`${idx + 1}: ${coordP.asString()}`);
    });

})(); // End of async IIFE.