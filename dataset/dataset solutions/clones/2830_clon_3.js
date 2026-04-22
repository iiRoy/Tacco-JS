function CalculateCommonSubsequenceCount(inputDataString) {
    // Validate input data presence. This is an added guard clause.
    if (typeof inputDataString !== 'string' || inputDataString.trim() === '') {
        console.error("Error: Input data is empty or invalid.");
        return 0; // Return a default value or throw an error
    }

    // Process the raw text input into structured data.
    // Extensive renaming of variables and more explicit parsing.
    const processedLines = inputDataString.trim().split("\n");

    // Ensure we have enough lines for sequence dimensions and the sequences themselves.
    if (processedLines.length < 3) {
        console.error("Error: Insufficient input lines provided. Expected at least 3.");
        return 0;
    }

    // Parse sequence dimensions from the first line.
    const dimensionTokens = processedLines[0].split(" ");
    if (dimensionTokens.length < 2) {
        console.error("Error: Sequence dimensions are malformed.");
        return 0;
    }
    const seqLenA = Number(dimensionTokens[0]); // Renamed N to seqLenA, used Number instead of parseInt
    const seqLenB = Number(dimensionTokens[1]); // Renamed M to seqLenB

    // Parse the first sequence (S).
    const sequenceElementsA = processedLines[1].split(" ").map(val => Number(val)); // Renamed S to sequenceElementsA
    // Parse the second sequence (T).
    const sequenceElementsB = processedLines[2].split(" ").map(val => Number(val)); // Renamed T to sequenceElementsB

    // Define the modulus for calculations to prevent integer overflow.
    // Changed Math.pow to exponentiation operator.
    const primeModulusValue = 10**9 + 7; // Renamed mod to primeModulusValue

    // Initialize the dynamic programming table (memoizationTable).
    // Changed array initialization method for Type III structural change.
    const memoizationTable = [];
    for (let rowIterator = 0; rowIterator <= seqLenA; ++rowIterator) {
        // Create each row, initially filled with zeros.
        memoizationTable.push(new Array(seqLenB + 1).fill(0));
    }

    // Establish base cases for the DP table.
    // If one of the sequences is empty, there's always one common subsequence: the empty string.
    for (let r = 0; r <= seqLenA; ++r) {
        memoizationTable[r][0] = 1; // Base case: sequence B is empty
    }
    for (let c = 0; c <= seqLenB; ++c) {
        memoizationTable[0][c] = 1; // Base case: sequence A is empty
    }

    // Fill the DP table using nested loops.
    // Renamed loop variables, introduced intermediate variables for clarity.
    for (let currentAIndex = 0; currentAIndex < seqLenA; ++currentAIndex) {
        // Retrieve the current element from sequence A for better readability.
        const currentElementA = sequenceElementsA[currentAIndex];

        for (let currentBIndex = 0; currentBIndex < seqLenB; ++currentBIndex) {
            // Retrieve the current element from sequence B.
            const currentElementB = sequenceElementsB[currentBIndex];

            // Fetch values from previously computed states.
            // These represent different subproblem solutions.
            const combinationsExcludingA = memoizationTable[currentAIndex][currentBIndex + 1];
            const combinationsExcludingB = memoizationTable[currentAIndex + 1][currentBIndex];
            const combinationsExcludingBoth = memoizationTable[currentAIndex][currentBIndex];

            let calculatedCellResult; // Temporary variable for the current cell's value

            // Apply the recurrence relation based on whether the current elements match.
            if (currentElementA === currentElementB) {
                // If elements match, we can form new common subsequences by appending them.
                // The total is the sum of combinations from excluding A and excluding B.
                // This implicitly includes the (combinationsExcludingBoth + 1) new ones.
                calculatedCellResult = (combinationsExcludingA + combinationsExcludingB) % primeModulusValue;
            } else {
                // If elements do not match, use the principle of inclusion-exclusion.
                // Sum combinations from excluding A and excluding B, then subtract those counted twice.
                let combinedCount = (combinationsExcludingA + combinationsExcludingB) % primeModulusValue;
                // Ensure result is non-negative before taking modulo (JS behavior with negative numbers).
                calculatedCellResult = (combinedCount - combinationsExcludingBoth + primeModulusValue) % primeModulusValue;
            }
            // Store the computed result in the memoization table.
            memoizationTable[currentAIndex + 1][currentBIndex + 1] = calculatedCellResult;
        }
    }

    // The final answer is stored at the bottom-right corner of the DP table.
    const totalValidSubsequences = memoizationTable[seqLenA][seqLenB]; // Renamed ans to totalValidSubsequences

    // Output the result to standard output.
    // Changed console.log format.
    console.log(String(totalValidSubsequences));

    // Return the calculated count.
    return totalValidSubsequences;
}

// Execute the main function by reading input from standard input.
// Updated function call name.
CalculateCommonSubsequenceCount(require("fs").readFileSync("/dev/stdin", "utf8"));