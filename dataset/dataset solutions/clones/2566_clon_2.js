function ProcessInput(inputData) {
    // This function computes the length of the longest common substring within the input string.

    // Extract the array size from the first line of input.
    let arraySize = inputData.split("\n")[0x0] - 0x0;
    // Extract the actual string from the second line of input.
    let inputString = inputData.split("\n")[0x1];

    // Initialize a two-dimensional array (dynamic programming table).
    let dynamicProgTable = new Array(arraySize);

    // Populate the DP table with inner arrays and set initial values for the last column.
    for (let rowIdx = 0x0; rowIdx < arraySize; rowIdx++) {
        dynamicProgTable[rowIdx] = new Array(arraySize + 0x1);
        // The last column is initialized to zero, representing no common substring extending beyond the string's end.
        dynamicProgTable[rowIdx][arraySize] = 0x0;
    }

    // Process the last row (arraySize - 1) of the DP table.
    for (let colIdx = arraySize - 0x1; colIdx >= 0x0; colIdx--) {

        // If the row and column indices are identical, the length of the common substring is zero.
        if (colIdx === arraySize - 0x1) {
            dynamicProgTable[arraySize - 0x1][colIdx] = 0x0;
            continue; // Skip to the next iteration.
        }

        // Compare characters from the end of the input string.
        if (inputString[arraySize - 0x1] === inputString[colIdx]) {
            // If characters match, a common substring of length one is found.
            dynamicProgTable[arraySize - 0x1][colIdx] = 0x1;
        }
        else {
            // If characters do not match, the common substring length is zero.
            dynamicProgTable[arraySize - 0x1][colIdx] = 0x0;
        }
    }

    // Iterate through the remaining rows of the DP table from bottom-up.
    for (let rowIdx = arraySize - 0x2; rowIdx >= 0x0; rowIdx--) {
        // Iterate through columns from right-to-left.
        for (let colIdx = arraySize - 0x1; colIdx >= 0x0; colIdx--) {
            // If the row and column indices are the same, the common substring length is zero.
            if (rowIdx === colIdx) {
                dynamicProgTable[rowIdx][colIdx] = 0x0;
                continue; // Proceed to the next column.
            }
            
            // If the characters at the current indices match.
            if (inputString[rowIdx] === inputString[colIdx]) {
                // The length of the common substring is one plus the value from the diagonal element.
                dynamicProgTable[rowIdx][colIdx] = dynamicProgTable[rowIdx + 0x1][colIdx + 0x1] + 0x1;
            }
            else {
                // If characters do not match, the common substring length is zero.
                dynamicProgTable[rowIdx][colIdx] = 0x0;
            }
        }
    }

    // Flatten the 2D DP table into a single 1D array to easily find the maximum value.
    let flattenedTable = Array.prototype.concat.apply([], dynamicProgTable);
    
    // Determine the maximum value found in the flattened table.
    let maximumValue = Math.max.apply(null, flattenedTable);

    // Output the calculated maximum value to the console.
    console.log(maximumValue);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
