// Configuration for verbose output during execution
const enableDetailedLogging = false;

/**
 * Converts a string of space-separated numerical tokens into an array of integers.
 * It trims each token and attempts to parse it as an integer, discarding any non-numeric results.
 *
 * @param {string} numericString - The input string containing numbers separated by spaces.
 * @returns {number[]} An array of parsed integer values.
 */
function parseIntegerSequence(numericString) {
    if (typeof numericString !== 'string' || numericString.trim() === '') {
        if (enableDetailedLogging) console.warn("Attempted to parse an empty or non-string sequence.");
        return [];
    }
    return numericString.split(" ").map(token => {
        const trimmedToken = token.trim();
        return trimmedToken === '' ? NaN : parseInt(trimmedToken, 10);
    }).filter(val => !isNaN(val)); // Filter out any elements that failed parsing
}

/**
 * Main function to process raw input and compute a cumulative score.
 * This simulates a resource allocation challenge where a primary set of resources
 * is consumed by a set of requirements, with a unique spill-over mechanism
 * to subsequent resources if the current one is insufficient.
 *
 * @param {string} rawInputContent - The entire raw string read from standard input.
 */
function computeCumulativeScore(rawInputContent) {
    // Normalize input: trim whitespace and split into individual lines
    const processedInputLines = rawInputContent.trim().split("\n");

    // Validate the minimum number of input lines required for data
    const MIN_REQUIRED_LINES = 3; // Typically: 1st line (N, M), 2nd line (array A), 3rd line (array B)
    if (processedInputLines.length < MIN_REQUIRED_LINES) {
        if (enableDetailedLogging) console.error(`Error: Insufficient input lines. Expected at least ${MIN_REQUIRED_LINES}, got ${processedInputLines.length}.`);
        console.log(0); // Output 0 for malformed or incomplete input
        return;
    }

    // Parse the two primary data arrays from the second and third lines
    const primaryResourceInventory = parseIntegerSequence(processedInputLines[1]);
    const consumptionDemands = parseIntegerSequence(processedInputLines[2]);

    // Perform a quick check on the parsed arrays' integrity
    if (primaryResourceInventory.length === 0 || consumptionDemands.length === 0) {
        if (enableDetailedLogging) console.error("Error: One or both data arrays are empty after parsing.");
        console.log(0); // Output 0 if data arrays are empty
        return;
    }

    // Create a mutable copy of the primary resource inventory for in-place modifications
    const currentMutableResources = [...primaryResourceInventory];

    let finalAccumulatedScore = 0; // The variable to hold the computed total score

    if (enableDetailedLogging) {
        console.log("Initial Resource Inventory:", currentMutableResources);
        console.log("Consumption Demands:", consumptionDemands);
    }

    // Iterate through each consumption demand to apply resource allocation logic
    for (let currentDemandIndex = 0; currentDemandIndex < consumptionDemands.length; currentDemandIndex++) {
        const demandAmount = consumptionDemands[currentDemandIndex];
        const availableCurrentResource = currentMutableResources[currentDemandIndex] || 0; // Default to 0 if resource doesn't exist

        // Guard clause for non-positive demands
        if (demandAmount <= 0) {
            if (enableDetailedLogging) console.warn(`Warning: Non-positive demand (${demandAmount}) at index ${currentDemandIndex}. Skipping.`);
            continue;
        }

        if (enableDetailedLogging) {
            console.log(`\n--- Processing demand at index ${currentDemandIndex} (Value: ${demandAmount}) ---`);
            console.log(`Available resource at current position: ${availableCurrentResource}`);
        }

        // --- Allocation Logic ---
        if (availableCurrentResource >= demandAmount) {
            // Scenario 1: The current resource is fully sufficient to meet the demand.
            finalAccumulatedScore += demandAmount;
            // No need to deduct from currentMutableResources[currentDemandIndex] as it doesn't affect subsequent calculations
            // for this specific problem's logic. If it did, we'd do: currentMutableResources[currentDemandIndex] -= demandAmount;
            if (enableDetailedLogging) {
                console.log(`Case A: Current resource (${availableCurrentResource}) fully covers demand. Added ${demandAmount}. Score: ${finalAccumulatedScore}`);
            }
        } else {
            // Scenario 2: The current resource is insufficient. A spill-over mechanism is activated.
            const remainingDemand = demandAmount - availableCurrentResource;
            const nextResourcePosition = currentDemandIndex + 1;
            const availableNextResource = currentMutableResources[nextResourcePosition] || 0; // Default to 0 if no next resource

            if (enableDetailedLogging) {
                console.log(`Current resource (${availableCurrentResource}) insufficient. Remaining demand: ${remainingDemand}`);
                console.log(`Available resource at next position (${nextResourcePosition}): ${availableNextResource}`);
            }

            if (remainingDemand <= availableNextResource) {
                // Scenario 2B: The next available resource can cover the remaining demand.
                finalAccumulatedScore += demandAmount; // The entire demand is met.
                currentMutableResources[nextResourcePosition] -= remainingDemand; // Deduct from the next resource.
                if (enableDetailedLogging) {
                    console.log(`Case B: Next resource (${availableNextResource}) covers remaining demand. Added ${demandAmount}. Next resource reduced by ${remainingDemand}. Score: ${finalAccumulatedScore}`);
                    console.log("Updated resources:", currentMutableResources);
                }
            } else {
                // Scenario 2C: Both current and next resources (if available) are insufficient.
                // Use up the current resource entirely.
                finalAccumulatedScore += availableCurrentResource;

                // If a next resource actually exists in the inventory, use it up entirely as well.
                if (nextResourcePosition < currentMutableResources.length) {
                    finalAccumulatedScore += availableNextResource;
                    currentMutableResources[nextResourcePosition] = 0; // Mark next resource as fully depleted.
                    if (enableDetailedLogging) {
                        console.log(`Case C: Both current (${availableCurrentResource}) and next (${availableNextResource}) resources consumed. Added ${availableCurrentResource + availableNextResource}. Next resource set to 0. Score: ${finalAccumulatedScore}`);
                    }
                } else {
                    // No next resource was available to contribute further.
                    if (enableDetailedLogging) {
                        console.log(`Case C (No Next): Only current resource (${availableCurrentResource}) consumed as no next resource was available. Added ${availableCurrentResource}. Score: ${finalAccumulatedScore}`);
                    }
                }
                if (enableDetailedLogging) {
                    console.log("Updated resources:", currentMutableResources);
                }
            }
        }
    }

    // Output the final calculated accumulated score
    console.log(finalAccumulatedScore);
}

// Entry point for execution: Read from standard input and invoke the processing function.
computeCumulativeScore(require("fs").readFileSync("/dev/stdin", "utf8"));