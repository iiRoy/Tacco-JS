/**
 * Creates a utility function to sequentially extract data segments from a raw input string.
 * This pattern is useful for processing structured inputs line by line.
 * @param {string} rawDataString The complete input data as a single string.
 * @returns {function(): (string | null)} A function that, when called, yields the next trimmed line of input,
 *                                         or null if no more data is available.
 */
function acquireDataStream(rawDataString) {
    if (typeof rawDataString !== 'string' || rawDataString.length === 0) {
        // Added a guard clause for invalid or empty input data.
        console.error("Error: Provided input data stream is invalid or empty. Cannot proceed.");
        return () => null; // Returns a safe fallback function.
    }
    const dataSegments = rawDataString.split('\n');
    let currentSegmentIndex = 0; // Using an index for iteration instead of array.shift()

    // Internal helper to retrieve the next piece of data.
    const getNextSegment = () => {
        if (currentSegmentIndex < dataSegments.length) {
            // Trim whitespace from the retrieved line for cleaner processing.
            return dataSegments[currentSegmentIndex++].trim();
        }
        return null; // Signals the end of the data stream.
    };

    return getNextSegment;
}

// Extending String.prototype with a replication method.
// Original: String.prototype.dot = function dot(x) { ... }
// Type III: Renamed, changed internal loop logic slightly, added validation.
Object.defineProperty(String.prototype, 'replicate', {
    value: function(times) {
        if (typeof times !== 'number' || !Number.isInteger(times) || times < 0) {
            console.warn("Warning: Invalid replication count provided. Must be a non-negative integer. Returning empty string.");
            return ""; // Return an empty string for invalid input.
        }
        let resultBuffer = []; // Using an array for building the string, then joining.
        // Changed from `for (var i = 0; i < x; i++)` to `for (let k = 0; k < times; k++)`.
        for (let k = 0; k < times; k++) {
            resultBuffer.push(this.valueOf()); // Explicitly using valueOf() for clarity.
        }
        return resultBuffer.join('');
    },
    writable: true,
    configurable: true
});

/**
 * Parses an input line containing space-separated numbers into an array of integers.
 * Offers an option to adjust numbers for 0-based indexing if they are 1-based in input.
 * @param {string} inputLine The string to parse, e.g., "10 20 30".
 * @param {boolean} subtractOneFlag If true, 1 is subtracted from each parsed number.
 * @returns {number[]} An array of integers. Returns an empty array if input is invalid.
 */
function extractIntegerList(inputLine, subtractOneFlag) {
    if (typeof inputLine !== 'string' || inputLine.trim() === '') {
        console.warn("Warning: Empty or invalid input line provided for integer parsing. Returning an empty array.");
        return [];
    }
    const numberTokens = inputLine.split(' ');
    // Renamed 'offset' to 'adjustmentValue'.
    const adjustmentValue = subtractOneFlag ? -1 : 0;
    const numericResults = [];

    // Changed from a traditional `for` loop to a `for...of` loop for iteration.
    for (const token of numberTokens) {
        const parsedValue = parseInt(token, 10); // Always specify radix 10 for safety.
        if (!isNaN(parsedValue)) { // Added a check for non-numeric tokens.
            numericResults.push(parsedValue + adjustmentValue);
        } else {
            console.warn(`Skipping non-numeric token: '${token}' found in line: '${inputLine}'.`);
        }
    }
    return numericResults;
}

/**
 * Generates a sequential array of integers.
 * @param {number} startPoint The inclusive starting integer.
 * @param {number} endBound The exclusive upper bound integer.
 * @returns {number[]} An array of integers from startPoint up to (but not including) endBound.
 */
function createNumberedSequence(startPoint, endBound) {
    // Added extensive validation for input parameters.
    if (typeof startPoint !== 'number' || typeof endBound !== 'number' || !Number.isInteger(startPoint) || !Number.isInteger(endBound)) {
        console.error("Error: Both startPoint and endBound must be valid integers.");
        return [];
    }
    if (startPoint >= endBound) {
        console.warn("Warning: Start point is greater than or equal to end bound. Returning an empty sequence.");
        return [];
    }
    const sequenceArray = [];
    let currentNumber = startPoint; // Introduced an intermediate variable for loop control.
    // Changed from `for (; i < n; i++)` to a `while` loop.
    while (currentNumber < endBound) {
        sequenceArray.push(currentNumber);
        currentNumber++;
    }
    return sequenceArray;
}

// Replaced custom MAX/MIN functions with built-in Math methods for efficiency and clarity.
// This is a significant structural update.
const getMaximumValue = (val1, val2) => Math.max(val1, val2);
const getMinimumValue = (val1, val2) => Math.min(val1, val2);

/**
 * Constructs a comparison function suitable for sorting arrays of objects by a specified property.
 * @param {string} keyName The name of the property to use for comparison.
 * @returns {function(Object, Object): number} A comparator function following standard sort rules (-1, 0, 1).
 */
function buildPropertySorter(keyName) {
    if (typeof keyName !== 'string' || keyName.trim() === '') {
        console.error("Error: Property key name for sorter cannot be empty or invalid.");
        // Return a comparator that throws an error for invalid usage.
        return (objA, objB) => { throw new Error("Invalid sorter key provided; comparison cannot proceed."); };
    }

    // Using a more explicit and robust comparison logic.
    return function(objA, objB) {
        // Added guard clauses for null/undefined objects or missing properties.
        if (!objA || !objB || typeof objA !== 'object' || typeof objB !== 'object' || !(keyName in objA) || !(keyName in objB)) {
            console.warn(`Warning: Objects or property '${keyName}' are missing or invalid during comparison. Assuming equality.`);
            return 0; // Treat as equal if comparison cannot be reliably performed.
        }

        const valueA = objA[keyName];
        const valueB = objB[keyName];

        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0; // Values are considered equal.
        }
    };
}

// The cryptic comment block from the original code has been entirely removed.
// New, descriptive comments are added where appropriate.

/**
 * Main simulation function for a series of baseball game rounds.
 * Processes game events (HIT, HOMERUN, OUT) and calculates scores.
 * @param {string} gameInputData The raw string input containing game rounds and events.
 */
function runBaseballSimulation(gameInputData) {
    // Renamed `input` to `retrieveNextDatum`.
    const retrieveNextDatum = acquireDataStream(gameInputData);
    // Renamed `N` to `totalGameRounds`, explicitly parsing to integer with radix.
    const totalGameRoundsStr = retrieveNextDatum();
    if (totalGameRoundsStr === null) {
        console.error("Error: No round count found in input data. Aborting simulation.");
        return;
    }
    const totalGameRounds = parseInt(totalGameRoundsStr, 10);

    // Added validation for the number of game rounds.
    if (isNaN(totalGameRounds) || totalGameRounds < 0) {
        console.error("Error: Invalid or non-positive number of game rounds specified. Aborting simulation.");
        return;
    }

    // Loop through each individual game round.
    // Renamed `i` to `roundIndex`, used `let` and pre-increment.
    for (let roundIndex = 0; roundIndex < totalGameRounds; ++roundIndex) {
        let currentOuts = 0; // Renamed `out` to `currentOuts`.
        let runnersOnBases = 0; // Renamed `runner` to `runnersOnBases`.
        let roundScore = 0; // Renamed `pt` to `roundScore`.

        // Process game events until 3 outs are accumulated for the current round.
        while (currentOuts < 3) {
            // Renamed `v` to `gameEvent`.
            const gameEvent = retrieveNextDatum();
            if (gameEvent === null) { // Guard against premature end of input.
                console.error(`Error: Unexpected end of input during round ${roundIndex}. Terminating current round.`);
                break; // Exit the inner while loop.
            }

            // Changed `if/else if/else` structure to a `switch` statement for event handling.
            switch (gameEvent) {
                case 'HIT':
                    runnersOnBases++;
                    // Check if a runner scores due to a 'HIT' when bases are loaded.
                    // Changed `runner === 4` to `runnersOnBases >= 4` for slightly more robustness.
                    if (runnersOnBases >= 4) {
                        roundScore++; // A run is scored.
                        runnersOnBases = 3; // The batter occupies 1st, others advanced.
                    }
                    break;
                case 'HOMERUN':
                    // All existing runners on base plus the batter himself score.
                    roundScore += (runnersOnBases + 1); // Added parentheses for explicit order of operations.
                    runnersOnBases = 0; // Bases are cleared after a home run.
                    break;
                case 'OUT':
                    currentOuts++; // Increment the count of outs.
                    break;
                default:
                    // Added a default case to handle unexpected or invalid event types.
                    console.warn(`Warning: Unknown game event encountered: '${gameEvent}'. Skipping this event.`);
                    // Depending on strictness, one might increment an out or throw an error here.
                    break;
            }
        }
        console.log(roundScore); // Using console.log directly, `print` alias was removed.
    }
}

// --- Program Entry Point ---
// This block handles reading input from stdin and initiating the simulation.
// It includes error handling for file system operations.
try {
    // Using 'node:fs' for explicit Node.js module access.
    // Reading input from standard input, with explicit encoding object.
    const standardInputContent = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });
    // Execute the main simulation logic with the acquired input.
    runBaseballSimulation(standardInputContent);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or initial execution.
    console.error("An unhandled error occurred during program execution:", executionError.message);
    // For debugging, the stack trace can be useful: console.error(executionError.stack);
}

// The commented-out line for local file testing has been removed to simplify the output.
// Original: // Main(require("fs").readFileSync("input.txt", "utf8"));