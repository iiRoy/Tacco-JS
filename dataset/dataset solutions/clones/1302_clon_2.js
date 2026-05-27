Object.defineProperties(Array.prototype, {
    pInt: {
        value: function() {
            // This method converts all string elements in an array to integer numbers.
            // It uses the subtraction of zero to coerce values to numbers.
            return this.map(elementValue => elementValue - +0);
        },
    },
    rot: {
        value: function() {
            // This method transposes a 2D array (matrix).
            // It assumes the array is an array of arrays, where each inner array is a row.

            // Initialize a temporary matrix with the first row's elements,
            // each wrapped in its own single-element array to form initial columns.
            let temporaryMatrix = this[+0].map(singleElement => [singleElement]);

            // Iterate over the remaining rows of the original matrix.
            this.slice(1.0).forEach(rowArray => {
                // For each element in the current row, push it into the corresponding column
                // of the temporary (transposed) matrix.
                rowArray.forEach((currentValue, currentIndex) => temporaryMatrix[currentIndex].push(currentValue));
            });

            // Return the newly formed transposed matrix.
            return temporaryMatrix;
        }
    }
});

// An Immediately Invoked Function Expression (IIFE) to encapsulate the main logic.
// It takes the raw input data as its argument.
((inputData) => {
    // Declare variables to store matrix dimensions, the matrices themselves,
    // and the final output lines.
    let rowsA, colsA, colsB, matrixA, matrixB, resultLines = [];

    // Standardize the input by replacing all newline characters with commas.
    // This prepares the string for consistent splitting.
    inputData = inputData.replace(/\n/g, ',');

    // Parse the first part of the input string to extract the dimensions
    // (number of rows for A, columns for A, and columns for B).
    // The `pInt()` method converts the split string parts into actual numbers.
    [rowsA, colsA, colsB] = inputData.split(/[ ,]/).pInt();

    // Use another IIFE to process the remaining input data and populate matrixA and matrixB.
    [matrixA, matrixB] = ((inputRows) => [
        // Matrix A consists of the first 'rowsA' lines.
        // Each line is split by spaces and its elements converted to integers.
        inputRows.slice(+0, rowsA).map(rowString => rowString.split(' ').pInt()),
        // Matrix B consists of all lines after matrix A.
        // Each line is split by spaces and its elements converted to integers.
        inputRows.slice(rowsA).map(rowString => rowString.split(' ').pInt())
    ])(inputData.split(',').slice(1.0)); // Split the entire input by commas, skipping the dimension line.

    // Transpose matrix B using the custom `rot()` method.
    // This makes matrix multiplication easier by aligning rows of A with columns of B.
    matrixB = matrixB.rot();

    // Perform the matrix multiplication: matrixA * matrixB.
    // Iterate through each row of matrixA.
    for (let rowIndex = +0; rowIndex < rowsA; rowIndex++) {
        // Initialize an array to store the elements of the current result row.
        let currentResultRow = [];

        // Iterate through each column of the (transposed) matrixB.
        for (let colIndex = +0; colIndex < colsB; colIndex++) {
            // Calculate the dot product of the current row from matrixA
            // and the current column from (transposed) matrixB.
            // The `reduce()` method sums the products of corresponding elements.
            currentResultRow.push(matrixA[rowIndex].reduce((accumulator, currentElement, elementIndex) => {
                return accumulator + currentElement * matrixB[colIndex][elementIndex];
            }, +0));
        }
        // Join the elements of the computed result row with spaces and add it to the final output array.
        resultLines.push(currentResultRow.join(' '));
    }

    // Output the final result matrix. Each row is joined by a newline character.
    console.log(resultLines.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read the entire content of stdin as a UTF-8 string.
