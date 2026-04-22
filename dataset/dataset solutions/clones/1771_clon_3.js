function assessAnimalPopulation(inputLine) {
    // This function evaluates if a given set of total creatures and total limbs
    // can be plausibly composed of two types of animals: one with 2 limbs, and another with 4 limbs.

    // Step 1: Deconstruct the raw input string.
    // The expected format is two space-separated integers: total heads and total legs.
    const inputComponents = inputLine.trim().split(" ");

    // Step 2: Implement a preliminary validation for the input structure.
    // This ensures that exactly two numerical values were provided, enhancing robustness.
    if (inputComponents.length !== 2) {
        // If the input format is incorrect, it's impossible to form a valid combination.
        return "No";
    }

    // Step 3: Convert the parsed string values into their numerical equivalents.
    // Using `parseInt` with a radix of 10 ensures correct conversion.
    const totalCreatureHeads = parseInt(inputComponents[0], 10);
    const aggregateLimbCount = parseInt(inputComponents[1], 10);

    // Step 4: Define fixed limb counts for the two hypothetical animal types.
    // Using named constants improves code clarity and maintainability.
    const twoLeggedAnimalLimbs = 2; // e.g., a bird or a snake (if it had 2 limbs)
    const fourLeggedAnimalLimbs = 4; // e.g., a mammal or a reptile

    // Step 5: Evaluate the necessary conditions for a possible combination.

    // Condition A: The total number of limbs must be an even number.
    // This is because both types of animals possess an even number of limbs (2 or 4).
    const isLimbTotalEvenlyDivisible = (aggregateLimbCount % twoLeggedAnimalLimbs === 0);

    // Condition B: The aggregate limb count cannot be less than the minimum possible.
    // The absolute minimum occurs if all creatures are of the two-legged variety.
    const isLimbTotalAtLeastMinimum = (aggregateLimbCount >= totalCreatureHeads * twoLeggedAnimalLimbs);

    // Condition C: The aggregate limb count cannot exceed the maximum possible.
    // The absolute maximum occurs if all creatures are of the four-legged variety.
    const isLimbTotalAtMostMaximum = (aggregateLimbCount <= totalCreatureHeads * fourLeggedAnimalLimbs);

    // The original code's calculation `2 * X - Y / 2` was essentially checking if `(4 * X - Y) / 2 >= 0`,
    // which simplifies to `4 * X >= Y`. This corresponds to `isLimbTotalAtMostMaximum`.
    // This Type III clone explicitly adds `isLimbTotalAtLeastMinimum`, completing the necessary range checks.

    // Step 6: Determine the final outcome based on all conditions.
    // If all conditions are simultaneously true, then such a combination of animals is possible.
    if (isLimbTotalEvenlyDivisible && isLimbTotalAtLeastMinimum && isLimbTotalAtMostMaximum) {
        return "Yes";
    } else {
        return "No";
    }
}

// Standard boilerplate for reading input from stdin in a Node.js environment.
// This part is separated from the core logic for better modularity.
const fileSystemAccess = require("fs");
const standardInputLocation = "/dev/stdin";
const textEncodingFormat = "utf8";

// Read the complete input from the specified source.
const completeInputContent = fileSystemAccess.readFileSync(standardInputLocation, textEncodingFormat);

// Invoke the main logic function with the acquired input and output its result.
console.log(assessAnimalPopulation(completeInputContent));