const LINE_BREAK_CHAR = "\n"; // Character for new line
const SPACE_DELIMITER = " "; // Character for space separation
const EMPTY_STRING_VAL = ""; // An empty string constant

/**
 * Processes the input string to calculate the minimum cost for a given budget.
 * This function implements a greedy algorithm to select items.
 * @param {string} rawTextData The raw input string containing item details and budget.
 * @returns {number} The calculated minimum cost.
 */
function ProcessInputData(rawTextData) {
    // Split the entire input by newlines, then each line by spaces.
    // This creates a 2D array of string tokens.
    let parsedInputLines = rawTextData.split(LINE_BREAK_CHAR).map(lineSegment => lineSegment.split(SPACE_DELIMITER));

    /**
     * Helper function to extract the next string token from the parsed input.
     * It consumes tokens from the current line first, then moves to the next line.
     * @returns {string} The next available string token.
     */
    const extractNextStringToken = () => {
        let currentLineTokens = parsedInputLines.shift(); // Get the first array (line) of tokens
        let extractedToken = currentLineTokens.shift(); // Get the first token from that line

        // If there are still tokens left in the current line, put it back at the front
        // of the main input array so they are consumed next.
        if (currentLineTokens.length) {
            parsedInputLines.unshift(currentLineTokens);
        }
        return extractedToken; // Return the token that was just extracted
    };

    /**
     * Helper function to extract the next integer token from the parsed input.
     * It uses the string token extractor and converts the result to an integer.
     * @returns {number} The next available integer token.
     */
    const extractNextIntegerToken = () => ~~extractNextStringToken(); // Convert string to integer using bitwise NOT operator

    // Read the initial parameters: number of items and total budget.
    let numberOfItems = extractNextIntegerToken(); // First integer is the count of items
    let totalBudget = extractNextIntegerToken(); // Second integer is the total budget or capacity

    // Initialize an array to store item offers (price and quantity).
    let itemOffers = [];
    // Populate the item offers array by reading N pairs of integers.
    for (let itemIndex = 0; itemIndex < numberOfItems; itemIndex++) {
        itemOffers.push([extractNextIntegerToken(), extractNextIntegerToken()]); // Each item has a price and a quantity
    }

    // Sort the item offers by their price in ascending order.
    // This is crucial for the greedy approach to work correctly.
    itemOffers.sort((offerA, offerB) => offerA[0] - offerB[0]);

    let finalCost = 0; // Initialize the total cost accumulator.

    // Continue purchasing items as long as there is budget remaining.
    while (totalBudget > 0) {
        // Get the cheapest available item offer.
        let currentOffer = itemOffers.shift();

        // If the remaining budget is sufficient to buy all units of the current item.
        if (totalBudget >= currentOffer[1]) {
            totalBudget -= currentOffer[1]; // Decrease budget by the item's full quantity
            finalCost += currentOffer[0] * currentOffer[1]; // Add the full cost of the item
        } else {
            // If the remaining budget is less than the item's quantity,
            // buy only what the budget allows.
            finalCost += currentOffer[0] * totalBudget; // Add cost for the remaining budget
            totalBudget = 0; // Budget is now fully spent, terminate the loop
        }
    }

    return finalCost; // Return the calculated total cost.
}

// The following section handles input/output based on the execution environment.
// It's designed to work both in Node.js (reading from stdin) and in a browser-like environment.
// This part is critical for the observable behavior and should not be altered significantly.
((paramA, paramB, paramC) => "undefined" != typeof require ? console.log(ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"))) : [paramA = paramA.split("\n").slice(1, -1).join("\n"), paramB = function () { try { return ProcessInputData(paramA) } catch (errorObj) { return errorObj.stack || errorObj.message } }(), paramC = typeof paramB, "string" == paramC || (paramB = JSON.stringify(paramB)), $("<form>").append([[10, paramA], 0, [1, paramC], 0, [10, paramB]].map(element => $(element ? "<textarea>" : "<br>", element && { rows: element[0], cols: 40, text: element[1] }))).appendTo("body")])(`
4 30
6 18
2 5
3 10
7 9
`);
