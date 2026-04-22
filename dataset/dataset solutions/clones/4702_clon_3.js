function processInputData(rawData) {
    // Define constant requirements for different combination types to improve readability and maintainability.
    const PRIMARY_COMPONENT_FOR_TYPE1 = 1;
    const SECONDARY_COMPONENT_FOR_TYPE1 = 2;
    const SECONDARY_COMPONENT_FOR_TYPE2 = 4;

    // Safely convert raw input to string, remove leading/trailing whitespace, and split by any sequence of spaces.
    const inputParts = String(rawData).trim().split(/\s+/);

    // Implement a guard clause for invalid input format.
    // This fragment adds robustness not present in the original.
    if (inputParts.length !== 2) {
        console.error("Error: Input data must consist of exactly two numbers separated by space.");
        return;
    }

    // Parse the component counts. Using parseInt with radix for explicit base.
    let availablePrimaryItems = parseInt(inputParts[0], 10);
    let availableSecondaryItems = parseInt(inputParts[1], 10);

    // Another guard clause: validate parsed numbers are non-negative integers.
    if (isNaN(availablePrimaryItems) || isNaN(availableSecondaryItems) || availablePrimaryItems < 0 || availableSecondaryItems < 0) {
        console.error("Error: Input values must be non-negative integers.");
        return;
    }

    // Initialize an accumulator for the final count of constructed units.
    let totalConstructedUnits = 0;

    // --- Phase 1: Construct units using both primary and secondary components ---
    // This strategy is prioritized as it utilizes the primary component.
    // Each unit of this type consumes PRIMARY_COMPONENT_FOR_TYPE1 primary and SECONDARY_COMPONENT_FOR_TYPE1 secondary components.
    // Instead of an iterative loop, calculate the maximum possible units directly.
    // The number of units is limited by the minimum of what primary and secondary components can support.
    const maxPossibleType1Units = Math.min(
        Math.floor(availablePrimaryItems / PRIMARY_COMPONENT_FOR_TYPE1),
        Math.floor(availableSecondaryItems / SECONDARY_COMPONENT_FOR_TYPE1)
    );

    // Add the calculated units to the total.
    totalConstructedUnits += maxPossibleType1Units;

    // Update the counts of available components after forming Type 1 units.
    availablePrimaryItems -= maxPossibleType1Units * PRIMARY_COMPONENT_FOR_TYPE1;
    availableSecondaryItems -= maxPossibleType1Units * SECONDARY_COMPONENT_FOR_TYPE1;

    // --- Phase 2: Construct units using only secondary components ---
    // After exhausting the primary components (or secondary components needed for Type 1 units),
    // utilize any remaining secondary components to form Type 2 units.
    // Each unit of this type requires SECONDARY_COMPONENT_FOR_TYPE2 secondary components.
    // Again, a direct calculation replaces the iterative loop.
    const maxPossibleType2Units = Math.floor(availableSecondaryItems / SECONDARY_COMPONENT_FOR_TYPE2);

    // Add these units to the overall total.
    totalConstructedUnits += maxPossibleType2Units;

    // The remaining `availableSecondaryItems` (less than SECONDARY_COMPONENT_FOR_TYPE2) are insufficient
    // for forming another unit and are thus ignored.

    // Output the final computed result to the console.
    console.log(totalConstructedUnits);
}

// Example invocation for testing purposes, kept commented as per original style.
// processInputData("12345 678901");

// Standard input handling for competitive programming environments.
// It's good practice to assign `require("fs")` to a variable for clarity.
const fileSystemUtility = require("fs");
const standardInputBuffer = fileSystemUtility.readFileSync("/dev/stdin", "utf8");
processInputData(standardInputBuffer);