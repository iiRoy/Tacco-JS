// Initialize a function for displaying output to the console.
var outputDisplay = console.log;

// Check if the current environment is Node.js-like to handle standard input.
if (typeof process !== "undefined" && process.stdin) {
    var accumulatedInputBuffer = ""; // A buffer to collect all incoming data chunks.
    process.stdin.resume(); // Ensures the process stays active while waiting for input.
    process.stdin.setEncoding('utf8'); // Specifies UTF-8 encoding for the input stream.

    // Event listener for 'data' chunks received from standard input.
    process.stdin.on('data', function (inputChunk) {
        accumulatedInputBuffer += inputChunk; // Append the new chunk to the buffer.
    });

    // Event listener for 'end' of the standard input stream, indicating all data has been received.
    process.stdin.on('end', function () {
        // Split the accumulated buffer into an array of individual lines.
        var inputLinesArray = accumulatedInputBuffer.split("\n");
        // Pass the array of lines to the primary data processing function.
        processInputDataSet(inputLinesArray);
    });
}

// A utility function to safely determine the maximum of two values,
// treating undefined or null inputs as zero for comparison purposes.
function safeMax(val1, val2) {
    return Math.max(val1 || 0, val2 || 0);
}

// The main entry point for processing the entire input data set.
// It parses the raw string lines and orchestrates the knapsack calculation.
function processInputDataSet(rawInputLines) {
    // This section transforms raw string input lines into structured numeric data.
    // Each line is processed; empty lines are ignored, and values are converted to numbers.
    var processedDataItems = rawInputLines.map(function (currentLineString) {
        // Trim leading/trailing whitespace from the current line.
        const trimmedLine = currentLineString.trim();
        if (trimmedLine === "") {
            return null; // Return null for empty lines, to be filtered out later.
        }

        var lineTokens = trimmedLine.split(" "); // Split the line by spaces.
        if (lineTokens.length >= 2) {
            // If there are two or more tokens, assume they represent multiple numeric values.
            return lineTokens.map(function (tokenValue) {
                return Number(tokenValue); // Convert each token to a number.
            });
        } else {
            // If there's only one token (or none after trim), treat it as a single numeric value.
            return Number(trimmedLine);
        }
    }).filter(item => item !== null); // Filter out any null entries corresponding to empty lines.

    // If no valid data remains after parsing, log a message and exit.
    if (processedDataItems.length === 0) {
        outputDisplay("No valid input data provided for processing.");
        return;
    }

    // The first line of input typically contains configuration parameters (e.g., N and W).
    var configurationParameters = processedDataItems.shift();
    // Validate that the configuration line is an array with at least two numbers.
    if (!Array.isArray(configurationParameters) || configurationParameters.length < 2) {
        outputDisplay("Error: The initial configuration line is malformed. Expected at least two numeric parameters.");
        return;
    }

    var totalItemCount = configurationParameters.shift(); // The first config parameter (N).
    var maximumWeightCapacity = configurationParameters.shift(); // The second config parameter (W).

    // The remaining processed data items represent the collection of available items.
    var availableItemsCollection = processedDataItems;

    // Invoke the core algorithm to compute the optimal value for the knapsack problem.
    determineKnapsackOptimalValue(availableItemsCollection, maximumWeightCapacity);
}

// Implements a dynamic programming solution for the 0/1 Knapsack problem.
// It calculates the maximum value of items that can fit into a knapsack
// given their weights and values, without exceeding the capacity.
function determineKnapsackOptimalValue(itemCollection, capacityThreshold) {
    // Early exit: If the knapsack has no capacity or negative capacity, the maximum value is 0.
    if (capacityThreshold <= 0) {
        outputDisplay(0);
        return;
    }

    // Initialize two DP state objects: one for the current iteration and one for the previous.
    // Keys represent weights, and values represent the maximum value achievable for that weight.
    // 'currentIterationState' starts with a base case: 0 value for 0 weight.
    let currentIterationState = { '0': 0 };
    let previousIterationState = {}; // This will be populated from currentIterationState.

    // Iterate through each item in the provided collection.
    for (let currentItemIndex = 0; currentItemIndex < itemCollection.length; currentItemIndex++) {
        const itemDetails = itemCollection[currentItemIndex];
        // Validate the structure of each item (should be an array [value, weight]).
        if (!Array.isArray(itemDetails) || itemDetails.length < 2) {
            // If an item is malformed, skip it and optionally log a warning.
            // console.warn(`Skipping malformed item at index ${currentItemIndex}:`, itemDetails);
            continue;
        }

        const currentItemValue = itemDetails[0]; // Extract the value of the current item.
        const currentItemWeight = itemDetails[1]; // Extract the weight of the current item.

        // Prepare for the new iteration: the current state becomes the previous state,
        // and a new current state is initialized based on the previous state.
        previousIterationState = currentIterationState;
        currentIterationState = { ...previousIterationState }; // Shallow copy all previous states.

        // Iterate through all possible weights from 0 up to the maximum knapsack capacity.
        // This systematic iteration ensures all subproblems are correctly solved.
        for (let currentWeight = 0; currentWeight <= capacityThreshold; currentWeight++) {
            // Case 1: We DO NOT include the current item.
            // The value for 'currentWeight' remains what it was in the previous iteration.
            const valueWithoutCurrentItem = previousIterationState[currentWeight] || 0;
            currentIterationState[currentWeight] = safeMax(currentIterationState[currentWeight], valueWithoutCurrentItem);

            // Calculate the total weight if the current item WERE to be added.
            const newWeightIfAdded = currentWeight + currentItemWeight;

            // Case 2: We DO include the current item.
            // Check if adding the current item keeps the total weight within the capacity limit.
            if (newWeightIfAdded <= capacityThreshold) {
                // Calculate the new total value if the current item is added to the 'currentWeight' state.
                const valueWithCurrentItem = (previousIterationState[currentWeight] || 0) + currentItemValue;
                
                // Update the 'currentIterationState' for 'newWeightIfAdded'.
                // We take the maximum of the existing value at 'newWeightIfAdded'
                // or the value achieved by adding the current item.
                currentIterationState[newWeightIfAdded] = safeMax(currentIterationState[newWeightIfAdded], valueWithCurrentItem);
            }
        }
        // Special handling for the current item itself, if it fits and offers a better value
        // than what's currently recorded for its exact weight. This handles items that are
        // the first to achieve a specific weight.
        if (currentItemWeight <= capacityThreshold) {
            currentIterationState[currentItemWeight] = safeMax(currentIterationState[currentItemWeight], currentItemValue);
        }
    }

    // After processing all items, the 'currentIterationState' holds the maximum values
    // for all achievable weights up to the capacity threshold.
    // We now need to find the single highest value within this state.
    let optimalFinalValue = 0;
    // Iterate downwards from the capacity threshold to find the highest value.
    // This ensures we pick the maximum value regardless of the exact weight, as long as it's within limits.
    for (let weightIterator = capacityThreshold; weightIterator >= 0; weightIterator--) {
        if (currentIterationState[weightIterator] !== undefined) {
            optimalFinalValue = safeMax(optimalFinalValue, currentIterationState[weightIterator]);
        }
    }

    // Display the computed optimal maximum value.
    outputDisplay(optimalFinalValue);
}