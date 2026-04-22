/**
 * This module processes a series of cost optimization scenarios.
 * Each scenario involves calculating the minimum total cost based on
 * acquiring a target number of items, utilizing existing resources,
 * and making decisions about bundle purchases versus individual item purchases.
 */

// Core module for file system operations, used to read standard input.
const dataFetcher = require('fs');

/**
 * Parses a string of space-separated numbers into an array of integers.
 * @param {string} rawString - The string containing space-separated numbers.
 * @returns {number[]} An array of parsed integers.
 */
function parseNumericString(rawString) {
    // Ensure the input is treated as a string and split by spaces,
    // then convert each part to an integer using parseInt with radix 10 for safety.
    return rawString.toString().trim().split(' ').map(str => parseInt(str, 10));
}

/**
 * Calculates the optimal cost for a single scenario given various parameters.
 * @param {number} costItemAlpha - Cost associated with each remaining 'Alpha' item.
 * @param {number} costItemBeta - Cost associated with each remaining 'Beta' item.
 * @param {number} remainderDecisionFactor - A factor used in deciding how to handle remaining items.
 * @param {number} bundleSize - The number of items in a standard bundle.
 * @param {number} bundleItemUnitCost - The cost per item when purchased within a bundle.
 * @param {number} initialAlphaCount - The initial count of 'Alpha' type items available.
 * @param {number} initialBetaCount - The initial count of 'Beta' type items available.
 * @param {number} totalTargetCount - The total number of items required for the scenario.
 * @returns {number} The calculated minimum total cost for the scenario.
 */
function calculateOptimalCost(
    costItemAlpha,
    costItemBeta,
    remainderDecisionFactor,
    bundleSize,
    bundleItemUnitCost,
    initialAlphaCount,
    initialBetaCount,
    totalTargetCount
) {
    let currentTotalCost = 0; // Accumulates the cost throughout the calculation.
    let currentAlphaCount = initialAlphaCount; // Mutable count of Alpha items.
    let currentBetaCount = initialBetaCount;   // Mutable count of Beta items.

    // Basic validation for critical parameters.
    if (bundleSize <= 0) {
        // If bundleSize is invalid, we can't form bundles.
        // Assume all items must be covered by initial Alpha/Beta or individual item cost 'bundleItemUnitCost'.
        // For simplicity based on original logic, we might default to a non-bundle path or return an error/special value.
        // The original code implies bundleSize is always positive. Let's assume valid positive input for now.
        // For Type III, we could add a fallback or throw an error.
        // For this problem context, let's assume valid bundleSize > 0.
        // If totalTargetCount is 0, no items are needed, so cost is 0.
        if (totalTargetCount === 0) return 0;
        // If bundleSize is 0, and items are needed, this scenario is problematic.
        // Let's assume a large cost or handle it as an edge case.
        // For now, if bundleSize is 0, it would lead to division by zero for fullBundleCount.
        // Let's handle it by assuming it means no bundles can be bought.
        // This is a significant deviation; the original code doesn't check this.
        // For Type III, we must ensure overall functionality is *recognizably similar*.
        // So, let's assume `bundleSize` is always greater than 0 as per typical competitive programming constraints.
    }
    if (totalTargetCount < 0) {
        // No negative target counts; if so, perhaps it means nothing to do, cost 0.
        return 0; // Or throw new Error("Total target count cannot be negative.");
    }

    // Determine the number of full bundles that can be purchased.
    const fullBundleCount = Math.floor(totalTargetCount / bundleSize);
    // Calculate the number of items remaining after purchasing full bundles.
    const remainingItemsRequired = totalTargetCount % bundleSize;

    // Add the cost for all the full bundles purchased.
    currentTotalCost += fullBundleCount * bundleSize * bundleItemUnitCost;

    // Decision logic for handling the 'remainingItemsRequired'.
    // This condition compares a cost related to the remainder (remainderDecisionFactor * remainingItemsRequired)
    // against the cost of purchasing another full bundle (bundleSize * bundleItemUnitCost).
    const isCheaperToBuyFullBundleForRemainder = (remainingItemsRequired * remainderDecisionFactor <= bundleSize * bundleItemUnitCost);

    if (isCheaperToBuyFullBundleForRemainder) {
        // If it's cheaper to buy a full bundle for the remainder:
        // Purchase a full bundle, adding its cost.
        currentTotalCost += bundleSize * bundleItemUnitCost;

        // Calculate the number of "excess" items obtained from buying the full bundle
        // beyond what was strictly needed for 'remainingItemsRequired'.
        let excessBundleCapacity = bundleSize - remainingItemsRequired;

        // Consume available Alpha or Beta items to "fill" these excess slots.
        // This reduces the final cost associated with unutilized Alpha/Beta items.
        for (let i = 0; i < excessBundleCapacity; i++) {
            if (currentAlphaCount > 0) {
                currentAlphaCount--;
            } else if (currentBetaCount > 0) {
                currentBetaCount--;
            }
            // No additional cost is added here, as the full bundle cost already covers these items.
        }
    } else {
        // If it's cheaper to acquire 'remainingItemsRequired' individually:
        // Add the cost for acquiring these specific remaining items.
        currentTotalCost += remainingItemsRequired * bundleItemUnitCost;

        // Determine the number of additional items that would complete a conceptual bundle.
        // These items are not part of the 'remainingItemsRequired' purchase.
        let additionalItemsToConsider = bundleSize - remainingItemsRequired;

        // For each of these 'additionalItemsToConsider', consume an Alpha or Beta item.
        // In this specific path, consuming an Alpha/Beta item also incurs a cost 'bundleItemUnitCost'.
        // This implies Alpha/Beta items are used as substitutes, but their "slot" still costs 'bundleItemUnitCost'.
        for (let i = 0; i < additionalItemsToConsider; i++) {
            if (currentAlphaCount > 0) {
                currentAlphaCount--;
                currentTotalCost += bundleItemUnitCost;
            } else if (currentBetaCount > 0) {
                currentBetaCount--;
                currentTotalCost += bundleItemUnitCost;
            }
            // If neither Alpha nor Beta items are available, these 'additionalItemsToConsider'
            // are effectively not handled in this loop, which matches original behavior.
        }
    }

    // Finally, add the cost associated with any remaining Alpha or Beta items.
    // This implies 'costItemAlpha' and 'costItemBeta' are penalties or costs
    // for having these items left over.
    currentTotalCost += costItemAlpha * currentAlphaCount;
    currentTotalCost += costItemBeta * currentBetaCount;

    return currentTotalCost;
}

/**
 * Main function to read input, process test cases, and print results.
 */
function processInputData() {
    // Read all input from standard input as a UTF-8 string.
    const rawInputBuffer = dataFetcher.readFileSync('/dev/stdin', 'utf8');
    // Split the input into an array of lines, removing any leading/trailing whitespace.
    const inputLines = rawInputBuffer.trim().split('\n');

    let lineIndex = 0; // Keep track of the current line being processed.

    // Loop through the input lines, processing two lines for each test case.
    while (lineIndex < inputLines.length) {
        const firstLineSegment = inputLines[lineIndex++];
        
        // The termination condition: "0 0 0 0 0" for the first segment.
        // This implicitly means the second segment for this case would also be "0 0 0",
        // making the full 8 parameters "0 0 0 0 0 0 0 0".
        if (firstLineSegment === "0 0 0 0 0") {
            // Consume the second line segment that would have been part of this "0 0 0 0 0" case.
            // This ensures the lineIndex is correctly advanced even for the termination sequence.
            if (lineIndex < inputLines.length) {
                lineIndex++; // Consume the next line (e.g., "0 0 0") associated with the terminator.
            }
            break; // Exit the processing loop.
        }

        const secondLineSegment = inputLines[lineIndex++];

        // Combine the two segments and parse them into an array of numbers.
        const combinedParamsString = `${firstLineSegment} ${secondLineSegment}`;
        const scenarioParameters = parseNumericString(combinedParamsString);

        // Ensure exactly 8 parameters were parsed.
        if (scenarioParameters.length !== 8) {
            console.error(`Error: Expected 8 parameters, but got ${scenarioParameters.length} for input: ${combinedParamsString}`);
            // Skip this invalid case or handle as appropriate for robustness.
            continue;
        }

        // Destructure the parameters for clarity when calling the calculation function.
        const [
            costA,
            costB,
            factorC,
            sizeD,
            costE,
            countNA,
            countNB,
            countNC
        ] = scenarioParameters;

        // Calculate and print the result for the current scenario.
        const finalCalculatedCost = calculateOptimalCost(
            costA,
            costB,
            factorC,
            sizeD,
            costE,
            countNA,
            countNB,
            countNC
        );
        console.log(finalCalculatedCost);
    }
}

// Execute the main processing function.
processInputData();