function processInputData(sourceText) {
    // Validate the raw input string, ensuring it's not empty or malformed.
    if (typeof sourceText !== 'string' || sourceText.trim() === '') {
        console.error("Input processing error: Provided data string is empty or invalid.");
        return;
    }

    // Decompose the multi-line input into an array of strings, cleaning leading/trailing whitespace.
    const allInputLines = sourceText.trim().split("\n");

    // Enforce a minimum structure: at least two lines are expected for configuration and data.
    if (allInputLines.length < 2) {
        console.error("Input parsing error: Not enough lines in the input data. Expected at least two.");
        return;
    }

    // Extract numerical configuration parameters from the first line.
    const configurationTokens = allInputLines[0].split(" ");

    // The first token (originally 'num') is not utilized in the subsequent calculation logic.
    // It's processed here for completeness but its value is discarded.
    // const initialNumberQuantity = parseInt(configurationTokens[0], 10);

    // Determine the parity selection criterion for odd numbers (0 for even sum, 1 for odd sum).
    const oddParitySelection = parseInt(configurationTokens[1], 10);

    // Validate the extracted parity selection.
    if (isNaN(oddParitySelection) || (oddParitySelection !== 0 && oddParitySelection !== 1)) {
        console.error("Input validation error: Invalid parity condition specified. Must be 0 or 1.");
        return;
    }

    // Process the second line, which contains the sequence of numbers for analysis.
    const rawNumberStrings = allInputLines[1].split(" ");

    let totalEvenNumbers = 0; // Counter for even numbers encountered.
    let totalOddNumbers = 0;  // Counter for odd numbers encountered.
    const numericValueList = []; // Optional: Store parsed numbers if needed for other operations.

    // Iterate through the string representations of numbers to parse and categorize them.
    for (let currentEntryIndex = 0; currentEntryIndex < rawNumberStrings.length; currentEntryIndex++) {
        const parsedNumericValue = parseInt(rawNumberStrings[currentEntryIndex], 10);

        // Skip any non-numeric or invalid entries to prevent errors.
        if (isNaN(parsedNumericValue)) {
            continue;
        }

        numericValueList.push(parsedNumericValue); // Add to the list of processed numbers.

        // Classify the number based on its parity.
        if (parsedNumericValue % 2 === 0) {
            totalEvenNumbers++;
        } else {
            totalOddNumbers++;
        }
    }

    // Auxiliary function to compute the factorial of a non-negative integer.
    // Throws an error for negative inputs.
    const calculateIntegerFactorial = (inputVal) => {
        if (inputVal < 0) {
            throw new Error("Factorial is undefined for negative numbers.");
        }
        if (inputVal === 0 || inputVal === 1) {
            return 1; // Base cases: 0! = 1, 1! = 1.
        }
        let accumulatedProduct = 1;
        for (let k = 2; k <= inputVal; k++) { // Optimized loop start.
            accumulatedProduct *= k;
        }
        return accumulatedProduct;
    };

    // Auxiliary function to determine the number of combinations (nCr).
    // Includes guard clauses and an optimization for C(n, r) = C(n, n-r).
    const computeCombinationsNcr = (overallCount, selectionCount) => {
        if (selectionCount < 0 || selectionCount > overallCount) {
            return 0; // Invalid selection.
        }
        if (selectionCount === 0 || selectionCount === overallCount) {
            return 1; // C(n, 0) = 1, C(n, n) = 1.
        }
        // Use the symmetry C(n, r) = C(n, n-r) to reduce computations if r > n/2.
        if (selectionCount > overallCount / 2) {
            selectionCount = overallCount - selectionCount;
        }
        
        // Calculate n! / (r! * (n-r)!).
        // Math.round is used to compensate for potential floating-point inaccuracies
        // that can arise from division operations, ensuring an integer result.
        return Math.round(
            calculateIntegerFactorial(overallCount) /
            (calculateIntegerFactorial(selectionCount) * calculateIntegerFactorial(overallCount - selectionCount))
        );
    };

    // Determine the number of ways to select any subset of the even numbers.
    // This is simply 2 raised to the power of the count of even numbers.
    const combinationsFromEvens = Math.pow(2, totalEvenNumbers);

    // Determine the number of ways to select subsets of the odd numbers
    // such that their sum satisfies the `oddParitySelection` condition.
    let combinationsFromOdds = 0;

    if (totalOddNumbers === 0) {
        // If no odd numbers are present:
        // - If oddParitySelection is 0 (even sum desired), only the empty set (sum 0, which is even) qualifies.
        // - If oddParitySelection is 1 (odd sum desired), no odd sum can be achieved.
        combinationsFromOdds = (oddParitySelection === 0) ? 1 : 0;
    } else {
        // For any non-zero count of odd numbers, the sum of combinations
        // for an even number of selected odd items (oddParitySelection 0)
        // is 2^(N-1). Similarly, for an odd number of selected odd items
        // (oddParitySelection 1), the sum is also 2^(N-1).
        // This effectively replaces the original loops.
        combinationsFromOdds = Math.pow(2, totalOddNumbers - 1);
    }
    // The original `console.log` within the odd combinations loop has been removed as it was likely for debugging.

    // The final result is the product of combinations from the even and odd groups.
    const finalComputedResult = combinationsFromEvens * combinationsFromOdds;

    // Output the calculated result to the console.
    console.log(finalComputedResult);
}

// Standard entry point for competitive programming environments, reading from stdin.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));