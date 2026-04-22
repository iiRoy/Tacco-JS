const processInputData = (inputBlob) => {
    // Validate input: ensure it's a non-empty string.
    if (typeof inputBlob !== 'string' || inputBlob.trim().length === 0) {
        console.error("Input processing terminated: Provided data is empty or malformed.");
        return;
    }

    /**
     * Safely parses a string into an integer, defaulting to 0 if parsing fails.
     * @param {string} valueString - The string to parse.
     * @returns {number} The parsed integer or 0.
     */
    const getNumericValue = (valueString) => parseInt(valueString, 10) || 0;

    /**
     * Calculates the sum of a specific numeric property across an array of objects.
     * @param {Array<Object>} itemCollection - The array of objects.
     * @param {string} propertyKey - The name of the property to sum.
     * @returns {number} The total sum.
     */
    const calculatePropertySum = (itemCollection, propertyKey) =>
        itemCollection.reduce((currentSum, currentItem) => currentSum + currentItem[propertyKey], 0);

    // Split the entire input block into an array of individual lines.
    const inputLinesArray = inputBlob.trim().split("\n");

    // Process the first line to extract global configuration parameters.
    const initialConfigurationTokens = inputLinesArray[0].split(" ");
    if (initialConfigurationTokens.length < 3) {
        console.error("Input processing terminated: Configuration line is incomplete. Expected N, RatioA, RatioB.");
        return;
    }

    const numberOfItemsToConsider = getNumericValue(initialConfigurationTokens[0]);
    // Store the target ratio as an array [numerator, denominator].
    const desiredRatioComponents = [getNumericValue(initialConfigurationTokens[1]), getNumericValue(initialConfigurationTokens[2])];

    // Extract the actual data entries, starting from the second line.
    // Ensure we don't try to access lines beyond the input array's length.
    const rawDataRecords = inputLinesArray.slice(1, 1 + numberOfItemsToConsider);

    // Warn if the number of actual data records is less than specified.
    if (rawDataRecords.length < numberOfItemsToConsider) {
        console.warn(`Warning: Expected ${numberOfItemsToConsider} data records but found ${rawDataRecords.length}. Proceeding with available records.`);
    }

    // This variable will hold the best combination of items found so far
    // that satisfies the ratio and has the minimum expense.
    let bestAchievedCombination = [];

    /**
     * Computes the Greatest Common Divisor (GCD) of two non-negative integers
     * using the Euclidean algorithm.
     * @param {number} valX - The first integer.
     * @param {number} valY - The second integer.
     * @returns {number} The GCD of valX and valY.
     */
    const computeGCD = (valX, valY) => {
        if (valY === 0) return valX;
        return computeGCD(valY, valX % valY);
    };

    /**
     * Simplifies a ratio (x:y) to its lowest terms and returns it as a string "x_prime y_prime".
     * Handles edge cases for zero values.
     * @param {number} primaryVal - The primary value of the ratio.
     * @param {number} secondaryVal - The secondary value of the ratio.
     * @returns {string} The simplified ratio as a space-separated string.
     */
    const formatSimplifiedRatio = (primaryVal, secondaryVal) => {
        if (primaryVal === 0 && secondaryVal === 0) return "0 0";
        if (primaryVal === 0) return "0 1"; // Simplifies to 0:1
        if (secondaryVal === 0) return "1 0"; // Simplifies to 1:0

        const commonDivisor = computeGCD(primaryVal, secondaryVal);
        return `${primaryVal / commonDivisor} ${secondaryVal / commonDivisor}`;
    };

    /**
     * Recursively explores potential combinations of data records to find the one
     * that matches the desired ratio with the minimum total expense.
     * This function implements a depth-first search strategy, starting from a given index
     * and extending the current combination.
     * @param {string | undefined} currentLineContent - The string content of the data record being processed.
     * @param {Array<Object>} currentActiveCombination - The collection of items chosen in the current path.
     * @param {number} currentRecordIdx - The index of the data record being considered from `rawDataRecords`.
     */
    const exploreAndEvaluateCombinations = (currentLineContent, currentActiveCombination, currentRecordIdx) => {
        // Base case 1: If we have processed all available records or the current line is invalid.
        if (currentRecordIdx >= numberOfItemsToConsider || !currentLineContent) {
            return;
        }

        // Parse the current data record line into its numerical components.
        const recordTokens = currentLineContent.split(" ").map(getNumericValue);
        if (recordTokens.length < 3) {
            console.warn(`Skipping malformed data record at index ${currentRecordIdx}: "${currentLineContent}"`);
            // Attempt to continue with the next record, skipping this malformed one.
            const nextRecordLine = rawDataRecords[currentRecordIdx + 1];
            exploreAndEvaluateCombinations(nextRecordLine, currentActiveCombination, currentRecordIdx + 1);
            return;
        }

        // Create an object for the current item and add it to a new combination array.
        const newlyAddedItem = {
            valueA: recordTokens[0],
            valueB: recordTokens[1],
            itemExpense: recordTokens[2]
        };
        const extendedCombination = [...currentActiveCombination, newlyAddedItem];

        // Calculate aggregate values for the extended combination.
        const totalExpenseForPath = calculatePropertySum(extendedCombination, 'itemExpense');
        const sumOfValueA = calculatePropertySum(extendedCombination, 'valueA');
        const sumOfValueB = calculatePropertySum(extendedCombination, 'valueB');

        // Determine the current minimum expense found in any valid combination.
        let minimumOverallExpense = Infinity;
        if (bestAchievedCombination.length > 0) {
            minimumOverallExpense = calculatePropertySum(bestAchievedCombination, 'itemExpense');
        }

        // Pruning step: If the current path's total expense already exceeds the best found,
        // there's no need to continue exploring this specific branch.
        if (totalExpenseForPath > minimumOverallExpense) {
            return;
        }

        // Check if the current combination's (valueA:valueB) ratio matches the desired target ratio.
        const currentRatioText = formatSimplifiedRatio(sumOfValueA, sumOfValueB);
        const targetRatioText = `${desiredRatioComponents[0]} ${desiredRatioComponents[1]}`;

        if (currentRatioText === targetRatioText) {
            // This combination is a valid candidate. Update `bestAchievedCombination` if it's better.
            if (bestAchievedCombination.length === 0 || totalExpenseForPath < minimumOverallExpense) {
                bestAchievedCombination = extendedCombination;
            }
            // Important: If a valid ratio is found, this particular recursive path terminates.
            // The original logic does not continue extending the combination if a match is found.
        } else {
            // If the ratio is NOT yet met, continue exploring by adding the next item in sequence.
            const nextRecordLine = rawDataRecords[currentRecordIdx + 1];
            exploreAndEvaluateCombinations(nextRecordLine, extendedCombination, currentRecordIdx + 1);
        }
    };

    // Initiate the search: For each data record, start a new potential combination path.
    // This finds contiguous sub-sequences of records that satisfy the condition.
    for (let startingIndex = 0; startingIndex < numberOfItemsToConsider; startingIndex++) {
        const initialRecordLine = rawDataRecords[startingIndex];
        if (initialRecordLine) {
            // Each call starts with an empty combination and tries to add `initialRecordLine` first.
            exploreAndEvaluateCombinations(initialRecordLine, [], startingIndex);
        }
    }

    // Output the final result based on whether an optimal combination was found.
    if (bestAchievedCombination.length === 0) {
        console.log(-1);
    } else {
        console.log(calculatePropertySum(bestAchievedCombination, 'itemExpense'));
    }
};

// --- Application Entry Point ---
// Read input from the standard input stream.
try {
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputData(rawInputContent);
} catch (fileError) {
    console.error("An error occurred while reading from /dev/stdin:", fileError.message);
    // In a production environment, you might want to exit with an error code.
    // process.exit(1);
}