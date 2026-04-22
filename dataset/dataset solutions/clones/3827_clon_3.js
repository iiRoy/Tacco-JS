// This function is responsible for safely converting a raw string input into a numerical limit.
function parseInputToNumber(inputString) {
    // Defensive check: Ensure the input is treated as a string before trimming.
    const cleanedString = (inputString || '').trim();

    // Perform the integer conversion using radix 10.
    const numericValue = Number.parseInt(cleanedString, 10);

    // Validate the parsed number. If it's not a number or is non-positive,
    // return a default safe value (e.g., 1) to prevent errors or unexpected behavior.
    // This acts as a guard clause for invalid inputs.
    if (Number.isNaN(numericValue) || numericValue < 1) {
        return 1; // A minimum positive value to ensure subsequent logic has a valid bound.
    }
    return numericValue;
}

// This primary function orchestrates the generation and collection of power values.
function processNumericalInput(inputStringContent) {
    // Define symbolic constants for loop boundaries to improve code clarity and maintainability.
    const MIN_BASE_FOR_CALCULATION = 2;
    const MIN_EXPONENT_FOR_CALCULATION = 2;
    const MAX_EXPONENT_FOR_CALCULATION = 10;

    // First, process the raw input string to get the numerical upper bound.
    const upperLimitForPowers = parseInputToNumber(inputStringContent);

    // Initialize a Set to store all unique computed power values.
    // Using a Set inherently handles the uniqueness requirement.
    let collectionOfUniquePowers = new Set();

    // It's crucial to include '1' in the collection. This ensures that even for very small
    // upper limits (e.g., less than 4), Math.max will have a value to compare against,
    // and '1' is often considered a base case in power-related problems.
    collectionOfUniquePowers.add(1);

    // Outer loop: Iterates through various exponent values.
    // This loop structure is an alternative to the original's 'j' loop.
    for (let currentExponent = MIN_EXPONENT_FOR_CALCULATION; currentExponent <= MAX_EXPONENT_FOR_CALCULATION; ++currentExponent) {
        // Inner loop: Iterates through different base values for the current exponent.
        // The termination condition is now handled inside the loop for more flexibility.
        for (let currentBase = MIN_BASE_FOR_CALCULATION; ; ++currentBase) {
            // Calculate the power using Math.pow, which is an explicit function for this operation.
            const computedPowerResult = Math.pow(currentBase, currentExponent);

            // Check if the newly computed power exceeds our defined upper limit.
            // If it does, all subsequent powers with an increasing base (for this exponent)
            // will also exceed the limit, so we can break out of the inner loop.
            if (computedPowerResult > upperLimitForPowers) {
                break; // Terminate the inner loop for the current exponent.
            }

            // If the power is within bounds, add it to our set of unique results.
            collectionOfUniquePowers.add(computedPowerResult);
        }
    }

    // Convert the Set into an array. This is an intermediate step required
    // for using Math.max with a spread operator, or for other array operations.
    const finalSetOfNumbers = Array.from(collectionOfUniquePowers);

    // Determine the highest value present in our collection.
    // A fallback to 0 is included, although '1' being added initially prevents an empty array.
    const overallMaximumValue = finalSetOfNumbers.length > 0
        ? Math.max(...finalSetOfNumbers)
        : 0; // Should not be reached if '1' is always added.

    // Output the final, largest calculated power to the standard console.
    console.log(overallMaximumValue);
}

// This is the entry point of the script, handling file system interaction.
// It reads the content from standard input and passes it to our main processing function.
processNumericalInput(require('fs').readFileSync('/dev/stdin', 'utf8'));