// This JavaScript module computes the number of unblocked cells within a 3D cubic grid.
// It processes sets of restrictions, each defining a line segment of prohibited cells.
// The final output for each set is the count of cells that are not covered by any restriction.

const fileSystem = require('fs'); // Core module for file operations, used to read standard input.

/**
 * A utility function to convert a string to an integer.
 * It's safer than direct Number() or unary plus for parsing base-10 integers.
 * @param {string} text - The string to be parsed.
 * @returns {number} The parsed integer, or NaN if the string is not a valid integer.
 */
const convertToInteger = (text) => parseInt(text, 10);

// --- Main Program Execution ---
try {
    // Read the entire input stream from /dev/stdin (standard input) as a UTF-8 string.
    const fullInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Split the input content into an array of individual lines.
    // Filter out any lines that are empty or contain only whitespace to ensure clean data.
    const inputLinesArray = fullInputContent.split('\n').filter(line => line.trim().length > 0);

    let currentInputLinePointer = 0; // Index to keep track of the next line to process.

    /**
     * Helper function to retrieve the next non-empty line from the input array.
     * Advances the internal line pointer.
     * @returns {string|null} The next trimmed line, or null if no more lines are available.
     */
    const fetchNextInputLine = () => {
        if (currentInputLinePointer >= inputLinesArray.length) {
            return null; // All lines have been consumed.
        }
        return inputLinesArray[currentInputLinePointer++].trim();
    };

    // Process data blocks iteratively until a specific termination sequence ("0 0") is found.
    while (true) {
        const gridDimensionsAndConstraintCountLine = fetchNextInputLine();

        // Check for the termination condition or end of input.
        if (gridDimensionsAndConstraintCountLine === null || gridDimensionsAndConstraintCountLine === '0 0') {
            break; // Exit the main processing loop.
        }

        // Parse the two numbers from the current line: cube size (N) and number of constraints (H).
        const parsedDimensionsAndCounts = gridDimensionsAndConstraintCountLine.split(' ').map(convertToInteger);

        // --- Input Validation for Block Header ---
        if (parsedDimensionsAndCounts.length !== 2 || parsedDimensionsAndCounts.some(isNaN)) {
            console.error(`Error: Malformed dimension and constraint count line: "${gridDimensionsAndConstraintCountLine}". Skipping this data block.`);
            // Advance the line pointer past any potential constraint lines for this malformed block.
            // This assumes the next line would be a constraint if the header was valid.
            // For robustness, one might try to infer H, but for cloning, we just skip.
            // No reliable H, so we just continue to next block header.
            continue;
        }

        const cubeSideLength = parsedDimensionsAndCounts[0]; // N: The size of one side of the cube (N x N x N).
        const totalConstraintOperations = parsedDimensionsAndCounts[1]; // H: The number of blocking operations for this cube.

        // --- Further Validation for Cube Parameters ---
        if (cubeSideLength <= 0 || totalConstraintOperations < 0) {
            console.warn(`Warning: Invalid cube side length (${cubeSideLength}) or negative constraint count (${totalConstraintOperations}). Skipping this block.`);
            // Consume the remaining constraint lines for this invalid block to prevent misinterpreting them later.
            for (let k = 0; k < totalConstraintOperations; k++) {
                fetchNextInputLine(); // Discard the line.
            }
            continue;
        }

        // Initialize a Set to store unique coordinates of cells that are marked as prohibited.
        // Using a Set is efficient for checking uniqueness and adding new items (average O(1)).
        const blockedCellCoordinates = new Set();

        // Process each individual constraint operation for the current cube.
        for (let constraintRun = 0; constraintRun < totalConstraintOperations; constraintRun++) {
            const currentConstraintDescriptor = fetchNextInputLine();

            // --- Input Validation for Constraint Line ---
            if (currentConstraintDescriptor === null) {
                console.error(`Error: Unexpected end of input while expecting constraint #${constraintRun} for cube size ${cubeSideLength}. Aborting current block.`);
                break; // Stop processing constraints for this block if input runs out.
            }

            const constraintComponents = currentConstraintDescriptor.split(' ');

            if (constraintComponents.length !== 3) {
                console.error(`Error: Incorrect format for constraint line: "${currentConstraintDescriptor}". Expected 3 parts. Skipping this constraint.`);
                continue; // Move to the next constraint.
            }

            const constraintTypeIdentifier = constraintComponents[0]; // e.g., "xy", "xz", "yz"
            const firstFixedCoordinate = convertToInteger(constraintComponents[1]);
            const secondFixedCoordinate = convertToInteger(constraintComponents[2]);

            // --- Validation for Constraint Coordinates ---
            if (isNaN(firstFixedCoordinate) || isNaN(secondFixedCoordinate)) {
                console.error(`Error: Non-numeric coordinate values in constraint: "${currentConstraintDescriptor}". Skipping.`);
                continue; // Skip this constraint.
            }

            // Iterate over the range of the varying coordinate (from 0 up to cubeSideLength - 1).
            // For each step, a 3D coordinate string is generated and added to the set of blocked cells.
            for (let dynamicCoordinateValue = 0; dynamicCoordinateValue < cubeSideLength; dynamicCoordinateValue++) {
                let cellKey; // Represents the (x,y,z) coordinate as a string, e.g., "1,2,3"

                // Based on the constraint type, construct the full 3D coordinate.
                // The problem defines these as lines:
                // "xy": x is fixed to firstFixedCoordinate, y to secondFixedCoordinate, z varies.
                // "xz": x is fixed to firstFixedCoordinate, z to secondFixedCoordinate, y varies.
                // "yz": y is fixed to firstFixedCoordinate, z to secondFixedCoordinate, x varies.
                switch (constraintTypeIdentifier) {
                    case 'xy':
                        // (x, y, z) where x=A, y=B, z=V
                        cellKey = `${firstFixedCoordinate},${secondFixedCoordinate},${dynamicCoordinateValue}`;
                        break;
                    case 'xz':
                        // (x, y, z) where x=A, y=V, z=B
                        cellKey = `${firstFixedCoordinate},${dynamicCoordinateValue},${secondFixedCoordinate}`;
                        break;
                    case 'yz':
                        // (x, y, z) where x=V, y=A, z=B
                        cellKey = `${dynamicCoordinateValue},${firstFixedCoordinate},${secondFixedCoordinate}`;
                        break;
                    default:
                        console.warn(`Warning: Unrecognized constraint type "${constraintTypeIdentifier}" in line: "${currentConstraintDescriptor}". Skipping this constraint.`);
                        continue; // Skip to the next constraint operation.
                }
                blockedCellCoordinates.add(cellKey); // Mark this cell as blocked.
            }
        }

        // Calculate the total volume of the cube.
        const totalPossibleCells = cubeSideLength * cubeSideLength * cubeSideLength;

        // The number of unique blocked cells is simply the size of the Set.
        const countOfUniqueBlockedCells = blockedCellCoordinates.size;

        // Compute the number of available (unblocked) cells.
        const availableCellCount = totalPossibleCells - countOfUniqueBlockedCells;

        // Output the result for the current data block to standard output, followed by a newline.
        process.stdout.write(`${availableCellCount}\n`);
    }

} catch (unexpectedError) {
    // Catch and report any unhandled exceptions that occur during execution.
    console.error('An unexpected runtime error occurred:', unexpectedError.message);
    // Optionally, exit with an error code to signal failure.
    // process.exit(1);
}