/**
 * This module is designed for processing a list of numerical inputs.
 * It categorizes numbers based on divisibility by ten and then computes
 * a maximum possible sum following a specific recursive pattern,
 * where intermediate or final sums that are multiples of ten are generally avoided.
 */

/**
 * Partitions a collection of string-encoded numbers into two groups:
 * those perfectly divisible by ten, and all others.
 * It also computes the total sum of the numbers divisible by ten.
 *
 * @param {string[]} rawInputItems - An array of strings, each representing a number.
 * @returns {object} An object containing three properties:
 *   - `divisibleByTen`: An array of numbers that are multiples of ten.
 *   - `totalSumOfTens`: The sum of all numbers in `divisibleByTen`.
 *   - `otherNumbers`: An array of numbers not divisible by ten.
 */
function segregateNumericStrings(rawInputItems) {
    // Initialize containers for the categorized numbers and their sum.
    const numbersDivisibleByTen = [];
    const remainingNumbers = [];
    let cumulativeSumOfMultiplesOfTen = 0;

    // Implement a pre-check for the validity of the input array.
    if (!Array.isArray(rawInputItems) || rawInputItems.length === 0) {
        console.warn("Input array for segregation is empty or invalid. Returning default empty structure.");
        return {
            divisibleByTen: [],
            totalSumOfTens: 0,
            otherNumbers: [],
        };
    }

    // Iterate through each string item using a modern `for...of` loop.
    for (const itemStr of rawInputItems) {
        // Convert the string representation to a numerical value.
        const numericalValue = Number(itemStr);

        // Skip any items that cannot be successfully converted to a number.
        if (isNaN(numericalValue)) {
            console.info(`Skipping non-numeric entry: '${itemStr}'.`);
            continue;
        }

        // Check for divisibility by 10.
        // Using the modulo operator and strict equality for precision.
        if ((numericalValue % 10) === 0) {
            numbersDivisibleByTen.push(numericalValue);
            cumulativeSumOfMultiplesOfTen += numericalValue;
        } else {
            remainingNumbers.push(numericalValue);
        }
    }

    // Construct and return the result object with descriptive keys.
    return {
        divisibleByTen: numbersDivisibleByTen,
        totalSumOfTens: cumulativeSumOfMultiplesOfTen,
        otherNumbers: remainingNumbers,
    };
}

/**
 * Initiates a recursive process to find the optimal sum by combining numbers
 * from the 'otherNumbers' category, starting with one chosen element,
 * and adding the pre-calculated sum of all multiples of ten.
 * One element from 'otherNumbers' is strategically excluded from the recursive part.
 *
 * @param {number} startingElement - The number from `otherNumbers` that begins this particular sum calculation.
 * @param {number} elementToExcludeIdx - The zero-based index of `startingElement` within the original `otherNumbers` array,
 *                                       so it can be correctly omitted from the list passed to the recursive function.
 * @param {object} categorizedInfo - An object containing the segregated number arrays and their sum,
 *                                   as returned by `segregateNumericStrings`.
 * @returns {number} The highest sum achievable under the defined rules for this specific starting pattern.
 */
function computeBestSequenceSum(startingElement, elementToExcludeIdx, categorizedInfo) {
    // Combine the initial element with the total sum of multiples of ten.
    const currentBaseSum = startingElement + categorizedInfo.totalSumOfTens;

    // Prepare a new array of 'otherNumbers' excluding the `startingElement`.
    const reducedSetForRecursion = [];
    const originalOtherNumbers = categorizedInfo.otherNumbers;

    // Add a check for an empty or invalid `originalOtherNumbers` array.
    if (!Array.isArray(originalOtherNumbers) || originalOtherNumbers.length === 0) {
        // If there are no other numbers to combine, the base sum is the final result.
        return currentBaseSum;
    }

    // Manually construct the reduced set, excluding the element at `elementToExcludeIdx`.
    for (let currentIdx = 0; currentIdx < originalOtherNumbers.length; currentIdx++) {
        if (currentIdx !== elementToExcludeIdx) {
            reducedSetForRecursion.push(originalOtherNumbers[currentIdx]);
        }
    }

    // Begin the recursive aggregation process with the prepared sum and reduced set.
    // The recursion starts from the first element (index 0) of the `reducedSetForRecursion`.
    return recursivelyDetermineSum(currentBaseSum, reducedSetForRecursion, 0);
}

/**
 * A recursive helper function that calculates the maximum possible sum from a list of numbers.
 * At each step, it decides whether to include the current number or not,
 * with a rule that sums that are multiples of ten are considered invalid (yielding 0).
 *
 * @param {number} accumulatedValue - The sum accumulated up to the current point in the recursion.
 * @param {number[]} remainingValues - The subset of numbers still available for consideration.
 * @param {number} iterationIndex - The current index within `remainingValues` being processed.
 * @returns {number} The maximum valid sum found from this point in the recursion.
 */
function recursivelyDetermineSum(accumulatedValue, remainingValues, iterationIndex) {
    // Base case: If all elements in `remainingValues` have been processed.
    if (iterationIndex >= remainingValues.length) {
        // If the final accumulated sum is a multiple of ten, it's an invalid path.
        if ((accumulatedValue % 10) === 0) {
            return 0; // Signifies an invalid sum according to problem rules.
        }
        return accumulatedValue; // This is a valid final sum.
    }

    // Recursive step: Explore two branches for the current element.
    // Branch A: Include the number at `iterationIndex` in the sum.
    const sumIncludingCurrent = recursivelyDetermineSum(
        accumulatedValue + remainingValues[iterationIndex],
        remainingValues,
        iterationIndex + 1
    );

    // Branch B: Exclude the number at `iterationIndex` from the sum.
    const sumExcludingCurrent = recursivelyDetermineSum(
        accumulatedValue,
        remainingValues,
        iterationIndex + 1
    );

    // Evaluate the results from both branches based on validity (not being a multiple of ten).
    const isSumAValid = (sumIncludingCurrent % 10) !== 0;
    const isSumBValid = (sumExcludingCurrent % 10) !== 0;

    // Decision logic:
    if (isSumAValid && isSumBValid) {
        // If both paths yield valid sums, choose the larger one.
        return Math.max(sumIncludingCurrent, sumExcludingCurrent);
    } else if (isSumAValid) {
        // If only sumIncludingCurrent is valid.
        return sumIncludingCurrent;
    } else if (isSumBValid) {
        // If only sumExcludingCurrent is valid.
        return sumExcludingCurrent;
    } else {
        // If neither path yields a valid sum (both are multiples of ten or 0).
        return 0;
    }
}

/**
 * The primary function that orchestrates the entire data processing workflow.
 * It takes a raw string input, parses it, categorizes numbers, and then
 * iteratively computes the maximum possible sum following specific rules.
 *
 * @param {string} completeRawInput - A multi-line string containing all input data.
 * @returns {number} The highest sum found across all possible valid combinations.
 */
function processApplicationInput(completeRawInput) {
    // Implement robust input validation at the entry point.
    if (typeof completeRawInput !== 'string' || completeRawInput.trim().length === 0) {
        console.error("Error: Input provided is either not a string or is empty. Cannot process.");
        return 0; // Return a default error value.
    }

    // Split the entire input string into individual lines.
    const inputLinesArray = completeRawInput.split("\n");

    // Guard clause: Ensure there's sufficient data beyond a potential header line.
    if (inputLinesArray.length < 2) {
        console.error("Error: Input does not contain enough lines for processing (expected at least 2).");
        return 0;
    }

    // Extract the actual data points, assuming the first line is non-data (e.g., a count).
    const dataPointsForProcessing = inputLinesArray.slice(1);

    // Categorize the extracted data points.
    const processedDataCategories = segregateNumericStrings(dataPointsForProcessing);

    let overallHighestSum = 0; // Variable to keep track of the absolute maximum sum found.

    // Iterate through each number in the 'otherNumbers' category.
    // Each of these numbers will serve as an initial element for a `computeBestSequenceSum` call.
    for (let iterationCounter = 0; iterationCounter < processedDataCategories.otherNumbers.length; iterationCounter++) {
        const currentInitialCandidate = processedDataCategories.otherNumbers[iterationCounter];

        // Compute the maximum sum for the current pattern.
        const currentPatternMax = computeBestSequenceSum(
            currentInitialCandidate,
            iterationCounter, // Pass the index to correctly exclude it.
            processedDataCategories
        );

        // Update the overall highest sum if the current pattern yielded a greater result.
        overallHighestSum = Math.max(overallHighestSum, currentPatternMax);
    }

    return overallHighestSum; // Return the final computed maximum sum.
}

// Self-executing anonymous function to handle script execution and I/O operations.
(function initializeAndExecute() {
    try {
        // Dynamically load the Node.js file system module.
        const fileSystemHandler = require("fs");
        // Define the standard input path, common in competitive programming.
        const standardInputPath = "/dev/stdin";

        // Synchronously read the entire content of the standard input file as a UTF-8 string.
        const fullInputContent = fileSystemHandler.readFileSync(standardInputPath, "utf8");

        // Execute the main processing logic with the read input.
        const finalCalculatedResult = processApplicationInput(fullInputContent);

        // Output the final result to standard output.
        console.log(finalCalculatedResult);
    } catch (operationError) {
        // Catch and report any errors that occur during file reading or processing.
        console.error("An unexpected error occurred during execution:", operationError.message);
        // Optionally, exit the process with an error code.
        process.exit(1);
    }
})();