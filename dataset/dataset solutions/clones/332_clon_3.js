const logToConsole = console.log;

/**
 * Creates a utility function to sequentially fetch lines from a multi-line string.
 * This acts as a generator for input lines.
 * @param {string} sourceText - The entire input string, typically read from a file.
 * @returns {function(): string | null} A function that returns the next line or null if no more lines.
 */
function acquireLineProvider(sourceText) {
    if (typeof sourceText !== 'string' || sourceText === null) {
        logToConsole("Warning: Provided source text for line reader is invalid.");
        return () => null;
    }

    const inputLines = sourceText.split('\n');
    let linePointer = 0;

    return function getNextLine() {
        if (linePointer < inputLines.length) {
            return inputLines[linePointer++];
        }
        return null;
    };
}

/**
 * Extends String.prototype to replicate the string a specified number of times.
 * @param {number} count - The number of times the string should be replicated.
 * @returns {string} The replicated string.
 */
String.prototype.replicate = function (count) {
    const repetitions = Math.max(0, Math.floor(count || 0));
    const baseString = this.toString();
    return Array(repetitions).fill(baseString).join('');
};

/**
 * Parses a space-separated string of numbers into an array of integers.
 * Optionally applies an offset to each parsed number.
 * @param {string} textLine - The input string containing space-separated numbers.
 * @param {boolean} decrementFlag - If true, subtracts 1 from each parsed number.
 * @returns {number[]} An array of parsed integers.
 */
function extractNumericValues(textLine, decrementFlag) {
    if (typeof textLine !== 'string' || textLine.trim() === '') {
        return [];
    }
    const parts = textLine.split(' ').filter(p => p !== '');
    const valueAdjustment = decrementFlag ? -1 : 0;

    const numericArray = parts.map(str => {
        const parsed = parseInt(str, 10);
        return isNaN(parsed) ? 0 : parsed + valueAdjustment;
    });

    return numericArray;
}

/**
 * Generates an array of numbers within a specified range (inclusive start, exclusive end).
 * @param {number} begin - The starting value of the sequence.
 * @param {number} limit - The upper bound (exclusive) of the sequence.
 * @returns {number[]} An array containing numbers from 'begin' up to 'limit - 1'.
 */
function createNumberSeries(begin, limit) {
    const startVal = Math.floor(begin || 0);
    const endVal = Math.floor(limit || 0);

    if (startVal >= endVal) {
        return [];
    }

    return Array.from({ length: endVal - startVal }, (_, k) => startVal + k);
}

/**
 * Determines the larger of two numeric values.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} The maximum of the two inputs.
 */
const determineLarger = (valA, valB) => Math.max(valA, valB);

/**
 * Determines the smaller of two numeric values.
 * @param {number} valX - The first number.
 * @param {number} valY - The second number.
 * @returns {number} The minimum of the two inputs.
 */
const determineSmaller = (valX, valY) => Math.min(valX, valY);

/**
 * Creates a comparison function for sorting objects based on a specified property.
 * This is suitable for use with Array.prototype.sort().
 * @param {string} propertyName - The name of the property to compare.
 * @returns {function(object, object): number} A comparator function.
 */
function createObjectComparator(propertyName) {
    if (typeof propertyName !== 'string' || propertyName.length === 0) {
        return () => 0;
    }

    return (itemA, itemB) => {
        const valueA = itemA[propertyName];
        const valueB = itemB[propertyName];

        if (valueA === undefined && valueB === undefined) return 0;
        if (valueA === undefined) return 1;
        if (valueB === undefined) return -1;

        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
    };
}

/*
 * This section was previously a multi-line comment block.
 * It has been refactored to provide a brief description of its original purpose,
 * or indicate that it was a placeholder for additional documentation.
 * Original intent: Likely a placeholder for Japanese comments or complex ASCII art.
 * Current interpretation: Acknowledging a removed comment block.
 */

/**
 * Simulates a simplified baseball game scenario based on input commands.
 * It processes a series of plays for two teams over a specified number of innings.
 * @param {string} rawScenarioInput - The complete input string containing game details and play-by-play.
 */
function executeGameSimulation(rawScenarioInput) {
    const dataStream = acquireLineProvider(rawScenarioInput);

    const totalInnings = parseInt(dataStream(), 10);
    if (isNaN(totalInnings) || totalInnings <= 0) {
        logToConsole("Error: Invalid or missing total innings count. Exiting simulation.");
        return;
    }

    const scoreTracker = [0, 0];
    const MAX_OUTS_PER_INNING = 3;

    let activeTeamIndex = 0;
    let gameIterationCounter = 0;

    while (gameIterationCounter < totalInnings * 2) {
        let outsInInning = 0;
        let baseRunners = 0;

        while (outsInInning < MAX_OUTS_PER_INNING) {
            const playAction = dataStream();

            if (playAction === null) {
                logToConsole("Warning: Unexpected end of input stream during game simulation.");
                break;
            }

            switch (playAction) {
                case 'HIT':
                    if (baseRunners === MAX_OUTS_PER_INNING) {
                        scoreTracker[activeTeamIndex]++;
                    } else {
                        baseRunners++;
                    }
                    break;
                case 'HOMERUN':
                    scoreTracker[activeTeamIndex] += baseRunners + 1;
                    baseRunners = 0;
                    break;
                case 'OUT':
                    outsInInning++;
                    break;
                default:
                    logToConsole(`Warning: Unrecognized play action "${playAction}". Skipping.`);
                    break;
            }
        }

        activeTeamIndex = (activeTeamIndex + 1) % 2;
        gameIterationCounter++;
    }

    logToConsole(scoreTracker[0]);
    logToConsole(scoreTracker[1]);
}

try {
    const fileSystemModule = require("fs");
    const inputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    executeGameSimulation(inputContent);
} catch (error) {
    logToConsole("An error occurred while reading input or running the simulation:");
    logToConsole(error.message);
}