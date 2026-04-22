function computeAndDisplayMultiplicationFacts() {
    // Define the boundaries for our multiplication factors.
    const MIN_FACTOR_VALUE = 1; // The smallest number to be used as a factor.
    const MAX_FACTOR_VALUE = 9; // The largest number to be used as a factor.

    // Display a header message to indicate the start of the output.
    console.log("--- Initiating Multiplication Table Generation ---");
    console.log(""); // Add a blank line for readability.

    // Outer loop: iterates through the first operand (multiplier).
    // The loop condition ensures we go from MIN_FACTOR_VALUE up to MAX_FACTOR_VALUE.
    for (let primaryOperand = MIN_FACTOR_VALUE; primaryOperand <= MAX_FACTOR_VALUE; primaryOperand = primaryOperand + 1) {

        // Announce the current table being generated.
        console.log(`>>> Displaying table for ${primaryOperand} <<<`);

        // Inner loop: iterates through the second operand (multiplicand).
        // This loop also covers the full range from MIN_FACTOR_VALUE to MAX_FACTOR_VALUE.
        for (let secondaryOperand = MIN_FACTOR_VALUE; secondaryOperand < (MAX_FACTOR_VALUE + 1); secondaryOperand += 1) {

            // Perform the multiplication. Store the result in a temporary variable.
            const productResult = primaryOperand * secondaryOperand;

            // Construct the formatted output string using template literals.
            // This provides a clear and readable way to combine text and variables.
            const formattedOutput = `${primaryOperand} multiplied by ${secondaryOperand} yields ${productResult}`;

            // Output the calculated fact to the console.
            console.log(formattedOutput);
        }

        // Add a separator for better visual distinction between different primary operand tables.
        console.log("-----------------------------------------");
    }

    // Indicate the completion of the entire process.
    console.log("");
    console.log("--- Multiplication Table Generation Completed Successfully ---");
}

// Execute the function to generate and display the multiplication tables.
computeAndDisplayMultiplicationFacts();