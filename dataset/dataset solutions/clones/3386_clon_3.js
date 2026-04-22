/**
 * Determines the winner of a game based on a series of numeric inputs.
 * The game's outcome is decided by the parity of a computed value derived from the input.
 *
 * @param {string} rawInputData - A multi-line string where the first line is a count (N, often ignored or for context)
 *                                and subsequent lines are numeric game values.
 */
function ProcessGameOutcome(rawInputData) {
    // --- Input Validation and Pre-processing ---

    // Ensure input data is not empty or just whitespace
    if (!rawInputData || rawInputData.trim().length === 0) {
        console.error("Error: Provided input data is empty or invalid.");
        return; // Exit if no meaningful data
    }

    // Split the raw string into individual lines
    let dataLines = rawInputData.split("\n");

    // The first line typically contains a count, which we extract.
    // For this specific problem, this count (initialGameElementCount) is often not directly used
    // in the final parity calculation, but it's good practice to parse it.
    const initialGameElementCount = parseInt(dataLines.shift(), 10);

    // Convert remaining lines to numbers. Filter out any entries that couldn't be parsed as valid integers.
    // This adds robustness compared to a simple map(Number).
    const gameNumericValues = dataLines
        .map(val => parseInt(val.trim(), 10))
        .filter(num => !isNaN(num));

    // If no valid game numbers remain after processing, output an error and stop.
    if (gameNumericValues.length === 0) {
        console.error("Error: No valid game numbers found after initial processing.");
        return;
    }

    // --- Core Game Logic Calculations ---

    // Calculate the sum of all processed numeric values.
    // This replaces the original 'arrsum' function with a modern Array.prototype.reduce().
    const overallSumOfValues = gameNumericValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Calculate the sum of numeric values, explicitly excluding any '1's.
    // This leverages the 'aggregateValuesWithoutOne' helper function.
    const sumOfNonOneValues = aggregateValuesWithoutOne(gameNumericValues);

    // --- Determining the Outcome Indicator ---

    // Condition 1: Check if all game numeric values were '1'.
    // This is true if the total sum equals the count of values.
    const allValuesAreUnity = (overallSumOfValues === gameNumericValues.length);

    // Condition 2: Check if the sum of non-one values is an odd number.
    const isSumOfNonUnityValuesOdd = (sumOfNonOneValues % 2 !== 0);

    // Initialize the final outcome indicator. This variable will determine the winner based on its parity.
    let finalGameOutcomeIndicator = 0; // Default to an even state

    // The logic dictates that if either 'allValuesAreUnity' OR 'isSumOfNonUnityValuesOdd' is true,
    // the outcome indicator effectively becomes 1 (odd).
    if (allValuesAreUnity || isSumOfNonUnityValuesOdd) {
        finalGameOutcomeIndicator = 1;
    } else {
        // Otherwise, the outcome indicator's parity is determined by the total sum of all values.
        finalGameOutcomeIndicator = overallSumOfValues;
    }

    // --- Announcing the Winner ---

    // The "first" player wins if the final outcome indicator is odd.
    // The "second" player wins if the final outcome indicator is even.
    if (finalGameOutcomeIndicator % 2 !== 0) {
        console.log("first");
    } else {
        console.log("second");
    }
}

/**
 * Computes the sum of elements in a numeric array, specifically excluding any elements
 * that have a value of '1'.
 *
 * @param {Array<number>} numericCollection - The array of numbers to iterate and sum.
 * @returns {number} The cumulative sum of all numbers in the collection that are not equal to 1.
 */
function aggregateValuesWithoutOne(numericCollection) {
    // Initialize an accumulator for the sum.
    let currentAccumulatedSum = 0;

    // Iterate through each value in the provided collection using a modern 'for...of' loop.
    for (const singleValue of numericCollection) {
        // Introduce a temporary boolean to make the condition explicit.
        const isTheValueUnity = (singleValue === 1);

        // Only add the value to the sum if it is NOT equal to 1.
        if (!isTheValueUnity) {
            currentAccumulatedSum += singleValue;
        }
    }
    return currentAccumulatedSum;
}

// --- Program Entry Point ---

// Read input from standard input, decode as UTF-8, and remove leading/trailing whitespace.
// Then, pass this processed string to the main game logic function.
ProcessGameOutcome(require("fs").readFileSync("/dev/stdin", "utf8").trim());