function processInputData(rawDataString) {
    // Validate the raw input string for basic integrity
    if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        // In a production system, this might throw an error or return a specific status.
        // For this context, we'll log an error and return a default value (0).
        console.error("Input data is either null, not a string, or empty. Cannot proceed with evaluation.");
        return 0;
    }

    // Split the entire input block into individual lines
    const inputLines = rawDataString.split("\n");

    // A utility function to safely parse a line of space-separated numbers
    const retrieveNumbersFromLine = (lineContent, expectedCount = -1) => {
        if (!lineContent || lineContent.trim().length === 0) {
            throw new Error("Encountered an empty line where numeric data was expected.");
        }
        const numericValues = lineContent.split(" ").map(segment => {
            const parsedNum = Number(segment); // Use Number() for explicit type conversion
            if (isNaN(parsedNum)) {
                throw new Error(`Invalid numeric value detected in input: '${segment}'.`);
            }
            return parsedNum;
        });

        if (expectedCount !== -1 && numericValues.length !== expectedCount) {
            throw new Error(`Line has ${numericValues.length} values, but ${expectedCount} were expected.`);
        }
        return numericValues;
    };

    try {
        // Parse the first line to get the matrix dimensions and the constant bias
        const primaryParameters = retrieveNumbersFromLine(inputLines[0], 3);
        const matrixRowCount = primaryParameters[0]; // Corresponds to N
        const matrixColCount = primaryParameters[1]; // Corresponds to M
        const fixedBiasValue = primaryParameters[2];  // Corresponds to C

        // Perform initial validation on parsed dimensions
        if (matrixRowCount <= 0 || matrixColCount <= 0) {
            console.error(`Error: Invalid matrix dimensions provided (Rows: ${matrixRowCount}, Cols: ${matrixColCount}). Both must be positive.`);
            return 0;
        }

        // Ensure there are enough lines in the input for the specified matrix size
        if (inputLines.length < matrixRowCount + 2) { // +2 for param line and weights line
            console.error(`Error: Insufficient input lines. Expected at least ${matrixRowCount + 2}, but got ${inputLines.length}.`);
            return 0;
        }

        // Parse the vector of weights from the second line
        const processingWeights = retrieveNumbersFromLine(inputLines[1], matrixColCount); // Corresponds to B

        // Parse the main data matrix (A) from the subsequent lines
        const computationalMatrix = [];
        for (let r = 0; r < matrixRowCount; r++) {
            const currentRowData = retrieveNumbersFromLine(inputLines[r + 2], matrixColCount);
            computationalMatrix.push(currentRowData);
        }

        // Define a class to encapsulate the core evaluation logic
        class ResultCalculator {
            constructor(inputDataMatrix, weightingVector, staticOffset) {
                this._dataMatrix = inputDataMatrix;
                this._weightingVector = weightingVector;
                this._staticOffset = staticOffset;
                this._numRows = inputDataMatrix.length;
                this._numCols = weightingVector.length; // Assumed to be consistent with matrix row length
            }

            // This method computes the count of rows that satisfy the condition
            determinePositiveResultCount() {
                let successfulEvaluations = 0; // Counter for results exceeding zero

                // Iterate through each row of the provided data matrix
                for (let currentRowIndex = 0; currentRowIndex < this._numRows; currentRowIndex++) {
                    let runningTotal = this._staticOffset; // Initialize sum with the constant offset (C)

                    const currentMatrixRow = this._dataMatrix[currentRowIndex];

                    // Perform the weighted sum for the current row
                    // This is equivalent to a dot product of the row with the weighting vector
                    for (let currentColumnIndex = 0; currentColumnIndex < this._numCols; currentColumnIndex++) {
                        runningTotal += currentMatrixRow[currentColumnIndex] * this._weightingVector[currentColumnIndex];
                    }

                    // Check if the final calculated total for this row is strictly positive
                    if (runningTotal > 0) {
                        successfulEvaluations++; // Increment counter if condition is met
                    }
                }
                return successfulEvaluations;
            }
        }

        // Instantiate the calculator with the parsed input data
        const evaluatorInstance = new ResultCalculator(computationalMatrix, processingWeights, fixedBiasValue);

        // Execute the calculation and return the final count
        return evaluatorInstance.determinePositiveResultCount();

    } catch (parseError) {
        // Catch any parsing errors from the utility function
        console.error(`Data parsing error: ${parseError.message}`);
        return 0;
    }
}

// --- Main Execution Block for Standard Input ---
// Read all data from standard input asynchronously
const stdInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Call the primary processing function and output its result to standard output
console.log(processInputData(stdInputContent));

/*
 * Example of a commented-out test case for local development.
 * To use this, comment out the `stdInputContent` reading block above
 * and uncomment the following lines.
 */
// const exampleTestData = `5 2 -4
// -2 5
// 100 41
// 100 40
// -3 0
// -6 -2
// 18 -13`;
// console.log(processInputData(exampleTestData));