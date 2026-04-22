const INPUT_FILE_PATH = "/dev/stdin";
const DEFAULT_SPLIT_SEPARATOR = " ";
const MAX_HEALTH_CAP = 100000; // Represents the maximum damage point considered for DP table
const INITIAL_LARGE_VALUE = Infinity; // Used for unreachable states in DP table

/**
 * Enumeration for various input conversion types.
 * Helps in making `transformInput` function more readable and maintainable.
 */
const CONVERSION_TYPES = Object.freeze({
    INTEGER: 1,
    STRING_ARRAY: 2,
    NUMBER_ARRAY: 4,
    CHAR_ARRAY: 6,
    JOIN_SPACE: 8,
    JOIN_NEWLINE: 9,
    JOIN_EMPTY: 0
});

/**
 * Represents a battle spell with its damage output and associated mana cost.
 * Provides a structured way to store spell properties.
 */
class BattleSpell {
    /**
     * Creates an instance of BattleSpell.
     * @param {number} damage The amount of health points this spell can reduce.
     * @param {number} mana The mana required to cast this spell.
     */
    constructor(damage, mana) {
        this.spellDamage = damage;
        this.manaCost = mana;
    }
}

// Global instance of the input reader to manage sequential line access.
let globalInputHandler = null;

/**
 * Fetches raw input data from the standard input file.
 * Reads the entire file, trims whitespace, and splits it into an array of lines.
 * Handles potential file reading errors and empty input gracefully.
 * @returns {string[]} An array of strings, where each string is a line from the input.
 */
function fetchInputData() {
    try {
        const rawContent = require("fs").readFileSync(INPUT_FILE_PATH, "utf8").trim();
        if (!rawContent) {
            console.error("Warning: Input file is empty. Processing with no input lines.");
            return []; // Return an empty array if the file is empty
        }
        return rawContent.split("\n");
    } catch (error) {
        console.error(`Error reading input file from ${INPUT_FILE_PATH}:`, error.message);
        // In a production environment, might rethrow or handle differently.
        // For competitive programming, returning empty array often prevents crashes.
        return [];
    }
}

/**
 * Initializes and returns an input reader object.
 * This object provides methods to check for more lines and retrieve the next line.
 * It encapsulates the state of input consumption.
 * @returns {object} An object containing input lines, current index, total lines,
 *                   and methods `hasMoreLines` and `getNextLine`.
 */
function initializeInputReader() {
    const rawLines = fetchInputData();
    const readerInstance = {
        dataLines: rawLines,
        currentLineIndex: 0,
        totalLines: rawLines.length,

        /**
         * Checks if there are more lines available to be read from the input.
         * @returns {boolean} True if there are unread lines, false otherwise.
         */
        hasMoreLines: function () {
            return this.currentLineIndex < this.totalLines;
        },

        /**
         * Retrieves the next available line from the input.
         * Increments the internal line index after reading.
         * Returns `null` if no more lines are available, preventing an error.
         * @returns {string | null} The next input line as a string, or `null` if end of input.
         */
        getNextLine: function () {
            if (!this.hasMoreLines()) {
                // Return null instead of throwing an error for a more graceful end-of-input handling
                return null;
            }
            const currentLineContent = this.dataLines[this.currentLineIndex];
            this.currentLineIndex++;
            return currentLineContent;
        }
    };
    return readerInstance;
}

/**
 * Transforms input data based on a specified conversion type.
 * This function centralizes various parsing and formatting operations.
 * @param {*} inputData The data to be transformed (e.g., a string line from input).
 * @param {number} conversionType A constant from `CONVERSION_TYPES` indicating the desired conversion.
 * @returns {*} The transformed data, or the original data if conversion fails or type is unknown.
 */
function transformInput(inputData, conversionType) {
    // Guard clause for null or undefined input to prevent errors
    if (inputData === null || inputData === undefined) {
        return inputData;
    }

    switch (conversionType) {
        case CONVERSION_TYPES.INTEGER: {
            const parsedValue = Number(inputData); // More robust than parseInt, handles floats and empty strings
            return Number.isInteger(parsedValue) ? parsedValue : inputData; // Return original if not a valid integer
        }
        case CONVERSION_TYPES.STRING_ARRAY:
            return String(inputData).split(DEFAULT_SPLIT_SEPARATOR);
        case CONVERSION_TYPES.NUMBER_ARRAY:
            // Converts each item to a Number. `map` ensures a new array.
            return String(inputData).split(DEFAULT_SPLIT_SEPARATOR).map(item => Number(item));
        case CONVERSION_TYPES.CHAR_ARRAY:
            return String(inputData).split(""); // Splits string into an array of single characters
        case CONVERSION_TYPES.JOIN_SPACE:
            return Array.isArray(inputData) ? inputData.join(" ") : inputData;
        case CONVERSION_TYPES.JOIN_NEWLINE:
            return Array.isArray(inputData) ? inputData.join("\n") : inputData;
        case CONVERSION_TYPES.JOIN_EMPTY:
            return Array.isArray(inputData) ? inputData.join("") : inputData;
        default:
            // If conversion type is not recognized, return the original data.
            return inputData;
    }
}

// Convenient wrapper functions for accessing input via the global reader.
function getNextInputLine() { return globalInputHandler.getNextLine(); }
function hasMoreInputLines() { return globalInputHandler.hasMoreLines(); }

// Specialized input reading functions using the `transformInput` helper.
function readInteger() { return transformInput(getNextInputLine(), CONVERSION_TYPES.INTEGER); }
function readStringArray() { return transformInput(getNextInputLine(), CONVERSION_TYPES.STRING_ARRAY); }
function readIntArray() { return transformInput(getNextInputLine(), CONVERSION_TYPES.NUMBER_ARRAY); }
function readCharacterArray() { return transformInput(getNextInputLine(), CONVERSION_TYPES.CHAR_ARRAY); }

/**
 * Displays the final computed result to standard output.
 * @param {*} outputContent The content to be printed.
 */
function displayResult(outputContent) {
    console.log(outputContent);
}

/**
 * Logs an error message to standard error output.
 * Useful for debugging and reporting non-critical issues without affecting main output.
 * @param {*} errorMessage The error message or object to log.
 */
function logError(errorMessage) {
    console.error(errorMessage);
}

// Initialize the global input reader when the script starts.
globalInputHandler = initializeInputReader();
// Execute the main problem-solving logic.
solveProblem();

/**
 * The primary function containing the problem's solution logic.
 * This function orchestrates input reading, dynamic programming calculations,
 * and result output.
 */
function solveProblem() {
    // Start a performance timer to measure the execution duration of the solver.
    console.time("ProblemSolverExecution");

    // Read the first line of input which typically contains problem parameters.
    const firstLineData = readIntArray();

    // Input validation: Ensure the first line is valid and contains enough data.
    if (!firstLineData || firstLineData.length < 2 || !firstLineData.every(Number.isFinite)) {
        logError("Error: First line of input must contain two finite numbers (targetHealth, numSpells).");
        displayResult(INITIAL_LARGE_VALUE); // Indicate no solution due to bad input
        return;
    }

    const targetHealth = firstLineData[0]; // The total damage required (H)
    const numSpells = firstLineData[1];     // The number of available spells (N)

    // Further input validation for positive values.
    if (targetHealth <= 0) {
        displayResult(0); // If target health is non-positive, 0 mana is needed.
        return;
    }
    if (numSpells <= 0) {
        displayResult(INITIAL_LARGE_VALUE); // If no spells, cannot deal damage (unless targetHealth <= 0).
        return;
    }

    // Populate the list of available spells from subsequent input lines.
    const spellList = [];
    for (let i = 0; i < numSpells; i++) {
        const currentSpellData = readIntArray();
        if (!currentSpellData || currentSpellData.length < 2 || !currentSpellData.every(Number.isFinite)) {
            logError(`Warning: Skipping malformed spell data on line ${i + 2}. Expected two finite numbers.`);
            continue; // Skip this spell and try the next one
        }
        spellList.push(new BattleSpell(currentSpellData[0], currentSpellData[1]));
    }

    // Dynamic Programming Initialization:
    // `minManaForDamage[d]` will store the minimum mana required to deal EXACTLY `d` damage.
    // The DP table size needs to accommodate `MAX_HEALTH_CAP` plus one for zero-indexing.
    const dpTableSize = MAX_HEALTH_CAP + 1;
    const minManaForDamage = new Array(dpTableSize).fill(INITIAL_LARGE_VALUE);
    minManaForDamage[0] = 0; // It costs 0 mana to deal 0 damage.

    // First pass (Unbounded Knapsack DP):
    // Calculate the minimum mana to achieve *exactly* `d` damage for all `d` up to `MAX_HEALTH_CAP`.
    // We iterate through each possible damage point `currentDamagePoint`.
    // If `currentDamagePoint` is reachable (i.e., its mana cost is not `INITIAL_LARGE_VALUE`),
    // we then consider applying each spell from this state.
    for (let currentDamagePoint = 0; currentDamagePoint <= MAX_HEALTH_CAP; currentDamagePoint++) {
        // If the current damage point is unreachable, we cannot use it to reach further damage points.
        if (minManaForDamage[currentDamagePoint] === INITIAL_LARGE_VALUE) {
            continue;
        }

        // For each reachable `currentDamagePoint`, iterate through all spells.
        for (let spellIdx = 0; spellIdx < numSpells; spellIdx++) {
            const currentSpell = spellList[spellIdx];
            const { spellDamage, manaCost } = currentSpell;

            const nextDamagePoint = currentDamagePoint + spellDamage;

            // Ensure the `nextDamagePoint` is within the bounds of our DP table.
            if (nextDamagePoint <= MAX_HEALTH_CAP) {
                // Update the minimum mana cost for `nextDamagePoint` if a cheaper path is found.
                minManaForDamage[nextDamagePoint] = Math.min(
                    minManaForDamage[nextDamagePoint],
                    minManaForDamage[currentDamagePoint] + manaCost
                );
            }
        }
    }

    // Second pass (Post-processing for "at least" damage):
    // Transform the `minManaForDamage` array so that `minManaForDamage[d]`
    // stores the minimum mana required to deal *at least* `d` damage.
    // This is achieved by iterating backwards and taking the minimum of the current value
    // and the value for `d+1`. This effectively propagates the minimum cost from higher damage points downwards.
    for (let currentDamagePoint = MAX_HEALTH_CAP - 1; currentDamagePoint >= 0; currentDamagePoint--) {
        minManaForDamage[currentDamagePoint] = Math.min(
            minManaForDamage[currentDamagePoint],
            minManaForDamage[currentDamagePoint + 1]
        );
    }

    // The final answer is the minimum mana required to deal at least `targetHealth` damage.
    const requiredMana = minManaForDamage[targetHealth];

    // Display the result, handling cases where no solution was found.
    if (requiredMana === INITIAL_LARGE_VALUE) {
        displayResult("No combination of spells can defeat the monster with the specified health.");
    } else {
        displayResult(requiredMana);
    }

    // End the performance timer.
    console.timeEnd("ProblemSolverExecution");
}