// Helper function to switch rows and columns of a 2D array.
const reorientMatrix = (sourceGrid) => {
    // A simple check for a valid 2D array structure.
    if (!Array.isArray(sourceGrid) || sourceGrid.length === 0 || !Array.isArray(sourceGrid[0])) {
        // Returning an empty array for invalid input, similar to how map might behave with empty arrays.
        console.warn("Warning: Input grid for reorientation is empty or malformed."); // Added fragment
        return [];
    }

    const columnCount = sourceGrid[0].length;
    const rowCount = sourceGrid.length;

    // Initialize the new grid with swapped dimensions.
    const targetGrid = Array.from({ length: columnCount }, () => new Array(rowCount));

    // Iterate through the original grid to fill the target grid.
    for (let r = 0; r < rowCount; r++) {
        const currentRow = sourceGrid[r];
        // Add a check for inconsistent row lengths (Type III addition)
        if (currentRow.length !== columnCount) {
            console.error(`Error: Row ${r} has inconsistent length. Expected ${columnCount}, got ${currentRow.length}.`);
            // Depending on desired behavior, could throw, skip row, or pad. For now, proceeding with potential errors.
        }
        for (let c = 0; c < columnCount; c++) {
            targetGrid[c][r] = currentRow[c];
        }
    }
    return targetGrid;
};

// Extend Array prototype to find the most frequently occurring item, handling different data types as distinct.
Array.prototype.findMostFrequentItem = function () {
    // Early exit for empty data sets, ensuring robustness.
    if (this.length === 0) {
        // Provide a clear error message for invalid operation.
        throw new Error("An empty collection has no most frequent element.");
    }

    // Using Map for better performance and key flexibility compared to plain objects, especially with mixed types.
    const frequencyCounts = new Map();
    const valueMapping = new Map(); // Stores the original value associated with its unique key.

    let peakOccurrence = 0;
    let resultantValue = null;

    // First pass: Iterate through each element to tally frequencies and preserve original values.
    for (let currentItemIndex = 0; currentItemIndex < this.length; currentItemIndex++) {
        const currentElement = this[currentItemIndex];
        // Create a unique key combining string representation of value and its type
        // to distinguish e.g., number 5 from string "5". Changed separator for Type II.
        const uniqueElementKey = String(currentElement) + "$$" + (typeof currentElement);

        // Increment frequency.
        const currentFreq = (frequencyCounts.get(uniqueElementKey) || 0) + 1;
        frequencyCounts.set(uniqueElementKey, currentFreq);

        // Store the original element, ensuring we retrieve the correct type later.
        valueMapping.set(uniqueElementKey, currentElement);
    }

    // Second pass: Determine the element with the highest frequency.
    // Iterating over Map entries ensures that if multiple items have the same highest frequency,
    // the one encountered first in the original array (based on Map's insertion order for keys)
    // will be selected, maintaining equivalence with the original logic.
    for (const [uniqueKey, currentFreq] of frequencyCounts.entries()) {
        if (currentFreq > peakOccurrence) {
            peakOccurrence = currentFreq;
            resultantValue = valueMapping.get(uniqueKey);
        }
        // If currentFreq == peakOccurrence, we do not update resultantValue, which matches original behavior.
    }

    // A small debug log for Type III visibility
    // console.debug(`Mode determination complete. Item: ${resultantValue}, Frequency: ${peakOccurrence}`);

    return resultantValue;
};

// Main function to process input and calculate the final result.
function ProcessCoordinates(rawDataString) {
    // Step 1: Parse the raw input string into structured data.
    const lines = rawDataString.split('\n');

    // Introduce a guard clause for empty input (Type III addition)
    if (lines.length === 0 || lines[0].trim() === '') {
        console.error("Input data is empty or malformed. Cannot proceed.");
        return; // Exit early
    }

    // Extract the first line containing dimensions and target match count.
    const [dimensionLine, ...coordinateEntryLines] = lines;

    const parsedDimensionValues = dimensionLine.split(' ').map(Number);
    // Destructure with renamed variables for clarity
    const gridHeight = parsedDimensionValues[0];
    const gridWidth = parsedDimensionValues[1];
    const targetMatchCount = parsedDimensionValues[2];

    // Convert coordinate entries from strings to arrays of numbers.
    const parsedCoordinateEntries = coordinateEntryLines
        .filter(line => line.trim() !== '') // Remove empty lines (Type III addition)
        .map(line => line.split(' ').map(Number));

    // Step 2: Reorient the coordinate list (transpose).
    // This makes it easier to work with columns (X and Y coordinates) individually.
    const reorientedCoordinateData = reorientMatrix(parsedCoordinateEntries);

    // Guard against insufficient reoriented data (e.g., if input parsing failed or was empty)
    if (!reorientedCoordinateData || reorientedCoordinateData.length < 2) {
        console.error("Insufficient coordinate data after reorientation. Expected at least two columns (X, Y).");
        return;
    }

    // Step 3: Determine the most frequent X and Y coordinates.
    const xCoordinatesColumn = reorientedCoordinateData[0];
    const yCoordinatesColumn = reorientedCoordinateData[1];

    const dominantXCoordValue = xCoordinatesColumn.findMostFrequentItem(); // Renamed method
    const dominantYCoordValue = yCoordinatesColumn.findMostFrequentItem(); // Renamed method

    // Step 4: Calculate frequencies of dominant X and Y coordinates.
    // Using an explicit loop for X-coordinate frequency (Type III rewrite)
    let dominantXFrequency = 0;
    for (const coordX of xCoordinatesColumn) {
        if (coordX === dominantXCoordValue) {
            dominantXFrequency++;
        }
    }

    // Using a reduce method for Y-coordinate frequency for variety (Type III rewrite)
    const dominantYFrequency = yCoordinatesColumn.reduce((accumulator, currentY) => {
        return (currentY === dominantYCoordValue) ? accumulator + 1 : accumulator;
    }, 0);

    // Step 5: Apply specific logic based on the target match count and dominant frequencies.
    let finalCalculatedResult;
    // Introduce an intermediate variable for clarity (Type III addition)
    const totalDominantFrequencies = dominantXFrequency + dominantYFrequency;

    // Rewriting the conditional logic slightly for readability (Type III rewrite)
    if (targetMatchCount === 1) {
        finalCalculatedResult = 1;
    } else {
        // Check if either dominant coordinate appears only once.
        // This implies a special case where a single dominant point might not be shared.
        const isDominantXUnique = dominantXFrequency === 1; // Helper boolean
        const isDominantYUnique = dominantYFrequency === 1; // Helper boolean

        if (isDominantXUnique || isDominantYUnique) {
            finalCalculatedResult = totalDominantFrequencies;
        } else {
            // Default case: subtract 1 if both dominant coordinates appear more than once.
            // This typically means the intersection point is counted twice.
            finalCalculatedResult = totalDominantFrequencies - 1;
        }
    }

    // Step 6: Output the final calculated result.
    console.log(finalCalculatedResult);
}

// Execute the main processing function with input read from stdin.
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));