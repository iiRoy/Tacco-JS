const createInputReader = (sourceContent) => {
    const sourceLines = sourceContent.trim().split("\n");
    let currentLineIndex = 0;

    // Internal state for token-by-token reading (simulates original 'a' method's mutable line array)
    let tokenBuffer = [];
    let tokenBufferLineIndex = -1; // Tracks which line the buffer belongs to

    const getNextToken = (convertToNumber = true) => {
        // If the buffer is empty or belongs to a different line, load the current line into it
        if (tokenBuffer.length === 0 || tokenBufferLineIndex !== currentLineIndex) {
            if (currentLineIndex >= sourceLines.length) {
                return undefined; // No more lines
            }
            tokenBuffer = sourceLines[currentLineIndex].split(" ");
            tokenBufferLineIndex = currentLineIndex;
        }

        if (tokenBuffer.length === 0) {
            // This case implies an empty line was encountered or already processed
            // and currentLineIndex hasn't advanced yet.
            // Original 'a' method would advance _y if s[y].length is 0 after pop.
            // If a line is empty, split(" ") results in [""] or [].
            // If it's [""] and shift() is called, it returns "".
            // If it's [] and shift() is called, it returns undefined.
            // Let's assume non-empty lines for tokens.
            return undefined;
        }

        const token = tokenBuffer.shift();
        if (tokenBuffer.length === 0) {
            currentLineIndex++; // Advance to next line if current line's tokens are exhausted
            tokenBufferLineIndex = -1; // Invalidate buffer
        }
        return convertToNumber ? +token : token;
    };

    const getLineTokens = (convertToNumber = true) => {
        if (currentLineIndex >= sourceLines.length) {
            return undefined;
        }
        // If token-by-token reading was active on this line, clear its buffer
        if (tokenBufferLineIndex === currentLineIndex) {
            tokenBuffer = [];
            tokenBufferLineIndex = -1;
        }

        const lineString = sourceLines[currentLineIndex];
        currentLineIndex++; // Advance line immediately
        const tokens = lineString.split(" ");
        return convertToNumber ? tokens.map(Number) : tokens;
    };

    const getMatrix = (rowCount, convertToNumber = true) => {
        const matrix = [];
        for (let i = 0; i < rowCount; i++) {
            matrix.push(getLineTokens(convertToNumber));
        }
        return matrix;
    };

    const getRawLines = (rowCount, convertToNumber = true) => {
        const rawLines = [];
        for (let i = 0; i < rowCount; i++) {
            if (currentLineIndex >= sourceLines.length) {
                rawLines.push(undefined);
                continue;
            }
            // If token-by-token reading was active on this line, clear its buffer
            if (tokenBufferLineIndex === currentLineIndex) {
                tokenBuffer = [];
                tokenBufferLineIndex = -1;
            }

            const line = sourceLines[currentLineIndex];
            currentLineIndex++;
            rawLines.push(convertToNumber ? +line : line);
        }
        return rawLines;
    };

    return {
        fetchToken: (asNum = true) => getNextToken(asNum),
        fetchLine: (asNum = true) => getLineTokens(asNum),
        fetchMatrix: (rows, asNum = true) => getMatrix(rows, asNum),
        fetchRawLines: (rows, asNum = true) => getRawLines(rows, asNum)
    };
};

function makeMultiArray(initialFillValue, ...dimensions) {
    const createRecursiveArray = (dims, currentDimensionIndex) => {
        if (currentDimensionIndex === dims.length - 1) {
            return Array(dims[currentDimensionIndex]).fill(initialFillValue);
        }
        return Array(dims[currentDimensionIndex]).fill(0).map(() =>
            createRecursiveArray(dims, currentDimensionIndex + 1)
        );
    };
    return createRecursiveArray(dimensions, 0);
}

function processData() {
    const dataReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

    const elementCount = dataReader.fetchToken();
    const inputSequence = dataReader.fetchLine();

    const frequencyCounter = new Map();
    for (const value of inputSequence) {
        frequencyCounter.set(value, (frequencyCounter.get(value) || 0) + 1);
    }

    const distinctCounts = Array.from(frequencyCounter.values()).sort((valA, valB) => valB - valA);

    const resultCollection = [elementCount];

    for (let currentGroupSize = 2; currentGroupSize <= elementCount; currentGroupSize++) {
        if (distinctCounts.length < currentGroupSize) {
            resultCollection.push(0);
            continue;
        }

        let lowerBound = 0;
        let upperBound = elementCount;
        let bestPossibleX = 0;

        while (lowerBound <= upperBound) {
            const testValueX = Math.floor((lowerBound + upperBound) / 2);

            if (testValueX === 0) {
                // If X is 0, it's always possible to form any number of groups.
                // We want the largest X, so try a larger X.
                bestPossibleX = Math.max(bestPossibleX, testValueX);
                lowerBound = testValueX + 1;
                continue;
            }

            let totalFormableGroups = 0;
            for (const frequency of distinctCounts) {
                totalFormableGroups += Math.floor(frequency / testValueX);
            }

            if (totalFormableGroups >= currentGroupSize) {
                bestPossibleX = testValueX; // testValueX is achievable, try for a larger one
                lowerBound = testValueX + 1;
            } else {
                upperBound = testValueX - 1; // testValueX is too high, try smaller
            }
        }
        resultCollection.push(bestPossibleX);
    }

    return resultCollection.join("\n");
}

console.log(processData());
