const LINE_BREAK = "\n";

const SPACE_DELIM = " ";
const EMPTY_STR = "";

// Main processing function for the given input
function ProcessData(rawData) {

    // First, split the raw input by newlines, then each line by spaces.
    var parsedLines = rawData.split(LINE_BREAK).map(lineContent => lineContent.split(SPACE_DELIM));


    // This helper extracts the next string token from the parsed input.
    const extractStringToken = () => {
        var currentLineParts = parsedLines.shift(); // Get the first array (line)
        var extractedToken = currentLineParts.shift(); // Get the first item from that array

        // If there are still items left in the current line, put it back at the front of parsedLines
        if (currentLineParts.length > 0) {
            parsedLines.unshift(currentLineParts);
        }
        return extractedToken;
    };

    // This helper extracts the next number token by converting a string token to an integer.
    const extractNumberToken = () => ~~extractStringToken();

    // Read the two initial integer values from the input.
    var itemCount = extractNumberToken();
    var availableBudget = extractNumberToken();

    // Initialize an array to store the item offers.
    var itemOffers = [];

    // Loop to read all item offers. Each offer has two integer values.
    for (var itemIndex = 0; itemIndex < itemCount; itemIndex++) {
        itemOffers.push([extractNumberToken(), extractNumberToken()]);
    }

    // Sort the item offers based on their first element (cost) in ascending order.
    itemOffers.sort((offerA, offerB) => offerA[0] - offerB[0]);

    // Initialize the variable to accumulate the total calculated cost.
    var totalCost = 0;

    // Process offers as long as there is budget remaining and offers are available.
    while (availableBudget > 0 && itemOffers.length > 0) {
        var currentOffer = itemOffers.shift(); // Get the next cheapest offer.

        // Check if the remaining budget is enough to purchase the entire quantity of this offer.
        if (availableBudget >= currentOffer[1]) {
            // If yes, deduct the full quantity from the budget.
            availableBudget -= currentOffer[1];
            // Add the cost of the full quantity to the total.
            totalCost += currentOffer[0] * currentOffer[1];
        } else {
            // If no, purchase only what the remaining budget allows.
            // Add the cost for the partial quantity to the total.
            totalCost += currentOffer[0] * availableBudget;
            // Set budget to zero as it's fully spent.
            availableBudget = 0;
        }
    }

    // Return the final calculated total cost.
    return totalCost;
}

// Self-executing anonymous function to handle execution context (Node.js vs. Browser).
((initialDataFromContext, calculationOutcomeRef, outcomeTypeRef) => {

    // Check if the 'require' function is available (indicates Node.js environment).
    if ("undefined" !== typeof require) {
        const importFileSystem = require("fs"); // Import the file system module.
        const standardInputPath = "/dev/stdin"; // Path for standard input.
        const encodingFormat = "utf8"; // Character encoding.

        // Read input from stdin, process it, and log the result to console.
        console.log(ProcessData(importFileSystem.readInputSynchronously(standardInputPath, encodingFormat)));
    } else {
        // This block executes if not in a Node.js environment (assumed browser).

        // Prepare the initial data by splitting, slicing (to remove outer newlines), and rejoining.
        initialDataFromContext = initialDataFromContext.split("\n").slice(1, -1).join("\n");

        // Execute the main processing function within a try-catch block to handle errors.
        calculationOutcomeRef = (() => {
            try {
                return ProcessData(initialDataFromContext);
            } catch (errorObject) {
                // If an error occurs, return its stack trace or message.
                return errorObject.stack || errorObject.message;
            }
        })();

        // Determine the data type of the calculation outcome.
        outcomeTypeRef = typeof calculationOutcomeRef;

        // If the outcome is not already a string, convert it to a JSON string for display.
        if ("string" !== outcomeTypeRef) {
            calculationOutcomeRef = JSON.stringify(calculationOutcomeRef);
        }

        // Use jQuery to dynamically create and append HTML elements to display results.
        jQuery("<form>")
            .append(
                [
                    [10, initialDataFromContext], // Input data in a textarea
                    0, // A line break
                    [1, outcomeTypeRef], // Type of result in a textarea
                    0, // Another line break
                    [10, calculationOutcomeRef] // The actual result in a textarea
                ].map(elementConfig => // Map configuration arrays to jQuery elements
                    jQuery(
                        elementConfig ? "<textarea>" : "<br>", // Create textarea or line break
                        elementConfig && { // If it's a textarea, set its properties
                            rows: elementConfig[0],
                            cols: 40,
                            text: elementConfig[1]
                        }
                    )
                )
            )
            .appendTo("body"); // Append the form with elements to the document body.
    }
})(
    // Input string passed to the IIFE for browser context.
    `
    4 30
    6 18
    2 5
    3 10
    7 9
    `
);