// This initial segment configures logging and handles the ingestion of input data.

var outputVal = console.log; // Assigns the console's logging function to a local variable.

if (typeof execEnv !== "undefined") { // Checks if the script is running within a Node.js-like environment.
    /*
    // The following block demonstrates an alternative, asynchronous method for input retrieval.
    var dataStreamBuffer = "";
    execEnv.stdin.resume();
    execEnv.stdin.setEncoding('utf8');
    execEnv.stdin.on('data', function (dataChunk) {
        dataStreamBuffer += dataChunk;
    });
    execEnv.stdin.on('end', function () {
        var textRowsArray = dataStreamBuffer.split("\n");
        performTask(textRowsArray); // Invokes the main processing routine.
    });
    */
    // For synchronous operation, reads the entire content from standard input.
    var dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
    var textRows = dataStream.split("\n"); // Splits the raw input string into an array of lines.
    performTask(textRows); // Initiates the primary computational sequence.
}

// End of the input processing and execution environment setup.

function performTask(textRows) {
    // Transforms the array of raw text lines into a structured numerical format.
    textRows = textRows.map(function (elementItem) {
        // If a line contains multiple space-separated numerical components.
        if (elementItem.split(" ").length >= 2) {
            return elementItem.split(" ").map(function (numericPiece) {
                return Number(numericPiece); // Converts each part to a number.
            });
        } else {
            return Number(elementItem); // Otherwise, converts the entire line to a single number.
        }
    });


    var configParams = textRows.shift(); // Extracts the first line for configuration.
    var numItems = configParams.shift(); // Retrieves the total count of items.
    var maxWeight = configParams.shift(); // Obtains the maximum allowable weight capacity.
    var itemDetails = textRows; // The remaining lines represent the actual item data.

    var itemCounter = numItems; // An auxiliary counter, its direct use might be contextual or implied later.

    var storageMap = {}; // An empty object, potentially for future data aggregation or mapping.

    calculateValue(itemDetails, maxWeight); // Calls the core algorithm to determine the optimal value.
}

// This function implements a dynamic programming algorithm, typically for a knapsack problem variant.
function calculateValue(itemDetails, maxWeight) {
    var currentValues = {}; // Stores the maximum value achieved for each weight in the current iteration.
    var previousValues = {}; // Holds the state from the prior iteration to build upon.

    // Iterates through each item provided in the itemDetails array.
    for (var itemIndex = 0; itemIndex < itemDetails.length; itemIndex++) {
        var itemValue = itemDetails[itemIndex][0]; // The value of the current item being considered.
        var itemWeight = itemDetails[itemIndex][1]; // The weight of the current item.

        previousValues = currentValues; // Transfers the results of the current iteration to the 'previous' state.
        currentValues = {}; // Resets the 'currentValues' map for the new iteration with the next item.

        // Processes all weight entries accumulated from the previous step.
        for (var currentWeight in previousValues) {
            currentWeight = Number(currentWeight); // Ensures the weight key is treated as a numerical value.

            // Updates 'currentValues' if the value from 'previousValues' for the current weight is higher
            // or if 'currentValues' does not yet contain an entry for this weight.
            if (currentValues[currentWeight] <= previousValues[currentWeight] || !currentValues[currentWeight]) {
                currentValues[currentWeight] = previousValues[currentWeight];
            }

            // Checks if adding the current item's weight would exceed the overall maximum capacity.
            if (currentWeight + itemWeight <= maxWeight) {
                var potentialNewTotalValue = previousValues[currentWeight] + itemValue; // Calculate value if item is added.
                var existingPreviousCombinedValue = previousValues[currentWeight + itemWeight];
                var existingCurrentCombinedValue = currentValues[currentWeight + itemWeight];

                // If the potential new total value is greater than existing values for the combined weight
                // in both 'previousValues' and 'currentValues', update 'currentValues'.
                if ((existingPreviousCombinedValue <= potentialNewTotalValue || !existingPreviousCombinedValue) &&
                    (existingCurrentCombinedValue <= potentialNewTotalValue || !existingCurrentCombinedValue)) {
                    currentValues[currentWeight + itemWeight] = potentialNewTotalValue;
                }
            } else {
                // If adding the current item's weight exceeds the capacity,
                // further iteration on increasing weights for this path is stopped.
                break;
            }
        }
        // Considers the current item by itself, or if its value is superior to any existing entry
        // for its specific weight in both previous and current result sets.
        if ((previousValues[itemWeight] <= itemValue || !previousValues[itemWeight]) &&
            (currentValues[itemWeight] <= itemValue || !currentValues[itemWeight])) {
            currentValues[itemWeight] = itemValue;
        }
    }

    // After processing all items, searches for the maximum value attainable within the total weight limit.
    for (var weightCounter = maxWeight; weightCounter > 0; weightCounter--) {
        if (!!currentValues[weightCounter]) { // If a valid value exists for this specific weight.
            outputVal(currentValues[weightCounter]); // Logs the highest value found.
            break; // Exits the loop once the maximum value for the highest possible weight is identified.
        }
    }
}