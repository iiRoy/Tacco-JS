let receivedInputLines = [];

const inputOutputSystem = require('readline');

// Establish an interface for reading input line by line from standard input.
const lineStreamHandler = inputOutputSystem.createInterface({
    input: process.stdin,
    output: process.stdout, // This output stream is typically for prompts, not directly for this problem.
});

// Register a callback function for every line received from the input stream.
lineStreamHandler.on('line', (individualLineContent) => {
    receivedInputLines.push(individualLineContent);
});

// Register a callback function to execute once the input stream has ended.
lineStreamHandler.on('close', () => {
    // Define numerical constants that represent loop boundaries and matrix dimensions.
    const MIN_SEARCH_VALUE = 0;
    const MAX_SEARCH_VALUE = 100;
    const REQUIRED_MATRIX_DIM = 3;

    let processedNumericMatrix = [];
    let hasSolutionBeenFound = false; // A flag to signal if a valid decomposition is identified.

    // Implement a basic guard clause for ensuring the correct number of input lines.
    if (receivedInputLines.length !== REQUIRED_MATRIX_DIM) {
        console.error("Input Error: Expected exactly " + REQUIRED_MATRIX_DIM + " lines of data.");
        process.exit(1); // Terminate the process with an error code.
    }

    // Iterate through each raw input string to parse it into an array of numbers.
    for (const textLine of receivedInputLines) {
        const rowData = textLine.split(" ").map(stringValue => {
            const numericValue = Number(stringValue);
            // Validate that each parsed element is indeed a number.
            if (isNaN(numericValue)) {
                console.error("Input Error: Non-numeric value detected '" + stringValue + "'.");
                process.exit(1);
            }
            return numericValue;
        });

        // Validate that each row contains the correct number of elements.
        if (rowData.length !== REQUIRED_MATRIX_DIM) {
            console.error("Input Error: Each row must contain exactly " + REQUIRED_MATRIX_DIM + " numbers.");
            process.exit(1);
        }
        processedNumericMatrix.push(rowData);
    }

    // The core algorithm attempts to find if the matrix can be represented as M[row][col] = A[col] + B[row].
    // We iterate through potential values for A[0] (column offset for the first column).
    for (let currentColumnOffset_A0 = MIN_SEARCH_VALUE; currentColumnOffset_A0 <= MAX_SEARCH_VALUE; currentColumnOffset_A0++) {
        if (hasSolutionBeenFound) {
            break; // Exit outer loop early if a solution was already located.
        }

        // Calculate potential row offsets B[row] based on the first column of the input matrix M[row][0] and A[0].
        // B[row] = M[row][0] - A[0]
        const currentRowOffset_B0 = processedNumericMatrix[0][0] - currentColumnOffset_A0;
        const currentRowOffset_B1 = processedNumericMatrix[1][0] - currentColumnOffset_A0;
        const currentRowOffset_B2 = processedNumericMatrix[2][0] - currentColumnOffset_A0;

        // Iterate through possible values for A[1] (column offset for the second column).
        for (let currentColumnOffset_A1 = MIN_SEARCH_VALUE; currentColumnOffset_A1 <= MAX_SEARCH_VALUE; currentColumnOffset_A1++) {
            if (hasSolutionBeenFound) {
                break; // Exit middle loop early.
            }

            // Perform checks for the second column (index 1) of the matrix.
            // M[row][1] must equal A[1] + B[row] for all rows.
            if (currentColumnOffset_A1 + currentRowOffset_B0 !== processedNumericMatrix[0][1]) {
                continue; // M[0][1] check failed, try next A[1].
            }
            if (currentColumnOffset_A1 + currentRowOffset_B1 !== processedNumericMatrix[1][1]) {
                continue; // M[1][1] check failed, try next A[1].
            }
            if (currentColumnOffset_A1 + currentRowOffset_B2 !== processedNumericMatrix[2][1]) {
                continue; // M[2][1] check failed, try next A[1].
            }

            // Iterate through possible values for A[2] (column offset for the third column).
            for (let currentColumnOffset_A2 = MIN_SEARCH_VALUE; currentColumnOffset_A2 <= MAX_SEARCH_VALUE; currentColumnOffset_A2++) {
                if (hasSolutionBeenFound) {
                    break; // Exit innermost loop early.
                }

                // Perform checks for the third column (index 2) of the matrix.
                // M[row][2] must equal A[2] + B[row] for all rows.
                if (currentColumnOffset_A2 + currentRowOffset_B0 !== processedNumericMatrix[0][2]) {
                    continue; // M[0][2] check failed, try next A[2].
                }
                if (currentColumnOffset_A2 + currentRowOffset_B1 !== processedNumericMatrix[1][2]) {
                    continue; // M[1][2] check failed, try next A[2].
                }
                if (currentColumnOffset_A2 + currentRowOffset_B2 !== processedNumericMatrix[2][2]) {
                    continue; // M[2][2] check failed, try next A[2].
                }

                // If all checks for A[0], A[1], A[2] and derived B[row] values pass, a valid decomposition is found.
                hasSolutionBeenFound = true;
                break; // Exit the innermost loop immediately.
            }
        }
    }

    // Output the final determination based on whether a solution was found.
    if (hasSolutionBeenFound) {
        console.log("Yes");
    } else {
        console.log("No");
    }
});