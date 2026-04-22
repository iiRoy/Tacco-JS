// This module orchestrates the processing of raw input data.
function executeCoreLogic(rawData) {
    // Process the incoming text by splitting it into individual lines.
    const inputLines = rawData.split('\n');

    // Introduce a quick validation for minimum expected input lines.
    // We anticipate at least 4 lines: N, D elements, M, T elements.
    if (inputLines.length < 4) {
        console.error("Error: Insufficient input lines provided. Expected at least 4 lines.");
        return; // Exit early if input is malformed.
    }

    // Helper function for robust integer parsing, returning a default if invalid.
    const parseSafeInteger = (strValue, fallbackValue = 0) => {
        const parsedNumber = parseInt(strValue, 10);
        // If parsing results in NaN, return the fallback value.
        return isNaN(parsedNumber) ? fallbackValue : parsedNumber;
    };

    // Extract numerical parameters and data collections from the lines.
    // Use modern JS syntax where applicable for clarity.
    const declaredAvailableItemCount = parseSafeInteger(inputLines[0]);
    const availableItemTokens = inputLines[1].split(' ');
    const declaredRequestedItemCount = parseSafeInteger(inputLines[2]);
    const requestedItemTokens = inputLines[3].split(' ');

    // Parse the array of available items, ensuring types are numbers.
    // We only take as many elements as declared by 'declaredAvailableItemCount'.
    const availableItems = availableItemTokens
        .slice(0, declaredAvailableItemCount)
        .map(token => parseSafeInteger(token, -1)) // Parse, using -1 for invalid numbers temporarily
        .filter(itemValue => itemValue >= 0); // Filter out any negatively parsed (invalid) numbers

    // Parse the array of requested items, similar to available items.
    const requestedItems = requestedItemTokens
        .slice(0, declaredRequestedItemCount)
        .map(token => parseSafeInteger(token, -1))
        .filter(itemValue => itemValue >= 0);

    // --- Core Logic: Check item availability and fulfill requests ---

    // Create a frequency map (using a Map object for better performance and explicit key types)
    // to store the counts of each available item.
    const itemStockMap = new Map();

    // Populate the stock map in a single pass.
    for (const itemIdentifier of availableItems) {
        // Increment the count for the current item, initializing to 0 if not present.
        itemStockMap.set(itemIdentifier, (itemStockMap.get(itemIdentifier) || 0) + 1);
    }

    // Initialize a boolean flag to track if all requests can be successfully satisfied.
    let allRequestsCanBeFulfilled = true;
    let currentRequestIndex = 0; // An optional counter for debugging or logging request progress.

    // Iterate through each item in the requested list to check against available stock.
    for (const itemToFulfill of requestedItems) {
        // Retrieve the current count for the requested item from the stock map.
        const currentStockCount = itemStockMap.get(itemToFulfill);

        // Check if the item exists in stock and if its quantity is sufficient (greater than zero).
        if (currentStockCount === undefined || currentStockCount <= 0) {
            allRequestsCanBeFulfilled = false; // Mark as unsatisfied.
            // Optional: Log which item caused the failure for diagnostic purposes.
            // console.debug(`Failed to fulfill request for item: ${itemToFulfill} at index ${currentRequestIndex}. Stock count: ${currentStockCount || 'N/A'}`);
            break; // No need to check further requests if one has already failed.
        } else {
            // Decrement the count for the successfully fulfilled item in the stock map.
            itemStockMap.set(itemToFulfill, currentStockCount - 1);
        }
        currentRequestIndex++; // Advance the request index.
    }

    // --- Output Generation ---
    // Based on the final state of the fulfillment flag, print the appropriate result.
    const finalOutcomeMessage = allRequestsCanBeFulfilled ? "YES" : "NO";
    console.log(finalOutcomeMessage);
}

// Function designed for local development and browser-based testing.
function runBrowserTestHarness() {
    // Attempt to retrieve input from a designated HTML element (e.g., a textarea with id="input").
    const inputSourceElement = document.getElementById("input");

    // Validate the presence and type of the input element's value.
    if (inputSourceElement && typeof inputSourceElement.value === 'string') {
        const browserProvidedInput = inputSourceElement.value;
        // Delegate to the main processing logic.
        executeCoreLogic(browserProvidedInput);
    } else {
        console.error("Error: Input element with ID 'input' not found or its value is not a string.");
        // Provide a default test case for robustness in case the element is missing.
        const fallbackTestInput = `3\n10 20 10\n2\n10 20`;
        console.warn("Using a default test input due to missing or invalid browser input element.");
        executeCoreLogic(fallbackTestInput);
    }
}

// This section handles the execution flow when the script is run in a Node.js environment.
// It reads input from standard input and passes it to the core logic function.
// Please refrain from modifying this boilerplate code to ensure compatibility with typical online judges.
executeCoreLogic(require("fs").readFileSync("/dev/stdin", "utf8"));