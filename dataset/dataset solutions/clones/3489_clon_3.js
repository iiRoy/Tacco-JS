// This script's purpose is to identify the most cost-effective item from a given catalog
// that also adheres to a specified time constraint. It processes input from standard
// input, expecting the first line to contain critical configuration parameters:
// the total count of items to evaluate and the maximum permissible processing time.
// Subsequent lines are anticipated to detail individual items, each providing its
// specific cost and the time required for its processing.

// Begin by reading the complete raw content from the standard input stream.
const dataSourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Implement a preliminary validation step: check if the input data is missing or empty.
// While competitive programming problems often guarantee valid input, robust code
// includes such guard clauses. If no content is found, an error message is logged,
// and the script can be configured to exit or output a default error state.
if (!dataSourceContent || dataSourceContent.trim().length === 0) {
    console.error("Error: Input stream is devoid of content or contains only whitespace.");
    // In a production scenario, one might `process.exit(1)` here.
    // For this context, we will proceed, and the 'TLE' will likely be the outcome.
}

// Divide the entire input content into an array of individual lines.
const allInputRecords = dataSourceContent.split('\n');

// Extract and parse the global configuration parameters from the very first line.
// The `shift()` method removes this line from the array, leaving only item data.
const configurationLineDetails = allInputRecords.shift();

// Perform a check for an empty configuration line, which could happen if the input
// was just a single newline or truly empty.
if (!configurationLineDetails || configurationLineDetails.trim().length === 0) {
    console.error("Error: Configuration line is missing or malformed.");
    console.log("TLE"); // Output 'TLE' as no configuration means no valid items can be processed.
    return; // Exit the script.
}

// Split the configuration line to obtain the item count and time limit as strings.
const [numberOfItemsString, maximumAllowedTimeString] = configurationLineDetails.split(' ');

// Convert the string representations of configuration values into numeric types.
// Using `Number()` provides explicit type conversion.
const totalItemEntriesToProcess = Number(numberOfItemsString);
const overallProcessingTimeLimit = Number(maximumAllowedTimeString);

// Initialize variables to track the search for the optimal item.
// `optimalCostFound` is set to `Infinity` to ensure any valid item's cost
// will be lower, correctly establishing a minimum.
let optimalCostFound = Infinity;
// `hasSuccessfullyIdentifiedOption` is a boolean flag to indicate if at least
// one item meeting the criteria has been located.
let hasSuccessfullyIdentifiedOption = false;

// Loop through each item entry provided in the input, starting from the second line.
// A traditional `for` loop is used for direct indexed access, mirroring the original structure.
for (let currentEntryIndex = 0; currentEntryIndex < totalItemEntriesToProcess; currentEntryIndex++) {
    const currentItemRecord = allInputRecords[currentEntryIndex];

    // Skip over any empty lines that might inadvertently appear in the input,
    // especially from trailing newlines after splitting the input.
    if (!currentItemRecord || currentItemRecord.trim().length === 0) {
        continue; // Proceed to the next item if the current line is empty.
    }

    // Deconstruct the current item's record into its string components: cost and time.
    const [itemPriceString, itemDurationString] = currentItemRecord.split(' ');

    // Convert these string components into their numeric equivalents.
    const itemActualPrice = Number(itemPriceString);
    const itemProcessingDuration = Number(itemDurationString);

    // First, verify if the item's processing time falls within the global limit.
    if (itemProcessingDuration <= overallProcessingTimeLimit) {
        // If the time constraint is met, then check if this item's cost is
        // strictly less than the current minimum cost discovered so far.
        if (itemActualPrice < optimalCostFound) {
            // If it is, update `optimalCostFound` to this new lower cost.
            optimalCostFound = itemActualPrice;
            // Set the flag to true, indicating that at least one viable option exists.
            hasSuccessfullyIdentifiedOption = true;
        }
        // Note: If an item has the same cost as `optimalCostFound`, it won't trigger
        // an update here, which is typical behavior for finding a "minimum".
        // The `hasSuccessfullyIdentifiedOption` flag still ensures we know *something* was found.
    }
}

// Prepare the final output message based on the search results.
let finalOutcomeMessage;
if (hasSuccessfullyIdentifiedOption) {
    // If a valid, time-compliant item was found, the message is its minimum cost.
    // Convert the numeric cost back to a string for consistent output.
    finalOutcomeMessage = String(optimalCostFound);
} else {
    // If no item met the criteria (or no items were processed), output 'TLE'.
    finalOutcomeMessage = 'TLE';
}

// Display the determined outcome to the console.
console.log(finalOutcomeMessage);