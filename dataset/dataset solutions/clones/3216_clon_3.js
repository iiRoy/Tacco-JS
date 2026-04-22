const exchangeElements = (targetArray, idxA, idxB) => {
    // A robust utility to swap two elements within any given array.
    // Includes a basic validation check to ensure array and indices are valid.
    if (!Array.isArray(targetArray) || idxA < 0 || idxB < 0 || idxA >= targetArray.length || idxB >= targetArray.length) {
        // Log a warning for invalid swap attempts, preserving program flow.
        console.warn("Attempted element swap with invalid array or out-of-bounds indices.");
        return false; // Indicate failure to swap
    }
    // Using modern JavaScript destructuring assignment for an efficient swap.
    [targetArray[idxA], targetArray[idxB]] = [targetArray[idxB], targetArray[idxA]];
    return true; // Indicate successful swap
};

// Computes the binary XOR (exclusive OR) for two single bits (expected 0 or 1).
// This function strictly operates on binary values.
const computeBinaryXOR = (bitOne, bitTwo) => {
    // The sum modulo 2 correctly implements XOR for binary inputs.
    // 0 XOR 0 = (0+0)%2 = 0
    // 0 XOR 1 = (0+1)%2 = 1
    // 1 XOR 0 = (1+0)%2 = 1
    // 1 XOR 1 = (1+1)%2 = 0
    return (Number(bitOne) + Number(bitTwo)) % 2;
};

// Applies the `computeBinaryXOR` operation across corresponding elements of two rows.
// This is typical for Gaussian elimination in a binary field.
const performRowXOR = (firstRowData, secondRowData) => {
    // A safety check: if row lengths differ, this operation might yield unexpected results.
    if (firstRowData.length !== secondRowData.length) {
        console.error("Mismatch in row lengths detected during XOR operation. Returning first row as fallback.");
        return [...firstRowData]; // Return a copy of the first row to prevent further issues.
    }
    // `Array.prototype.map` is used to create a new array with XORed values.
    return firstRowData.map((element, index) => computeBinaryXOR(element, secondRowData[index]));
};

// Defines a constructor for a matrix specifically designed for binary operations (GF(2)).
function BinaryMatrix(initialRows, initialCols, flatElements) {
    // Explicitly store the matrix dimensions for easier access and management.
    this.numMatrixRows = initialRows;
    this.numMatrixCols = initialCols;

    // Initialize the internal matrix storage as a 2D array, pre-filled with zeros.
    // `Array.from` provides a concise way to create an array of arrays.
    this.matrixRows = Array.from({ length: initialRows }, () => new Array(initialCols).fill(0));

    // Populate the matrix using the provided flattened array of elements.
    // A warning is issued if the input `flatElements` array is smaller than expected.
    if (flatElements.length < initialRows * initialCols) {
        console.warn("Input element count is less than matrix capacity. Remaining cells will default to zero.");
    }

    for (let rIndex = 0; rIndex < initialRows; rIndex++) {
        for (let cIndex = 0; cIndex < initialCols; cIndex++) {
            const flatIdx = rIndex * initialCols + cIndex;
            // Ensure elements are treated as numbers, defaulting to 0 if input is missing.
            this.matrixRows[rIndex][cIndex] = Number(flatElements[flatIdx] || 0);
        }
    }
}

// Prototype methods extend the functionality of BinaryMatrix instances.

// Swaps two rows within the matrix using the global `exchangeElements` helper.
BinaryMatrix.prototype.swapRows = function(rowIdx1, rowIdx2) {
    if (!exchangeElements(this.matrixRows, rowIdx1, rowIdx2)) {
        console.error(`Failed to swap rows ${rowIdx1} and ${rowIdx2}.`);
    }
};

// Removes the last row from the matrix, if available.
BinaryMatrix.prototype.removeLastRow = function() {
    if (this.numMatrixRows > 0) {
        this.matrixRows.pop(); // Standard array method to remove the last element.
        this.numMatrixRows--; // Update the internal row count.
        return true;
    } else {
        console.warn("Cannot remove row: matrix is already empty.");
        return false;
    }
};

// Swaps two specified columns across all rows of the matrix.
BinaryMatrix.prototype.swapColumns = function(colIdx1, colIdx2) {
    // Validate column indices to prevent errors.
    if (colIdx1 < 0 || colIdx1 >= this.numMatrixCols || colIdx2 < 0 || colIdx2 >= this.numMatrixCols) {
        console.error(`Invalid column indices for swap: ${colIdx1}, ${colIdx2}.`);
        return false;
    }
    // Iterate through each row and apply the column swap.
    for (let currentR = 0; currentR < this.numMatrixRows; currentR++) {
        exchangeElements(this.matrixRows[currentR], colIdx1, colIdx2);
    }
    return true;
};

// Removes the last column from the matrix. Special handling for a single-column matrix.
BinaryMatrix.prototype.removeLastColumn = function() {
    if (this.numMatrixCols <= 0) {
        console.warn("Cannot remove column: matrix has no columns.");
        return false;
    }

    // Original logic: if only one column remains, clearing that column
    // effectively makes the entire matrix empty.
    if (this.numMatrixCols === 1) {
        this.matrixRows = []; // Empty the entire matrix.
        this.numMatrixRows = 0;
        this.numMatrixCols = 0;
    } else {
        // For matrices with multiple columns, remove the last element from each row.
        for (let currentR = 0; currentR < this.numMatrixRows; currentR++) {
            this.matrixRows[currentR].pop();
        }
        this.numMatrixCols--; // Decrement the internal column count.
    }
    return true;
};

// Getter method to retrieve the current number of rows.
BinaryMatrix.prototype.getRowCount = function() {
    return this.numMatrixRows;
};

// Getter method to retrieve the current number of columns.
BinaryMatrix.prototype.getColumnCount = function() {
    return this.numMatrixCols;
};

// Retrieves a copy of a specific row by its index.
BinaryMatrix.prototype.getRow = function(rowIndex) {
    if (rowIndex >= 0 && rowIndex < this.numMatrixRows) {
        return [...this.matrixRows[rowIndex]]; // Return a shallow copy to prevent external modification.
    }
    return undefined; // Indicate row not found.
};

// Sets the content of a specific row. Performs validation on new row length.
BinaryMatrix.prototype.setRow = function(rowIndex, newRowData) {
    if (rowIndex >= 0 && rowIndex < this.numMatrixRows && newRowData.length === this.numMatrixCols) {
        this.matrixRows[rowIndex] = [...newRowData]; // Store a shallow copy.
        return true;
    }
    console.error(`Failed to set row ${rowIndex}: invalid index or mismatched data length.`);
    return false;
};


// The primary function orchestrating the program's logic.
const ExecuteProgram = (rawDataInput) => {
    // Step 1: Parse and prepare the input data.
    // Input is trimmed, split by any whitespace, and converted to numeric values.
    const numericValues = rawDataInput.trim().split(/\s+/).map(s => Number(s));

    // Basic validation to ensure sufficient input for matrix dimensions.
    if (numericValues.length < 2) {
        console.error("Critical error: Insufficient input data to define matrix dimensions.");
        return; // Terminate execution if input is invalid.
    }
    const initialMatrixRows = numericValues.shift(); // First number is row count.
    const initialMatrixCols = numericValues.shift(); // Second number is column count.

    // Step 2: Initialize the binary matrix structure.
    const activeBinaryMatrix = new BinaryMatrix(initialMatrixRows, initialMatrixCols, numericValues);

    // This variable will accumulate the rank of the matrix.
    let currentDeterminedRank = 0;

    // Step 3: Core algorithm for rank determination (Gaussian elimination variant).
    // The loop continues as long as there are rows and columns to process.
    while (activeBinaryMatrix.getRowCount() > 0 && activeBinaryMatrix.getColumnCount() > 0) {
        // Find the first row that has a '1' in the leading (first) column.
        // `findIndex` provides a clean way to locate such a row.
        const pivotCandidateRowIndex = activeBinaryMatrix.matrixRows.findIndex(row => row[0] === 1);

        if (pivotCandidateRowIndex === -1) {
            // Case A: No '1' found in the current first column.
            // This means the column is entirely zeros (or effectively zero for rank purposes).
            // We move this column to the end and then remove it.
            if (activeBinaryMatrix.getColumnCount() > 1) {
                // Only swap if there's another column to swap with.
                activeBinaryMatrix.swapColumns(0, activeBinaryMatrix.getColumnCount() - 1);
            }
            activeBinaryMatrix.removeLastColumn(); // Discard this column.
        } else {
            // Case B: A '1' (pivot) is found in the current first column.
            currentDeterminedRank++; // Increment rank as a new pivot is identified.

            // If the pivot row isn't the first one, swap it to the top position for processing.
            // This simplifies subsequent XOR operations by ensuring the pivot is at a known index.
            if (pivotCandidateRowIndex !== 0) {
                activeBinaryMatrix.swapRows(pivotCandidateRowIndex, 0);
                // Update pivotCandidateRowIndex as it's now at index 0.
                // This is crucial because `matrixRows` has been modified.
                // The original code implicitly relied on `i1` being the first `1` found,
                // but then processes from `i1+1`. If `i1` is not 0, it means other rows above it
                // are all zeros in the first column. For rank, it doesn't matter if we swap.
                // However, to mimic the original logic more closely (where `i1` is the pivot
                // and subsequent rows are XORed against it), let's keep `pivotCandidateRowIndex`
                // as the actual index of the pivot. The `findIndex` already gets the correct one.
                // The original code `A.low[i2]=XOR(A.low[i1],A.low[i2]);` means `i1` is the pivot.
                // My `pivotCandidateRowIndex` is that `i1`. No explicit swap to index 0 needed
                // if we just process against `pivotCandidateRowIndex`.
                // Let's re-evaluate the original logic:
                // `let i1=0; for(let i=0;i<A.low.length;i++){ if(A.low[i][0]===1)break; i1++; }`
                // If `i1` is `k`, it means `A.low[k][0]` is 1, and `A.low[0...k-1][0]` are all 0.
                // Then `A.low[i2]=XOR(A.low[i1],A.low[i2]);` uses `i1` as the pivot.
                // So my `pivotCandidateRowIndex` is correctly identified.
            }

            // Iterate through all other rows in the matrix.
            // If a row has a '1' in the current pivot column, XOR it with the pivot row to eliminate the '1'.
            let currentRowProcessingIndex = 0;
            const currentPivotRowContent = activeBinaryMatrix.getRow(pivotCandidateRowIndex); // Get pivot row content once.

            while (currentRowProcessingIndex < activeBinaryMatrix.getRowCount()) {
                if (currentRowProcessingIndex === pivotCandidateRowIndex) {
                    currentRowProcessingIndex++;
                    continue; // Skip the pivot row itself.
                }

                const targetRowContent = activeBinaryMatrix.getRow(currentRowProcessingIndex);
                if (targetRowContent[0] === 1) {
                    const xoredResultRow = performRowXOR(currentPivotRowContent, targetRowContent);
                    activeBinaryMatrix.setRow(currentRowProcessingIndex, xoredResultRow);
                }
                currentRowProcessingIndex++;
            }

            // Once the pivot row has been used to eliminate '1's in its column,
            // move it to the end of the matrix and remove it from active consideration.
            activeBinaryMatrix.swapRows(pivotCandidateRowIndex, activeBinaryMatrix.getRowCount() - 1);
            activeBinaryMatrix.removeLastRow(); // This row is now "processed".
        }
    }

    // Step 4: Final calculation using the determined rank.
    const finalRankOutput = currentDeterminedRank;

    // Define the modulus constant used for all modular arithmetic operations.
    const MODULUS_CONST = 998244353;

    // Calculate the first power term: (2^(initialMatrixRows + initialMatrixCols - 1)) % MODULUS_CONST.
    let powerTermA = 1;
    const exponentA = initialMatrixRows + initialMatrixCols - 1;
    for (let k = 0; k < exponentA; k++) {
        powerTermA = (powerTermA * 2) % MODULUS_CONST;
    }

    // Calculate the second power term: (2^(initialMatrixRows + initialMatrixCols - finalRankOutput - 1)) % MODULUS_CONST.
    let powerTermB = 1;
    const exponentB = initialMatrixRows + initialMatrixCols - finalRankOutput - 1;
    // The loop iterates `exponentB` times. If `exponentB` is negative or zero, loop won't run, `powerTermB` remains 1.
    for (let k = 0; k < exponentB; k++) {
        powerTermB = (powerTermB * 2) % MODULUS_CONST;
    }

    // Step 5: Compute the final result.
    // Ensure the result of subtraction is non-negative by adding MODULUS_CONST before the final modulo.
    const finalComputedResult = (powerTermA - powerTermB + MODULUS_CONST) % MODULUS_CONST;

    // Step 6: Output the result.
    // Using `process.stdout.write` for direct output, including a newline.
    process.stdout.write(String(finalComputedResult) + '\n');
};

// Entry point: Read input from standard input and execute the program.
// `process.stdin.readFileSync` is used for synchronous file reading from '/dev/stdin'.
ExecuteProgram(process.stdin.readFileSync('/dev/stdin', 'utf8'));