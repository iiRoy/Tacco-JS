const filesystemModule = require('fs'); // Import the file system module.

// A class to represent a 2D vector or point in a coordinate system.
class Coordinate {
    // Constructor to initialize the horizontal (x) and vertical (y) components.
    constructor(xCoord, yCoord) {
        this.horizontal = xCoord; // Stores the x-value.
        this.vertical = yCoord;   // Stores the y-value.
    }

    // Provides a string representation of the coordinate.
    display() {
        return `(${this.horizontal}, ${this.vertical})`;
    }

    // Calculates the squared Euclidean distance from the origin.
    // Useful for comparisons without needing the square root.
    getSquaredMagnitude() {
        return this.horizontal * this.horizontal + this.vertical * this.vertical;
    }
}

/**
 * Determines the orientation of an ordered triplet of points (p, q, r).
 * The function returns:
 *  - A positive value if r is to the left (counter-clockwise) of the vector pq.
 *  - A negative value if r is to the right (clockwise) of the vector pq.
 *  - Zero if p, q, and r are collinear.
 * This is effectively the 2D cross product of vectors pq and pr.
 *
 * @param {Coordinate} p The reference point (origin of vector pq).
 * @param {Coordinate} q The second point defining vector pq.
 * @param {Coordinate} r The third point defining vector pr.
 * @returns {number} An integer representing the orientation.
 */
const calculateOrientation = (p, q, r) => {
    // Cross product calculation: (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)
    const crossProductValue = (q.horizontal - p.horizontal) * (r.vertical - p.vertical) -
                              (q.vertical - p.vertical) * (r.horizontal - p.horizontal);
    return crossProductValue;
};

/**
 * Locates the point with the minimum Y-coordinate (and minimum X in case of ties)
 * in a collection of coordinates and moves it to the beginning of the array.
 * This point will serve as the base point for subsequent angular sorting.
 *
 * @param {Array<Coordinate>} coordinateCollection An array of Coordinate objects.
 * @returns {Array<Coordinate>} The modified array with the base point at index 0.
 */
function establishInitialBasePoint(coordinateCollection) {
    // Validate input array.
    if (!Array.isArray(coordinateCollection) || coordinateCollection.length === 0) {
        console.error("Error: Input coordinate collection is empty or invalid.");
        return []; // Return an empty array or throw an error.
    }

    let lowestY = coordinateCollection[0].vertical; // Initialize with the first point's Y.
    let lowestX = coordinateCollection[0].horizontal; // Initialize with the first point's X.
    let indexOfLowest = 0; // Keep track of the index of the lowest point.

    // Iterate through the collection to find the point with the minimum Y.
    // If Y-coordinates are equal, choose the one with the minimum X.
    for (let currentIdx = 1; currentIdx < coordinateCollection.length; ++currentIdx) {
        const currentCoord = coordinateCollection[currentIdx];

        if (currentCoord.vertical < lowestY ||
            (currentCoord.vertical === lowestY && currentCoord.horizontal < lowestX)) {
            lowestY = currentCoord.vertical;
            lowestX = currentCoord.horizontal;
            indexOfLowest = currentIdx;
        }
    }

    // Move the identified lowest point to the first position in the array.
    // This is done using array destructuring for a concise swap.
    [coordinateCollection[0], coordinateCollection[indexOfLowest]] =
    [coordinateCollection[indexOfLowest], coordinateCollection[0]];

    console.log(`Debug: Identified base point: ${coordinateCollection[0].display()}`);
    return coordinateCollection; // Return the modified array.
}

// Main execution block wrapped in an IIFE for scope management.
(function mainExecution() {
    // Attempt to read input from standard input or a specified file path.
    // Using a try-catch block for robust error handling during file operations.
    let rawInputContent;
    try {
        rawInputContent = filesystemModule.readFileSync('/dev/stdin', 'utf8');
    } catch (readError) {
        console.error(`Failed to read input from /dev/stdin: ${readError.message}`);
        process.exit(1); // Exit with an error code.
    }

    // Split the raw content into individual lines.
    const inputLines = rawInputContent.split('\n');

    // Parse the number of coordinates from the first line.
    const numCoordinatesStr = inputLines[0];
    const totalPointsCount = parseInt(numCoordinatesStr, 10);

    // Basic validation for the number of points.
    if (isNaN(totalPointsCount) || totalPointsCount <= 0) {
        console.error("Error: Invalid or non-positive number of coordinates specified.");
        process.exit(1);
    }
    if (totalPointsCount + 1 > inputLines.length) {
        console.error("Error: Not enough input lines for the specified number of coordinates.");
        process.exit(1);
    }

    const coordinateCollection = []; // Array to store parsed Coordinate objects.

    // Iterate from the second line (index 1) to parse each coordinate.
    for (let i = 1; i <= totalPointsCount; ++i) {
        const lineData = inputLines[i];
        if (!lineData) {
            console.warn(`Warning: Skipping empty line at index ${i}.`);
            continue;
        }

        const components = lineData.split(' '); // Split x and y values by space.
        if (components.length < 2) {
            console.error(`Error: Malformed coordinate data on line ${i}: '${lineData}'. Expected two numbers.`);
            process.exit(1);
        }

        const parsedX = parseInt(components[0], 10);
        const parsedY = parseInt(components[1], 10);

        if (isNaN(parsedX) || isNaN(parsedY)) {
            console.error(`Error: Non-numeric coordinate values on line ${i}: '${lineData}'.`);
            process.exit(1);
        }

        coordinateCollection.push(new Coordinate(parsedX, parsedY)); // Create and add a new Coordinate object.
    }

    console.log(`Debug: Successfully parsed ${coordinateCollection.length} coordinates.`);

    // Find the base point (lowest Y, then lowest X) and move it to the front.
    const processedCoordinates = establishInitialBasePoint(coordinateCollection);

    // If the collection is empty after processing (e.g., due to initial validation), exit.
    if (processedCoordinates.length === 0) {
        console.log("No coordinates to process after base point establishment.");
        return;
    }

    // The first point in the array is now our reference point for angular sorting.
    const baseReferencePoint = processedCoordinates[0];

    // Prepare the remaining points for sorting (all except the base point).
    const remainingPointsForSorting = processedCoordinates.slice(1);

    // Sort the remaining points based on the angle they make with the base point.
    // A standard Graham Scan sort uses counter-clockwise orientation.
    const sortedAngularly = remainingPointsForSorting.sort((pointOne, pointTwo) => {
        // Calculate the orientation of (baseReferencePoint, pointOne, pointTwo).
        const orientationResult = calculateOrientation(baseReferencePoint, pointOne, pointTwo);

        // If collinear (orientationResult === 0), sort by distance from the base point.
        // The closer point comes first.
        if (orientationResult === 0) {
            const distSqOne = (pointOne.horizontal - baseReferencePoint.horizontal) ** 2 +
                              (pointOne.vertical - baseReferencePoint.vertical) ** 2;
            const distSqTwo = (pointTwo.horizontal - baseReferencePoint.horizontal) ** 2 +
                              (pointTwo.vertical - baseReferencePoint.vertical) ** 2;
            return distSqOne - distSqTwo; // Sort by squared distance.
        }

        // If not collinear, sort by orientation.
        // A positive orientation means pointTwo is counter-clockwise to pointOne.
        // For counter-clockwise sorting, positive values should come before negative ones.
        // So, if orientation is positive, pointOne comes before pointTwo (return -1).
        // If orientation is negative, pointTwo comes before pointOne (return 1).
        return orientationResult > 0 ? -1 : 1;
    });

    // Combine the base point with the newly sorted array of points.
    const finalOrderedSet = [baseReferencePoint, ...sortedAngularly];

    // Output the final ordered set of coordinates.
    console.log("--- Final Ordered Coordinate Set ---");
    finalOrderedSet.forEach((coord, index) => {
        console.log(`[${index}]: ${coord.display()}`);
    });

    // Example of adding a new fragment: a simple check or additional output.
    if (finalOrderedSet.length > 1) {
        console.log(`\nInitial point: ${finalOrderedSet[0].display()}`);
        console.log(`Second point in order: ${finalOrderedSet[1].display()}`);
    } else if (finalOrderedSet.length === 1) {
        console.log(`Only one point in the set: ${finalOrderedSet[0].display()}`);
    } else {
        console.log("No points were processed.");
    }

})(); // End of IIFE.