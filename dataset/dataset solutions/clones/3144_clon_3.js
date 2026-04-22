const LINE_SEPARATOR = "\n";
const TOKEN_SEPARATOR = " ";
const EMPTY_STRING = "";

/**
 * A utility class to parse structured input text line by line and token by token.
 * It manages the state of input consumption, providing methods to extract strings or integers.
 */
class InputTokenizer {
    #allSourceLines;          // Stores all lines of the input text
    #currentLineIndex;        // Tracks the index of the line currently being processed
    #tokensOnActiveLine;      // Holds the tokens (parts) of the current line

    /**
     * Initializes the tokenizer with the raw input string and specified separators.
     * @param {string} sourceText The complete input string to be tokenized.
     * @param {string} lineDelim The character(s) used to separate lines (e.g., "\n").
     * @param {string} tokenDelim The character(s) used to separate tokens within a line (e.g., " ").
     */
    constructor(sourceText, lineDelim, tokenDelim) {
        // Clean and split the input into individual lines
        this.#allSourceLines = sourceText.trim().split(lineDelim);
        this.#currentLineIndex = 0;
        this.#tokensOnActiveLine = []; // Initialize as empty

        // Store delimiters for internal use
        this.lineDelimiter = lineDelim;
        this.tokenDelimiter = tokenDelim;

        // Pre-load tokens for the very first valid line
        this.#ensureCurrentLineTokensAreLoaded();
    }

    /**
     * Internal helper to ensure that `tokensOnActiveLine` contains tokens from the next available line.
     * Skips empty lines.
     * @private
     */
    #ensureCurrentLineTokensAreLoaded() {
        // Loop until tokens are found or all lines are exhausted
        while (this.#tokensOnActiveLine.length === 0 && this.#currentLineIndex < this.#allSourceLines.length) {
            const lineContent = this.#allSourceLines[this.#currentLineIndex].trim();
            this.#currentLineIndex++;

            if (lineContent !== EMPTY_STRING) {
                this.#tokensOnActiveLine = lineContent.split(this.tokenDelimiter);
            }
        }
    }

    /**
     * Extracts and returns the next string token from the input.
     * Advances the internal pointer.
     * @returns {string} The next token as a string.
     * @throws {Error} If no more tokens are available.
     */
    getNextString() {
        this.#ensureCurrentLineTokensAreLoaded(); // Ensure tokens are ready
        if (this.#tokensOnActiveLine.length > 0) {
            return this.#tokensOnActiveLine.shift(); // Remove and return the first token
        }
        throw new Error("Input exhaustion: No more string tokens to read.");
    }

    /**
     * Extracts and returns the next integer token from the input.
     * Advances the internal pointer and performs parsing.
     * @returns {number} The next token as an integer.
     * @throws {Error} If no more tokens are available or parsing fails.
     */
    getNextInteger() {
        const stringToken = this.getNextString(); // Get the string representation
        const parsedValue = parseInt(stringToken, 10); // Attempt to parse as base-10 integer

        if (isNaN(parsedValue)) {
            // Provide informative error if parsing fails
            throw new Error(`Invalid input format: Expected an integer but received '${stringToken}'.`);
        }
        return parsedValue;
    }
}

/**
 * Calculates the minimum cost to acquire a certain quantity of items from various shops,
 * prioritizing cheaper items. This simulates a greedy shopping strategy.
 * @param {string} scenarioInputString Raw input data containing shop information and budget.
 * @returns {number} The total calculated cost.
 */
function ProcessShoppingScenario(scenarioInputString) {
    // Input validation: ensure the input data is not empty or just whitespace.
    if (!scenarioInputString || scenarioInputString.trim() === EMPTY_STRING) {
        console.warn("Warning: Received empty or whitespace-only input string. Returning zero cost.");
        return 0; // No input means no cost.
    }

    // Initialize the custom input tokenizer to manage reading from the scenario string.
    const inputReader = new InputTokenizer(scenarioInputString, LINE_SEPARATOR, TOKEN_SEPARATOR);

    // Read the primary parameters for the shopping trip from the first line.
    const totalShopCount = inputReader.getNextInteger(); // Represents 'N' in the original problem.
    let maximumBudget = inputReader.getNextInteger();    // Represents 'M' in the original problem.

    // A collection to store all available purchasing options from different shops.
    // Using objects for clarity instead of raw arrays.
    let purchaseOpportunities = [];

    // Populate the collection by reading shop offers for each shop.
    for (let currentShopIdx = 0; currentShopIdx < totalShopCount; currentShopIdx++) {
        const itemPrice = inputReader.getNextInteger();
        const itemQuantity = inputReader.getNextInteger();
        purchaseOpportunities.push({ pricePerUnit: itemPrice, availableStock: itemQuantity });
    }

    // Sort the offers in ascending order based on their unit price.
    // This is crucial for the greedy algorithm to work correctly (always buy from cheapest first).
    purchaseOpportunities.sort((offerA, offerB) => offerA.pricePerUnit - offerB.pricePerUnit);

    let totalAcquisitionCost = 0; // Accumulator for the final cost.

    // Iterate through the sorted offers to make purchases as long as budget remains.
    for (const currentOffer of purchaseOpportunities) {
        // If the budget is completely exhausted, there's no need to consider further offers.
        if (maximumBudget <= 0) {
            break; // Exit the loop early.
        }

        // Determine the actual number of units to purchase from the current offer.
        // This is the minimum of what's available in stock and what the remaining budget can afford.
        const unitsToPurchase = Math.min(currentOffer.availableStock, maximumBudget);

        // Calculate the cost for this specific batch of items.
        const costForThisBatch = currentOffer.pricePerUnit * unitsToPurchase;

        // Add this cost to the cumulative expenditure.
        totalAcquisitionCost += costForThisBatch;

        // Deduct the purchased quantity from the remaining budget.
        maximumBudget -= unitsToPurchase;

        // For debugging or detailed output, an intermediate log could be useful:
        // console.log(`Purchased ${unitsToPurchase} units at ${currentOffer.pricePerUnit} each. Remaining budget: ${maximumBudget}`);
    }

    // Return the final calculated cost for the entire shopping scenario.
    return totalAcquisitionCost;
}

// --- Execution Environment Handling ---
// This immediate invoked function expression (IIFE) handles how the `ProcessShoppingScenario`
// function is executed based on the environment (Node.js for competitive programming, or browser for testing).

((inputForDemonstration, finalExecutionResult, resultValueType) => {
    // Check if the 'require' function is defined, which is typical for Node.js environments.
    if (typeof require !== "undefined") {
        const fileSystemModule = require("fs"); // Node.js File System module.
        const standardInputPath = "/dev/stdin"; // Standard path for input in many Unix-like systems.

        try {
            // Read all data from standard input synchronously and decode as UTF-8.
            const rawFileData = fileSystemModule.readFileSync(standardInputPath, "utf8");
            // Execute the main logic with the read data.
            const calculatedOutput = ProcessShoppingScenario(rawFileData);
            // Print the final result to standard output.
            console.log(calculatedOutput);
        } catch (executionError) {
            // Log any errors that occur during file reading or function execution.
            console.error("An error occurred during Node.js execution:", executionError.message);
            // In a production system, more robust error handling might be needed.
        }
    } else {
        // This block executes if not in a Node.js environment, typically a web browser.
        // It uses a predefined test string for demonstration purposes.

        // Trim any leading/trailing whitespace from the demonstration input string.
        let cleanedBrowserInput = inputForDemonstration.trim();

        // Attempt to run the main processing function with the demo input.
        try {
            finalExecutionResult = ProcessShoppingScenario(cleanedBrowserInput);
        } catch (browserExecutionError) {
            // If an error occurs, capture its message or stack trace.
            finalExecutionResult = browserExecutionError.stack || browserExecutionError.message;
        }

        // Determine the JavaScript type of the result for display.
        resultValueType = typeof finalExecutionResult;

        // If the result is not already a string, convert it to a JSON string for display.
        // This handles numbers, objects, arrays, etc., making them viewable.
        if (resultValueType !== "string") {
            finalExecutionResult = JSON.stringify(finalExecutionResult, null, 2); // Pretty-print JSON.
        }

        // --- Dynamic HTML Output for Browser Demonstration ---
        // This section creates simple HTML elements to display the input and output
        // directly in the browser's body, without relying on external libraries like jQuery.

        const pageBody = document.body;
        if (pageBody) { // Ensure the document body is available before appending elements.
            // Helper function to create and configure HTML elements.
            const generateHtmlElement = (tag, attributes) => {
                const element = document.createElement(tag);
                for (const key in attributes) {
                    if (attributes.hasOwnProperty(key)) {
                        if (key === 'text') {
                            element.textContent = attributes[key];
                        } else {
                            element.setAttribute(key, attributes[key]);
                        }
                    }
                }
                return element;
            };

            // Display for the initial input data.
            pageBody.appendChild(generateHtmlElement("h4", { text: "Provided Input Data:" }));
            pageBody.appendChild(generateHtmlElement("textarea", {
                rows: 10,
                cols: 40,
                text: cleanedBrowserInput,
                readOnly: true,
                style: "margin-bottom: 8px; font-family: monospace;"
            }));
            pageBody.appendChild(generateHtmlElement("br")); // Visual separator.

            // Display for the execution result type.
            pageBody.appendChild(generateHtmlElement("h4", { text: "Result Information:" }));
            pageBody.appendChild(generateHtmlElement("span", {
                text: `Data Type: ${resultValueType}`,
                style: "font-weight: bold; margin-right: 15px;"
            }));
            pageBody.appendChild(generateHtmlElement("br")); // Visual separator.

            // Display for the actual execution result.
            pageBody.appendChild(generateHtmlElement("textarea", {
                rows: 10,
                cols: 40,
                text: finalExecutionResult,
                readOnly: true,
                style: "margin-top: 8px; font-family: monospace;"
            }));
        } else {
            // Fallback for environments where document.body might not be ready or available.
            console.warn("Document body not found. Displaying results in console instead.");
            console.log("Browser Demo Input:", cleanedBrowserInput);
            console.log("Browser Demo Result Type:", resultValueType);
            console.log("Browser Demo Result:", finalExecutionResult);
        }
    }
})(`
4 30
6 18
2 5
3 10
7 9
`); // The test input string passed to the IIFE.