// This module processes raw text data to perform a specific calculation.
// It expects two lines of input:
// 1. Configuration parameters (two space-separated integers)
// 2. A list of space-separated numbers

function ProcessInputData(rawDataPayload) {
    // Split the entire payload into individual lines.
    const dataLines = rawDataPayload.split('\n');

    // Basic input validation: ensure we have at least two lines.
    if (dataLines.length < 2) {
        console.error("Error: Input data payload must contain at least two lines.");
        return; // Exit if input is malformed.
    }

    // Parse the first line to extract configuration values.
    const configParameters = dataLines[0].split(' ');
    
    // Ensure config parameters are valid numbers.
    const elementCount = parseInt(configParameters[0], 10);
    const maximumThreshold = parseInt(configParameters[1], 10);

    if (isNaN(elementCount) || isNaN(maximumThreshold)) {
        console.error("Error: Configuration parameters must be valid integers.");
        return;
    }

    // Define a constant for the scaling factor.
    const SCALING_FACTOR = 0.5; // Represents 'half'

    // Parse the second line which contains the array of numbers.
    const rawNumberStrings = dataLines[1].split(' ');
    
    // Transform the raw number strings into an array of scaled numeric values.
    // We only process up to 'elementCount' items as specified in the config.
    let scaledNumericCollection = [];
    // Using a traditional for loop for structural change from map.
    for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
        const valueToScale = parseFloat(rawNumberStrings[currentIdx]);
        if (isNaN(valueToScale)) {
            console.error(`Warning: Non-numeric value encountered at index ${currentIdx}. Skipping.`);
            // Depending on requirements, one might push a default value or throw an error.
            // For this clone, we'll continue to the next iteration.
            continue; 
        }
        scaledNumericCollection.push(valueToScale * SCALING_FACTOR);
    }

    // Guard clause: If no valid numbers were processed, the product would be 1 (multiplicative identity).
    // If elementCount is 0, then the product effectively starts at 1.
    // If maximumThreshold is 1 or less, the loop won't run, resulting in 0.
    // If maximumThreshold is greater than 1, and the product is 1, the loop might run.
    // However, if there are genuinely no elements to process (elementCount is 0),
    // the product should effectively be 1, and the count should be 0 unless max is 0 or less.
    // Let's explicitly handle the case where no numbers were processed.
    if (elementCount === 0 || scaledNumericCollection.length === 0) {
        console.log(0); 
        return;
    }

    // Calculate the product of all scaled values.
    // Using an explicit initial value for robustness with potentially empty arrays (though checked above).
    let currentProductAccumulator = scaledNumericCollection.reduce((accumulator, currentValue) => {
        // Intermediate step: This could include logging or an additional check.
        // For example, ensuring currentValue is not zero if division were involved.
        return accumulator * currentValue;
    }, 1.0); // Explicitly starting with a float to maintain precision.

    // Initialize a counter for the growth operations.
    let growthOperationCount = 0;

    // Loop to repeatedly double the accumulated product until it exceeds the threshold.
    // Added a safety break for extremely large loops (Type III addition).
    const MAX_ITERATIONS_SAFETY_LIMIT = 1000000; 
    let iterationGuard = 0;

    while (maximumThreshold > currentProductAccumulator) {
        // Prevent infinite loops in edge cases or very large thresholds.
        // This is a defensive programming addition.
        if (iterationGuard >= MAX_ITERATIONS_SAFETY_LIMIT) {
            console.warn("Warning: Maximum iteration safety limit reached. Breaking loop to prevent resource exhaustion.");
            break; 
        }
        
        currentProductAccumulator *= 2; // Double the product.
        growthOperationCount++; // Increment the counter.
        iterationGuard++; // Increment safety guard.
    }
 
    // Output the final count of growth operations.
    console.log(growthOperationCount);
}

// Do not modify the following line; it handles standard input/output.
// This part ensures the script can be run in competitive programming environments
// by reading from stdin and calling the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));