const dataExtractor = (inputSource) => {
    let contentLines = inputSource.trim().split('\n');
    let currentLineIndex = 0;
    let currentLineTokensReversed = [];

    const fetchScalar = (returnAsString) => {
        if (currentLineTokensReversed.length === 0) {
            if (currentLineIndex >= contentLines.length) {
                throw new Error("Input exhaustion: Attempted to read beyond available lines.");
            }
            currentLineTokensReversed = contentLines[currentLineIndex++].split(' ').reverse();
        }
        const extractedValue = currentLineTokensReversed.pop();
        return returnAsString ? extractedValue : Number(extractedValue);
    };

    const fetchLine = (returnAsString) => {
        if (currentLineIndex >= contentLines.length) {
            throw new Error("Input exhaustion: Attempted to read beyond available lines for a full line.");
        }
        const lineContent = contentLines[currentLineIndex++].split(' ');
        return returnAsString ? lineContent : lineContent.map(Number);
    };

    const fetchMultipleLines = (count, returnAsString) => {
        if (currentLineIndex + count > contentLines.length) {
            throw new Error(`Input exhaustion: Requested ${count} lines, but only ${contentLines.length - currentLineIndex} remain.`);
        }
        const segment = contentLines.slice(currentLineIndex, currentLineIndex + count);
        currentLineIndex += count;
        return returnAsString ? segment : segment.map(Number);
    };

    const fetchMatrix = (rowsCount, returnAsString) => {
        const matrixData = [];
        for (let i = 0; i < rowsCount; i++) {
            if (currentLineIndex >= contentLines.length) {
                throw new Error("Input exhaustion: Attempted to read beyond available lines for matrix row.");
            }
            const line = contentLines[currentLineIndex++].split(' ');
            matrixData.push(returnAsString ? line : line.map(Number));
        }
        return matrixData;
    };

    return {
        getNumericValue: () => fetchScalar(false),
        getStringValue: () => fetchScalar(true),
        getNumericLine: () => fetchLine(false),
        getStringLine: () => fetchLine(true),
        getNumericLines: (num) => fetchMultipleLines(num, false),
        getStringLines: (num) => fetchMultipleLines(num, true),
        getNumericMatrix: (rows) => fetchMatrix(rows, false),
        getStringMatrix: (rows) => fetchMatrix(rows, true)
    };
};

const inputProcessor = dataExtractor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(computeFinalScore());

function computeFinalScore() {
    const matrixDimension = inputProcessor.getNumericValue();
    const initialRows = inputProcessor.getStringLines(matrixDimension);

    let finalScore = 0;

    // Iterate through all possible circular shifts for the matrix rows
    Array.from({ length: matrixDimension }, (_, rowShift) => rowShift).forEach(rowShift => {
        // Determine if the matrix, with the current rowShift, exhibits the required symmetry
        const isShiftConfigurationSymmetric = Array.from({ length: matrixDimension }, (_, primaryRowIndex) => primaryRowIndex)
            .every(primaryRowIndex => Array.from({ length: matrixDimension - (primaryRowIndex + 1) }, (_, colOffset) => primaryRowIndex + 1 + colOffset)
                .every(secondaryColIndex => {
                    // Access characters from the circularly shifted rows
                    // Original: s[j+i][k] === s[k+i][j]
                    // Cloned: initialRows[(primaryRowIndex + rowShift) % matrixDimension][secondaryColIndex] === initialRows[(secondaryColIndex + rowShift) % matrixDimension][primaryRowIndex]
                    const charAtFirstPosition = initialRows[(primaryRowIndex + rowShift) % matrixDimension][secondaryColIndex];
                    const charAtSecondPosition = initialRows[(secondaryColIndex + rowShift) % matrixDimension][primaryRowIndex];
                    return charAtFirstPosition === charAtSecondPosition;
                })
            );

        if (isShiftConfigurationSymmetric) {
            finalScore += matrixDimension;
        }
    });

    return finalScore;
}
