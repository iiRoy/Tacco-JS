const fileSystemModule = require('fs'); // Import the Node.js file system module for input operations.

// Define the standard input file path, typically used in competitive programming environments.
const standardInputFilePath = '/dev/stdin';

// Read the entire content of the standard input file.
// - `readFileSync` reads the file synchronously.
// - `'utf8'` specifies the character encoding.
// - `.trim()` removes any leading or trailing whitespace, including newlines.
const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8').trim();

// Split the raw input string into an array of individual lines.
// Each element in `availableInputLines` will be a string representing one line of input.
let availableInputLines = rawInputContent.split('\n');

/**
 * Utility function to parse a string line into an array of numbers.
 * It handles potential empty lines gracefully.
 * @param {string} lineText The input string line to be parsed.
 * @returns {Array<number>} An array containing numbers parsed from the line.
 */
const parseLineToNumbers = (lineText) => {
    // If the line is empty or just whitespace, return an empty array.
    if (!lineText || lineText.trim() === '') {
        return [];
    }
    // Split the line by spaces and convert each resulting string part to a number.
    return lineText.split(' ').map(Number);
};

// Begin the main processing loop. Each iteration handles a single test case or scenario.
// The loop continues as long as there are lines remaining in the input to process.
while (availableInputLines.length > 0) {
    // Extract and parse the first line, which typically contains the configuration for the current scenario (N and R).
    // `shift()` removes the first element from `availableInputLines` and returns it.
    const scenarioConfiguration = parseLineToNumbers(availableInputLines.shift());

    // Perform basic validation to ensure the configuration line has at least two numbers.
    // If not, it could indicate malformed input or an unexpected end of file, so we terminate.
    if (scenarioConfiguration.length < 2) {
        // Log an error message for debugging purposes.
        console.error("Input error: Malformed scenario configuration line or unexpected EOF.");
        break; // Exit the loop as we cannot proceed with invalid configuration.
    }

    // Destructure the configuration values for better readability.
    const initialCardCount = scenarioConfiguration[0]; // N: The total number of cards in the initial deck.
    const numberOfShuffleOperations = scenarioConfiguration[1]; // R: The number of shuffle operations to perform.

    // Check for the problem's specific termination condition: N = 0 and R = 0.
    // This is often used to signal the end of all test cases.
    const combinedValueForTermination = initialCardCount + numberOfShuffleOperations;
    if (combinedValueForTermination === 0) {
        break; // If the sum is zero, exit the main processing loop.
    }

    // Initialize the deck of cards for the current scenario.
    // The original problem specifies a deck ordered from N down to 1 (e.g., [5, 4, 3, 2, 1] for N=5).
    // Type III change: Using `Array.from` with a mapping function for a more concise and functional initialization
    // instead of a traditional `for` loop pushing elements.
    let currentDeckState = Array.from({ length: initialCardCount }, (_, index) => initialCardCount - index);

    // Iterate through each of the specified shuffle operations.
    for (let currentShuffleRound = 0; currentShuffleRound < numberOfShuffleOperations; currentShuffleRound++) {
        // Extract and parse the line detailing the current shuffle operation (p and c).
        const operationParameters = parseLineToNumbers(availableInputLines.shift());

        // Validate the shuffle operation parameters.
        if (operationParameters.length < 2) {
            console.error(`Input error: Missing parameters for shuffle operation in round ${currentShuffleRound + 1}. Exiting.`);
            break; // Terminate if shuffle details are incomplete.
        }

        // Destructure the shuffle parameters.
        const cutStartOneIndexed = operationParameters[0]; // p: The 1-indexed position to start cutting.
        const cardsToMoveCount = operationParameters[1];   // c: The number of cards to cut and move.

        // Type III change: Introduce an intermediate variable for the 0-indexed cut position.
        // This improves clarity by separating the problem's 1-indexed input from array's 0-indexed operations.
        const zeroBasedCutIndex = cutStartOneIndexed - 1;

        // Implement robust validation for the shuffle parameters.
        // While competitive programming usually provides valid input, adding these checks is a Type III modification.
        if (zeroBasedCutIndex < 0 || zeroBasedCutIndex >= currentDeckState.length ||
            cardsToMoveCount <= 0 || (zeroBasedCutIndex + cardsToMoveCount) > currentDeckState.length) {
            // If parameters are invalid (e.g., cut position out of bounds, count is zero or too large).
            console.warn(`Warning: Invalid shuffle parameters detected (p=${cutStartOneIndexed}, c=${cardsToMoveCount}) for round ${currentShuffleRound + 1}. Skipping this operation.`);
            continue; // Skip the current invalid shuffle and proceed to the next.
        }

        // Perform the actual card cutting.
        // `splice` removes `cardsToMoveCount` elements starting from `zeroBasedCutIndex`
        // and returns them as a new array (`extractedSegment`).
        // `currentDeckState` is modified in place to contain the remaining cards.
        const extractedSegment = currentDeckState.splice(zeroBasedCutIndex, cardsToMoveCount);

        // Type III change: Rewrite the method of placing the extracted segment at the top of the deck.
        // The original code used a loop with `unshift(pop())`, which effectively preserves the internal order
        // of the cut segment while placing it at the front.
        // This rewrite uses the spread syntax (`...`) with array concatenation, which is a more modern and often
        // more readable way to achieve the same result: creating a new array with the `extractedSegment`
        // followed by the rest of the `currentDeckState`.
        currentDeckState = [...extractedSegment, ...currentDeckState];
    }

    // After all shuffle operations for the current scenario are complete,
    // print the value of the card that is now at the very top of the deck (index 0).
    console.log(currentDeckState[0]);
}