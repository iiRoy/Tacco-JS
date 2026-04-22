// This script processes numerical data from standard input, calculating specific triplet counts.
// Each line of input is expected to contain six space-separated integers.
// The program terminates its execution upon encountering a line where all six numbers are zero.

(function processInputDataStream() {
    // Acquire the complete raw data buffer from standard input.
    // In Node.js, `process.stdin.readFileSync(0, 'utf8')` is a common way to read from stdin.
    const rawInputBuffer = process.stdin.readFileSync(0, 'utf8');

    // Split the raw buffer into an array of individual lines.
    // .trim() removes leading/trailing whitespace, and .filter(Boolean) removes any empty strings
    // that might result from multiple newlines or a trailing newline.
    const allInputLines = rawInputBuffer
        .trim()
        .split('\n')
        .filter(line => line.length > 0);

    /**
     * Calculates the maximum number of triplets that can be formed from three given integer values.
     * This involves two phases:
     * 1. Counting full sets of three from each individual value.
     * 2. Counting additional sets of three by taking one unit from each remaining value.
     * @param {number} valueOne The first integer.
     * @param {number} valueTwo The second integer.
     * @param {number} valueThree The third integer.
     * @returns {number} The total count of triplets.
     */
    function determineTripletCount(valueOne, valueTwo, valueThree) {
        let accumulatedTriplets = 0;

        // Phase 1: Count how many full sets of three can be made from each value independently.
        // Math.floor ensures we only count whole triplets.
        accumulatedTriplets += Math.floor(valueOne / 3);
        accumulatedTriplets += Math.floor(valueTwo / 3);
        accumulatedTriplets += Math.floor(valueThree / 3);

        // Phase 2: Calculate the remainders after extracting full sets.
        // These remainders are then used to form combined triplets.
        let remainingValOne = valueOne % 3;
        let remainingValTwo = valueTwo % 3;
        let remainingValThree = valueThree % 3;

        // Count additional triplets by combining one unit from each remaining category.
        // This loop runs as long as there's at least one unit left in all three categories.
        while (remainingValOne >= 1 && remainingValTwo >= 1 && remainingValThree >= 1) {
            remainingValOne--;
            remainingValTwo--;
            remainingValThree--;
            accumulatedTriplets++; // Increment for each combined triplet formed.
        }

        return accumulatedTriplets;
    }

    // Iterate over each line of the prepared input data.
    // A 'for...of' loop provides a clean way to process each line sequentially.
    for (const currentInputLine of allInputLines) {
        // Parse the space-separated string of numbers into an array of integers.
        // Using `parseInt` with radix 10 for explicit base conversion, and `\s+` to handle
        // multiple spaces between numbers robustly.
        const parsedNumericSegments = currentInputLine
            .split(/\s+/)
            .map(segment => parseInt(segment, 10));

        // Implement a guard clause to validate the input format.
        // If the line does not contain exactly six numbers, it's considered malformed.
        if (parsedNumericSegments.length !== 6) {
            console.error(`Error: Malformed input line encountered. Expected 6 numbers, but got ${parsedNumericSegments.length}. Skipping line: "${currentInputLine}"`);
            continue; // Skip processing this malformed line and proceed to the next.
        }

        // Check for the termination condition: if all parsed numbers are zero.
        // This is a more robust numerical check compared to string comparison.
        const areAllValuesZero = parsedNumericSegments.every(value => value === 0);
        if (areAllValuesZero) {
            break; // Exit the main processing loop if the termination sequence is detected.
        }

        // Aggregate the input numbers into three primary sums as per the problem logic.
        // Using descriptive variable names for clarity.
        const aggregatedSumA = parsedNumericSegments[0] + parsedNumericSegments[3];
        const aggregatedSumB = parsedNumericSegments[1] + parsedNumericSegments[4];
        const aggregatedSumC = parsedNumericSegments[2] + parsedNumericSegments[5];

        // Utilize the helper function to compute the total number of triplets for the current line's data.
        const finalCalculatedTriplets = determineTripletCount(aggregatedSumA, aggregatedSumB, aggregatedSumC);

        // Output the computed result to standard output.
        console.log(finalCalculatedTriplets);
    }
})(); // The entire script is wrapped in an Immediately Invoked Function Expression (IIFE)
      // to create a private scope and prevent global variable pollution.