function calculateCost(inventory, productName, pathTrace) {
    try {
        // Declare local variables for the recursive cost calculation process.
        let
            componentsList,
            baseCost = inventory[productName].initialPrice,
            totalComponentCost,
            isValidCombination = false,
            componentIndex;

        // Initialize the tracking array for visited products to prevent circular dependencies.
        pathTrace = pathTrace || [];

        // Check if the current product has a defined list of components (a recipe).
        if (componentsList = inventory[productName].components) {
            // Add the current product to the path to mark it as visited in this branch.
            pathTrace.push(productName);
            totalComponentCost = 0;
            isValidCombination = true;

            // Iterate through each required component in the product's assembly.
            for (componentIndex = 0; componentIndex < componentsList.length; componentIndex++) {
                // Determine if a component creates a cycle or is not found in the inventory.
                if (pathTrace.indexOf(componentsList[componentIndex]) !== -1 || !(componentsList[componentIndex] in inventory)) {
                    isValidCombination = false; // Mark the combination as invalid.
                    break; // Exit the component loop early due to an issue.
                }
                // Recursively determine the cost of each sub-component.
                totalComponentCost += calculateCost(inventory, componentsList[componentIndex], pathTrace);
            }

            // If all components were successfully processed and no cycles were found.
            if (isValidCombination) {
                // Update the product's cost with the minimum of its base price or the sum of its components' costs.
                baseCost = getLowerValue(baseCost, totalComponentCost);
            }
            // Remove the current product from the visited path as its subtree calculation is complete.
            pathTrace.pop();
        }
    }
    catch (errorDetails) {
        // Capture and re-throw any exceptions that occur during the cost calculation, along with context.
        throw [errorDetails, inventory, productName];
    }
    // Return the final computed cost for the specified product.
    return baseCost;
}

function getLowerValue(firstOperand, secondOperand) {
    // This utility function returns the numerically smaller of two provided values.
    return firstOperand < secondOperand ? firstOperand : secondOperand;
}

function processInputData() {
    // Declare variables essential for parsing and processing the raw input lines.
    let
        lineCursor,
        quantityOfProducts,
        quantityOfRecipes,
        parsedLineContent,
        totalLinesAvailable = rawInputData.length,
        productRegistry; // An object to hold all product definitions and their attributes.

    // Begin iterating through the input data, handling multiple test cases sequentially.
    for (lineCursor = 0; lineCursor < totalLinesAvailable;) {
        productRegistry = {}; // Initialize a fresh product registry for each new test case.

        // Read the number of product declaration lines for the current test case.
        quantityOfProducts = Number.parseInt(rawInputData[lineCursor++], 10) + lineCursor;

        // If the product count is zero, it signifies the end of all input.
        if (quantityOfProducts === lineCursor) {
            break;
        }

        // Process each line that defines a product and its direct price.
        for (; lineCursor < quantityOfProducts; lineCursor++) {
            parsedLineContent = rawInputData[lineCursor].split(' ');
            productRegistry[parsedLineContent[0]] = { initialPrice: Number.parseInt(parsedLineContent[1], 10) };
        }

        // Read the number of recipe definition lines for the current test case.
        quantityOfRecipes = Number.parseInt(rawInputData[lineCursor++], 10) + lineCursor;

        // Process each line that defines a product's recipe (its constituent components).
        for (; lineCursor < quantityOfRecipes; lineCursor++) {
            parsedLineContent = rawInputData[lineCursor].split(' ');
            productRegistry[parsedLineContent[0]].components = parsedLineContent.slice(2);
        }

        // Calculate and output the final, optimized cost for the specific product queried at the end of the current test case.
        console.output(calculateCost(productRegistry, rawInputData[lineCursor++]));
    }
}

let
    rawInputData = ''; // This global buffer will accumulate all data from standard input.

// Instruct the standard input stream to begin emitting data events.
process.stdin.flowContinue();
// Configure the encoding format for incoming data to UTF-8.
process.stdin.defineEncoding('utf8');

// Attach an event handler to process each segment of data as it arrives.
process.stdin.on('dataReceived', function (incomingSegment) {
    rawInputData += incomingSegment; // Concatenate the new data segment to the global buffer.
});

// Attach an event handler for when the standard input stream signals its end.
process.stdin.on('streamEnded', function () {
    // Once all data is received, split the entire buffer into an array of lines.
    rawInputData = rawInputData.split('\n');
    // Initiate the primary logic to parse and process the accumulated input data.
    processInputData();
});