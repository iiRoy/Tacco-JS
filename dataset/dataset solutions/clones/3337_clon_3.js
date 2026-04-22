(function(sourceDataInput) {
    // This module calculates the number of ways to distribute a specific
    // total amount of sweets among a group of individuals, where each
    // individual has a maximum allowance. The calculation is done modulo
    // a large prime number to prevent integer overflow.

    // 1. Input Processing and Validation
    // Ensure the raw input string is not null, empty, or just whitespace.
    if (!sourceDataInput || typeof sourceDataInput !== 'string' || sourceDataInput.trim().length === 0) {
        console.error("Error: The provided data stream is empty or invalid. Please ensure it contains numerical input.");
        // A robust application might throw an error or return a specific error code here.
        return;
    }

    // Clean and parse the input string into an array of numbers.
    // Spaces are used as delimiters. `Number(val)` is used instead of `val-0`.
    const numericalValues = sourceDataInput.trim().split(/\s+/).map(val => Number(val));

    // Validate that we have at least N and K, plus N allowance values.
    if (numericalValues.length < 2) {
        console.error("Error: Insufficient numerical data. Expected at least two numbers (N and K).");
        return;
    }

    // Extract the total number of children (N) and the maximum total candies (K).
    const numberOfRecipients = numericalValues.shift(); // N
    const maximumSweetsToDistribute = numericalValues.shift(); // K

    // Define the prime modulus for calculations. Using numeric separators for readability.
    const calculationModulus = 1_000_000_000 + 7;

    // The remaining values in `numericalValues` are the individual candy limits for each child.
    const recipientLimits = numericalValues; // 'a' in original code

    // Further validation: check if recipientLimits array has correct length
    if (recipientLimits.length !== numberOfRecipients) {
        console.error(`Error: Mismatch in recipient limits. Expected ${numberOfRecipients} limits, but received ${recipientLimits.length}.`);
        return;
    }

    // Helper function to perform modulo arithmetic safely, handling negative results.
    const getPositiveModulo = (valueToMod) => {
        return ((valueToMod % calculationModulus) + calculationModulus) % calculationModulus;
    };

    // 2. Dynamic Programming Table Initialization
    // `waysMatrix[i][j]` will store the cumulative count of ways to distribute
    // up to `j` sweets among the first `i` recipients.
    // We use `numberOfRecipients + 1` rows to handle a virtual "0th" recipient row,
    // simplifying base cases and avoiding negative indexing.
    const waysMatrix = Array.from({ length: numberOfRecipients + 1 }, () =>
        Array(maximumSweetsToDistribute + 1).fill(0)
    );

    // Initialize the base case: the "0th" recipient row (index 0 in `waysMatrix`).
    // This corresponds to the `dp[-1]` row in the original problem statement.
    // When no recipients are considered, there's effectively 1 way to distribute
    // any number of candies (this is a mathematical convenience for prefix sums).
    for (let currentSweetAmount = 0; currentSweetAmount <= maximumSweetsToDistribute; currentSweetAmount++) {
        waysMatrix[0][currentSweetAmount] = 1;
    }

    // 3. Dynamic Programming State Transitions
    // Iterate through each recipient, starting from the first actual recipient (index 1 in `waysMatrix`).
    for (let currentRecipientIdx = 1; currentRecipientIdx <= numberOfRecipients; currentRecipientIdx++) {
        // The actual limit for this recipient is at `recipientLimits[currentRecipientIdx - 1]`
        const recipientActualIndex = currentRecipientIdx - 1;
        const currentRecipientMaxAllowance = recipientLimits[recipientActualIndex];

        // Iterate through all possible cumulative sweet amounts.
        for (let currentCumulativeSweets = 0; currentCumulativeSweets <= maximumSweetsToDistribute; currentCumulativeSweets++) {
            // Term 1: Ways to distribute `currentCumulativeSweets - 1` among the current set of recipients.
            // This term accounts for giving one less candy to the current recipient and adding it to previous sums.
            const termFromPreviousSweets = (currentCumulativeSweets > 0)
                ? waysMatrix[currentRecipientIdx][currentCumulativeSweets - 1]
                : 0; // If currentCumulativeSweets is 0, this term is 0.

            // Term 2: Ways to distribute `currentCumulativeSweets` among the previous set of recipients.
            // This term represents the case where the current recipient receives 0 candies.
            const termFromPreviousRecipient = waysMatrix[currentRecipientIdx - 1][currentCumulativeSweets];

            // Term 3: Subtraction term to correct for cases where the current recipient's allowance is exceeded.
            // This term is subtracted because `termFromPreviousRecipient` implicitly allows the current recipient
            // to take any number of candies. We must subtract cases where the current recipient takes more than allowed.
            let exclusionTerm = 0;
            const exclusionSweetIndex = currentCumulativeSweets - currentRecipientMaxAllowance - 1;

            if (exclusionSweetIndex >= 0) {
                // If the index is valid, retrieve the value from the previous recipient's row.
                exclusionTerm = waysMatrix[currentRecipientIdx - 1][exclusionSweetIndex];
            }
            // If `exclusionSweetIndex` is negative, `exclusionTerm` remains 0, which is correct.
            // This effectively combines the two `k` loops from the original code.

            // Calculate the current state using the recurrence relation and apply modulo.
            waysMatrix[currentRecipientIdx][currentCumulativeSweets] = getPositiveModulo(
                termFromPreviousSweets + termFromPreviousRecipient - exclusionTerm
            );
        }
    }

    // 4. Final Result Extraction
    // The `waysMatrix` stores cumulative sums. To get the exact number of ways
    // to distribute `maximumSweetsToDistribute` candies, we need to subtract
    // the cumulative sum for `maximumSweetsToDistribute - 1` from the cumulative
    // sum for `maximumSweetsToDistribute`.
    // This is equivalent to: `waysMatrix[N][K] - waysMatrix[N][K-1]`

    let finalTotalCombinations = waysMatrix[numberOfRecipients][maximumSweetsToDistribute];

    // If `maximumSweetsToDistribute` is 0, then `maximumSweetsToDistribute - 1` would be negative.
    // In this case, the subtraction term should be 0. Our `getPositiveModulo` handles this safely.
    if (maximumSweetsToDistribute > 0) {
        finalTotalCombinations = getPositiveModulo(
            finalTotalCombinations - waysMatrix[numberOfRecipients][maximumSweetsToDistribute - 1]
        );
    }
    // If K=0, the result should be 1 (one way to give 0 candies to everyone).
    // Our logic handles this: waysMatrix[N][0] is 1, and the subtraction term is 0.

    // Output the final computed result.
    console.log(finalTotalCombinations);

})(require('fs').readFileSync('/dev/stdin','utf8'));