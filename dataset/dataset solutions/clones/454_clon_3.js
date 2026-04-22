// Define a constant for the fixed number of monthly entries associated with each scenario.
const MONTHS_PER_SCENARIO = 12;

// Import the Node.js 'fs' (file system) module to handle file operations.
const fileSystemUtility = require('fs');

// Read the entire content of the standard input stream synchronously.
// The data is expected to be UTF-8 encoded text.
let rawInputTextContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// Parse the raw text content into an array of strings, where each string represents a line.
// This effectively splits the input file by newline characters.
const inputLineSegments = rawInputTextContent.split('\n');

// Initialize a pointer to keep track of the current line being processed in the input array.
// This index will advance by a fixed amount after each scenario is fully handled.
let currentSegmentIndex = 0;

// Begin the main processing loop. This loop continues as long as there are
// unprocessed lines in the input and the scenario's target value is not the exit signal.
while (currentSegmentIndex < inputLineSegments.length) {
    // Attempt to convert the current line segment into an integer, representing the target
    // balance for the ongoing scenario. Use radix 10 for explicit decimal parsing.
    const scenarioRequiredThreshold = parseInt(inputLineSegments[currentSegmentIndex], 10);

    // Check for the termination condition: if the parsed threshold is 0,
    // or if the parsing resulted in a non-numeric value (NaN), exit the loop.
    if (isNaN(scenarioRequiredThreshold) || scenarioRequiredThreshold === 0) {
        break;
    }

    // Initialize a running total for the financial balance within the current scenario.
    let cumulativeFinancialBalance = 0;

    // A flag to indicate if the required threshold was met or exceeded within the 12 months.
    let thresholdMetInScenario = false;

    // A variable to store the ordinal month number (1-12) if the threshold is met.
    let monthOfThresholdAttainment = -1; // Default to -1, indicating not met

    // Loop through the 12 expected monthly transaction records for the current scenario.
    // Month numbers are 1-indexed for user-friendly output.
    for (let monthIterator = 1; monthIterator <= MONTHS_PER_SCENARIO; monthIterator++) {
        // Calculate the absolute line index for the current month's data.
        // It's the current scenario's starting line plus the month offset.
        const monthlyRecordLineAbsoluteIndex = currentSegmentIndex + monthIterator;

        // Implement a safeguard: ensure that the calculated line index is within the
        // bounds of the available input data. This handles potentially malformed input.
        if (monthlyRecordLineAbsoluteIndex >= inputLineSegments.length) {
            console.error(`Input data error: Expected ${MONTHS_PER_SCENARIO} monthly records, but ran out of lines at index ${monthlyRecordLineAbsoluteIndex}.`);
            // Mark as not met to ensure "NA" output for this scenario.
            thresholdMetInScenario = false;
            break; // Exit the inner loop due to insufficient data.
        }

        // Split the current month's line into its constituent parts (income and expense).
        // Convert these parts directly to numbers.
        const transactionComponents = inputLineSegments[monthlyRecordLineAbsoluteIndex].split(' ').map(Number);

        // Extract the income and expense values from the parsed components.
        // Assuming the format is always "income expense".
        const incomingFunds = transactionComponents[0];
        const outgoingFunds = transactionComponents[1];

        // Update the cumulative balance by adding the net change for the current month.
        cumulativeFinancialBalance += (incomingFunds - outgoingFunds);

        // Check if the cumulative balance has reached or surpassed the scenario's target threshold.
        if (cumulativeFinancialBalance >= scenarioRequiredThreshold) {
            // If the threshold is met, record the current month number.
            monthOfThresholdAttainment = monthIterator;
            // Set the flag to true, indicating success for this scenario.
            thresholdMetInScenario = true;
            // Since the goal is achieved, there's no need to process further months.
            break; // Exit the inner loop.
        }
    }

    // Determine the final output string for the current scenario based on the outcome.
    let scenarioOutcomeMessage;
    if (thresholdMetInScenario) {
        // If the threshold was met, the message is the month number (converted to string).
        scenarioOutcomeMessage = String(monthOfThresholdAttainment);
    } else {
        // Otherwise, the message indicates that the threshold was not met.
        scenarioOutcomeMessage = "NA";
    }

    // Output the determined message for the current scenario to the console.
    console.log(scenarioOutcomeMessage);

    // Increment the main line index to point to the start of the *next* scenario.
    // This skips the current scenario's target line itself (1 line) and its
    // associated 12 monthly data lines.
    currentSegmentIndex += (MONTHS_PER_SCENARIO + 1);
}

// The script concludes after processing all scenarios or encountering the termination signal.