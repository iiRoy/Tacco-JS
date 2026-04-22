// Define a global constant for the number of distinct event types.
// This improves readability and maintainability.
const NUMBER_OF_EVENT_TYPES = 26;

/**
 * @class InputBufferProcessor
 * @description Manages the sequential reading of input lines.
 * This class replaces the simpler object-based input handler for enhanced structure.
 */
class InputBufferProcessor {
    /**
     * @param {string[]} inputLines - An array of raw string lines from standard input.
     */
    constructor(inputLines) {
        // Validate the incoming input array to prevent runtime errors.
        if (!Array.isArray(inputLines) || inputLines.length === 0) {
            throw new Error("Input stream must not be empty or malformed.");
        }
        this.dataStorage = inputLines; // Stores all input lines.
        this.currentPosition = 0;      // Tracks the current line being processed.
        this.totalLines = inputLines.length; // Total number of available input lines.
    }

    /**
     * @returns {boolean} True if there are more lines to read, false otherwise.
     */
    hasMoreEntries() {
        return this.currentPosition < this.totalLines;
    }

    /**
     * @returns {string} The next line from the input buffer.
     * @throws {Error} If attempting to read beyond the end of the input stream.
     */
    retrieveNextEntry() {
        if (!this.hasMoreEntries()) {
            // Provide a clear error message for out-of-bounds access.
            throw new Error("Attempted to read beyond the end of the input stream.");
        }
        // Increment position after retrieving the entry.
        return this.dataStorage[this.currentPosition++];
    }
}

/**
 * @object DataConversionUtility
 * @description A utility object encapsulating various data transformation methods.
 * This replaces the monolithic `myconv` function with a more structured approach
 * using named constants for conversion types.
 */
const DataConversionUtility = {
    // Constants defining different conversion and formatting operations.
    TO_INTEGER: 1,
    SPLIT_BY_SPACE: 2,
    SPLIT_AND_TO_INT_ARRAY: 4,
    SPLIT_BY_CHAR: 6,
    SPLIT_BY_CHAR_AND_TO_INT_ARRAY: 7,
    JOIN_BY_SPACE: 8,
    JOIN_BY_NEWLINE: 9,
    JOIN_NO_SEPARATOR: 0,

    /**
     * @param {string|Array} input - The data to be converted or formatted.
     * @param {number} conversionType - A constant from DataConversionUtility indicating the desired operation.
     * @returns {any} The converted or formatted data. Returns original input on error or unknown type.
     */
    performConversion: (input, conversionType) => {
        try {
            switch (conversionType) {
                case DataConversionUtility.TO_INTEGER:
                    // Always specify radix for parseInt for consistent behavior.
                    return parseInt(input, 10);
                case DataConversionUtility.SPLIT_BY_SPACE:
                    return input.split(" ");
                case DataConversionUtility.SPLIT_AND_TO_INT_ARRAY:
                    return input.split(" ").map(Number);
                case DataConversionUtility.SPLIT_BY_CHAR:
                    return input.split("");
                case DataConversionUtility.SPLIT_BY_CHAR_AND_TO_INT_ARRAY:
                    return input.split("").map(Number);
                case DataConversionUtility.JOIN_BY_SPACE:
                    return input.join(" ");
                case DataConversionUtility.JOIN_BY_NEWLINE:
                    return input.join("\n");
                case DataConversionUtility.JOIN_NO_SEPARATOR:
                    return input.join("");
                default:
                    // Log a warning for unsupported conversion types.
                    console.warn(`[WARNING]: Unknown conversion type ${conversionType}. Input returned as-is.`);
                    return input;
            }
        } catch (error) {
            // Log detailed error information during conversion.
            console.error(`[ERROR]: Data conversion failed for type ${conversionType}. Message: ${error.message}`);
            return input; // Fallback: return original input on error.
        }
    }
};

// Global instance of the input processor, initialized once all lines are read.
let inputDataStream;

// Helper functions to simplify access to the input stream.
const retrieveNextLine = () => inputDataStream.retrieveNextEntry();
const hasMoreInputLines = () => inputDataStream.hasMoreEntries();

// Helper functions for common input parsing patterns.
const retrieveNumeric = () => DataConversionUtility.performConversion(retrieveNextLine(), DataConversionUtility.TO_INTEGER);
const getWordList = () => DataConversionUtility.performConversion(retrieveNextLine(), DataConversionUtility.SPLIT_BY_SPACE);
const getIntegerList = () => DataConversionUtility.performConversion(retrieveNextLine(), DataConversionUtility.SPLIT_AND_TO_INT_ARRAY);
const getCharacterArray = () => DataConversionUtility.performConversion(retrieveNextLine(), DataConversionUtility.SPLIT_BY_CHAR);

// Consolidated output functions.
const displayOutput = (data) => console.log(data);
// Enhanced debug logging for better visibility, including structured data.
const logDebug = (message) => console.error(`[DEBUG_INFO]: ${JSON.stringify(message, null, 2)}`);

// Setup for reading standard input line by line.
const systemInputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout // Output stream is generally not used by readline for program output, but for internal prompts.
});

// Buffer to collect all incoming lines from standard input.
const collectedInputBuffer = [];

// Event listener for each line received.
systemInputReader.on('line', (lineContent) => {
    collectedInputBuffer.push(lineContent);
});

// Event listener for when the input stream is closed (EOF).
systemInputReader.on('close', () => {
    try {
        // Initialize the input data processor with all collected lines.
        inputDataStream = new InputBufferProcessor(collectedInputBuffer);
        logDebug("Input stream successfully initialized. Preparing for core simulation logic.");

        const simulationStartTime = Date.now(); // Record start time for performance tracking.
        executeCoreLogic(); // Execute the main simulation logic.
        const simulationEndTime = Date.now();   // Record end time.
        const durationMilliseconds = simulationEndTime - simulationStartTime;

        // Log performance metrics.
        logDebug(`Simulation concluded. Total runtime: ${durationMilliseconds} ms.`);
        logDebug(`Memory footprint (heap total): ${Math.round(process.memoryUsage().heapTotal / 1024)} KB.`);
    } catch (err) {
        // Catch any unhandled errors during simulation execution.
        console.error(`[FATAL_ERROR]: An unexpected error occurred during simulation: ${err.message}`);
        logDebug(err.stack); // Provide stack trace for debugging.
    }
});

/**
 * @function executeCoreLogic
 * @description This is the primary function containing the application's core simulation logic.
 * It has been extensively refactored to enhance readability, modularity, and robustness.
 */
function executeCoreLogic() {
    // Retrieve initial simulation parameters.
    const totalSimulationDays = retrieveNumeric();
    const eventDecayCoefficients = getIntegerList();

    // --- Input Validation and Guard Clauses ---
    // Ensure simulation duration is sensible.
    if (totalSimulationDays <= 0) {
        logDebug({ type: "Validation Error", message: "Total simulation days must be a positive integer.", value: totalSimulationDays });
        displayOutput("Simulation aborted: Invalid day count provided.");
        return;
    }
    // Verify the number of decay coefficients matches the expected event types.
    if (eventDecayCoefficients.length !== NUMBER_OF_EVENT_TYPES) {
        logDebug({
            type: "Validation Error",
            message: `Mismatch in decay coefficients count. Expected ${NUMBER_OF_EVENT_TYPES}, received ${eventDecayCoefficients.length}.`,
            received: eventDecayCoefficients.length
        });
        displayOutput("Simulation aborted: Malformed decay coefficients.");
        return;
    }
    // --- End Input Validation ---

    // Array to store the calculated satisfaction for each individual day.
    // This is an intermediate step before calculating the cumulative sum.
    const dailySatisfactionScores = new Array(totalSimulationDays).fill(0);

    // Array to keep track of the last day each specific event type was held.
    // Initialized to 0, implying no event was held before day 1.
    const lastEventOccurrenceDay = new Array(NUMBER_OF_EVENT_TYPES).fill(0);

    // Main simulation loop, iterating through each day.
    for (let currentDay = 1; currentDay <= totalSimulationDays; currentDay++) {
        // Read the scores for all events for the current day.
        const scoresForCurrentDayEvents = getIntegerList();

        let maximumScoreToday = -Infinity; // Initialize with a very low number to correctly find the max.
        let selectedEventTypeIndex = -1;   // Index of the event chosen for today.

        // Determine the best event to hold on the current day.
        // Using a traditional loop for direct control and performance, though `reduce` is also an option.
        for (let eventIdx = 0; eventIdx < scoresForCurrentDayEvents.length; eventIdx++) {
            const currentEventScore = scoresForCurrentDayEvents[eventIdx];
            if (currentEventScore > maximumScoreToday) {
                maximumScoreToday = currentEventScore;
                selectedEventTypeIndex = eventIdx;
            }
        }

        // Update the record for the last day the chosen event type was held.
        lastEventOccurrenceDay[selectedEventTypeIndex] = currentDay;

        // Initialize the current day's satisfaction with the base score of the chosen event.
        let currentDayCalculatedSatisfaction = maximumScoreToday;

        // Apply decay penalties from ALL event types, including the one just held (which will have 0 penalty).
        for (let eventIdx = 0; eventIdx < NUMBER_OF_EVENT_TYPES; eventIdx++) {
            const daysSinceLastHeld = currentDay - lastEventOccurrenceDay[eventIdx];
            const decayImpact = eventDecayCoefficients[eventIdx] * daysSinceLastHeld;
            currentDayCalculatedSatisfaction -= decayImpact;
        }

        // Store the final calculated satisfaction for this specific day.
        dailySatisfactionScores[currentDay - 1] = currentDayCalculatedSatisfaction;
    }

    // --- Post-processing Step: Calculate Cumulative Satisfaction ---
    // The original code calculated cumulative sum inside the loop.
    // This refactoring separates the calculation of daily scores from their accumulation,
    // making the logic clearer and allowing for potential future modifications
    // (e.g., analyzing daily scores before cumulative).
    const cumulativeSatisfactionSeries = [];
    let runningTotal = 0; // Accumulator for the cumulative sum.
    for (let i = 0; i < totalSimulationDays; i++) {
        runningTotal += dailySatisfactionScores[i];
        cumulativeSatisfactionSeries.push(runningTotal); // Add current cumulative sum to the series.
    }
    // --- End Post-processing ---

    // Output the final cumulative satisfaction series, with each day's cumulative sum on a new line.
    displayOutput(DataConversionUtility.performConversion(cumulativeSatisfactionSeries, DataConversionUtility.JOIN_BY_NEWLINE));
}