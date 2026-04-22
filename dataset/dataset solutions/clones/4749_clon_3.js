"use strict";

/**
 * Initiates and configures a utility for reading input data sequentially.
 * This component is responsible for retrieving content from standard input,
 * processing it into an array of lines, and providing methods to traverse this data.
 * @returns {object} An object containing the processed input lines and navigation functions.
 */
const establishInputService = () => {
    let rawInputContent;
    try {
        // Attempt to read all data from the standard input stream synchronously.
        // This operation is wrapped to catch potential file system errors.
        rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (readError) {
        // Log the specific error and then re-throw a more generalized error
        // to indicate a critical failure in input acquisition.
        console.error("Critical I/O Error: Unable to read from /dev/stdin.", readError.message);
        throw new Error("Input source initialization failed due to an I/O problem.");
    }

    // Pre-process the raw string: trim leading/trailing whitespace,
    // split into individual lines, and then filter out any resultant empty strings.
    const processedLines = rawInputContent
        .trim()
        .split(/\r?\n/) // Handles both Windows (\r\n) and Unix (\n) line endings
        .filter(lineSegment => lineSegment.length > 0); // Excludes blank lines

    // Provide a warning if the input stream was effectively empty after processing.
    if (processedLines.length === 0) {
        console.warn("Input stream appears to be empty or contains only whitespace after processing.");
    }

    // Construct the input stream handler object with its state and methods.
    const streamAccessor = {
        lineBuffer: processedLines,      // Array holding all the parsed input lines
        currentLinePointer: 0,           // Index indicating the next line to be read
        totalAvailableLines: processedLines.length, // Total count of lines in the buffer

        /**
         * Verifies if there are additional lines available for reading in the buffer.
         * @returns {boolean} Returns `true` if `currentLinePointer` is less than `totalAvailableLines`, otherwise `false`.
         */
        hasMoreData: function () {
            return this.currentLinePointer < this.totalAvailableLines;
        },

        /**
         * Retrieves the subsequent line from the buffer and advances the internal pointer.
         * This method will throw an error if called when no more data is available.
         * @returns {string} The next line from the input sequence.
         * @throws {Error} Throws an `InputExhaustedError` if an attempt is made to read beyond the stream's end.
         */
        retrieveNextLine: function () {
            if (!this.hasMoreData()) {
                throw new Error("InputExhaustedError: Attempted to retrieve data beyond the end of the input stream.");
            }
            // Return the line at the current pointer position and then increment the pointer.
            return this.lineBuffer[this.currentLinePointer++];
        }
    };
    return streamAccessor;
};

// Initialize the primary input data feeder for the entire application.
const dataInputFeeder = establishInputService();

/**
 * Obtains the next raw line (token) from the input stream.
 * @returns {string} The raw string content of the next line.
 */
const fetchNextToken = () => dataInputFeeder.retrieveNextLine();

/**
 * Parses the next input token as a base-10 integer.
 * Includes robust error checking for non-numeric input.
 * @returns {number} The successfully parsed integer.
 * @throws {Error} If the token cannot be converted to an integer.
 */
const parseIntegerToken = () => {
    const tokenString = fetchNextToken();
    const numericValue = parseInt(tokenString, 10); // Always use radix 10 for decimal integers.
    if (isNaN(numericValue)) {
        throw new Error(`DataConversionError: Expected an integer, but received non-numeric input "${tokenString}".`);
    }
    return numericValue;
};

/**
 * Reads the next line, splits it by spaces, and returns an array of string segments.
 * Filters out any empty strings that might result from multiple consecutive spaces.
 * @returns {string[]} An array of string segments.
 */
const readStringSegments = () => fetchNextToken().split(" ").filter(segment => segment !== "");

/**
 * Reads the next line, splits it into space-separated string segments,
 * and then converts each segment into an integer.
 * @returns {number[]} An array of parsed integers.
 * @throws {Error} If any segment cannot be converted into an integer.
 */
const readIntegerSegments = () => {
    const stringSegments = readStringSegments();
    return stringSegments.map(str => {
        const num = parseInt(str, 10);
        if (isNaN(num)) {
            throw new Error(`DataConversionError: Expected integer in array segment, but found "${str}".`);
        }
        return num;
    });
};

/**
 * Reads the next line and converts it into an array of individual characters.
 * @returns {string[]} An array where each element is a single character.
 */
const readCharacterArray = () => fetchNextToken().split("");

/**
 * Checks if there is any more data available to be read from the input stream.
 * @returns {boolean} `true` if more data is available, `false` otherwise.
 */
const hasRemainingInput = () => dataInputFeeder.hasMoreData();

/**
 * A flexible function to output one or more items to the console.
 * Can be extended for custom logging formats, prefixes, or destination.
 * @param {...any} outputItems - Any number of items to be logged.
 */
const printOutput = (...outputItems) => console.log(...outputItems);

/**
 * The primary execution logic of the program.
 * This function orchestrates reading input, performing calculations, and displaying results.
 * It calculates a series of adjustment values based on specific conditions.
 */
const runMainProcessing = () => {
    // Read the initial count of data pairs (N) expected in the input.
    let numberOfDataItems = parseIntegerToken();

    // Validate that N is a positive integer, as required by the problem's logic.
    if (numberOfDataItems <= 0) {
        console.error("Input Data Constraint Violation: The initial count of data items (N) must be a positive integer.");
        // Depending on the application's robustness needs, this might lead to an exit or default behavior.
        return;
    }

    // Initialize arrays to store the two sets of input values.
    const primaryDataset = [];   // Corresponds to 'a' in the original problem.
    const secondaryDataset = []; // Corresponds to 'b' in the original problem.

    // Loop to read all N pairs of integers.
    // The loop continues as long as there is input and we haven't read N items.
    let itemsSuccessfullyRead = 0;
    while (hasRemainingInput() && itemsSuccessfullyRead < numberOfDataItems) {
        const currentDataPair = readIntegerSegments();

        // Validate that each line intended as a pair actually contains two numbers.
        if (currentDataPair.length !== 2) {
            console.warn(`Input Format Discrepancy: Expected exactly two integers per line, but found ${currentDataPair.length} on line ${dataInputFeeder.currentLinePointer}. Skipping this line.`);
            // Increment counter to prevent infinite loops if malformed lines don't exhaust input.
            itemsSuccessfullyRead++;
            continue;
        }

        primaryDataset.push(currentDataPair[0]);
        secondaryDataset.push(currentDataPair[1]);
        itemsSuccessfullyRead++;
    }

    // If fewer items were read than initially declared, adjust `numberOfDataItems`
    // to match the actual amount of data successfully processed.
    if (itemsSuccessfullyRead < numberOfDataItems) {
        console.warn(`Data Mismatch: Expected ${numberOfDataItems} data pairs, but only ${itemsSuccessfullyRead} were successfully read. Adjusting processing count.`);
        numberOfDataItems = itemsSuccessfullyRead;
    }

    // This array will store the calculated adjustment values.
    // It's populated dynamically during the backward iteration.
    const calculatedAdjustments = new Array(numberOfDataItems); // Pre-allocate for efficiency if size is known.

    let runningCorrectionSum = 0; // Accumulates adjustments from later elements to influence earlier ones.

    // Iterate through the data sets in reverse order.
    // This order is critical due to the dependency of 'cumulativeCorrection'.
    for (let i = numberOfDataItems - 1; i >= 0; i--) {
        const currentPrimaryValue = primaryDataset[i];
        const currentSecondaryFactor = secondaryDataset[i];

        // Implement a guard clause for division by zero, which would invalidate the calculation.
        if (currentSecondaryFactor === 0) {
            console.error(`Calculation Error: A secondary factor at index ${i} is zero. This prevents valid calculation. Assigning zero adjustment.`);
            calculatedAdjustments[i] = 0; // Assign a default or error value.
            continue;
        }

        // The core calculation involves finding the smallest multiplier 'M' such that:
        // M * currentSecondaryFactor >= currentPrimaryValue + runningCorrectionSum
        // This can be efficiently determined using Math.ceil for division.
        const requiredMinimumSum = currentPrimaryValue + runningCorrectionSum;
        let derivedMultiplier = Math.ceil(requiredMinimumSum / currentSecondaryFactor);

        // Ensure the multiplier is at least 1, as per the original problem's implicit logic
        // (where 'mul' starts at 1 and increments). This handles cases where `requiredMinimumSum`
        // might be zero or negative, leading to a `derivedMultiplier` of zero or less.
        const effectiveMultiplier = Math.max(1, derivedMultiplier);

        // Calculate the specific adjustment needed for the current element.
        // This ensures the condition is met and contributes to the running total.
        const individualAdjustment = (effectiveMultiplier * currentSecondaryFactor) - currentPrimaryValue - runningCorrectionSum;

        // Store the calculated adjustment at its corresponding index.
        calculatedAdjustments[i] = individualAdjustment;

        // Update the running sum of corrections to be applied to preceding elements.
        runningCorrectionSum += individualAdjustment;
    }

    // Compute the final aggregate sum of all calculated adjustments.
    let totalComputedAdjustment = 0;
    // Using a for...of loop for summing is often clearer and more performant than `reduce` for simple sums.
    for (const adjustmentValue of calculatedAdjustments) {
        // Defensive check: ensure the value is a valid number before adding.
        if (typeof adjustmentValue === 'number' && !isNaN(adjustmentValue)) {
            totalComputedAdjustment += adjustmentValue;
        } else {
            console.warn(`Data Integrity Warning: Encountered a non-numeric or invalid value (${adjustmentValue}) in the calculated adjustments. Skipping this value.`);
        }
    }

    // Output the final result to the console.
    printOutput(totalComputedAdjustment);
};

// Initiate the execution of the main program logic.
runMainProcessing();