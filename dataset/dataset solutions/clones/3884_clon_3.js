"use strict";

/**
 * Custom class for parsing input data from a string.
 * It tokenizes the input and provides methods to retrieve specific data types.
 */
class InputProcessor {
    // Private fields for internal state management
    #tokenIndex = 0;
    #dataTokens;

    /**
     * Initializes the InputProcessor with the raw input string.
     * @param {string} sourceData - The raw input string containing numbers and words.
     * @throws {Error} If sourceData is undefined or null.
     */
    constructor(sourceData) {
        if (typeof sourceData === 'undefined' || sourceData === null) {
            throw new Error('Input source cannot be undefined or null for InputProcessor!');
        }
        // Split by one or more whitespace characters (including newlines, tabs, etc.)
        // and filter out any empty strings that might result from multiple spaces.
        this.#dataTokens = sourceData.split(/\s+/).filter(token => token.length > 0);
    }

    /**
     * Retrieves the next integer token from the input stream.
     * Advances the internal token index.
     * @returns {number} The parsed integer value.
     * @throws {Error} If trying to read past the end of data or if the token is not a valid integer.
     */
    retrieveInteger() {
        if (this.#tokenIndex >= this.#dataTokens.length) {
            throw new Error('Attempted to retrieve integer past the end of input data.');
        }
        const currentToken = this.#dataTokens[this.#tokenIndex++];
        const numericValue = parseInt(currentToken, 10);
        if (isNaN(numericValue)) {
            throw new Error(`Expected an integer but received: '${currentToken}'`);
        }
        return numericValue;
    }

    /**
     * Reads a specified number of integer tokens into a new array.
     * @param {number} count - The number of integers to read. Must be a positive number.
     * @returns {number[]} An array containing the retrieved integers.
     * @throws {Error} If count is not a positive number.
     */
    retrieveIntegerArray(count) {
        if (typeof count !== 'number' || count < 1) {
            throw new Error('Count for integer array retrieval must be a positive number.');
        }
        const integerResultArray = new Array(count);
        for (let i = 0; i < count; ++i) {
            integerResultArray[i] = this.retrieveInteger();
        }
        return integerResultArray;
    }

    /**
     * Retrieves the next string token from the input stream.
     * Advances the internal token index.
     * @returns {string} The next string token.
     * @throws {Error} If trying to read past the end of data.
     */
    retrieveString() {
        if (this.#tokenIndex >= this.#dataTokens.length) {
            throw new Error('Attempted to retrieve string past the end of input data.');
        }
        return this.#dataTokens[this.#tokenIndex++];
    }

    /**
     * Reads a specified number of string tokens into a new array.
     * @param {number} count - The number of strings to read. Must be a positive number.
     * @returns {string[]} An array containing the retrieved strings.
     * @throws {Error} If count is not a positive number.
     */
    retrieveStringArray(count) {
        if (typeof count !== 'number' || count < 1) {
            throw new Error('Count for string array retrieval must be a positive number.');
        }
        const stringResultArray = new Array(count);
        for (let i = 0; i < count; ++i) {
            stringResultArray[i] = this.retrieveString();
        }
        return stringResultArray;
    }
}

/**
 * Calculates the maximum achievable calorie intake from sushi spots on a circular track.
 * This function processes paths in both clockwise and counter-clockwise directions.
 * @param {string} rawInputData - The raw string input containing track and spot information.
 */
function calculateOptimalSushiCalories(rawInputData) {
    const dataReader = new InputProcessor(rawInputData);

    const numSushiSpots = dataReader.retrieveInteger();
    const trackCircumference = dataReader.retrieveInteger();

    // Basic validation for input parameters: If no spots or invalid circumference, no calories can be gained.
    if (numSushiSpots < 0 || trackCircumference <= 0) {
        console.log(0);
        return;
    }

    // Initialize arrays for spot positions and associated calorie values.
    // Index 0 serves as a dummy for the starting point (position 0, value 0).
    const spotPositions = new Array(numSushiSpots + 1).fill(0);
    const calorieValues = new Array(numSushiSpots + 1).fill(0);

    for (let i = 1; i <= numSushiSpots; ++i) {
        spotPositions[i] = dataReader.retrieveInteger();
        calorieValues[i] = dataReader.retrieveInteger();
    }

    // Add the total circumference as an implicit end point in the positions array.
    // This assists with boundary calculations, especially for reverse movements.
    spotPositions.push(trackCircumference);

    // Initialize the overall maximum calories to 0, as not picking any sushi is a valid option.
    let overallMaxCalories = 0; 

    /**
     * Computes the maximum profit for a given set of spot data and direction.
     * This helper abstracts the core calculation logic, making it reusable for both
     * original (clockwise) and transformed (simulated counter-clockwise) data.
     * @param {number[]} currentSpotPositions - Array of spot positions (already adjusted for direction).
     * @param {number[]} currentCalorieValues - Array of calorie values (already adjusted for direction).
     * @param {number} currentNumSpots - Number of actual sushi spots.
     * @returns {number} The maximum profit found for this particular directional analysis.
     */
    const computeDirectionalProfits = (currentSpotPositions, currentCalorieValues, currentNumSpots) => {
        // profitsUnidirectional[i] stores the total profit when reaching spot 'i'
        // by moving purely in the forward (clockwise) direction, without returning to the start.
        const profitsUnidirectional = new Array(currentNumSpots + 1).fill(0);
        for (let i = 1; i <= currentNumSpots; ++i) {
            const distanceMoved = currentSpotPositions[i] - currentSpotPositions[i-1];
            profitsUnidirectional[i] = profitsUnidirectional[i-1] + currentCalorieValues[i] - distanceMoved;
        }

        // profitsReverseUnidirectional[i] stores the total profit when reaching spot 'i+1'
        // by moving purely in the reverse (counter-clockwise) direction from the "end" (C),
        // also without returning to C.
        const profitsReverseUnidirectional = new Array(currentNumSpots + 1).fill(0);
        // Initialize the profit at the "end" point (conceptual travel from C to C) as 0.
        profitsReverseUnidirectional[currentNumSpots] = 0;
        for (let i = currentNumSpots - 1; i >= 0; --i) {
            // Calculate distance between spot X[i+1] and X[i+2] in the current (transformed) coordinates.
            const segmentDistance = currentSpotPositions[i+2] - currentSpotPositions[i+1];
            profitsReverseUnidirectional[i] = profitsReverseUnidirectional[i+1] + currentCalorieValues[i+1] - segmentDistance;
        }

        let localMaxProfit = Number.MIN_SAFE_INTEGER; // Start with the smallest possible safe integer

        // Scenario 1: Traverse purely in one direction (e.g., clockwise from 0 to X[i]) and do not return.
        // Update localMaxProfit with the highest single-direction profit.
        for (let i = 0; i <= currentNumSpots; ++i) {
            localMaxProfit = Math.max(localMaxProfit, profitsUnidirectional[i]);
        }

        // Scenario 2: Traverse clockwise to spot 'i', return to the origin,
        // then traverse counter-clockwise from C to spot 'j' (where j >= i, based on original code's indexing).
        // This interpretation is derived directly from the original code's formula: L[n] - X[n] + R[m].
        for (let i = 0; i <= currentNumSpots; ++i) {
            // Calculate the profit obtained by going clockwise to spot 'i' and then returning to the starting point (0).
            const profitFromForwardAndReturn = profitsUnidirectional[i] - currentSpotPositions[i];

            // Iterate through possible 'j' spots for the reverse path.
            // The original code used 'm' from 'n' to 'N-1', where R[m] corresponds to spot X[m+1].
            for (let j = i; j < currentNumSpots; ++j) {
                // Combine the two path profits.
                const combinedPathSum = profitFromForwardAndReturn + profitsReverseUnidirectional[j];
                localMaxProfit = Math.max(localMaxProfit, combinedPathSum);
            }
        }
        return localMaxProfit;
    };

    // --- First Pass: Calculate profits for the standard clockwise movement ---
    // Update the overall maximum with results from the clockwise analysis.
    overallMaxCalories = Math.max(overallMaxCalories, computeDirectionalProfits(spotPositions, calorieValues, numSushiSpots));

    // --- Second Pass: Simulate counter-clockwise movement by transforming data ---
    // Create copies of the original arrays to perform transformations without affecting the first pass's context.
    // 'transformedPositions' initially includes the 'C' at the end.
    const transformedPositions = [...spotPositions]; 
    // 'transformedCalorieValues' initially includes the dummy '0' at the start.
    const transformedCalorieValues = [...calorieValues]; 

    // Step 1: Invert positions relative to the track's total circumference.
    // Original positions: [0, x1, ..., xN, C]
    // After `C - position`: [C, C-x1, ..., C-xN, 0]
    for (let i = 0; i < transformedPositions.length; ++i) {
        transformedPositions[i] = trackCircumference - transformedPositions[i];
    }

    // Step 2: Reverse the order of the transformed positions array.
    // Now `transformedPositions`: [0, C-xN, ..., C-x1, C]
    // This effectively re-orients the track such that the new "start" is at 0 and "end" at C,
    // but with the spots ordered from what was originally furthest (C-xN) to closest (C-x1) from C.
    transformedPositions.reverse();

    // Step 3: Adjust calorie values to align with the newly reversed positions.
    // Original `calorieValues`: [0, v1, ..., vN]
    // After `shift()`: [v1, ..., vN] (removes the initial dummy 0)
    // After `push(0)`: [v1, ..., vN, 0] (adds a new dummy 0 at the end)
    // After `reverse()`: [0, vN, ..., v1]
    // This ensures `transformedCalorieValues[1]` corresponds to the value at `transformedPositions[1]` (which is C-xN, associated with vN).
    transformedCalorieValues.shift(); 
    transformedCalorieValues.push(0); 
    transformedCalorieValues.reverse(); 

    // Perform calculations again with the transformed data for counter-clockwise analysis.
    // Update the overall maximum with results from this second analysis.
    overallMaxCalories = Math.max(overallMaxCalories, computeDirectionalProfits(transformedPositions, transformedCalorieValues, numSushiSpots));

    // Output the final maximum calorie intake.
    console.log(overallMaxCalories);
}

// Entry point for Node.js environment; simulates reading from standard input.
if (typeof module !== 'undefined' && module.exports) {
    // For Node.js, read input from the file system, specifically standard input.
    const fileSystem = require('fs');
    const inputBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');
    calculateOptimalSushiCalories(inputBuffer);
}
// Note: For a browser environment, input would typically be provided via a UI element
// or hardcoded for demonstration purposes, as 'stdin' is not directly available.