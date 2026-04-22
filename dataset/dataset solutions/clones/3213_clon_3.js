"use strict"

// A utility function for performing a binary exclusive OR (XOR) operation on two individual bits.
// This function takes two numerical inputs, typically expected to be 0 or 1.
// Renamed from 'xor' to 'calculateBitwiseXOR'.
function calculateBitwiseXOR(firstOperand, secondOperand) {
    // If the bits are the same (both 0 or both 1), their XOR is 0.
    // If they are different (one 0 and one 1), their XOR is 1.
    return (firstOperand === secondOperand) ? 0 : 1;
}

// This function applies the bitwise XOR operation to corresponding elements of two input arrays (vectors).
// It returns a new array containing the results of these element-wise XOR operations.
// Renamed from 'XOR' to 'performVectorXOR'.
function performVectorXOR(vectorA, vectorB) {
    // Basic validation: Check if input vectors are valid arrays.
    if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
        console.error("Invalid input: Both arguments must be arrays for vector XOR.");
        return []; // Return an empty array or throw an error.
    }

    const outputVector = [];
    // Iterate up to the length of the shorter vector to avoid out-of-bounds access.
    const commonLength = Math.min(vectorA.length, vectorB.length);

    // Using a traditional for loop for clarity and potential performance implications in some engines.
    for (let currentElementIndex = 0; currentElementIndex < commonLength; currentElementIndex++) {
        outputVector.push(calculateBitwiseXOR(vectorA[currentElementIndex], vectorB[currentElementIndex]));
    }
    return outputVector;
}

// A versatile helper function to swap two elements within any given array by their indices.
// Renamed from 'swap' to 'swapArrayElementsAtIndexes'.
function swapArrayElementsAtIndexes(targetCollection, indexOne, indexTwo) {
    // Ensure the array and indices are valid before proceeding with the swap.
    if (!Array.isArray(targetCollection) || indexOne < 0 || indexTwo < 0 ||
        indexOne >= targetCollection.length || indexTwo >= targetCollection.length) {
        console.error("Cannot perform swap: Invalid array or out-of-bounds indices provided.");
        return; // Exit if validation fails.
    }
    // A temporary variable is used to hold one element during the exchange process.
    const temporaryHolder = targetCollection[indexOne];
    targetCollection[indexOne] = targetCollection[indexTwo];
    targetCollection[indexTwo] = temporaryHolder;
}

// The core class representing a binary matrix, designed to support row and column operations.
// Renamed from 'Matrix' to 'BinarySystemMatrix'.
function BinarySystemMatrix(numberOfRows, numberOfColumns, initialFlatData) {
    // Storing the dimensions as properties of the matrix instance for consistent access.
    this.currentNumRows = numberOfRows;
    this.currentNumColumns = numberOfColumns;

    // The internal representation of the matrix, an array of arrays (rows).
    // Renamed from 'low' to 'matrixRows'.
    this.matrixRows = [];

    // Initialize the matrixRows structure.
    // Added an explicit check for valid dimensions.
    if (numberOfRows <= 0 || numberOfColumns <= 0) {
        console.warn("Attempting to create matrix with non-positive dimensions. Matrix will be empty.");
        this.currentNumRows = 0;
        this.currentNumColumns = 0;
        return;
    }

    // Pre-allocate the rows and fill them based on the provided flat data.
    // Added validation for the length of initialFlatData.
    if (initialFlatData.length !== numberOfRows * numberOfColumns) {
        console.error("Initial data length mismatch with matrix dimensions. Populating partially or with zeros.");
        // We might choose to throw an error here in a strict implementation.
    }

    let dataIndex = 0;
    for (let rIdx = 0; rIdx < this.currentNumRows; rIdx++) {
        const newRow = [];
        for (let cIdx = 0; cIdx < this.currentNumColumns; cIdx++) {
            // Populate from flat data, ensuring values are binary (0 or 1).
            const val = initialFlatData[dataIndex++];
            newRow.push((val === 0 || val === 1) ? val : 0); // Default to 0 for invalid inputs.
        }
        this.matrixRows.push(newRow);
    }
}

// Prototype methods for BinarySystemMatrix.

// Exchanges the positions of two specified rows within the matrix.
// Renamed from 'swapLow' to 'swapMatrixRows'.
BinarySystemMatrix.prototype.swapMatrixRows = function(idxA, idxB) {
    // Delegate to the general array swapping utility.
    swapArrayElementsAtIndexes(this.matrixRows, idxA, idxB);
};

// Removes the last row from the matrix.
// Renamed from 'deleteLow' to 'removeFinalRow'.
BinarySystemMatrix.prototype.removeFinalRow = function() {
    // Guard clause: prevent removal from an empty matrix.
    if (this.matrixRows.length === 0) {
        console.warn("Attempted to remove a row from an empty matrix. No operation performed.");
        return;
    }
    this.matrixRows.pop(); // Remove the last array (row).
    this.currentNumRows--; // Update the stored row count.
};

// Exchanges the positions of two specified columns across all rows of the matrix.
// Renamed from 'swapColumn' to 'swapMatrixColumns'.
BinarySystemMatrix.prototype.swapMatrixColumns = function(idxA, idxB) {
    // Guard clause: check if the matrix has any rows or columns.
    if (this.matrixRows.length === 0 || this.matrixRows[0].length === 0) {
        console.warn("Attempted to swap columns in an empty matrix. No operation performed.");
        return;
    }
    // Iterate through each row and swap the elements at the specified column indices.
    for (let r = 0; r < this.matrixRows.length; r++) {
        swapArrayElementsAtIndexes(this.matrixRows[r], idxA, idxB);
    }
};

// Removes the last column from the matrix.
// Renamed from 'deleteColumn' to 'removeFinalColumn'.
BinarySystemMatrix.prototype.removeFinalColumn = function() {
    // Extensive guard clauses for various empty or near-empty states.
    if (this.matrixRows.length === 0) {
        console.warn("Attempted to remove a column from an empty matrix (no rows).");
        return;
    }
    if (this.matrixRows[0].length === 0) {
        console.warn("Attempted to remove a column from a matrix where all rows are empty.");
        return;
    }

    // Special case: if there's only one column left, removing it means the matrix becomes empty.
    if (this.matrixRows[0].length === 1) {
        this.matrixRows = []; // Clear all rows.
        this.currentNumRows = 0; // Reset row count.
        this.currentNumColumns = 0; // Reset column count.
        return;
    }

    // For all other cases, remove the last element (column) from each row.
    for (let r = 0; r < this.matrixRows.length; r++) {
        this.matrixRows[r].pop();
    }
    this.currentNumColumns--; // Decrement the stored column count.
};


// The primary function to process input, perform matrix operations, and output the final calculation.
// Renamed from 'Main' to 'processAndSolveBinarySystem'.
const processAndSolveBinarySystem = function(rawInputContent) {
    // Input validation: Check if the raw input string is provided and not just whitespace.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Error: Input content is empty or not a valid string.");
        return; // Exit early if input is invalid.
    }

    // Step 1: Parse the raw input string into an array of numerical values.
    // Original: input=input.trim().split(/\s+/).map(x=>x-0);
    // Rewritten to use `parseInt` explicitly and include error handling for non-numeric tokens.
    const parsedNumericData = rawInputContent
        .trim() // Remove leading/trailing whitespace.
        .split(/\s+/) // Split by one or more whitespace characters.
        .map(token => {
            const num = parseInt(token, 10);
            if (isNaN(num)) {
                console.warn(`Warning: Non-numeric token '${token}' found in input. Treating as 0.`);
                return 0; // Default to 0 for invalid numbers.
            }
            return num;
        });

    // Step 2: Extract the matrix dimensions (N and M) from the beginning of the parsed data.
    // Original: var N=input.shift(); var M=input.shift();
    // Added checks for sufficient data.
    if (parsedNumericData.length < 2) {
        console.error("Error: Insufficient numerical data to determine matrix dimensions (N and M).");
        return;
    }
    const dimensionN = parsedNumericData.shift(); // First number is number of rows.
    const dimensionM = parsedNumericData.shift(); // Second number is number of columns.

    // Validate extracted dimensions.
    if (dimensionN <= 0 || dimensionM <= 0) {
        console.error(`Error: Invalid matrix dimensions provided: N=${dimensionN}, M=${dimensionM}. Both must be positive.`);
        return;
    }

    // Initialize a variable to count the effective rank of the matrix.
    // Renamed from 'rankCounter' to 'calculatedMatrixRank'.
    let calculatedMatrixRank = 0;

    // Step 3: Instantiate the binary matrix object with the parsed dimensions and remaining data.
    // Original: var A=new Matrix(N,M,input);
    const systemRepresentation = new BinarySystemMatrix(dimensionN, dimensionM, parsedNumericData);

    // Step 4: Perform a modified Gaussian elimination process to determine the rank.
    // This process continuously modifies the matrix until no rows remain or no pivots can be found.
    // Original: while(A.low.length>0)
    // The loop continues as long as there are rows in the matrix.
    while (systemRepresentation.matrixRows.length > 0) {
        // Find the index of the first row (pivot candidate) that has a '1' in the current leading column (index 0).
        // Renamed from 'i1' to 'firstOneRowIndex'.
        let firstOneRowIndex = -1;
        for (let rIterator = 0; rIterator < systemRepresentation.matrixRows.length; rIterator++) {
            // Check if the current row exists and has at least one column.
            if (systemRepresentation.matrixRows[rIterator] && systemRepresentation.matrixRows[rIterator].length > 0 &&
                systemRepresentation.matrixRows[rIterator][0] === 1) {
                firstOneRowIndex = rIterator;
                break; // A pivot '1' has been found.
            }
        }

        // Scenario A: No '1' was found in the current leading column among the remaining rows.
        // This means the current leading column is entirely composed of zeros.
        // Original: if(i1===A.low.length)
        if (firstOneRowIndex === -1) {
            // If the matrix has no columns left, or only one column left (which is all zeros),
            // then we've processed all meaningful data.
            if (systemRepresentation.currentNumColumns <= 1) {
                // If only one column remains and it's all zeros, effectively the matrix is empty.
                systemRepresentation.matrixRows = [];
                systemRepresentation.currentNumRows = 0;
                systemRepresentation.currentNumColumns = 0;
                break; // Exit the main loop.
            }

            // Move the current (all-zero) leading column to the end and then remove it.
            // This effectively "processes" this column.
            // Original: A.swapColumn(0,A.low[0].length-1); A.deleteColumn();
            systemRepresentation.swapMatrixColumns(0, systemRepresentation.currentNumColumns - 1);
            systemRepresentation.removeFinalColumn();
        } else {
            // Scenario B: A '1' (pivot) was found in the current leading column.
            // Increment the rank counter as we've found a new pivot.
            calculatedMatrixRank++;

            // Use the pivot row to eliminate (XOR out) '1's in the same column in subsequent rows.
            // Original: while(true){ ... }
            // Rewritten with an explicit loop condition.
            let targetRowSearchIndex = firstOneRowIndex + 1;
            while (targetRowSearchIndex < systemRepresentation.matrixRows.length) {
                // Search for the next row below the pivot that also has a '1' in the leading column.
                // Renamed from 'i2' to 'nextOneTargetRowIndex'.
                let nextOneTargetRowIndex = -1;
                for (let rFind = targetRowSearchIndex; rFind < systemRepresentation.matrixRows.length; rFind++) {
                    if (systemRepresentation.matrixRows[rFind] && systemRepresentation.matrixRows[rFind].length > 0 &&
                        systemRepresentation.matrixRows[rFind][0] === 1) {
                        nextOneTargetRowIndex = rFind;
                        break;
                    }
                }

                // If no more '1's are found in this column below the current search point, exit the inner loop.
                // Original: if(i2===A.low.length)break;
                if (nextOneTargetRowIndex === -1) {
                    break;
                }

                // Perform the XOR operation: target_row = XOR(pivot_row, target_row).
                // Original: A.low[i2]=XOR(A.low[i1],A.low[i2]);
                const xoredResultRow = performVectorXOR(
                    systemRepresentation.matrixRows[firstOneRowIndex],
                    systemRepresentation.matrixRows[nextOneTargetRowIndex]
                );
                systemRepresentation.matrixRows[nextOneTargetRowIndex] = xoredResultRow;

                // Advance the search index to continue looking for more '1's below the modified row.
                targetRowSearchIndex = nextOneTargetRowIndex + 1;
            }

            // After using the pivot row for elimination, remove it from the matrix.
            // This is done by swapping it to the last position and then popping it.
            // Original: A.swapLow(i1,A.low.length-1); A.deleteLow();
            systemRepresentation.swapMatrixRows(firstOneRowIndex, systemRepresentation.matrixRows.length - 1);
            systemRepresentation.removeFinalRow();

            // IMPORTANT NOTE: Unlike standard Gaussian elimination, this algorithm does NOT
            // explicitly remove the current leading column after finding a pivot and eliminating.
            // It continues to process the *same* physical column 0 in the next iteration of the main loop,
            // but with a reduced set of rows. This is a specific behavior being cloned.
        }
    }

    // Step 5: Calculate the final result using the determined rank and initial dimensions.
    // Original: var r=rankCounter; var ans=Math.pow(2,N+M-1)-Math.pow(2,Math.min(M,N)-r+Math.max(M,N)-1);
    const finalRankValue = calculatedMatrixRank;

    // Break down the exponents for clarity and intermediate steps.
    const firstExponentComponent = dimensionN + dimensionM - 1;
    const minimumDimension = Math.min(dimensionM, dimensionN);
    const maximumDimension = Math.max(dimensionM, dimensionN);
    const secondExponentComponent = minimumDimension - finalRankValue + maximumDimension - 1;

    // Guard against potential issues with Math.pow (though unlikely for positive exponents).
    if (firstExponentComponent < 0 || secondExponentComponent < 0) {
        console.warn("Warning: A calculated exponent is negative. Results of Math.pow might be unexpected.");
        // Depending on requirements, could return 0 or throw an error.
    }

    const firstTerm = Math.pow(2, firstExponentComponent);
    const secondTerm = Math.pow(2, secondExponentComponent);

    const finalAnswer = firstTerm - secondTerm;

    // Step 6: Output the computed answer to the console.
    console.log(finalAnswer);
};

// Self-executing anonymous function to handle input reading and kick off the solution process.
(function initializeAndExecute() {
    // This block checks if the script is running in a Node.js environment
    // and attempts to read input from standard input.
    if (typeof require !== 'undefined' && typeof module !== 'undefined' && module.exports) {
        try {
            const nodeFsModule = require('fs');
            const standardInputPath = '/dev/stdin';
            // Read all file content synchronously as a UTF-8 string.
            const inputData = nodeFsModule.readFileSync(standardInputPath, 'utf8');
            processAndSolveBinarySystem(inputData);
        } catch (executionError) {
            console.error("An error occurred during input reading or execution:", executionError.message);
            // Optionally, provide a default or example input for debugging or fallback.
            // processAndSolveBinarySystem("2 2 1 0 0 1"); // Example: 2x2 identity matrix
        }
    } else {
        // If not in a Node.js environment (e.g., browser), log a warning.
        console.warn("Not running in a Node.js-like environment. Please provide input manually for testing 'processAndSolveBinarySystem'.");
        // Example usage for manual testing:
        // processAndSolveBinarySystem("3 3 1 1 0 0 1 1 1 0 1");
    }
})();