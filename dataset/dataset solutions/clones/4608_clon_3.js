let inputProcessor = initializeInputProcessor();

executeSolution();

/**
 * Retrieves and parses the next available input line as an integer.
 * @returns {number} The numerical value of the parsed integer.
 */
function readInteger() {
    return transformInput(fetchNextLine(), 1); // Conversion type 1: To integer
}

/**
 * Retrieves the next input line and segments it into an array of strings, delimited by spaces.
 * @returns {string[]} An array containing the space-separated string tokens.
 */
function readSpaceSeparatedStrings() {
    return transformInput(fetchNextLine(), 2); // Conversion type 2: Split by space
}

/**
 * Fetches the next input line, splits it by spaces, and transforms each segment into a numerical value.
 * @returns {number[]} An array of numbers derived from the space-separated input.
 */
function readSpaceSeparatedIntegers() {
    return transformInput(fetchNextLine(), 4); // Conversion type 4: Split by space, then to numbers
}

/**
 * Obtains the next input line and disassembles it into an array of individual characters.
 * @returns {string[]} An array where each element is a single character from the input line.
 */
function readCharacterArray() {
    return transformInput(fetchNextLine(), 6); // Conversion type 6: Split into characters
}

/**
 * Requests the subsequent line of data from the global input processing utility.
 * @returns {string} The next line of input text.
 */
function fetchNextLine() {
    return inputProcessor.fetchNext();
}

/**
 * Inquires if additional lines are available for reading within the input stream.
 * @returns {boolean} True if more lines are present, false otherwise.
 */
function hasMoreLines() {
    return inputProcessor.moreAvailable();
}

/**
 * Acquires raw content from the standard input stream, performs trimming, and segments it into lines.
 * Incorporates error handling for file reading operations.
 * @returns {string[]} An array of strings, each representing a line from the input.
 */
function loadRawInput() {
    try {
        const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
        // Validate content is present before processing.
        if (rawContent === null || rawContent === undefined) {
             reportError("CRITICAL: Input from /dev/stdin was null or undefined.");
             return []; // Return empty array on critical error
        }
        return rawContent.trim().split("\n");
    } catch (fileReadError) {
        reportError(`SYSTEM ERROR: Unable to access or read /dev/stdin: ${fileReadError.message}`);
        return []; // Return empty array upon file system error
    }
}

/**
 * Establishes and configures the input data handling mechanism.
 * Generates an object designed for sequential line retrieval.
 * @returns {object} An instance of an input processor, exposing `moreAvailable` and `fetchNext` functionalities.
 */
function initializeInputProcessor() {
    const loadedInputLines = loadRawInput();
    if (!loadedInputLines || loadedInputLines.length === 0) {
        reportError("CONFIGURATION ALERT: No input data detected. Input processing will be non-functional.");
        // Provide a resilient, non-operating processor for empty input.
        return {
            "inputLines": [],
            "currentLineIndex": 0,
            "totalLines": 0,
            "moreAvailable": () => false, // Always report no more lines
            "fetchNext": () => { reportError("Attempted to retrieve line from an empty input source."); return ""; }
        };
    }

    const processorInstance = {
        "inputLines": loadedInputLines,
        "currentLineIndex": 0,
        "totalLines": loadedInputLines.length,
        /**
         * Ascertains if there remain unread lines in the input buffer.
         * @returns {boolean} True if further lines can be read, false otherwise.
         */
        "moreAvailable": function() {
            return (this.currentLineIndex < this.totalLines);
        },
        /**
         * Extracts the subsequent line from the input and increments the internal line pointer.
         * @returns {string} The content of the next line. Issues an error if no more lines exist.
         */
        "fetchNext": function() {
            if (!this.moreAvailable()) {
                reportError("INPUT STREAM EXHAUSTED: Attempted to read beyond the final input line.");
                return ""; // Provide an empty string as a fallback for robustness.
            }
            const retrievedLineContent = this.inputLines[this.currentLineIndex];
            this.currentLineIndex++;
            return retrievedLineContent;
        }
    };
    return processorInstance;
}

/**
 * Transmits the final computed outcome to the standard output device.
 * @param {*} resultValue The data or value to be displayed.
 */
function displayResult(resultValue) {
    console.log(resultValue);
}

/**
 * Logs an error or warning message to the standard error stream, prefixed for clarity.
 * @param {string} diagnosticMessage The message detailing the error or warning.
 */
function reportError(diagnosticMessage) {
    console.error(`[APP_WARN] ${diagnosticMessage}`);
}

/**
 * Internal utility to safely convert a string to an integer, defaulting to base 10.
 * @param {string} textValue The string representation of an integer.
 * @returns {number} The parsed integer, or `NaN` if parsing fails.
 */
const parseIntegerStrict = (textValue) => parseInt(textValue, 10);

/**
 * Internal utility to safely convert a string to a floating-point number.
 * @param {string} textValue The string representation of a floating-point number.
 * @returns {number} The parsed float, or `NaN` if parsing fails.
 */
const parseFloatStrict = (textValue) => parseFloat(textValue);

/**
 * Transforms input data according to a specified type of conversion.
 * This function handles various parsing, splitting, and array joining operations.
 *
 * Defined Conversion Types:
 *   - 1: Parses data as an integer.
 *   - 2: Splits a string by single spaces into an array of strings.
 *   - 3: Parses data as a floating-point number. (New addition)
 *   - 4: Splits a string by spaces, then converts each part to a number.
 *   - 5: Splits a string by commas, then converts each part to a number. (New addition)
 *   - 6: Splits a string into an array of individual characters.
 *   - 7: Splits a string into individual characters, then converts each character to a number.
 *   - 8: Joins array elements using a single space as a separator.
 *   - 9: Joins array elements using a newline character as a separator.
 *   - 0: Joins array elements without any separator.
 *   - Default: Returns the input data unchanged and logs a warning for unrecognized types.
 *
 * @param {*} inputData The data to be transformed.
 * @param {number} transformationCode A numerical code specifying the desired transformation.
 * @returns {*} The result of the transformation.
 */
function transformInput(inputData, transformationCode) {
    // Implement a robust guard for invalid input data.
    if (inputData === null || inputData === undefined || (typeof inputData === 'string' && inputData.trim() === '')) {
        reportError(`Transform input received empty/invalid data for code ${transformationCode}. Returning original.`);
        return inputData;
    }

    try {
        const dataAsString = String(inputData); // Ensure string operations are safe

        switch (transformationCode) {
            case 1: return parseIntegerStrict(dataAsString);
            case 2: return dataAsString.split(" ");
            case 3: return parseFloatStrict(dataAsString); // New: parse to float
            case 4: return dataAsString.split(" ").map(numSegment => parseFloatStrict(numSegment));
            case 5: return dataAsString.split(",").map(numSegment => parseFloatStrict(numSegment)); // New: comma-separated floats
            case 6: return dataAsString.split("");
            case 7: return dataAsString.split("").map(charSegment => parseIntegerStrict(charSegment));
            case 8: return Array.isArray(inputData) ? inputData.join(" ") : dataAsString;
            case 9: return Array.isArray(inputData) ? inputData.join("\n") : dataAsString;
            case 0: return Array.isArray(inputData) ? inputData.join("") : dataAsString;
            default:
                reportError(`Unrecognized transformation code '${transformationCode}'. Input returned without modification.`);
                return inputData;
        }
    } catch (processingError) {
        reportError(`An error occurred during data transformation (code ${transformationCode}): ${processingError.message}`);
        return inputData; // Return original data to prevent cascading failures.
    }
}

/**
 * Core application logic: Computes the total cumulative active time based on a sequence of events.
 * Each event is presumed to have a fixed duration, `eventDurationThreshold`.
 * If a subsequent event commences before the preceding one concludes, the duration of the preceding event is truncated.
 * The final event in the sequence always contributes its full `eventDurationThreshold`.
 */
function executeSolution() {
    // Extract problem parameters: number of events (N) and individual event duration (T).
    const problemConfiguration = readSpaceSeparatedIntegers();
    let totalEventCount = problemConfiguration[0];
    let defaultEventDuration = problemConfiguration[1];

    // Initial validation of input parameters.
    if (totalEventCount < 0 || defaultEventDuration <= 0) {
        if (totalEventCount === 0) {
            displayResult(0); // No events implies zero active time.
            return;
        }
        reportError(`INPUT VALIDATION FAILED: 'totalEventCount' (${totalEventCount}) must be non-negative and 'defaultEventDuration' (${defaultEventDuration}) must be positive.`);
        displayResult(0); // Default to zero for invalid configurations.
        return;
    }

    // Retrieve the chronological sequence of event start times.
    const eventTimestamps = readSpaceSeparatedIntegers();

    // Adjust 'totalEventCount' if the actual number of timestamps differs from the declared count.
    if (eventTimestamps.length < totalEventCount) {
        reportError(`DATA INCONSISTENCY: Expected ${totalEventCount} event timestamps, but only ${eventTimestamps.length} were provided. Adapting 'totalEventCount'.`);
        totalEventCount = eventTimestamps.length; // Use the actual count of available timestamps.
    }
    if (totalEventCount === 0) {
        displayResult(0); // If, after adjustment, there are no events, the total duration is zero.
        return;
    }

    let cumulativeActiveTime = 0;

    // Define a concise helper for calculating the minimum of two values.
    const getMinimum = (val1, val2) => (val1 < val2 ? val1 : val2);

    // Iterate through the event timestamps to sum up effective durations.
    // This loop calculates the duration contributed by each event up to, but not including, the last one.
    // An event's contribution is capped either by its full duration or by the start time of the next event.
    for (let currentEventIndex = 0; currentEventIndex < totalEventCount - 1; currentEventIndex++) {
        const timeOfCurrentEvent = eventTimestamps[currentEventIndex];
        const timeOfNextEvent = eventTimestamps[currentEventIndex + 1];

        // Determine the temporal gap between the current event's start and the next event's start.
        const intervalToNextEvent = timeOfNextEvent - timeOfCurrentEvent;

        // The actual contribution of the current event is the lesser of its default duration
        // and the time until the subsequent event begins.
        const currentEventContribution = getMinimum(defaultEventDuration, intervalToNextEvent);

        cumulativeActiveTime += currentEventContribution;
    }

    // The final event always contributes its entire `defaultEventDuration`,
    // as there are no subsequent events to curtail its span.
    cumulativeActiveTime += defaultEventDuration;

    // Present the calculated total active duration.
    displayResult(cumulativeActiveTime);
}