// Constants defining the range for the multiplication table factors.
const MIN_MULTIPLIER_VALUE = 1; // Starting value for factors.
const MAX_MULTIPLIER_VALUE = 9; // Ending value for factors.

// A dedicated array to accumulate all the formatted multiplication expressions
// before they are finally displayed. This acts as an intermediate storage.
let generatedProductStrings = [];

// A simple counter to keep track of how many individual multiplication operations
// have been performed throughout the process.
let operationCount = 0;

// Outer iteration loop: controls the first number in the multiplication.
// The variable name 'i' from the original code has been renamed to 'currentPrimaryFactor'.
for (let currentPrimaryFactor = MIN_MULTIPLIER_VALUE; currentPrimaryFactor <= MAX_MULTIPLIER_VALUE; currentPrimaryFactor++) {

    // For each primary factor, we'll collect all its results into a temporary row.
    // This is an added intermediate data structure.
    let temporaryRowCollection = [];

    // Inner iteration loop: controls the second number in the multiplication.
    // The variable name 'j' from the original code has been renamed to 'currentSecondaryFactor'.
    for (let currentSecondaryFactor = MIN_MULTIPLIER_VALUE; currentSecondaryFactor <= MAX_MULTIPLIER_VALUE; currentSecondaryFactor++) {

        // Calculate the product. This is an explicit intermediate step.
        let calculatedProduct = currentPrimaryFactor * currentSecondaryFactor;

        // Construct the output string using a template literal.
        // This is a rewrite of the original string concatenation.
        let formattedExpression = `${currentPrimaryFactor} multiplied by ${currentSecondaryFactor} equals ${calculatedProduct}`;

        // Add the formatted string to our temporary row collection.
        temporaryRowCollection.push(formattedExpression);

        // Increment the total operations counter.
        operationCount++;
    }

    // Once the inner loop completes for a primary factor, add its entire row of results
    // to the main collection of generated product strings.
    generatedProductStrings.push(temporaryRowCollection);
}

// --- Output Phase ---
// The original immediate console.log has been removed and replaced by
// a separate, distinct phase for printing the collected results.

console.log("--- Comprehensive Multiplication Table Display ---"); // Added a new introductory message.
console.log("This table shows products from " + MIN_MULTIPLIER_VALUE + " to " + MAX_MULTIPLIER_VALUE + "."); // Another new fragment.

let displayIndex = 1; // Helper variable for numbering output entries.

// Iterate through the collected rows of multiplication results.
for (const productRow of generatedProductStrings) {
    // Iterate through each individual multiplication entry within the current row.
    for (const singleEntry of productRow) {
        // Log each entry to the console, prefixed with an incrementing index.
        // The output format is also slightly altered.
        console.log(`Entry #${displayIndex.toString().padStart(3, '0')}: ${singleEntry}`);
        displayIndex++;
    }
}

// Final summary message, utilizing the operation counter.
console.log(`--- End of table. Total expressions processed: ${operationCount} ---`);
console.log("Thank you for using the enhanced multiplication generator!"); // Another concluding fragment.