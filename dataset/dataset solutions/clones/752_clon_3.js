const parseNumericInputString = (textLine) => {
    // Helper function to convert a string of space-separated numbers into an array of numbers.
    // It filters out any non-numeric results (like NaN from empty strings or invalid parsing).
    if (typeof textLine !== 'string') {
        return []; // Return an empty array if input isn't a string.
    }
    return textLine.trim().split(/\s+/).map(Number).filter(val => !isNaN(val));
};

const calculateOptimalCost = (
    itemCostA, itemCostB, individualPurchaseCostC,
    groupingThresholdD, groupUnitCostE,
    initialInventoryNA, initialInventoryNB, totalItemsNeededNC
) => {
    // This function encapsulates the core logic for determining the minimum cost
    // based on two distinct purchasing strategies.

    // Basic validation for numeric inputs to prevent unexpected behavior.
    if (![itemCostA, itemCostB, individualPurchaseCostC, groupingThresholdD, groupUnitCostE, initialInventoryNA, initialInventoryNB, totalItemsNeededNC]
        .every(p => typeof p === 'number' && !isNaN(p))) {
        console.error("Error: Non-numeric parameters supplied to calculateOptimalCost.");
        return; // Abort calculation if inputs are invalid.
    }

    // Ensure grouping threshold is positive to avoid division by zero or negative logic.
    // In competitive programming, D is typically positive, but this adds robustness.
    if (groupingThresholdD <= 0) {
        // Depending on problem specifics, this might mean no grouping, or an error.
        // For this clone, we'll assume valid D > 0 as per original problem context.
        // If D could be 0, the logic for remainder and full groups would require
        // significant re-evaluation. Let's proceed assuming D > 0.
    }

    // Determine the remainder of items after forming as many full groups as possible.
    const remainderItems = totalItemsNeededNC % groupingThresholdD;

    // --- Strategy 1: Purchase full groups, then individual items for the remainder ---
    // Start with the value of existing inventory.
    let currentTotalCostScenario1 = (initialInventoryNA * itemCostA) + (initialInventoryNB * itemCostB);

    // Calculate how many full groups can be formed.
    const numberOfFullGroups = Math.floor(totalItemsNeededNC / groupingThresholdD);

    // Add the cost for purchasing these full groups.
    currentTotalCostScenario1 += numberOfFullGroups * groupingThresholdD * groupUnitCostE;

    // Add the cost for the remaining items bought individually.
    currentTotalCostScenario1 += remainderItems * individualPurchaseCostC;


    // --- Strategy 2: Always ensure a full group is purchased, even if it means overshooting ---
    let currentTotalCostScenario2;

    // If the total items needed are already enough or more than a full group threshold.
    if (totalItemsNeededNC >= groupingThresholdD) {
        // In this scenario, we just buy all `totalItemsNeededNC` at the group unit cost.
        currentTotalCostScenario2 = (initialInventoryNA * itemCostA) + (initialInventoryNB * itemCostB) + (totalItemsNeededNC * groupUnitCostE);
    } else {
        // If `totalItemsNeededNC` is less than `groupingThresholdD`, we are forced to buy
        // a full group of `groupingThresholdD` items. This means we might need to adjust
        // our initial inventory (NA, NB) downwards to reflect the items replaced by the full group.

        // Calculate how many additional items are needed to reach a full group.
        const itemsToCompensate = groupingThresholdD - remainderItems;

        let availableNA = initialInventoryNA;
        let availableNB = initialInventoryNB;

        // Reduce from availableNB first, then availableNA to cover the 'itemsToCompensate'.
        // This is a Type III rewrite of the original while loop for efficiency and clarity.
        let remainingCompensation = itemsToCompensate;

        const nbReductionAmount = Math.min(availableNB, remainingCompensation);
        availableNB -= nbReductionAmount;
        remainingCompensation -= nbReductionAmount;

        if (remainingCompensation > 0) {
            const naReductionAmount = Math.min(availableNA, remainingCompensation);
            availableNA -= naReductionAmount;
            // No need to update remainingCompensation further, as it's fully covered or NA is exhausted.
        }

        // Calculate the cost with the adjusted inventory and the cost of one full group.
        currentTotalCostScenario2 = (availableNA * itemCostA) + (availableNB * itemCostB) + (groupingThresholdD * groupUnitCostE);
    }

    // Output the minimum cost found between the two strategies.
    console.log(Math.min(currentTotalCostScenario1, currentTotalCostScenario2));
};

const mainProcessingRoutine = () => {
    let rawFileContent;
    try {
        // Attempt to read the entire standard input synchronously.
        rawFileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (ioError) {
        console.error("Failed to read input from /dev/stdin:", ioError.message);
        return; // Exit if input cannot be read.
    }

    // Split the raw content into individual lines, filtering out any blank lines.
    const allInputLines = rawFileContent.split('\n').filter(line => line.trim().length > 0);

    let currentLinePointer = 0;
    // Loop through the input lines, processing two lines at a time.
    while (currentLinePointer < allInputLines.length) {
        // Extract the first segment of input for the current calculation block.
        const segmentOne = allInputLines[currentLinePointer].trim();

        // Check for the specific termination sequence ("0 0 0 0 0").
        // This is a more robust check than simple string comparison.
        const potentialTerminationValues = parseNumericInputString(segmentOne);
        if (potentialTerminationValues.length === 5 && potentialTerminationValues.every(val => val === 0)) {
            break; // Exit the loop if the termination sequence is found.
        }

        // Advance the pointer to get the second segment of input.
        currentLinePointer++;
        if (currentLinePointer >= allInputLines.length) {
            console.error("Error: Incomplete input block. Missing second line for current processing set.");
            break; // Break if there's no second line to process.
        }
        const segmentTwo = allInputLines[currentLinePointer].trim();

        // Combine both segments and parse all eight numeric parameters.
        const combinedParametersString = `${segmentOne} ${segmentTwo}`;
        const eightInputParameters = parseNumericInputString(combinedParametersString);

        // Validate that exactly 8 numbers were successfully parsed.
        if (eightInputParameters.length !== 8) {
            console.error(`Warning: Skipping malformed input at line ${currentLinePointer}. Expected 8 numbers, but found ${eightInputParameters.length}.`);
            currentLinePointer++; // Advance pointer to skip this malformed block.
            continue; // Continue to the next iteration of the loop.
        }

        // Call the core calculation function with the parsed parameters.
        // Using spread syntax for clear argument mapping.
        calculateOptimalCost(...eightInputParameters);

        // Advance the pointer to the start of the next input block (after the second segment).
        currentLinePointer++;
    }
};

// Initiate the main processing routine.
mainProcessingRoutine();