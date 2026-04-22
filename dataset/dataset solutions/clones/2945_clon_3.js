/**
 * Processes raw input data to perform a series of operations.
 * @param {string} rawData - The entire input string, typically from standard input.
 */
function ProcessInput(rawData) {
    // Split the raw input into individual lines for easier processing.
    const dataLines = rawData.split('\n');

    // The first line contains the total number of operations to perform.
    let operationCount = parseInt(dataLines[0], 10);

    // Basic validation for the operation count. If invalid, treat as zero operations.
    if (isNaN(operationCount) || operationCount < 0) {
        console.error("Warning: Invalid operation count detected. Proceeding with 0 operations.");
        operationCount = 0;
    }

    // Initialize accumulators and data structures for operations.
    let totalValX = 0; // Accumulates sum of 'x' values from Type 1 operations.
    const collectedValues = []; // Stores all 'x' values added by Type 1 operations.

    // Iterate through each operation line, starting from the second line (index 1).
    for (let opIdx = 1; opIdx <= operationCount; ++opIdx) {
        // Split the current operation line by space to get its components.
        const currentOperation = dataLines[opIdx].split(' ');
        const operationType = parseInt(currentOperation[0], 10);

        // Skip processing if the line is malformed or operation type is invalid.
        if (currentOperation.length < 1 || isNaN(operationType)) {
            console.error(`Skipping malformed operation line: ${dataLines[opIdx]}`);
            continue;
        }

        // Handle operations based on their type.
        if (operationType === 1) {
            // Type 1 operation: Add two values (x, y) to the system.
            const operandX = parseInt(currentOperation[1], 10);
            const operandY = parseInt(currentOperation[2], 10); // 'y' value is stored but not used in this variant.

            // Validate operands. Skip if not valid numbers.
            if (isNaN(operandX) || isNaN(operandY)) {
                console.error(`Skipping Type 1 operation with invalid operands: ${dataLines[opIdx]}`);
                continue;
            }

            // Update total sum of 'x' values and add 'x' to the collection.
            totalValX += operandX;
            collectedValues.push(operandX);
        } else if (operationType === 2) {
            // Type 2 operation: Query for a specific statistic.

            // If no values have been collected yet, output default and continue.
            if (collectedValues.length === 0) {
                console.log('0 0');
                continue;
            }

            const currentCollectionSize = collectedValues.length;
            const averageX = totalValX / currentCollectionSize;

            // Find the element in `collectedValues` that is closest to `averageX`.
            // In case of ties (equal distance), the numerically smaller element is chosen.
            let closestElement = collectedValues[0];
            let minSquaredDistance = Math.pow(collectedValues[0] - averageX, 2);

            // Iterate through the rest of the collected values to find the true closest element.
            for (let elementIdx = 1; elementIdx < currentCollectionSize; ++elementIdx) {
                const currentValue = collectedValues[elementIdx];
                const currentSquaredDistance = Math.pow(currentValue - averageX, 2);

                if (currentSquaredDistance < minSquaredDistance) {
                    // Found a new closest element.
                    minSquaredDistance = currentSquaredDistance;
                    closestElement = currentValue;
                } else if (currentSquaredDistance === minSquaredDistance) {
                    // If distances are equal, prefer the smaller actual value.
                    if (currentValue < closestElement) {
                        closestElement = currentValue;
                    }
                }
            }

            // Calculate the cumulative difference: sum of (closestElement - collectedValue) for all collected values.
            // This is mathematically equivalent to (closestElement * N) - sum(collectedValues).
            const cumulativeDifference = (closestElement * currentCollectionSize) - totalValX;

            // Output the closest element and the calculated cumulative difference.
            console.log(`${closestElement} ${cumulativeDifference}`);
        }
        // Other operation types could be handled here with 'else if'.
    }
}

// The following line should not be modified. It handles standard input/output.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));