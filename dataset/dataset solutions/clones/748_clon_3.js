const transformValueForChecksum = (numericInput) => {
    if (typeof numericInput !== 'number' || isNaN(numericInput)) {
        console.error("Invalid non-numeric input detected. Defaulting to zero.");
        return 0;
    }

    if (numericInput < 10) {
        return numericInput;
    } else {
        // This effectively sums the digits of a two-digit number (e.g., 12 -> 1+2=3).
        // It's equivalent to numericInput - 9 for numbers >= 10.
        return (numericInput % 10) + Math.floor(numericInput / 10);
    }
};

const acquireRawInputData = () => {
    try {
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (fileReadError) {
        console.error("Error encountered while attempting to read from standard input:", fileReadError.message);
        // Depending on context, might exit or return a default string for testing.
        return "";
    }
};

// Anonymous self-executing function to encapsulate the main program logic.
(() => {
    // Define program-wide constants for clarity and easy modification.
    const MAXIMUM_DP_SUM_STATES = 100; // The upper bound for sum values in the DP table (0 to 99).
    const FINAL_CHECKSUM_MODULO = 10; // The divisor for validating the total checksum.

    // Read and preprocess the entire input stream.
    const rawInputContent = acquireRawInputData();
    const processedInputLines = rawInputContent.trim().split("\n");

    // Extract specific data points from the parsed input lines.
    // The original variables 'n' and 'a' were unused and have been removed.
    const identificationCodePattern = processedInputLines.shift(); // The string containing digits and '*' wildcards.
    const availableDigitOptions = processedInputLines.shift().split(" ").map(Number); // An array of possible digits for wildcards.

    let wildcardWeightFactors = []; // Stores the multiplier (1 or 2) for each '*' found.
    let accumulatedFixedDigitSum = 0; // Gathers the sum of all non-wildcard digits.

    // Iterate through the identification code pattern to distinguish fixed digits from wildcards.
    // This loop populates `wildcardWeightFactors` and `accumulatedFixedDigitSum`.
    for (let positionIndex = 0; positionIndex < identificationCodePattern.length; ++positionIndex) {
        const currentCharacter = identificationCodePattern[positionIndex];
        const isPositionEven = (positionIndex % 2 === 0); // Determine position parity.

        if (currentCharacter === "*") {
            // If the character is a wildcard, assign a weighting factor based on its position.
            wildcardWeightFactors.push(isPositionEven ? 1 : 2);
        } else {
            // If it's a fixed digit, convert it and add to the running sum.
            const digitValue = Number(currentCharacter); // Explicitly convert character to number.

            if (isPositionEven) {
                accumulatedFixedDigitSum += digitValue;
            } else {
                // For odd positions, double the digit and then apply the checksum transformation.
                accumulatedFixedDigitSum += transformValueForChecksum(digitValue * 2);
            }
        }
    }

    // Initialize the dynamic programming table.
    // `dpTable[i][s]` will store the count of ways to achieve a sum 's'
    // using the first 'i' wildcard positions.
    let dpTable = Array.from({ length: wildcardWeightFactors.length + 1 }, () =>
        Array(MAXIMUM_DP_SUM_STATES).fill(0)
    );

    // Establish the base case for the DP: there is one way to achieve a sum of zero
    // when no wildcards have been processed.
    dpTable[0][0] = 1;

    // Proceed with filling the DP table using nested loops.
    // The outer loop iterates through each wildcard position.
    for (let currentWildcardIdx = 0; currentWildcardIdx < wildcardWeightFactors.length; ++currentWildcardIdx) {
        const currentMultiplier = wildcardWeightFactors[currentWildcardIdx];

        // The middle loop iterates through each possible digit that a wildcard can represent.
        for (let digitOptionIdx = 0; digitOptionIdx < availableDigitOptions.length; ++digitOptionIdx) {
            const selectedDigit = availableDigitOptions[digitOptionIdx];
            // Calculate the transformed contribution of this digit and its multiplier.
            const transformedContribution = transformValueForChecksum(selectedDigit * currentMultiplier);

            // The inner loop iterates through all previously accumulated partial sums.
            for (let prevPartialSum = 0; prevPartialSum < MAXIMUM_DP_SUM_STATES; ++prevPartialSum) {
                // Optimization: If no paths lead to `prevPartialSum` at the current `currentWildcardIdx` stage, skip.
                if (dpTable[currentWildcardIdx][prevPartialSum] === 0) {
                    continue;
                }

                // Determine the new total partial sum after adding the current wildcard's contribution.
                const newPartialSum = prevPartialSum + transformedContribution;

                // Only update if the new sum is within the defined bounds of our DP table.
                if (newPartialSum < MAXIMUM_DP_SUM_STATES) {
                    // Add the number of ways from the previous state to the new state.
                    dpTable[currentWildcardIdx + 1][newPartialSum] += dpTable[currentWildcardIdx][prevPartialSum];
                }
            }
        }
    }

    // Compute the final count of valid combinations that satisfy the checksum rule.
    let totalValidChecksumCombinations = 0;

    // Iterate through all possible final partial sums stored in the DP table.
    for (let finalDpSum = 0; finalDpSum < MAXIMUM_DP_SUM_STATES; ++finalDpSum) {
        // Check if the sum of fixed digits plus the current DP-derived partial sum
        // is perfectly divisible by the checksum modulus.
        if ((accumulatedFixedDigitSum + finalDpSum) % FINAL_CHECKSUM_MODULO === 0) {
            // If valid, add the number of ways to achieve this `finalDpSum` using all wildcards.
            totalValidChecksumCombinations += dpTable[wildcardWeightFactors.length][finalDpSum];
        }
    }

    // Output the final computed count of valid combinations.
    console.log(totalValidChecksumCombinations);
})();