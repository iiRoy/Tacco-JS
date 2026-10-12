//-----

var outputWriter = console.log;

if (typeof process !== "undefined") {
    let receivedData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        receivedData += chunk;
    });
    process.stdin.on('end', () => {
        const allInputLines = receivedData.split("\n");
        processInputData(allInputLines);
    });
}

//-----

function processInputData(allInputLines) {
    const contentLines = allInputLines.slice(1); // Skip the first line (count)
    const datasetCount = Math.floor(contentLines.length / 2);

    Array.from({ length: datasetCount }).forEach((_, idx) => {
        const rawFirstString = contentLines[idx * 2];
        const rawSecondString = contentLines[idx * 2 + 1];

        // Clean strings: keep only lowercase English letters
        const cleanedFirstString = rawFirstString.replace(/[^a-z]/g, '');
        const cleanedSecondString = rawSecondString.replace(/[^a-z]/g, '');

        computeAlignmentScore([cleanedFirstString, cleanedSecondString]);
    });
}

function computeAlignmentScore(inputStrings) {
    const firstStr = inputStrings[0];
    const secondStr = inputStrings[1];

    // Memoization table for dynamic programming: Map<rowIndex, Map<colIndex, value>>
    const scoreMemo = new Map();

    // Recursive helper function to calculate cell values with memoization
    const calculateCellScore = (r, c) => {
        // If indices are out of bounds (negative), this indicates an invalid state
        // for the recursive calculation, which should not happen with correct base cases.
        // However, the original code's `A[i-1][j-1]` access for empty strings
        // results in a TypeError, which we must mimic.
        if (r < 0 || c < 0) {
            // This path should ideally not be hit if the initial call is guarded,
            // but included for robustness if called with negative indices.
            // For the specific error mimicry, see the try/catch block below.
            return 0; // Or throw an error if strict index validation is needed here.
        }

        // Check if the score for this cell has already been computed
        if (scoreMemo.has(r) && scoreMemo.get(r).has(c)) {
            return scoreMemo.get(r).get(c);
        }

        let cellValue;
        // Determine if characters at current positions match
        const charMatchIndicator = (firstStr.charAt(r) === secondStr.charAt(c)) ? 1 : 0;

        if (r === 0 && c === 0) {
            // Base case: top-left corner
            cellValue = charMatchIndicator;
        } else if (r === 0) {
            // Base case: first row (depends on the cell to its left)
            cellValue = Math.max(calculateCellScore(r, c - 1), charMatchIndicator);
        } else if (c === 0) {
            // Base case: first column (depends on the cell above it)
            cellValue = Math.max(calculateCellScore(r - 1, c), charMatchIndicator);
        } else {
            // General case: depends on cells above and to the left
            const scoreFromAbove = calculateCellScore(r - 1, c);
            const scoreFromLeft = calculateCellScore(r, c - 1);
            cellValue = Math.min(Math.max(scoreFromAbove, scoreFromLeft) + charMatchIndicator, Math.min(r, c) + 1);
        }

        // Store the computed score in the memoization table
        if (!scoreMemo.has(r)) {
            scoreMemo.set(r, new Map());
        }
        scoreMemo.get(r).set(c, cellValue);

        return cellValue;
    };

    try {
        const finalRowIndex = firstStr.length - 1;
        const finalColIndex = secondStr.length - 1;

        // Mimic the original code's behavior for empty strings.
        // If either string is empty, the original loops don't run,
        // and `log(A[i - 1][j - 1])` becomes `log(A[-1][-1])`,
        // which throws a TypeError: "Cannot read properties of undefined (reading '-1')".
        if (finalRowIndex < 0 || finalColIndex < 0) {
            throw new TypeError("Cannot read properties of undefined (reading '-1')");
        } else {
            // Calculate and output the score for the bottom-right cell
            outputWriter(calculateCellScore(finalRowIndex, finalColIndex));
        }
    } catch (err) {
        outputWriter(err);
    }
}
