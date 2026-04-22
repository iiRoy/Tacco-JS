process.stdin.resume();
process.stdin.setEncoding('utf8');

const receivedInputLines = [];

const inputLineParser = require('readline').createInterface({
  input: process.stdin
});

/**
 * Core function to evaluate item eligibility based on dynamic quotas.
 * This function encapsulates the main business logic of the application.
 *
 * @param {string[]} inputPayload - An array of strings representing the input data.
 *                                  Expected: [ "N A B", "item_sequence" ]
 * @returns {string} A newline-separated string indicating "Yes" or "No" for each item's selection status.
 */
function evaluateItemSelections(inputPayload) {
    // Defensive check: Ensure minimum required input lines are present.
    // In typical competitive programming, this might be implicitly guaranteed,
    // but explicit validation improves robustness.
    if (inputPayload.length < 2) {
        console.error("Error: Insufficient input lines provided for processing.");
        return ""; // Return an empty string or throw an error as appropriate.
    }

    // Extract and parse configuration parameters from the first line.
    const parameterTokens = inputPayload[0].split(" ");
    // N (total items) is often provided but not always directly used in the selection logic.
    // We name it 'nominalTotalItems' to reflect its presence but non-usage.
    const [nominalTotalItems, quotaForCategoryA, quotaForCategoryB] = parameterTokens.map(token => parseInt(token, 10));

    // Convert the second line (item sequence) into an array of individual characters.
    const candidateItemList = [...inputPayload[1]];

    // Calculate the absolute maximum number of items that can be selected across all categories.
    const overallSelectionCeiling = quotaForCategoryA + quotaForCategoryB;

    // Initialize a boolean array to store the selection outcome for each item.
    // By default, all items are initially considered not selected.
    const selectionOutcomeFlags = new Array(candidateItemList.length).fill(false);

    // Initialize counters to track current selections against their respective quotas.
    let currentTotalSelectionsMade = 0;
    let typeBCategorySelections = 0;

    // Iterate through each candidate item to determine its eligibility.
    for (let itemPosition = 0; itemPosition < candidateItemList.length; ++itemPosition) {
        // If the overall selection limit has already been reached, no further items can be selected.
        if (currentTotalSelectionsMade >= overallSelectionCeiling) {
            // Optimization: Since selectionOutcomeFlags is pre-filled with false,
            // we can simply skip remaining items without explicitly setting their flag to false.
            continue;
        }

        const currentItemCharacter = candidateItemList[itemPosition];
        let isCurrentItemEligible = false; // A temporary flag for the current item's eligibility.

        // Logic for items of type 'a'.
        if (currentItemCharacter === 'a') {
            isCurrentItemEligible = true;
        }
        // Logic for items of type 'b', with an additional check against its specific quota.
        else if (currentItemCharacter === 'b') {
            if (typeBCategorySelections < quotaForCategoryB) {
                isCurrentItemEligible = true;
                typeBCategorySelections++; // Increment the counter for type 'b' items.
            }
        }
        // Items of other types (e.g., 'c', 'd', etc.) are implicitly not eligible,
        // as 'isCurrentItemEligible' remains false for them.

        // If the current item is determined to be eligible, mark it as selected and update global count.
        if (isCurrentItemEligible) {
            selectionOutcomeFlags[itemPosition] = true;
            currentTotalSelectionsMade++;
        }
    }

    // Transform the boolean selection flags into "Yes" or "No" strings,
    // and concatenate them into a single string separated by newlines for output.
    const finalFormattedOutput = selectionOutcomeFlags.map(
        (isSelected) => isSelected ? "Yes" : "No"
    ).join("\n");

    return finalFormattedOutput;
}

// Event listener: Collect each line of input as it arrives.
inputLineParser.on('line', (currentLineText) => {
  receivedInputLines.push(currentLineText);
});

// Event listener: Once the entire input stream has closed, process the collected data.
inputLineParser.on('close', () => {
    // Invoke the main processing function with all gathered input lines.
    const computedResults = evaluateItemSelections(receivedInputLines);
    // Output the final computed results to standard output.
    console.log(computedResults);
});