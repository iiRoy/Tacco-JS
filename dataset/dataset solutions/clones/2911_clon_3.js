"use strict";

const fileSystemModule = require("fs");

// Retrieve raw content from the standard input stream.
// This path is typical for competitive programming environments on Unix-like systems.
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Break down the input string into individual tokens using spaces or newlines as delimiters.
const inputTokens = rawInputContent.split(/ |\n/);

// A pointer to keep track of the current token being processed from the inputTokens array.
let tokenPositionIndex = 0;

/**
 * Extracts and parses the next token as a number from the input stream.
 * Includes a basic check for non-numeric input.
 * @returns {number} The parsed numerical value.
 */
const obtainNextNumericalValue = () => {
    const valueStr = inputTokens[tokenPositionIndex++];
    const numValue = Number(valueStr);
    if (isNaN(numValue)) {
        console.error(`Error: Expected a number but received "${valueStr}". Returning NaN.`);
    }
    return numValue;
};

/**
 * Fetches the subsequent token as a string without any parsing.
 * @returns {string} The next string token.
 */
const retrieveNextTextSegment = () => inputTokens[tokenPositionIndex++];

/**
 * Acquires the next token and converts it into a BigInt.
 * @returns {BigInt} The parsed BigInt value.
 */
const extractNextBigInteger = () => BigInt(inputTokens[tokenPositionIndex++]);

/**
 * Reads a specified quantity of tokens, optionally converting them to numbers.
 * @param {number} elementCount The total number of elements to read.
 * @param {boolean} keepAsText If true, elements are kept as strings; otherwise, they are converted to numbers.
 * @returns {(number|string)[]} An array containing the read elements.
 */
const readSequentialElements = (elementCount, keepAsText) => {
    const collectedElements = [];
    let currentElementIdx = 0;
    while (currentElementIdx < elementCount) {
        const currentToken = inputTokens[tokenPositionIndex++];
        collectedElements.push(keepAsText ? currentToken : Number(currentToken));
        currentElementIdx++;
    }
    return collectedElements;
};

/**
 * Dynamically generates a multi-dimensional array with a specified default value.
 * This function uses a recursive approach to build arrays of arbitrary dimensions,
 * offering a safer alternative to `eval` for array initialization.
 * @param {*} initialValue The default value to fill the innermost array elements with.
 * @param {...number} arrayDimensions A sequence of numbers representing the size of each dimension.
 * @returns {Array} A new multi-dimensional array structured according to the provided dimensions.
 */
const constructMultiDimensionalArray = (initialValue, ...arrayDimensions) => {
    const recursiveArrayBuilder = (remainingDimensions) => {
        if (remainingDimensions.length === 0) {
            return initialValue; // Base case: deepest level, fill with initial value.
        }
        const currentDimensionSize = remainingDimensions[0];
        const nextDimensions = remainingDimensions.slice(1);
        const newArraySegment = new Array(currentDimensionSize);
        for (let i = 0; i < currentDimensionSize; i++) {
            newArraySegment[i] = recursiveArrayBuilder(nextDimensions);
        }
        return newArraySegment;
    };
    return recursiveArrayBuilder(arrayDimensions);
};

/**
 * The main logic function that calculates the number of valid switch configurations.
 * This simulates a circuit where N switches control M light bulbs,
 * and each bulb has a required parity (even/odd) for its active connected switches.
 * @returns {number} The total count of switch patterns that illuminate all bulbs correctly.
 */
function determineValidCircuitConfigurations() {
    const numberOfSwitches = obtainNextNumericalValue(); // N from original problem
    const numberOfBulbs = obtainNextNumericalValue();     // M from original problem

    // Early exit / Guard clause for invalid or trivial input scenarios.
    if (numberOfSwitches <= 0 || numberOfBulbs <= 0) {
        // If there are no switches or no bulbs, no valid combinations can exist or are necessary.
        return 0;
    }

    // Stores the count of switches connected to each specific light bulb.
    // Equivalent to 'K' array in the original code.
    const bulbSwitchCounts = new Array(numberOfBulbs);

    // Stores the actual indices of switches connected to each bulb.
    // 'bulbConnections[i]' will be an array of switch indices for bulb 'i'.
    // Equivalent to 'S' array in the original code.
    const bulbConnections = new Array(numberOfBulbs);

    // Read connection data for each bulb.
    for (let currentBulbIndex = 0; currentBulbIndex < numberOfBulbs; ++currentBulbIndex) {
        const currentBulbConnectedSwitchCount = obtainNextNumericalValue();
        bulbSwitchCounts[currentBulbIndex] = currentBulbConnectedSwitchCount;

        // Read the switch identifiers and convert them to 0-based indices.
        const connectedSwitchIDs = readSequentialElements(currentBulbConnectedSwitchCount, false).map(
            (idValue) => idValue - 1 // Adjusting from 1-based to 0-based indexing.
        );
        bulbConnections[currentBulbIndex] = connectedSwitchIDs;
    }

    // Read the required parity for each bulb (0 for even, 1 for odd).
    // Equivalent to 'P' array in the original code.
    const requiredParitySettings = readSequentialElements(numberOfBulbs, false);

    let successfulPatternCount = 0; // Accumulator for valid switch patterns.

    // An array to store the binary state (0=OFF, 1=ON) of each switch for the current pattern being evaluated.
    // Equivalent to 'pat_bits' in the original code.
    const currentSwitchActivationStates = new Array(numberOfSwitches);

    // Calculate the maximum value for iterating through all possible switch combinations (2^N).
    const maximumPatternValue = 1 << numberOfSwitches; // Bit shift is efficient for powers of 2.

    // Iterate through every possible combination of switch states.
    // Each 'patternIterator' value represents a unique binary configuration of switches.
    for (let patternIterator = 0; patternIterator < maximumPatternValue; ++patternIterator) {
        // Deconstruct the current pattern into individual switch states.
        for (let switchIndex = 0; switchIndex < numberOfSwitches; ++switchIndex) {
            // Use bitwise right shift and AND to get the state of the 'switchIndex'-th bit.
            currentSwitchActivationStates[switchIndex] = (patternIterator >>> switchIndex) & 1;
        }

        let isThisConfigurationViable = true; // Flag to determine if the current pattern satisfies all bulbs.

        // Evaluate each light bulb based on the current switch activation states.
        for (let bulbIndex = 0; bulbIndex < numberOfBulbs; ++bulbIndex) {
            let activeConnectedSwitchSum = 0; // Sum of ON switches connected to the current bulb.

            const switchesLinkedToThisBulb = bulbConnections[bulbIndex];
            const numLinkedSwitches = bulbSwitchCounts[bulbIndex];

            // Sum the states of all switches connected to the current bulb.
            for (let linkedSwitchCounter = 0; linkedSwitchCounter < numLinkedSwitches; ++linkedSwitchCounter) {
                const connectedSwitchIdx = switchesLinkedToThisBulb[linkedSwitchCounter];
                activeConnectedSwitchSum += currentSwitchActivationStates[connectedSwitchIdx];
            }

            // Check if the parity of the active switches matches the requirement for this bulb.
            if ((activeConnectedSwitchSum % 2) !== requiredParitySettings[bulbIndex]) {
                isThisConfigurationViable = false; // This pattern failed for at least one bulb.
                break; // No need to check further bulbs for this pattern; it's already invalid.
            }
        }

        // If the current switch configuration satisfied all bulbs, increment the counter.
        if (isThisConfigurationViable) {
            successfulPatternCount++;
        }
    }

    return successfulPatternCount; // Return the final tally of valid configurations.
}

// Execute the circuit solving function and output the result to the console.
console.log(determineValidCircuitConfigurations());