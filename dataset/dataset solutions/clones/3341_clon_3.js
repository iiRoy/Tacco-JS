// This function serves as the primary entry point for processing problem input.
// It applies a dynamic programming approach to solve a problem that typically
// involves finding an optimal way to combine a sequence of elements, similar
// to matrix chain multiplication or optimal binary search tree construction.
function ProcessInputData(rawData) {
    // Define a constant representing an extremely large value, used for
    // initializing minimum cost variables in dynamic programming.
    const POSITIVE_INFINITY_COST = Number.MAX_SAFE_INTEGER;

    // A utility function to parse and validate the initial problem parameters
    // from the raw input string. This centralizes input handling and error checking.
    const extractProblemDetails = (inputStr) => {
        const dataLines = inputStr.split("\n");

        // Validate that essential lines of input are present.
        if (dataLines.length < 2) {
            throw new Error("Input parsing error: Not enough data lines provided.");
        }

        // Parse the total count of elements from the first line.
        const totalElementCount = parseInt(dataLines[0].trim(), 10);
        // Ensure the element count is a valid, non-negative integer.
        if (isNaN(totalElementCount) || totalElementCount < 0) {
            throw new Error("Input validation error: Invalid or missing element count.");
        }

        // Parse the sequence of numbers from the second line.
        const numericalSequence = dataLines[1].trim().split(" ").map(s => parseInt(s.trim(), 10));
        // Validate that all parsed elements are indeed numbers.
        if (numericalSequence.some(isNaN)) {
            throw new Error("Input validation error: Sequence contains non-numeric values.");
        }
        // Ensure the sequence length matches the declared count.
        if (numericalSequence.length !== totalElementCount) {
             console.warn(`Warning: Declared element count (${totalElementCount}) does not match actual sequence length (${numericalSequence.length}). Using actual length.`);
             // Adjust totalElementCount to match actual sequence length if mismatch.
             // This can be a strict error or a warning depending on problem constraints.
             // For this clone, we'll proceed with the actual length.
        }

        return { count: totalElementCount, sequenceValues: numericalSequence };
    };

    // Execute the input parsing.
    let problemInfo;
    try {
        problemInfo = extractProblemDetails(rawData);
    } catch (e) {
        console.error(`Fatal input error: ${e.message}`);
        return -1; // Indicate a failure to process.
    }

    const { count: elementCount, sequenceValues: inputSequence } = problemInfo;

    // Handle edge cases where the sequence is too short to require any operations.
    if (elementCount <= 1) {
        console.log('0'); // No cost for combining 0 or 1 elements.
        return 0;
    }

    // Initialize the dynamic programming table (memoization table).
    // `dpTable[i][j]` will store the minimum cost to combine the subarray
    // from index `i` to `j` (inclusive).
    const dpTable = Array.from({ length: elementCount },
                                () => Array(elementCount).fill(0));

    // Precompute prefix sums of the input sequence. This allows for O(1)
    // calculation of the sum of any subarray. `cumulativeSums[k]` stores
    // the sum of `inputSequence[0]` through `inputSequence[k]`.
    const cumulativeSums = new Array(elementCount);
    cumulativeSums[0] = inputSequence[0];
    for (let currentIdx = 1; currentIdx < elementCount; ++currentIdx) {
        cumulativeSums[currentIdx] = cumulativeSums[currentIdx - 1] + inputSequence[currentIdx];
    }

    // Helper function to efficiently calculate the sum of elements within
    // a given range [start, end] using the precomputed cumulative sums.
    const calculateSubsegmentSum = (startSegmentIdx, endSegmentIdx) => {
        // Basic validation for segment indices.
        if (startSegmentIdx < 0 || endSegmentIdx >= elementCount || startSegmentIdx > endSegmentIdx) {
            console.error(`Error: Invalid segment indices provided for sum calculation: [${startSegmentIdx}, ${endSegmentIdx}]`);
            return 0; // Return 0 or throw, depending on desired error handling.
        }
        // If the segment starts from the beginning of the sequence.
        if (startSegmentIdx === 0) {
            return cumulativeSums[endSegmentIdx];
        }
        // For any other segment, subtract the sum of elements before the start.
        return cumulativeSums[endSegmentIdx] - cumulativeSums[startSegmentIdx - 1];
    };

    // The core dynamic programming loop.
    // `segmentLength` represents the current length of the subarray being processed (e.g., 2 for pairs, 3 for triplets).
    // It ranges from 2 up to `elementCount`.
    for (let segmentLength = 2; segmentLength <= elementCount; ++segmentLength) {
        // `startIdx` is the starting index of the current subarray.
        // `endIdx` is the ending index of the current subarray.
        for (let startIdx = 0; startIdx <= elementCount - segmentLength; ++startIdx) {
            const endIdx = startIdx + segmentLength - 1;

            // Initialize the minimum cost for the current subproblem to a very large value.
            let minCostForCurrentSegment = POSITIVE_INFINITY_COST;

            // Iterate through all possible split points (`divisionPoint`) within the current subarray.
            // A split point divides the subarray `[startIdx, endIdx]` into two smaller subarrays:
            // `[startIdx, divisionPoint]` and `[divisionPoint + 1, endIdx]`.
            for (let divisionPoint = startIdx; divisionPoint < endIdx; ++divisionPoint) {
                // Calculate the cost of merging the two sub-solutions and the cost
                // inherent to the current segment itself (e.g., sum of elements).
                const costOfCurrentMergeOperation = calculateSubsegmentSum(startIdx, endIdx);

                // The total cost for this specific split point is the sum of:
                // 1. The minimum cost to solve the left subproblem (`dpTable[startIdx][divisionPoint]`).
                // 2. The minimum cost to solve the right subproblem (`dpTable[divisionPoint + 1][endIdx]`).
                // 3. The cost incurred by the current merge operation (e.g., sum of elements in the combined range).
                const totalCostForThisSplit =
                    dpTable[startIdx][divisionPoint] +
                    dpTable[divisionPoint + 1][endIdx] +
                    costOfCurrentMergeOperation;

                // Update the minimum cost if the current split yields a lower total.
                minCostForCurrentSegment = Math.min(minCostForCurrentSegment, totalCostForThisSplit);
            }
            // Store the computed minimum cost for the segment `[startIdx, endIdx]`.
            dpTable[startIdx][endIdx] = minCostForCurrentSegment;
        }
    }

    // The final answer is the minimum cost to combine the entire sequence,
    // found at `dpTable[0][elementCount - 1]`.
    const finalOptimalCost = dpTable[0][elementCount - 1];

    // Output the final result to standard output.
    console.log(String(finalOptimalCost));

    // Return the calculated cost for external use or testing.
    return finalOptimalCost;
}

// This auxiliary function is designed for interactive debugging within a browser environment.
// It retrieves test data from HTML elements, executes the main processing logic,
// and displays the correctness of the computed answer against an expected output.
function executeDebugTest(testCaseIdentifier) {
    // Attempt to retrieve the input data from a specific HTML text area.
    const inputTextArea = document.getElementById("input" + testCaseIdentifier);
    if (!inputTextArea) {
        console.error(`Debug error: Input element 'input${testCaseIdentifier}' not found.`);
        return;
    }
    const testInputString = inputTextArea.value;

    let computedResult;
    // Execute the main processing function and catch any potential errors.
    try {
        computedResult = ProcessInputData(testInputString);
    } catch (processingError) {
        console.error("Processing failed for debug test:", processingError.message);
        document.getElementById("result" + testCaseIdentifier).innerHTML = "ERR";
        return;
    }

    // Retrieve the expected output from another HTML element.
    const outputTextArea = document.getElementById("output" + testCaseIdentifier);
    if (!outputTextArea) {
        console.error(`Debug error: Output element 'output${testCaseIdentifier}' not found.`);
        return;
    }
    // Parse the expected output, assuming it's the first line of the text area content.
    const expectedResult = parseInt(outputTextArea.value.split("\n")[0], 10);

    // Determine the test status (Accepted or Wrong Answer).
    const testStatus = (computedResult === expectedResult) ? "AC" : "WA";

    // Display the test result in a designated HTML element.
    const resultDisplay = document.getElementById("result" + testCaseIdentifier);
    if (resultDisplay) {
        resultDisplay.innerHTML = testStatus;
    } else {
        console.warn(`Debug warning: Result display element 'result${testCaseIdentifier}' not found.`);
    }
}

// This block ensures the `ProcessInputData` function is executed with standard input
// when the script is run in a Node.js environment (e.g., for competitive programming platforms).
// It prevents this code from running if the script is merely imported as a module.
if (typeof require !== 'undefined' && require.main === module) {
    try {
        // Access the Node.js file system module to read from standard input.
        const fileSystem = require("fs");
        const stdInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
        // Pass the content of standard input to the main processing function.
        ProcessInputData(stdInputContent);
    } catch (executionError) {
        console.error("Runtime error during standard input processing:", executionError.message);
        // In a production environment, you might want to exit with a non-zero status.
        // process.exit(1);
    }
}