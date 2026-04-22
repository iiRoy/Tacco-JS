const obtainInputData = () => {
    try {
        return require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        // Fallback for local testing or if /dev/stdin is unavailable
        // In a competitive programming environment, /dev/stdin is always present.
        console.error("Error reading input from /dev/stdin:", error);
        return "1\n"; // Provide a default or throw an error
    }
};

const rawInputContent = obtainInputData();

((dataPayload) => {
    // Constants for array initialization and iteration
    const INITIAL_COUNT_VALUE = 0;
    const MIN_ITERATION_INDEX = 1;

    // Process the raw input string
    const inputSegments = dataPayload.split('\n');
    const targetValueLimit = parseInt(inputSegments[0], 10);

    // Guard clause for invalid or zero target value
    if (isNaN(targetValueLimit) || targetValueLimit <= 0) {
        // For a Type III clone, we can add error handling or simply return
        // if the input is not valid according to expected problem constraints.
        // This makes the code more robust.
        return;
    }

    // Helper function to calculate the quadratic sum expression
    // It evaluates x^2 + y^2 + z^2 + xy + yz + xz
    const calculateSumOfSquaresAndProducts = (termA, termB, termC) => {
        // Introducing intermediate variables for clarity and slight rearrangement
        const termASquared = termA * termA;
        const termBSquared = termB * termB;
        const termCSquared = termC * termC;

        const productAB = termA * termB;
        const productBC = termB * termC;
        const productAC = termA * termC;

        return termASquared + termBSquared + termCSquared + productAB + productBC + productAC;
    };

    // Initialize an array to store the frequencies of computed results.
    // The size is targetValueLimit + 1 to allow 1-based indexing up to targetValueLimit.
    const resultOccurrenceCounts = Array(targetValueLimit + 1).fill(INITIAL_COUNT_VALUE);

    // Perform nested iterations to generate combinations of three integers
    // and compute their corresponding quadratic sum.
    // The loops run from MIN_ITERATION_INDEX (1) up to targetValueLimit.
    for (let firstVal = MIN_ITERATION_INDEX; firstVal <= targetValueLimit; firstVal++) {
        for (let secondVal = MIN_ITERATION_INDEX; secondVal <= targetValueLimit; secondVal++) {
            for (let thirdVal = MIN_ITERATION_INDEX; thirdVal <= targetValueLimit; thirdVal++) {
                // Calculate the value using the helper function
                const computedResult = calculateSumOfSquaresAndProducts(firstVal, secondVal, thirdVal);

                // Check if the computed result is within the valid range (1 to targetValueLimit)
                // If it exceeds the limit, subsequent thirdVal iterations will also exceed it,
                // so we can break early for optimization. This is a rephrased version of the original break.
                if (computedResult > targetValueLimit) {
                    // For Type III, we can introduce a small helper for this check,
                    // or just keep it inline with a more descriptive comment.
                    // Let's keep it inline for conciseness here.
                    break;
                }

                // Ensure the computed result is positive and a valid index before incrementing.
                // This adds a robustness check, though for positive inputs (1-based), it will always be positive.
                if (computedResult >= MIN_ITERATION_INDEX) {
                    resultOccurrenceCounts[computedResult]++;
                }
            }
        }
    }

    // Output the frequency counts for each possible value from 1 to targetValueLimit.
    // We iterate directly from 1 to targetValueLimit, bypassing the unused index 0.
    for (let resultIndex = MIN_ITERATION_INDEX; resultIndex <= targetValueLimit; resultIndex++) {
        console.log(resultOccurrenceCounts[resultIndex]);
    }

})(rawInputContent);