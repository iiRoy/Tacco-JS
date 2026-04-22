// Type III clone of the original JavaScript code.
// This version applies extensive modifications, including renaming, restructuring,
// adding validations, and refactoring core logic, while preserving the original
// functional outcome.

// A central processing unit for numerical array operations.
function ProcessMatrixCalculations(inputPayload) {
    // Validate the input payload exists.
    if (!inputPayload || typeof inputPayload !== 'string') {
        console.error("Error: Input payload is missing or invalid.");
        return; // Exit if input is bad
    }

    // Split the entire input string into individual lines.
    // The first line contains dimension information, subsequent lines are data.
    const allInputLines = inputPayload.split('\n');

    // Ensure there's at least one line for dimensions.
    if (allInputLines.length === 0) {
        console.error("Error: No input lines provided.");
        return;
    }

    // Extract dimension string and parse it.
    const dimensionSpecifier = allInputLines[0];
    const dimensionTokens = dimensionSpecifier.split(' ').map(Number);

    // Validate that two numerical dimensions are provided.
    if (dimensionTokens.length !== 2 || dimensionTokens.some(isNaN)) {
        console.error("Error: Invalid dimension specification. Expected two numbers.");
        return;
    }

    // Assign parsed dimensions to descriptive variables.
    const primaryRowCount = dimensionTokens[0]; // Corresponds to 'n'
    const secondaryColCount = dimensionTokens[1]; // Corresponds to 'm'

    // Basic sanity checks for dimensions.
    if (primaryRowCount <= 0 || secondaryColCount <= 0) {
        console.error("Error: Matrix dimensions must be positive integers.");
        return;
    }

    // Remove the dimension line from the array of lines to process.
    // This leaves only the actual data rows.
    const dataContentLines = allInputLines.slice(1);

    // Verify that enough data lines are present for the specified dimensions.
    const expectedDataLines = primaryRowCount + secondaryColCount;
    if (dataContentLines.length < expectedDataLines) {
        console.error(`Error: Insufficient data lines. Expected ${expectedDataLines}, got ${dataContentLines.length}.`);
        return;
    }

    // --- Data Segregation and Parsing ---

    // The first 'primaryRowCount' lines form the 'left-hand' matrix (let's call it 'A').
    const matrixA = [];
    for (let currentAIndex = 0; currentAIndex < primaryRowCount; currentAIndex++) {
        const rowString = dataContentLines[currentAIndex];
        const parsedRow = rowString.split(' ').map(Number);

        // Validate each row of matrix A has the expected number of columns.
        if (parsedRow.length !== secondaryColCount || parsedRow.some(isNaN)) {
            console.error(`Error: Invalid data in matrix A row ${currentAIndex}. Expected ${secondaryColCount} numbers.`);
            return;
        }
        matrixA.push(parsedRow);
    }

    // The next 'secondaryColCount' lines form the 'right-hand' vector components (let's call it 'B').
    // We only care about the first element of each of these lines.
    const vectorBComponents = [];
    for (let currentBIndex = 0; currentBIndex < secondaryColCount; currentBIndex++) {
        const rowString = dataContentLines[primaryRowCount + currentBIndex];
        const parsedElements = rowString.split(' ').map(Number);

        // Validate that each 'vector B' line has at least one number.
        if (parsedElements.length === 0 || isNaN(parsedElements[0])) {
            console.error(`Error: Invalid data in vector B component ${currentBIndex}. Expected at least one number.`);
            return;
        }
        vectorBComponents.push(parsedElements[0]); // Extract only the first element
    }

    // --- Core Calculation: Matrix-Vector Product (effectively dot products) ---

    // This section computes the dot product of each row in matrixA with the vectorBComponents.
    // We use a functional approach for the transformation.
    const finalCalculatedOutputs = matrixA.map((rowOfMatrixA, currentOutputIndex) => {
        // For each row of matrixA, calculate its dot product with vectorBComponents.
        // Use 'reduce' for a concise sum of products.
        const individualDotProduct = rowOfMatrixA.reduce((accumulator, currentElementA, elementIndex) => {
            // Guard against potential index out of bounds, though dimensions should ensure this.
            if (elementIndex >= vectorBComponents.length) {
                 // This should ideally not happen if dimensions are correctly validated.
                 console.warn(`Warning: Mismatch in vector B length during dot product at index ${elementIndex}.`);
                 return accumulator;
            }
            return accumulator + (currentElementA * vectorBComponents[elementIndex]);
        }, 0); // Initialize accumulator for sum.
        return individualDotProduct;
    });

    // --- Output Generation ---
    // Join all calculated results with newline characters and print them.
    console.log(finalCalculatedOutputs.join('\n'));
}

// --- Execution Context ---
// This part handles reading the input from the standard input stream
// and passing it to our main processing function.
try {
    const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");
    ProcessMatrixCalculations(systemInput);
} catch (errorReadingInput) {
    // Provide a more informative error message if input reading fails.
    console.error("Failed to read input from /dev/stdin:", errorReadingInput.message);
}