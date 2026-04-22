// This module provides a flexible input stream reader for competitive programming.
// It allows reading single values, full lines, or multi-line matrices from a string input.
const InputParserFactory = (function() {
    // Inner class representing an instance of the input stream handler.
    // It manages the state of the input lines and current parsing position.
    class LineStreamHandler {
        /**
         * Initializes the stream handler with the raw input content.
         * @param {string} rawInputContent - The entire input as a single string.
         */
        constructor(rawInputContent) {
            // Stores all lines from the input, trimmed and split.
            this._inputLines = rawInputContent.trim().split("\n");
            // Points to the index of the next line to be processed.
            this._currentLineIndex = 0;
            // A buffer to hold tokens (words) from the current line being parsed by readSingleValue.
            this._currentLineTokens = [];
            // Points to the index of the next token within _currentLineTokens.
            this._currentTokenIndex = 0;
        }

        /**
         * Ensures that there are tokens available in _currentLineTokens.
         * If the current line's tokens are exhausted, it advances to the next line.
         * @returns {boolean} True if tokens are available, false if end of input.
         */
        _advanceLineIfNeeded() {
            // If all tokens on the current line have been consumed, or it's the first call for a line
            if (this._currentTokenIndex >= this._currentLineTokens.length) {
                // Check if there are more lines in the input.
                if (this._currentLineIndex >= this._inputLines.length) {
                    return false; // No more lines to process.
                }
                // Split the next line into tokens and reset the token pointer.
                this._currentLineTokens = this._inputLines[this._currentLineIndex].split(" ");
                this._currentTokenIndex = 0;
                this._currentLineIndex++; // Move to the next line for subsequent full-line operations or if this line is fully consumed.
            }
            return true;
        }

        /**
         * Reads a single value (token) from the input stream.
         * It consumes tokens from left to right on a line.
         * @param {boolean} [shouldParseAsNumber=false] - If true, attempts to convert the value to a number.
         * @returns {string|number|undefined} The read value, or undefined if no more input.
         */
        readSingleValue(shouldParseAsNumber = false) {
            if (!this._advanceLineIfNeeded()) {
                console.warn("Attempted to read single value past end of input.");
                return undefined; // Or throw an error, depending on desired behavior.
            }
            const tokenValue = this._currentLineTokens[this._currentTokenIndex];
            this._currentTokenIndex++; // Advance token pointer.

            // Convert to a number if specified.
            return shouldParseAsNumber ? Number(tokenValue) : tokenValue;
        }

        /**
         * Reads an entire line of values from the input stream.
         * This method effectively consumes the current line and moves to the next.
         * @param {boolean} [shouldParseAsNumbers=false] - If true, attempts to convert all values on the line to numbers.
         * @returns {Array<string|number>} An array of values from the line. Returns an empty array if no more lines.
         */
        readLineValues(shouldParseAsNumbers = false) {
            if (this._currentLineIndex >= this._inputLines.length) {
                console.warn("Attempted to read line values past end of input.");
                return []; // No more lines.
            }
            // Get the current line and advance the line pointer.
            const rawLineContent = this._inputLines[this._currentLineIndex];
            this._currentLineIndex++;

            // Reset token pointers as this method consumes a full line, bypassing the single-value buffer.
            this._currentLineTokens = [];
            this._currentTokenIndex = 0;

            const lineTokens = rawLineContent.split(" ");
            return shouldParseAsNumbers ? lineTokens.map(val => Number(val)) : lineTokens;
        }

        /**
         * Reads 'numLines' consecutive lines as a matrix (array of arrays).
         * @param {number} numLines - The number of lines to read.
         * @param {boolean} [shouldParseAsNumbers=false] - If true, attempts to convert all values to numbers.
         * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
         */
        readMatrix(numLines, shouldParseAsNumbers = false) {
            const matrixData = [];
            // Ensure numLines is non-negative.
            if (numLines < 0) {
                console.error("Invalid number of lines specified for matrix read.");
                return matrixData;
            }

            for (let i = 0; i < numLines; i++) {
                matrixData.push(this.readLineValues(shouldParseAsNumbers));
            }
            return matrixData;
        }

        /**
         * Reads 'numLines' consecutive lines as raw strings.
         * @param {number} numLines - The number of lines to read.
         * @returns {Array<string>} An array of strings.
         */
        readRawLines(numLines) {
            const rawLineStrings = [];
            if (numLines < 0) {
                console.error("Invalid number of lines specified for raw lines read.");
                return rawLineStrings;
            }

            // Slice directly from the input lines and update the pointer.
            const availableLines = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex + numLines);
            this._currentLineIndex += availableLines.length; // Advance pointer by actual lines read.

            // Reset token pointers as this method consumes full lines.
            this._currentLineTokens = [];
            this._currentTokenIndex = 0;

            return availableLines;
        }
    }

    // The factory function that creates and returns a new LineStreamHandler instance.
    /**
     * Factory function to create a new input stream parser.
     * @param {string} inputString - The full content of the input stream as a string.
     * @returns {LineStreamHandler} An instance of the input stream handler.
     */
    function createInputParser(inputString) {
        return new LineStreamHandler(inputString);
    }

    return createInputParser;
})();

// Initialize the global input processor by reading from standard input.
const rawFileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputProcessor = InputParserFactory(rawFileContent);

// Output the result of the main calculation.
console.log(calculateMaxSimultaneousEvents());

/**
 * Main function to solve the scheduling problem: finding the maximum number of
 * simultaneously active events after merging overlapping intervals on separate channels.
 * @returns {number} The maximum number of events active at any single time point.
 */
function calculateMaxSimultaneousEvents() {
    // Read the total number of tasks (N) and the number of distinct channels (C).
    const totalTasks = inputProcessor.readSingleValue(true);
    const channelCount = inputProcessor.readSingleValue(true);

    // Validate input values to prevent errors.
    if (totalTasks < 0 || channelCount < 0) {
        console.error("Invalid input: totalTasks or channelCount cannot be negative.");
        return 0;
    }

    // Initialize an array to hold tasks, grouped by their respective channels.
    // Each element `channelSchedules[i]` will be an array of tasks for channel `i`.
    const channelSchedules = Array(channelCount).fill(null).map(() => []);
    let overallEndTime = 0; // Tracks the maximum end time across all tasks, for sweep line range.

    // Process each task from the input.
    for (let taskIndex = 0; taskIndex < totalTasks; taskIndex++) {
        // Read task details: [start_time, end_time, channel_id].
        const currentTaskDetails = inputProcessor.readLineValues(true);

        // Extract and validate task components.
        const [startTime, endTime, channelIdRaw] = currentTaskDetails;
        if (startTime === undefined || endTime === undefined || channelIdRaw === undefined) {
             console.error(`Error reading task details for task ${taskIndex}. Skipping.`);
             continue;
        }

        // Adjust channel ID to be 0-indexed.
        const actualChannelIndex = channelIdRaw - 1;

        // Ensure the channel index is valid.
        if (actualChannelIndex < 0 || actualChannelIndex >= channelCount) {
            console.warn(`Task ${taskIndex} refers to an invalid channel ID: ${channelIdRaw}. Skipping.`);
            continue;
        }

        // Add the task (start and end times) to its corresponding channel's schedule.
        channelSchedules[actualChannelIndex].push([startTime, endTime]);

        // Update the overall maximum end time if this task ends later.
        overallEndTime = Math.max(overallEndTime, endTime);
    }

    // Arrays to store consolidated start and end event points for the sweep-line algorithm.
    const startEvents = [];
    const endEvents = [];

    // Process tasks for each channel to merge overlapping intervals.
    for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
        const currentChannelTasks = channelSchedules[channelIndex];

        // If no tasks for this channel, move to the next.
        if (currentChannelTasks.length === 0) {
            continue;
        }

        // Sort tasks within the channel by their start times to facilitate merging.
        currentChannelTasks.sort((taskA, taskB) => taskA[0] - taskB[0]);

        const channelTaskCount = currentChannelTasks.length;
        // Iterate through tasks in the current channel to merge overlapping intervals.
        for (let currentTaskIdx = 0; currentTaskIdx < channelTaskCount; currentTaskIdx++) {
            // The sweep line algorithm uses `start_time - 1` for start events.
            // This ensures that an event starting at time `T` is processed *before*
            // an event ending at time `T`, when iterating `timePoint` by `timePoint`.
            startEvents.push(currentChannelTasks[currentTaskIdx][0] - 1);

            // Initialize the end time for the current (potentially merged) interval.
            let mergedIntervalEndTime = currentChannelTasks[currentTaskIdx][1];

            // Look ahead to merge subsequent overlapping tasks.
            while (currentTaskIdx + 1 < channelTaskCount) {
                const nextTask = currentChannelTasks[currentTaskIdx + 1];

                // Check for overlap: If the current merged interval's end time plus 1
                // is greater than or equal to the next task's start time, they overlap.
                // (e.g., [1,5] and [6,10] are contiguous, [1,5] and [5,10] overlap).
                if (mergedIntervalEndTime + 1 >= nextTask[0]) {
                    // Merge: Extend the end time to the maximum of the current merged end
                    // and the next task's end time.
                    mergedIntervalEndTime = Math.max(mergedIntervalEndTime, nextTask[1]);
                    currentTaskIdx++; // Advance the pointer to include the merged task.
                } else {
                    // No overlap with the next task, so stop merging for this interval.
                    break;
                }
            }
            // After merging all possible subsequent tasks, add the final merged end event.
            endEvents.push(mergedIntervalEndTime);
        }
    }

    // Sort all collected start and end events to prepare for the sweep-line algorithm.
    startEvents.sort((a, b) => a - b);
    endEvents.sort((a, b) => a - b);

    let startIndexPointer = 0; // Pointer for the sorted start events array.
    let endIndexPointer = 0;   // Pointer for the sorted end events array.
    let currentActiveEventCount = 0;     // Tracks the number of events active at the current time point.
    let maximumSimultaneousEvents = 0;   // Stores the highest number of simultaneous events found.

    // Perform the sweep-line algorithm from time point 0 up to the overall maximum end time.
    for (let timePoint = 0; timePoint <= overallEndTime; timePoint++) {
        // Process all end events that conclude at the current timePoint.
        // Decrement the active count for each event ending at `timePoint`.
        while (endIndexPointer < endEvents.length && endEvents[endIndexPointer] === timePoint) {
            currentActiveEventCount--;
            endIndexPointer++;
        }

        // Process all start events that begin at the current timePoint.
        // Increment the active count for each event starting at `timePoint`.
        while (startIndexPointer < startEvents.length && startEvents[startIndexPointer] === timePoint) {
            currentActiveEventCount++;
            startIndexPointer++;
        }

        // Update the overall maximum if the current active count is higher.
        maximumSimultaneousEvents = Math.max(maximumSimultaneousEvents, currentActiveEventCount);
    }

    // The final result is the maximum number of simultaneous events found.
    return maximumSimultaneousEvents;
}