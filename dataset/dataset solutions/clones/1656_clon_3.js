// This module provides a robust utility for parsing multi-line string input,
// converting lines into single values or arrays of values, and handling numeric conversions.
const TextDataLoader = (function () {
    /**
     * Helper function to attempt converting a string to a number.
     * If the conversion results in NaN, the original string is returned.
     * This ensures flexible data handling for mixed-type inputs.
     * @param {string} inputStringValue The string slice to convert.
     * @returns {number|string} A number if conversion is successful, otherwise the original string.
     */
    function attemptNumericConversion(inputStringValue) {
        const potentialNumericValue = Number(inputStringValue);
        // Check if the conversion yielded a valid, non-NaN number.
        return Number.isNaN(potentialNumericValue) ? inputStringValue : potentialNumericValue;
    }

    /**
     * Internal class representing an instance of the data loader.
     * Manages a collection of processed input lines.
     */
    class DataLineProcessor {
        /**
         * Constructs a new DataLineProcessor instance.
         * @param {string} fullInputText The complete raw string input, typically from a file.
         */
        constructor(fullInputText) {
            // Trim leading/trailing whitespace from the entire input and split it into individual lines.
            this._parsedLines = fullInputText.trim().split('\n');
        }

        /**
         * Parses a given line content into an array of numbers or strings.
         * Values are split by spaces and then individually processed for numeric conversion.
         * @param {string} lineContent The raw string content of a single line.
         * @returns {Array<number|string>} An array of values, with numbers converted where possible.
         */
        _processLineIntoArray(lineContent) {
            // Split the line by spaces and apply numeric conversion to each segment.
            return lineContent.split(' ').map(segment => attemptNumericConversion(segment));
        }

        /**
         * Retrieves a single value from a specified line.
         * This assumes each line contains a single relevant value or the first value is desired.
         * @param {number} targetLineNumber The 0-based index of the line to retrieve.
         * @returns {number|string|undefined} The parsed value, or undefined if the line number is out of bounds.
         */
        getSingleParsedValue(targetLineNumber) {
            // Implement a boundary check to prevent errors from invalid line access.
            if (targetLineNumber < 0 || targetLineNumber >= this._parsedLines.length) {
                return undefined; // Return undefined for out-of-bounds access, consistent with typical array behavior.
            }
            // Return the raw string content of the line, converted to numeric if possible.
            return attemptNumericConversion(this._parsedLines[targetLineNumber]);
        }

        /**
         * Retrieves a specified line and parses its content into an array of values.
         * @param {number} targetLineNumber The 0-based index of the line to parse.
         * @returns {Array<number|string>|undefined} An array of parsed values, or undefined if the line number is out of bounds.
         */
        getParsedValueArray(targetLineNumber) {
            // Perform boundary validation.
            if (targetLineNumber < 0 || targetLineNumber >= this._parsedLines.length) {
                return undefined;
            }
            // Use the internal helper to process the line content.
            return this._processLineIntoArray(this._parsedLines[targetLineNumber]);
        }

        /**
         * Extracts a contiguous block of lines, parsing each into a single value.
         * @param {number} startingIndex The 0-based index where the slice begins.
         * @param {number|undefined} countOfLines The number of lines to include. If undefined or non-positive, slices to the end.
         * @returns {Array<number|string>} An array of parsed single values from the sliced lines.
         */
        extractValuesSlice(startingIndex, countOfLines) {
            // Calculate the effective end index for the slice operation.
            // If `countOfLines` is not a positive number, `slice` will go until the end.
            const sliceEndIndex = (countOfLines !== undefined && countOfLines > 0) ? startingIndex + countOfLines : undefined;
            // Slice the internal collection and map each line to its single parsed value.
            return this._parsedLines.slice(startingIndex, sliceEndIndex).map(line => attemptNumericConversion(line));
        }

        /**
         * Extracts a contiguous block of lines, parsing each into an array of values.
         * @param {number} startingIndex The 0-based index where the slice begins.
         * @param {number|undefined} countOfLines The number of lines to include. If undefined or non-positive, slices to the end.
         * @returns {Array<Array<number|string>>} An array of arrays, where each inner array represents a parsed line.
         */
        extractArraysSlice(startingIndex, countOfLines) {
            // Determine the end index for the slice.
            const sliceEndIndex = (countOfLines !== undefined && countOfLines > 0) ? startingIndex + countOfLines : undefined;
            // Slice the lines and map each raw line to its parsed array form.
            return this._parsedLines.slice(startingIndex, sliceEndIndex).map(line => this._processLineIntoArray(line));
        }

        /**
         * Returns the total number of lines that were loaded and parsed.
         * @returns {number} The count of lines in the internal collection.
         */
        getLineCount() {
            return this._parsedLines.length;
        }

        /**
         * Retrieves the raw string content of a specific line without any parsing.
         * @param {number} targetLineNumber The 0-based index of the line.
         * @returns {string|undefined} The raw line content, or undefined if the line doesn't exist.
         */
        getRawLineContent(targetLineNumber) {
            if (targetLineNumber < 0 || targetLineNumber >= this._parsedLines.length) {
                return undefined;
            }
            return this._parsedLines[targetLineNumber];
        }
    }

    // The factory function that creates and returns new instances of the DataLineProcessor.
    function createInputProcessor(rawInputText) {
        return new DataLineProcessor(rawInputText);
    }

    return createInputProcessor;
})();

// Function to retrieve raw input from the standard input stream.
function acquireRawSystemInput() {
    // Utilizes Node.js 'fs' module to synchronously read data.
    // This is typical for competitive programming environments where input is piped.
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

/**
 * Executes the primary financial simulation.
 * This function models a simple asset trading strategy over a series of price points.
 * It aims to maximize cash balance by buying low and selling high under specific conditions.
 * @returns {number} The final cash reserves after all simulated transactions, or an error code.
 */
function performFinancialSimulation() {
    // Initialize a data processing utility for structured input parsing.
    const inputDataProcessor = TextDataLoader(acquireRawSystemInput());

    // Extract the total number of asset price data points (N) from the first line.
    const rawTotalElements = inputDataProcessor.getSingleParsedValue(0);

    // Validate the extracted count for integrity.
    if (typeof rawTotalElements !== 'number' || !Number.isInteger(rawTotalElements) || rawTotalElements < 0) {
        // Log an error and return a sentinel value to indicate failure.
        console.error("Validation Error: The specified total number of data points (N) is invalid. Must be a non-negative integer.");
        return -999; // Using a distinct error code for critical errors.
    }
    const totalDataPoints = rawTotalElements;

    // Retrieve the array of asset prices from the second line of input.
    const rawPriceSet = inputDataProcessor.getParsedValueArray(1);

    // Validate the asset price array's structure and content.
    if (!Array.isArray(rawPriceSet) || rawPriceSet.some(val => typeof val !== 'number' || val < 0)) {
        console.error("Validation Error: The provided asset price data is malformed or contains invalid values (e.g., non-numbers or negative prices).");
        return -999;
    }
    const assetPrices = rawPriceSet;

    // Initial guard: If no data points, or if the number of prices is less than declared N,
    // the simulation cannot proceed meaningfully, or should return initial capital.
    // The problem statement implies N refers to the length of An.
    if (totalDataPoints === 0 || assetPrices.length === 0) {
        return 1000; // Return starting capital if no data to process.
    }
    if (assetPrices.length < totalDataPoints) {
        // This is a new guard. If `N` is declared larger than `An`'s actual length,
        // we should adapt or warn. For Type III, a warning is appropriate.
        console.warn(`Warning: Declared total data points (N=${totalDataPoints}) exceeds actual number of prices provided (${assetPrices.length}). Using actual length.`);
        // The loop condition `currentPriceIndex < totalDataPoints` will naturally handle this if `totalDataPoints` is effectively `Math.min(totalDataPoints, assetPrices.length)`.
        // We can choose to adjust `totalDataPoints` here if we want to be explicit.
        // For now, the loop will implicitly stop at `assetPrices.length`.
    }


    // Determine a specific index for a 'terminal' sell operation.
    // This logic replaces an unusual single-iteration loop from the original code.
    // It checks if the last available asset price is higher than the second-to-last price.
    // If true, `finalSaleTriggerIndex` is set to that last index, otherwise it remains 0.
    let finalSaleTriggerIndex = 0; // Default to 0, implying no special terminal sell is triggered.
    const minimumPricesForTerminalCheck = 2; // Need at least two prices for An[N-1] and An[N-2].
    if (totalDataPoints >= minimumPricesForTerminalCheck) {
        const lastValidPriceIndex = totalDataPoints - 1;
        // Ensure array access for both An[N-1] and An[N-2] is within bounds.
        if (lastValidPriceIndex < assetPrices.length && (lastValidPriceIndex - 1) >= 0 && (lastValidPriceIndex - 1) < assetPrices.length) {
            if (assetPrices[lastValidPriceIndex] > assetPrices[lastValidPriceIndex - 1]) {
                finalSaleTriggerIndex = lastValidPriceIndex;
            }
        }
    }

    // Initialize the financial state for the simulation.
    const initialCashAmount = 1000; // Starting cash balance, as per the problem.
    let currentCashHoldings = initialCashAmount;
    let currentlyHeldShares = 0; // Number of asset shares currently possessed.

    // Main simulation loop: Iterate through each asset price point.
    // The loop runs from the first price (index 0) up to, but not including, `totalDataPoints`.
    for (let currentPriceIndex = 0; currentPriceIndex < totalDataPoints; currentPriceIndex++) {
        const priceAtCurrentIndex = assetPrices[currentPriceIndex];
        const nextPriceIndex = currentPriceIndex + 1;
        // Check if a subsequent price point exists to enable forward-looking decisions.
        const hasSubsequentPrice = nextPriceIndex < totalDataPoints;
        // Only access `priceAtNextIndex` if it exists, to prevent out-of-bounds errors.
        const priceAtNextIndex = hasSubsequentPrice ? assetPrices[nextPriceIndex] : undefined;

        // --- Decision Phase: Sell Operation ---
        // A sell is triggered under two primary conditions:
        // 1. The current index matches the `finalSaleTriggerIndex`, indicating a predetermined sell point.
        // 2. OR, if the asset price is expected to decrease (current price is greater than the next price)
        //    AND the trader currently holds shares to sell.
        const conditionForSelling = (finalSaleTriggerIndex === currentPriceIndex) ||
                                    (hasSubsequentPrice && priceAtCurrentIndex > priceAtNextIndex && currentlyHeldShares > 0);

        if (conditionForSelling) {
            // Execute sell: Convert all held shares back into cash at the current market price.
            currentCashHoldings += priceAtCurrentIndex * currentlyHeldShares;
            currentlyHeldShares = 0; // All shares are liquidated.
            // As per the original code's `continue` statement, no buying occurs in the same step as selling.
            continue;
        }

        // --- Decision Phase: Buy Operation (only if no sell occurred in this iteration) ---
        // A buy is triggered if:
        // 1. A subsequent price point exists and indicates an increase (current price is less than the next price).
        // 2. AND, the trader has sufficient cash reserves to purchase at least one share at the current price.
        const canAffordAnyShares = currentCashHoldings >= priceAtCurrentIndex;
        const conditionForBuying = hasSubsequentPrice && priceAtCurrentIndex < priceAtNextIndex && canAffordAnyShares;

        if (conditionForBuying) {
            // Add a guard against non-positive prices, which would lead to division by zero or illogical trading.
            if (priceAtCurrentIndex <= 0) {
                console.warn(`Simulation Warning: Cannot purchase assets at non-positive price (${priceAtCurrentIndex}) at index ${currentPriceIndex}. Skipping buy operation for this step.`);
                continue; // Skip the buy operation if the price is invalid.
            }

            // Calculate the maximum whole number of shares that can be acquired with current cash.
            const sharesToAcquire = Math.floor(currentCashHoldings / priceAtCurrentIndex);

            // Only proceed with the transaction if at least one share can be purchased.
            if (sharesToAcquire > 0) {
                // Increment the total count of shares held.
                currentlyHeldShares += sharesToAcquire;
                // Deduct the total cost of the purchased shares from the cash holdings.
                currentCashHoldings -= sharesToAcquire * priceAtCurrentIndex;
                // The remaining cash `currentCashHoldings` will now be `initialCashAmount % priceAtCurrentIndex`.
                // This precisely mirrors the original logic `result = temp` after calculating `temp = result % An[i]`.
            }
        }
    }

    // The simulation concludes after iterating through all price points.
    // The final cash balance reflects the outcome.
    // Note: Any shares still held at the very end of the simulation are NOT automatically sold.
    // The original code's logic only triggers a sell under specific conditions within the loop.
    return currentCashHoldings;
}

// Entry point for the application.
// This function orchestrates the simulation execution and manages the output.
function launchApplication() {
    const finalSimulationResult = performFinancialSimulation();

    // Check if the simulation completed successfully or encountered a critical error.
    if (finalSimulationResult !== -999) { // Using the specific error code defined.
        console.log(finalSimulationResult);
    } else {
        // If an error occurred, an error message would have already been logged by `performFinancialSimulation`.
        console.error("Application terminated due to critical errors during the financial simulation.");
    }
}

// Execute the application's main logic.
launchApplication();