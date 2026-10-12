function ProcessInputData(rawInputString) {
    // Split the entire input string into lines.
    // The first line contains dimensions, the rest are data rows.
    let [firstLineParts, ...dataLines] = rawInputString.split('\n');

    // Parse the dimensions from the first line.
    // It's expected to be two space-separated numbers.
    let dimensionsArray = firstLineParts.split(' ');
    let numRowsA = Number(dimensionsArray[0]); // Represents 'n'
    let numColsA = Number(dimensionsArray[1]); // Represents 'm'

    // Initialize a structure to hold all input numerical data.
    // This will store both matrix A (n x m) and vector B (m x 1).
    let inputDataMatrix = [];
    // Pre-fill the array with empty sub-arrays for all expected rows.
    // The total number of rows is n (for matrix A) + m (for vector B).
    for (let rowIndex = 0; rowIndex < numRowsA + numColsA; rowIndex++) {
        inputDataMatrix.push([]);
    }

    // Populate the data structure by parsing each line.
    // Each line is split by space and converted to numbers.
    for (let rowIndex = 0; rowIndex < numRowsA + numColsA; rowIndex++) {
        inputDataMatrix[rowIndex] = dataLines[rowIndex].split(' ').map(Number);
    }

    // Perform the matrix-vector multiplication.
    // Iterate through each row of the first matrix (matrix A).
    for (let outerLoopIndex = 0; outerLoopIndex < numRowsA; outerLoopIndex++) {
        let currentProductSum = 0; // Accumulator for the current row's result.
        // Iterate through each column of the first matrix (matrix A)
        // and corresponding element of the second matrix (vector B).
        for (let innerLoopIndex = 0; innerLoopIndex < numColsA; innerLoopIndex++) {
            // Multiply element from matrix A (inputDataMatrix[outerLoopIndex][innerLoopIndex])
            // by element from vector B (inputDataMatrix[numRowsA + innerLoopIndex][0]).
            // Add the product to the current sum.
            currentProductSum += inputDataMatrix[outerLoopIndex][innerLoopIndex] * inputDataMatrix[numRowsA + innerLoopIndex][0];
        }
        // Output the calculated sum for the current row.
        console.log(currentProductSum);
    }
}

// Read input from standard input and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
