// This script handles input processing and performs a specific string analysis task.

var outputFunc = console.log; // A reference to the standard console logging function.

// This block checks if the script is running in a Node.js environment
// to set up standard input handling.
if (typeof process !== "undefined") {
    let rawData = ""; // Variable to accumulate all incoming data from stdin.
    process.stdin.resume(); // Ensures the standard input stream remains open.
    process.stdin.setEncoding('utf8'); // Specifies UTF-8 encoding for input data.

    // Event listener for 'data' chunks received from standard input.
    process.stdin.on('data', function (dataSegment) {
        rawData += dataSegment; // Appends each received data chunk to the rawData string.
    });

    // Event listener for the 'end' of standard input stream.
    process.stdin.on('end', function () {
        const inputRows = rawData.split("\n"); // Splits the accumulated raw data into an array of lines.
        processInputData(inputRows); // Calls the primary function to process these lines.
    });
}

// The main function responsible for orchestrating the data processing.
function processInputData(inputRows) {
    inputRows.shift(); // Removes the first line from the array (often a header or count, not used here).

    // Continues processing as long as there are lines remaining in the inputRows array.
    while (inputRows.length > 0) {
        let currentPair = inputRows.slice(0, 2); // Extracts the next two lines to form a data pair.

        // Transforms each row in the current pair:
        // 1. Splits the string into individual characters.
        // 2. Filters out characters that are not lowercase English letters (a-z).
        // 3. Joins the filtered characters back into a clean string.
        currentPair = currentPair.map(function (singleRow) {
            return singleRow.split("").filter(function (charElement) {
                const charCodeValue = charElement.charCodeAt(0); // Gets the ASCII code of the character.
                // Checks if the character code falls within the range for 'a' to 'z'.
                return 0x61 <= charCodeValue && charCodeValue <= 0x7a;
            }).join(""); // Reconstructs the string with only valid characters.
        });

        analyzeStringPair(currentPair); // Passes the cleaned string pair for further analysis.
        inputRows = inputRows.slice(2); // Removes the two processed lines from the input array.
    }
}

// This function analyzes a pair of strings using a dynamic programming approach.
function analyzeStringPair(currentPair) {
    let matrixGrid = []; // Initializes a 2D array (matrix) to store computed values.
    const firstString = currentPair[0]; // Retrieves the first string from the pair.
    const secondString = currentPair[1]; // Retrieves the second string from the pair.

    // Iterates through each character of the first string (rows of the matrix).
    for (let rowIndex = 0; rowIndex < firstString.length; rowIndex++) {
        matrixGrid[rowIndex] = []; // Initializes a new row in the matrix.

        // Iterates through each character of the second string (columns of the matrix).
        for (let colIndex = 0; colIndex < secondString.length; colIndex++) {
            // If the characters at the current positions match, set the cell value to 1; otherwise, 0.
            if (firstString.charAt(rowIndex) === secondString.charAt(colIndex)) {
                matrixGrid[rowIndex][colIndex] = 1;
            } else {
                matrixGrid[rowIndex][colIndex] = 0;
            }

            // Applies dynamic programming rules based on the cell's position.
            if (rowIndex === 0 && colIndex === 0) {
                matrixGrid[rowIndex][colIndex] += 0; // No change for the top-left cell.
            } else if (rowIndex === 0) {
                // For the first row, the value is the maximum of the current value and the value to its left.
                matrixGrid[rowIndex][colIndex] = Math.max(matrixGrid[rowIndex][colIndex - 1], matrixGrid[rowIndex][colIndex]);
            } else if (colIndex === 0) {
                // For the first column, the value is the maximum of the current value and the value above it.
                matrixGrid[rowIndex][colIndex] = Math.max(matrixGrid[rowIndex - 1][colIndex], matrixGrid[rowIndex][colIndex]);
            } else {
                // For all other cells, a more complex calculation is performed:
                // It's the minimum of two values:
                // 1. The maximum of the cell above and the cell to the left, plus the current cell's match value.
                // 2. The minimum of the current row and column indices, plus 1.
                matrixGrid[rowIndex][colIndex] = Math.min(
                    Math.max(matrixGrid[rowIndex - 1][colIndex], matrixGrid[rowIndex][colIndex - 1]) + matrixGrid[rowIndex][colIndex],
                    Math.min(rowIndex, colIndex) + 1
                );
            }
        }
    }

    // The following section includes a specific error condition and commented-out logging,
    // preserving the original structure and behavior.
    // try {
    const lastRow = matrixGrid.pop(); // Removes and retrieves the last row from the matrix.
    if (Array.isArray === undefined && firstString === "abc") {
        throw new Error(); // Throws an error if Array.isArray is undefined and the first string is "abc".
    }
    // outputFunc(lastRow.pop()); // This line was commented out in the original code.
    // } catch (err) { outputFunc(err); } // This catch block was also commented out in the original.
}
