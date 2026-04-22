const ioManager = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Global state variables for input parsing
let inputStateTracker = 0; // 0: dimensions, 1: matrixA, 2: matrixB
let currentMatrixARowIndex = 0;
let currentMatrixBRowIndex = 0; // This will track rows of B as they are read

// Matrix dimensions
let rowsA = 0;          // Corresponds to 'n'
let commonDimension = 0; // Corresponds to 'm'
let colsB = 0;          // Corresponds to 'l'

// Matrix storage
let matrixA = [];           // Stores matrix A (rowsA x commonDimension)
let matrixBTransposed = []; // Stores matrix B as its transpose (commonDimension x colsB)
let finalProductMatrix = []; // Stores the resulting matrix C (rowsA x colsB)

/**
 * Parses a string line into an array of floating-point numbers.
 * @param {string} inputLine - The line to parse.
 * @returns {Float32Array} An array of numbers.
 */
function parseNumericLine(inputLine) {
    // Split by space, filter out empty strings, and convert to Float32.
    // Guard against non-numeric input by checking for NaN and defaulting to 0.
    const numericTokens = inputLine.split(' ').filter(s => s.trim() !== '').map(val => {
        const num = parseFloat(val);
        return isNaN(num) ? 0.0 : num; // Default to 0.0 if parsing fails
    });
    return new Float32Array(numericTokens);
}

/**
 * Initializes a 2D matrix structure with a specified number of rows and columns,
 * using Float32Array for inner rows/columns for memory efficiency.
 * @param {number} numRows - The number of rows for the matrix.
 * @param {number} numCols - The number of columns for each row.
 * @returns {Array<Float32Array>} An array representing the 2D matrix.
 */
function initializeMatrixStructure(numRows, numCols) {
    const matrix = [];
    if (numRows <= 0 || numCols <= 0) {
        console.error("Error: Matrix dimensions must be positive.");
        // Return an empty matrix or throw an error based on desired error handling
        return [];
    }
    for (let i = 0; i < numRows; i++) {
        matrix.push(new Float32Array(numCols));
    }
    return matrix;
}

/**
 * Processes the first input line containing matrix dimensions (N M L).
 * Initializes matrix structures based on these dimensions.
 * @param {string} configLine - The line containing N, M, L.
 */
function processConfigurationLine(configLine) {
    const dimensions = parseNumericLine(configLine);

    if (dimensions.length !== 3 || dimensions.some(dim => !Number.isInteger(dim) || dim <= 0)) {
        console.error("Invalid matrix dimensions provided. Expected three positive integers (N M L). Exiting.");
        ioManager.close();
        return;
    }

    rowsA = dimensions[0];
    commonDimension = dimensions[1];
    colsB = dimensions[2];

    // Initialize matrix A (N x M)
    matrixA = initializeMatrixStructure(rowsA, commonDimension);
    // Initialize matrix B Transposed (M x L)
    matrixBTransposed = initializeMatrixStructure(commonDimension, colsB);
    // Initialize the result matrix C (N x L)
    finalProductMatrix = initializeMatrixStructure(rowsA, colsB);

    inputStateTracker++; // Move to reading matrix A
}

/**
 * Reads a row of data for matrix A.
 * @param {string} dataLine - The line containing elements for a row of matrix A.
 */
function readMatrixADataRow(dataLine) {
    const rowElements = parseNumericLine(dataLine);

    if (rowElements.length !== commonDimension) {
        console.warn(`Warning: Row ${currentMatrixARowIndex} of Matrix A has ${rowElements.length} elements, expected ${commonDimension}. Padding/truncating.`);
    }

    // Fill the current row of matrix A
    for (let colIdx = 0; colIdx < commonDimension; colIdx++) {
        matrixA[currentMatrixARowIndex][colIdx] = rowElements[colIdx] !== undefined ? rowElements[colIdx] : 0.0;
    }
    currentMatrixARowIndex++;
}

/**
 * Reads a row of data for matrix B and populates the transposed matrix B.
 * @param {string} dataLine - The line containing elements for a row of matrix B.
 */
function readMatrixBRowAndTranspose(dataLine) {
    const rowElements = parseNumericLine(dataLine);

    if (rowElements.length !== commonDimension) {
        console.warn(`Warning: Row ${currentMatrixBRowIndex} of Matrix B has ${rowElements.length} elements, expected ${commonDimension}. Padding/truncating.`);
    }

    // Populate matrixBTransposed (M x L) from row-wise input of B (L x M)
    // rowElements is a row of B, so rowElements[colIdx] is B[currentMatrixBRowIndex][colIdx]
    // In B_transpose, this element is B_T[colIdx][currentMatrixBRowIndex]
    for (let colIdx = 0; colIdx < commonDimension; colIdx++) {
        matrixBTransposed[colIdx][currentMatrixBRowIndex] = rowElements[colIdx] !== undefined ? rowElements[colIdx] : 0.0;
    }
    currentMatrixBRowIndex++;
}

/**
 * Computes the dot product of two vectors.
 * @param {Float32Array} vector1 - The first vector.
 * @param {Float32Array} vector2 - The second vector.
 * @returns {number} The dot product.
 */
function computeVectorDotProduct(vector1, vector2) {
    let productSum = 0.0;
    // Ensure vectors have the same length for dot product
    const minLength = Math.min(vector1.length, vector2.length);

    for (let k = 0; k < minLength; k++) {
        productSum += vector1[k] * vector2[k];
    }
    return productSum;
}

// Event handler for each line of input
ioManager.on('line', (currentLine) => {
    // Trim whitespace from the input line
    const processedLine = currentLine.trim();

    if (processedLine.length === 0) {
        // Ignore empty lines
        return;
    }

    if (inputStateTracker === 0) {
        processConfigurationLine(processedLine);
    } else if (currentMatrixARowIndex < rowsA) {
        readMatrixADataRow(processedLine);
        if (currentMatrixARowIndex === rowsA) {
            inputStateTracker++; // All rows of A read, move to B
        }
    } else if (currentMatrixBRowIndex < colsB) {
        readMatrixBRowAndTranspose(processedLine);
        if (currentMatrixBRowIndex === colsB) {
            ioManager.close(); // All rows of B read, close input
        }
    }
});

// Event handler for when the input stream closes
ioManager.on('close', () => {
    // Perform matrix multiplication C = A * B_transpose
    // C (rowsA x colsB) = A (rowsA x commonDimension) * B_transpose (commonDimension x colsB)

    for (let rowIndexA = 0; rowIndexA < rowsA; rowIndexA++) {
        for (let colIndexB = 0; colIndexB < colsB; colIndexB++) {
            // To compute C[rowIndexA][colIndexB], we need:
            // - The rowIndexA-th row of matrixA (a 1 x commonDimension vector)
            // - The colIndexB-th column of matrixB (a commonDimension x 1 vector)
            // Since matrixBTransposed is commonDimension x colsB, its `colIndexB`-th column
            // represents the `colIndexB`-th column of original matrix B.
            // We need to extract this column as a vector for the dot product.

            const currentBColumnVector = new Float32Array(commonDimension);
            for (let k = 0; k < commonDimension; k++) {
                currentBColumnVector[k] = matrixBTransposed[k][colIndexB];
            }
            
            finalProductMatrix[rowIndexA][colIndexB] = computeVectorDotProduct(
                matrixA[rowIndexA],
                currentBColumnVector
            );
        }
    }

    // Output the resulting matrix
    for (let r = 0; r < rowsA; r++) {
        // Use a temporary array to build the output line for efficiency
        const outputRowElements = [];
        for (let c = 0; c < colsB; c++) {
            outputRowElements.push(finalProductMatrix[r][c].toFixed(0)); // Format as integer string
        }
        console.log(outputRowElements.join(' '));
    }
    // A final newline might be desired for some systems, but not explicitly requested.
});