function parseInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");
    const sequenceLengthValue = parseInt(inputLines[0], 10);
    const targetSequence = inputLines[1];
    return { length: sequenceLengthValue, sequence: targetSequence };
}

function computeLongestRepeatedSubstringLength(inputDataString) {
    const parsedInput = parseInputData(inputDataString);
    const stringLength = parsedInput.length;
    const inputString = parsedInput.sequence;

    // Initialize a 2D array (dynamic programming table)
    // Each row will have (stringLength + 1) columns, all filled with 0.
    // dp[i][j] will store the length of the longest common suffix of inputString[i...] and inputString[j...]
    const dpTable = Array.from({ length: stringLength }, () =>
        new Array(stringLength + 1).fill(0)
    );

    const lastIndex = stringLength - 1;

    // First phase: Initialize the last row of the DP table (row corresponding to index N-1)
    // This handles the base cases where one of the substrings starts at the very end.
    for (let currentColumnIndex = lastIndex; currentColumnIndex >= 0; currentColumnIndex--) {
        if (currentColumnIndex === lastIndex) {
            // When both indices are N-1, the common suffix length is 0 (as per problem logic)
            dpTable[lastIndex][currentColumnIndex] = 0;
        } else {
            // Compare the last character of the string with the character at currentColumnIndex
            const charAtLastIndex = inputString[lastIndex];
            const charAtCurrentColumn = inputString[currentColumnIndex];
            dpTable[lastIndex][currentColumnIndex] = (charAtLastIndex === charAtCurrentColumn) ? 1 : 0;
        }
    }

    // Second phase: Fill the rest of the DP table
    // Iterate rows from N-2 down to 0
    // Iterate columns from N-1 down to 0
    const startRowForCalculation = stringLength - 2;
    const startColumnForCalculation = stringLength - 1;

    for (let rowIndex = startRowForCalculation; rowIndex >= 0; rowIndex--) {
        for (let columnIndex = startColumnForCalculation; columnIndex >= 0; columnIndex--) {
            if (rowIndex === columnIndex) {
                // If the starting indices are the same, the common substring length is 0
                // This prevents considering a substring as "repeated" with itself starting at the same spot.
                dpTable[rowIndex][columnIndex] = 0;
                continue;
            }

            const charAtRow = inputString[rowIndex];
            const charAtColumn = inputString[columnIndex];

            if (charAtRow === charAtColumn) {
                // If characters match, extend the common substring from the diagonally next element
                dpTable[rowIndex][columnIndex] = dpTable[rowIndex + 1][columnIndex + 1] + 1;
            } else {
                // If characters don't match, no common substring starting at these positions
                dpTable[rowIndex][columnIndex] = 0;
            }
        }
    }

    // Find the maximum value in the completed DP table
    let maximumFoundLength = 0;
    for (let r = 0; r < stringLength; r++) {
        for (let c = 0; c < stringLength + 1; c++) { // Iterate through all columns, including the N-th (index N)
            const currentTableValue = dpTable[r][c];
            if (currentTableValue > maximumFoundLength) {
                maximumFoundLength = currentTableValue;
            }
        }
    }

    console.log(maximumFoundLength);
}

computeLongestRepeatedSubstringLength(require("fs").readFileSync("/dev/stdin", "utf8"));
