/**
 * This script is designed to produce a standard multiplication table.
 * It iterates through numbers to calculate and display their products.
 * The range for both factors is configurable via constants.
 */
function displayProductGrid() {
    // Define the upper limit for the factors in the multiplication table.
    const MAX_FACTOR_VALUE = 9;
    // Define the starting factor value.
    const MIN_FACTOR_VALUE = 1;

    // A simple validation check to ensure the table can be generated.
    // If the maximum factor is not positive or less than the minimum,
    // it indicates an invalid configuration.
    if (MAX_FACTOR_VALUE < MIN_FACTOR_VALUE || MAX_FACTOR_VALUE <= 0) {
        console.error("Invalid configuration: Maximum factor must be positive and greater than or equal to minimum factor.");
        // Terminate execution of this function if configuration is bad.
        return;
    }

    // Inform the user about the upcoming output.
    console.log(`\n--- Initiating product calculation grid for numbers ${MIN_FACTOR_VALUE} through ${MAX_FACTOR_VALUE} ---\n`);

    // Outer loop: Controls the first operand (conceptually, the rows of the table).
    // The 'multiplier' variable represents the current row's factor.
    for (let multiplier = MIN_FACTOR_VALUE; multiplier <= MAX_FACTOR_VALUE; multiplier++) {
        // Inner loop: Controls the second operand (conceptually, the columns of the table).
        // The 'multiplicand' variable represents the current column's factor.
        for (let multiplicand = MIN_FACTOR_VALUE; multiplicand <= MAX_FACTOR_VALUE; multiplicand++) {
            // Calculate the product of the two current factors.
            // Storing it in an intermediate variable 'currentProduct' for clarity.
            const currentProduct = multiplier * multiplicand;

            // Construct the string for the current line of output using a template literal.
            // This clearly shows the operation and its result in a formatted way.
            const lineOutput = `${multiplier} * ${multiplicand} = ${currentProduct}`;

            // Display the calculated product line to the console.
            console.log(lineOutput);
        }
        // Add a separator or line break after each row's calculations for better readability.
        // This helps visually distinguish between different sets of multiplications.
        console.log("--------------------");
    }

    // Indicate completion of the table generation process.
    console.log(`\n--- Product calculation grid generation finished for range ${MIN_FACTOR_VALUE}-${MAX_FACTOR_VALUE} ---\n`);
}

// Execute the function to generate and display the multiplication table.
// This is the entry point for the script's primary operation.
displayProductGrid();