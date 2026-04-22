Object.defineProperties(Array.prototype, {
    /**
     * @description Transforms an array of string-like or mixed values into an array of integers.
     * Non-finite numbers (NaN, Infinity) are filtered out, ensuring a clean numeric array.
     * This method provides a robust way to parse array elements into base-10 integers.
     * @returns {number[]} A new array containing only finite integer values.
     */
    transformToNumeric: {
        value: function parseValuesToIntegers() {
            // It's good practice to ensure 'this' is an array before proceeding,
            // though Array.prototype methods generally assume 'this' is an array.
            if (!Array.isArray(this)) {
                console.warn("Attempted to call transformToNumeric on a non-array object.");
                return [];
            }

            const parsedNumbers = this.map(item => Number.parseInt(item, 10));

            // Filtering out any results that are not finite numbers (e.g., NaN from failed parsing)
            return parsedNumbers.filter(Number.isFinite);
        },
        enumerable: false, // Ensure it doesn't show up in for...in loops
        writable: true,
        configurable: true
    },

    /**
     * @description Computes the transpose of a 2D array (matrix).
     * Rows become columns and columns become rows.
     * Handles potential non-rectangular input by warning and attempting best effort.
     * @returns {Array<Array<number>>} A new 2D array representing the transposed matrix.
     */
    createTransposition: {
        value: function performMatrixTranspose() {
            // Basic validation for the input array structure
            if (!this || this.length === 0 || !Array.isArray(this[0])) {
                console.error("Invalid input for matrix transposition. Expected a non-empty 2D array.");
                return [];
            }

            const originalRowCount = this.length;
            const originalColCount = this[0].length;

            // Initialize the transposed matrix with appropriate dimensions.
            // All elements are pre-filled with zero for clarity and consistent type.
            const transposedResult = Array.from({ length: originalColCount }, () =>
                new Array(originalRowCount).fill(0)
            );

            // Iterate over the original matrix to populate the transposed one.
            // Each element at [r][c] in the original goes to [c][r] in the transpose.
            for (let rIndex = 0; rIndex < originalRowCount; rIndex++) {
                const currentRow = this[rIndex];
                // Optional: Check for ragged arrays and warn, but continue processing.
                if (!Array.isArray(currentRow) || currentRow.length !== originalColCount) {
                    console.warn(`Row ${rIndex} has an inconsistent length (${currentRow ? currentRow.length : 'N/A'}) compared to the first row (${originalColCount}). Transposition might be irregular.`);
                    // For robustness, we could pad or truncate, but for Type III, just warning is sufficient.
                }

                for (let cIndex = 0; cIndex < originalColCount; cIndex++) {
                    // Ensure the element exists before assigning to avoid `undefined`.
                    // This implicitly handles ragged arrays by using 0 for missing elements.
                    transposedResult[cIndex][rIndex] = currentRow[cIndex] !== undefined ? currentRow[cIndex] : 0;
                }
            }
            return transposedResult;
        },
        enumerable: false,
        writable: true,
        configurable: true
    }
});

// Immediately Invoked Function Expression (IIFE) to encapsulate the main logic
((rawInputContent) => {
    // --- Input Processing and Validation ---

    // Trim whitespace from the beginning and end of the entire input string
    const cleanedInput = rawInputContent.trim();

    // Guard clause for empty input
    if (!cleanedInput) {
        console.error("Error: No input data was provided for processing.");
        return; // Exit if input is empty
    }

    // Split the input into individual lines
    const allInputLines = cleanedInput.split('\n');

    // Extract the first line which contains the dimensions (N, M, L)
    const dimensionLine = allInputLines.shift(); // Removes and returns the first element

    // Guard clause for missing dimension line
    if (!dimensionLine) {
        console.error("Input format error: The first line specifying matrix dimensions (N M L) is missing.");
        return;
    }

    // Parse the dimensions from the first line
    const dimensions = dimensionLine.split(/\s+/).transformToNumeric();

    // Destructure dimensions for better readability
    const [matrixARowCount, commonDimensionSize, matrixBColCount] = dimensions;

    // Validate parsed dimensions
    if (dimensions.length !== 3 || !dimensions.every(val => Number.isInteger(val) && val > 0)) {
        console.error(`Input dimension error: Expected three positive integers (N M L), received: ${dimensions.join(' ')}`);
        return;
    }
    if (allInputLines.length < (matrixARowCount + commonDimensionSize)) {
        console.error(`Input data error: Not enough rows provided for specified dimensions. Expected at least ${matrixARowCount + commonDimensionSize} data rows, found ${allInputLines.length}.`);
        return;
    }

    // Helper function to parse a single line into an array of numbers
    const parseLineToNumericArray = (lineText) => {
        if (!lineText || lineText.trim() === '') {
            // Return an empty array for empty lines, or handle as an error based on strictness
            return [];
        }
        return lineText.split(/\s+/).transformToNumeric();
    };

    // --- Matrix Data Extraction ---

    const matrixAData = [];
    // Extract rows for matrix A
    for (let rIdxA = 0; rIdxA < matrixARowCount; rIdxA++) {
        const rowData = parseLineToNumericArray(allInputLines[rIdxA]);
        if (rowData.length !== commonDimensionSize) {
            console.error(`Matrix A row ${rIdxA + 1} dimension mismatch. Expected ${commonDimensionSize} elements, found ${rowData.length}.`);
            return;
        }
        matrixAData.push(rowData);
    }

    const matrixBData = [];
    // Extract rows for matrix B
    for (let rIdxB = 0; rIdxB < commonDimensionSize; rIdxB++) {
        const currentLineIndex = matrixARowCount + rIdxB;
        const rowData = parseLineToNumericArray(allInputLines[currentLineIndex]);
        if (rowData.length !== matrixBColCount) {
            console.error(`Matrix B row ${rIdxB + 1} dimension mismatch. Expected ${matrixBColCount} elements, found ${rowData.length}.`);
            return;
        }
        matrixBData.push(rowData);
    }

    // --- Matrix Transposition ---

    // Transpose matrix B to simplify multiplication (row of A dot product with column of B)
    const transposedMatrixB = matrixBData.createTransposition();

    // Basic validation of transposed matrix B
    if (!transposedMatrixB || transposedMatrixB.length !== matrixBColCount || (transposedMatrixB[0] && transposedMatrixB[0].length !== commonDimensionSize)) {
        console.error("Internal error: Transposition of Matrix B resulted in an invalid structure.");
        return;
    }

    // --- Matrix Multiplication ---

    const finalProductMatrix = []; // This will store the result of A * B

    // Outer loop iterates through rows of Matrix A
    for (let currentARowIdx = 0; currentARowIdx < matrixARowCount; currentARowIdx++) {
        const currentRowOfA = matrixAData[currentARowIdx];
        const resultRow = []; // Stores the elements of the current row in the result matrix

        // Inner loop iterates through columns of (transposed) Matrix B
        for (let currentBColIdx = 0; currentBColIdx < matrixBColCount; currentBColIdx++) {
            const currentColOfTransposedB = transposedMatrixB[currentBColIdx];
            let cellValueAccumulator = 0; // Accumulates the dot product for the current cell

            // Innermost loop performs the dot product (sum of products)
            // It iterates through the common dimension (M)
            for (let k = 0; k < commonDimensionSize; k++) {
                const elementA = currentRowOfA[k];
                const elementB = currentColOfTransposedB[k];

                // Add to accumulator, ensuring elements are treated as numbers
                cellValueAccumulator += (elementA || 0) * (elementB || 0);
            }
            resultRow.push(cellValueAccumulator); // Add the calculated cell value to the current result row
        }
        finalProductMatrix.push(resultRow); // Add the completed row to the final result matrix
    }

    // --- Output Generation ---

    // Format the final matrix into a string, with elements separated by spaces
    // and rows separated by newlines, then print to console.
    const formattedOutput = finalProductMatrix
        .map(row => row.join(' ')) // Each row becomes a space-separated string
        .join('\n');               // All row strings are joined by newlines

    console.log(formattedOutput);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Reads input from standard in
// Note: In a production environment, error handling for file reading (try-catch) would be crucial.