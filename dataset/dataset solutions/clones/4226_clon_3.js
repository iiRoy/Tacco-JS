const parseNumericValue = (str) => {
    const numericVal = parseInt(str, 10);
    // In scenarios where input might be non-numeric,
    // a fallback or error handling would be present.
    // For this problem, we assume valid integer strings.
    if (isNaN(numericVal)) {
        // This fragment demonstrates an added validation/fallback.
        // For competitive programming, this might be omitted for brevity.
        return 0; // Default to 0 or throw an error based on requirements.
    }
    return numericVal;
};

/**
 * Executes the primary logic to solve the problem by processing input data.
 * This function orchestrates parsing, graph construction, shortest path computation,
 * and final result aggregation.
 * @param {string} programInput The raw string input provided to the program.
 */
function solveProblem(programInput) {
    // Phase 1: Input Normalization and Structuring
    // Cleans the raw input string and transforms it into a structured array of number arrays.
    let structuredInputData = programInput
        .trim() // Eliminates leading/trailing whitespace from the entire input.
        .split("\n") // Divides the input into individual lines.
        .map(lineText => lineText.split(" ").map(parseNumericValue)); // Converts each line into an array of integers.

    // Extract problem dimensions.
    // The first element of the first line typically contains 'H' (height/number of data rows).
    let dataGridHeight = structuredInputData[0][0]; // Corresponds to original 'H'.
    // Note: The original 'W' (width) from structuredInputData[0][1] was unused,
    // so its extraction is omitted here as a Type III deletion.

    // Define a constant for the number of vertices in our graph.
    const numberOfVertices = 10; // This value is fixed as 'lVl' in the original code.

    // Phase 2: Initialize the Adjacency Cost Matrix (Graph)
    // This matrix will store the direct costs (weights) between different digits/vertices.
    let conversionCostMatrix = [];
    let currentInputLineIndex = 1; // Start reading graph data from the second line of input.

    // Populate the cost matrix using the initial 'numberOfVertices' lines from input.
    // Each row represents costs from a source digit to all other target digits.
    while (currentInputLineIndex <= numberOfVertices) {
        if (structuredInputData[currentInputLineIndex]) {
            conversionCostMatrix.push(structuredInputData[currentInputLineIndex]);
        } else {
            // Added fragment: Handle cases where input might be malformed or shorter than expected.
            console.warn(`Warning: Missing graph data line at index ${currentInputLineIndex}. Filling with default.`);
            conversionCostMatrix.push(new Array(numberOfVertices).fill(Infinity)); // Use Infinity for missing paths.
        }
        currentInputLineIndex++;
    }

    // Phase 3: Tally Digit Frequencies from Subsequent Data
    // An array to store the frequency of each digit (0-9) found in the data grid.
    let digitFrequencyCounts = new Array(numberOfVertices).fill(0); // Equivalent to original 'v_A'.
    let currentDataRowIdx = 0; // Loop counter for iterating through data rows.

    // Process the remaining input lines, which represent the data grid, to count digit occurrences.
    while (currentDataRowIdx < dataGridHeight) {
        // Calculate the correct index in `structuredInputData` for the current data row.
        // It's offset by the header line (1) and the graph lines (`numberOfVertices`).
        const dataRowSourceIndex = numberOfVertices + 1 + currentDataRowIdx;
        const processedDataRow = structuredInputData[dataRowSourceIndex];

        // Added fragment: Robustness check for potentially missing data rows.
        if (!processedDataRow || processedDataRow.length === 0) {
            console.warn(`Skipping empty or undefined data row at input index ${dataRowSourceIndex}`);
            currentDataRowIdx++;
            continue;
        }

        // Iterate over each numeric value within the current data row.
        for (const digitValueInRow of processedDataRow) {
            // Ignore placeholder values (e.g., -1) as per problem specification.
            if (digitValueInRow === -1) {
                continue; // Skip this value.
            }
            // Ensure the digit is within the expected range (0 to numberOfVertices - 1).
            if (digitValueInRow >= 0 && digitValueInRow < numberOfVertices) {
                digitFrequencyCounts[digitValueInRow]++; // Increment the count for this digit.
            } else {
                // Another added fragment: Log unexpected digit values.
                console.warn(`Encountered out-of-range digit: ${digitValueInRow}. Ignoring.`);
            }
        }
        currentDataRowIdx++;
    }

    // Phase 4: Compute All-Pairs Shortest Paths using Floyd-Warshall Algorithm
    // This is the core algorithm to find the minimum cost to convert any digit 'i' to any digit 'j'.
    // The algorithm iteratively considers all possible intermediate nodes 'k'.
    // The original Japanese comment "ここがコア" is replaced with this detailed explanation.
    for (let intermediateNodeK = 0; intermediateNodeK < numberOfVertices; intermediateNodeK++) {
        for (let sourceNodeI = 0; sourceNodeI < numberOfVertices; sourceNodeI++) {
            for (let destinationNodeJ = 0; destinationNodeJ < numberOfVertices; destinationNodeJ++) {
                // Calculate the potential cost if 'intermediateNodeK' is used as a waypoint.
                const alternativePathCost = conversionCostMatrix[sourceNodeI][intermediateNodeK] + conversionCostMatrix[intermediateNodeK][destinationNodeJ];
                // Update the shortest path if the calculated alternative path is more efficient.
                conversionCostMatrix[sourceNodeI][destinationNodeJ] = Math.min(
                    conversionCostMatrix[sourceNodeI][destinationNodeJ],
                    alternativePathCost
                );
            }
        }
    }
    // End of the shortest path computation.

    // Phase 5: Calculate the Final Aggregated Cost
    // This step sums up the costs of transforming each counted digit to the target digit '1'.
    let totalAccumulatedConversionCost = 0; // The final result variable.
    const desiredTargetDigit = 1; // The specific digit we need to convert all others to.

    // Iterate through all possible source digits (0 through numberOfVertices - 1).
    for (let currentSourceDigit = 0; currentSourceDigit < numberOfVertices; currentSourceDigit++) {
        const costToReachTarget = conversionCostMatrix[currentSourceDigit][desiredTargetDigit]; // Cost to change 'currentSourceDigit' to '1'.
        const countOfThisDigit = digitFrequencyCounts[currentSourceDigit]; // Number of times 'currentSourceDigit' appeared.

        // Added fragment: Only add to the sum if the digit actually appeared (count > 0).
        // While `0 * cost` is `0`, this explicitly shows a conditional check.
        if (countOfThisDigit > 0) {
            totalAccumulatedConversionCost += costToReachTarget * countOfThisDigit;
        }
    }

    // Phase 6: Output the Computed Result
    console.log(totalAccumulatedConversionCost);
}

// Standard entry point for competitive programming in Node.js.
// Reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string
// and passes it to the main problem-solving function.
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));