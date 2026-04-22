const parseNumericValue = (textualData) => {
    // Ensures the input string is interpreted as a base-10 integer.
    return parseInt(textualData, 10);
};

const convertStringArrayToNumbers = (stringItems) => {
    // Maps an array of string representations of numbers to actual numeric values.
    return stringItems.map(item => parseNumericValue(item));
};

// The primary function orchestrating the coordinate movement problem solution.
function solveCoordinateMovement(rawDataStream) {
    // A constant defining a scaling factor or base dimension used in path calculations.
    // This value is crucial for determining the total path segments and individual movement steps.
    const PATH_BASE_DIMENSION = 10;

    // Split the raw input string into an array of lines.
    // It handles both Windows (\r\n) and Unix (\n) newlines and filters out any blank lines.
    const inputLines = rawDataStream.split(/\r?\n/).filter(line => line.trim() !== '');

    // Validate that there is at least enough input to determine the number of points.
    if (inputLines.length === 0) {
        console.error("Error: Input stream is empty. No data to process.");
        return 1; // Indicate an error state.
    }

    // The first line of input specifies the total quantity of coordinate pairs to follow.
    const numberOfTargetPoints = parseNumericValue(inputLines[0]);

    // Initialize a data structure to hold all the parsed coordinate pairs.
    const targetCoordinateCollection = [];

    // A utility function to determine if two points have incompatible parities for movement.
    // Specifically, checks if (x1+y1) and (x2+y2) have different modulo-2 results.
    const areParitiesIncompatible = (px1, py1, px2, py2) => {
        return ((px1 + py1) % 2) !== ((px2 + py2) % 2);
    };

    // Iterate through the input lines, parsing each coordinate pair.
    for (let currentPointIndex = 0; currentPointIndex < numberOfTargetPoints; currentPointIndex++) {
        // Retrieve the specific line containing the X and Y coordinates for the current point.
        const dataLine = inputLines[currentPointIndex + 1];
        if (!dataLine) {
            console.error(`Error: Data for point ${currentPointIndex + 1} is missing or malformed.`);
            return 1; // Exit due to insufficient data.
        }

        // Parse the X and Y values from the current line.
        const currentPointValues = convertStringArrayToNumbers(dataLine.split(' '));

        // Store the newly parsed point in our collection.
        targetCoordinateCollection[currentPointIndex] = currentPointValues;

        // Apply a crucial problem constraint: all points (x_i, y_i) must have the same parity
        // as the first point (x_0, y_0) when their coordinates are summed (x+y).
        // If this condition is violated, no solution exists.
        if (currentPointIndex > 0 && areParitiesIncompatible(
            targetCoordinateCollection[0][0], targetCoordinateCollection[0][1],
            currentPointValues[0], currentPointValues[1]
        )) {
            console.log(-1); // Output -1 to signify an impossible scenario.
            return 0;        // Terminate successfully (as per problem spec for impossible cases).
        }
    }

    // Calculate the parity of the sum of coordinates for the very first point.
    // This parity dictates a global transformation applied to all points.
    const sumParityOfFirstPoint = (targetCoordinateCollection[0][0] + targetCoordinateCollection[0][1]) % 2;

    // If the sum of the first point's coordinates is odd, a transformation is applied to all points.
    // The transformation swaps X and Y coordinates if the original X is even,
    // otherwise, the point remains unchanged. This ensures (x_transformed + y_transformed) is even.
    if (sumParityOfFirstPoint === 1) {
        targetCoordinateCollection.forEach((pointData, index) => {
            const originalX = pointData[0];
            const originalY = pointData[1];
            // If the X-coordinate is even, swap the X and Y values.
            if (originalX % 2 === 0) {
                targetCoordinateCollection[index] = [originalY, originalX];
            }
            // If originalX is odd, pointData remains as [originalX, originalY].
        });
    }

    // Determine the total count of individual movement segments in the path.
    // Starts with a base value, then adjusted based on the parities of the first point's components.
    let totalPathSegmentCount = 20;
    if (targetCoordinateCollection[0][0] % 2 !== 0) { // If first X is odd
        totalPathSegmentCount++;
    }
    if (targetCoordinateCollection[0][1] % 2 !== 0) { // If first Y is odd
        totalPathSegmentCount++;
    }

    // Output the calculated total number of movement segments.
    console.log(totalPathSegmentCount);

    // Generate a string representing the magnitudes of each path segment.
    // In this specific problem, each segment has a magnitude of 1.
    const individualSegmentMagnitudes = Array(totalPathSegmentCount).fill(1).join(' ');
    // Output this string.
    console.log(individualSegmentMagnitudes);

    // Now, iterate through each point to compute and output its unique path instruction sequence.
    for (let pointIteration = 0; pointIteration < numberOfTargetPoints; pointIteration++) {
        let pathInstructions = ''; // String builder for the current point's path.

        // Create a working copy of the current point's coordinates.
        // This allows modification during path calculation without affecting the original data.
        const currentCoordinates = [...targetCoordinateCollection[pointIteration]];
        let currentXCoord = currentCoordinates[0];
        let currentYCoord = currentCoordinates[1];

        // Apply initial 'R' movements and adjust coordinates if they are odd.
        // This step is critical to align coordinates for the subsequent path generation logic.
        if (currentXCoord % 2 !== 0) {
            pathInstructions += 'R';
            currentXCoord++; // Increment to make it even.
        }
        if (currentYCoord % 2 !== 0) {
            pathInstructions += 'R';
            currentYCoord++; // Increment to make it even.
        }

        // Calculate the number of steps required in each cardinal direction.
        // The logic (PATH_BASE_DIMENSION +/- coordinate) / 2 is derived from the problem's
        // coordinate transformation and movement rules, where each step effectively moves by 2 units.
        const stepsRight = (PATH_BASE_DIMENSION + currentXCoord) / 2;
        const stepsLeft = (PATH_BASE_DIMENSION - currentXCoord) / 2;
        const stepsUp = (PATH_BASE_DIMENSION + currentYCoord) / 2;
        const stepsDown = (PATH_BASE_DIMENSION - currentYCoord) / 2;

        // Append the directional movement strings to the path.
        // `padEnd` is used for efficient string repetition.
        pathInstructions += ''.padEnd(stepsRight, 'R');
        pathInstructions += ''.padEnd(stepsLeft, 'L');
        pathInstructions += ''.padEnd(stepsUp, 'U');
        pathInstructions += ''.padEnd(stepsDown, 'D');

        // Output the fully constructed path for the current point.
        console.log(pathInstructions);
    }

    return 0; // Indicate successful completion of the algorithm.
}

// Standard competitive programming entry point: read from stdin, execute solver.
try {
    const fileSystemModule = require("fs");
    const programInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    solveCoordinateMovement(programInputContent);
} catch (executionError) {
    console.error("An unexpected error occurred during input processing or execution:", executionError);
    process.exit(1); // Exit with an error code if an exception occurs.
}