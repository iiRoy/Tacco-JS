/*
 * This JavaScript module processes sequential data lines from standard input.
 * Its core function is to simulate a series of events and track a cumulative
 * value, checking if it exceeds a predetermined maximum threshold at any point.
 * The input describes test cases, each containing multiple items with associated
 * mass, start time, and end time.
 */

// Import the native file system module for input operations.
const fileSystemModule = require('node:fs');

// Declare constants for various literal values and string identifiers to enhance readability and maintainability.
const STD_INPUT_FILE_PATH = '/dev/stdin';          // Path to read input from.
const TEXT_ENCODING_STANDARD = 'utf8';             // Character encoding for file operations.
const LINE_BREAK_SEPARATOR = "\n";                  // Delimiter for splitting input into lines.
const VALUE_SEPARATOR = " ";                        // Delimiter for splitting line parts.
const EVENT_END_OFFSET = 0.1;                       // Small decimal offset for end events.
const MAXIMUM_ACCUMULATION_LIMIT = 150;             // The upper bound for the cumulative value.
const STATUS_INDICATOR_SUCCESS = "OK";              // String for a successful outcome.
const STATUS_INDICATOR_FAILURE = "NG";              // String for a failed outcome.
const ZERO_NUMERIC_VALUE = 0;                       // A constant representing the numeric zero.

// Obtain a reference to the readFileSync method for convenience, changing its identifier.
const obtainFileContentSynchronously = fileSystemModule.readFileSync;

// Read all content from the standard input file, applying the specified encoding.
let entireInputContent = obtainFileContentSynchronously(STD_INPUT_FILE_PATH, TEXT_ENCODING_STANDARD);

// Process the raw input: trim whitespace and split into an array of individual data strings.
let processedInputLines = entireInputContent.trim().split(LINE_BREAK_SEPARATOR);

// Begin the main loop to process multiple test scenarios. This loop continues until a specific termination condition is met.
while (Boolean(true))
{
    // Extract the first line, which represents the number of items for the current scenario, and convert it to a whole number.
    let numberOfScenarioItems = Number(processedInputLines.shift());

    // Check for the termination condition: if the item count is zero, exit the loop.
    if (numberOfScenarioItems === ZERO_NUMERIC_VALUE) {
        break;
    }

    // Initialize an empty array to store all significant events, each defined by a timestamp and a value change.
    let timePointAlterations = [];

    // Loop through each item description for the current scenario.
    for (let itemIndex = 0; itemIndex < numberOfScenarioItems; ++itemIndex)
    {
        // Parse the current item's data line: split by space and convert all parts to floating-point numbers.
        let currentItemData = processedInputLines.shift().split(VALUE_SEPARATOR).map(parseFloat);

        // Deconstruct the parsed data into meaningful variables.
        let itemWeight = currentItemData[0];
        let initialMoment = currentItemData[1];
        let finalMoment = currentItemData[2];

        // Record the start event: at the initial moment, the item's weight is added.
        timePointAlterations.push([initialMoment, itemWeight]);
        // Record the end event: just before the final moment, the item's weight is removed.
        timePointAlterations.push([finalMoment - EVENT_END_OFFSET, -1 * itemWeight]);
    }

    // Sort all recorded events based on their chronological order (timestamp).
    timePointAlterations.sort((firstEventDetail, secondEventDetail) =>
    {
        // Extract the timestamp from each event for comparison.
        const timeValueA = firstEventDetail[0];
        const timeValueB = secondEventDetail[0];
        return timeValueA - timeValueB; // Sort in ascending order of time.
    });

    // Initialize the status string to success and the running total to zero.
    let scenarioOutcomeStatus = STATUS_INDICATOR_SUCCESS;
    let runningTotalWeight = 0;

    // Iterate through the chronologically ordered events to simulate the cumulative effect.
    for (let alterationIdx = 0; alterationIdx < timePointAlterations.length; ++alterationIdx)
    {
        // Apply the weight change of the current event to the running total.
        runningTotalWeight += timePointAlterations[alterationIdx][1];

        // Check if the running total has exceeded the maximum allowable limit.
        if (runningTotalWeight > MAXIMUM_ACCUMULATION_LIMIT) {
            scenarioOutcomeStatus = STATUS_INDICATOR_FAILURE; // Update status to failure.
            break; // No need to process further events, the limit has been breached.
        }
    }

    // Output the final determined status for the current scenario to the console.
    console.log(scenarioOutcomeStatus);
}

// The script concludes after processing all test scenarios.