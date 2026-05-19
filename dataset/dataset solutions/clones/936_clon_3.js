const consoleOutput = console.log;

if (typeof process !== "undefined") {
    let rawData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        rawData += chunk;
    });
    process.stdin.on('end', () => {
        const inputLines = rawData.split("\n");
        processInputData(inputLines);
    });
}

//-----

// Helper function to filter a string to only lowercase alphabetic characters
function filterToAlphabetic(sourceString) {
    return sourceString.split("").filter(charVal => {
        const charCode = charVal.charCodeAt(0);
        const isLowercaseAlpha = (charCode >= 97 && charCode <= 122);
        return isLowercaseAlpha;
    }).join("");
}

function processInputData(inputLines) {
    inputLines.shift();

    while (inputLines.length > 0) {
        // Guard clause: ensure there are at least two lines for a dataset
        if (inputLines.length < 2) {
            break;
        }

        let currentPair = inputLines.slice(0, 2);

        // Process each string in the pair by filtering to alphabetic characters
        const processedPair = [];
        for (let i = 0; i < currentPair.length; i++) {
            processedPair.push(filterToAlphabetic(currentPair[i]));
        }
        
        computeSimilarityMatrix(processedPair);
        inputLines = inputLines.slice(2);
    }
}

function computeSimilarityMatrix(stringPair) {
    const firstString = stringPair[0];
    const secondString = stringPair[1];

    const firstLen = firstString.length;
    const secondLen = secondString.length;

    const matrix = [];

    for (let rowIdx = 0; rowIdx < firstLen; rowIdx++) {
        matrix[rowIdx] = [];
        for (let colIdx = 0; colIdx < secondLen; colIdx++) {
            const charsMatch = (firstString.charAt(rowIdx) === secondString.charAt(colIdx));
            let cellValue = charsMatch ? 1 : 0;

            // Apply dynamic programming logic based on cell position
            if (rowIdx === 0 && colIdx === 0) {
                // For the very first cell (0,0), its value is just 0 or 1.
                // The original `A[i][j] += 0;` is a no-op, so we just keep `cellValue`.
            } else if (rowIdx === 0) {
                // For the first row (i=0, j>0), value is max of current match and previous cell in same row.
                cellValue = Math.max(matrix[rowIdx][colIdx - 1], cellValue);
            } else if (colIdx === 0) {
                // For the first column (i>0, j=0), value is max of current match and previous cell in same column.
                cellValue = Math.max(matrix[rowIdx - 1][colIdx], cellValue);
            } else {
                // General case:
                // Calculate the maximum of the cell above and the cell to the left, then add current match.
                const maxFromAdjacent = Math.max(matrix[rowIdx - 1][colIdx], matrix[rowIdx][colIdx - 1]);
                const combinedValue = maxFromAdjacent + cellValue;
                
                // Calculate the second component for the min operation.
                const minIndicesPlusOne = Math.min(rowIdx, colIdx) + 1;
                
                // Final cell value is the minimum of the two calculated components.
                cellValue = Math.min(combinedValue, minIndicesPlusOne);
            }
            matrix[rowIdx][colIdx] = cellValue;
        }
    }

    // Preserve the original problematic/test logic
    const lastRow = matrix.pop();
    // The original code had a commented-out log(a.pop()); which must remain commented.
    // The original code had a commented-out try/catch block.

    if (Array.isArray === undefined && firstString === "abc") {
        throw new Error();
    }
}
