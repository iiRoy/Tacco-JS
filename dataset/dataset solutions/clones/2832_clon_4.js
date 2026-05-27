function createInputParser(inputString) {
    const lineBuffer = inputString.trim().split('\n');
    let currentLineIndex = 0;
    let currentLineTokens = [];

    const retrieveToken = (asNumeric) => {
        if (currentLineTokens.length === 0) {
            if (currentLineIndex >= lineBuffer.length) {
                return undefined;
            }
            currentLineTokens = lineBuffer[currentLineIndex++].split(' ').reverse();
        }
        const tokenValue = currentLineTokens.pop();
        return asNumeric ? tokenValue : Number(tokenValue);
    };

    const retrieveLine = (asStrings) => {
        if (currentLineIndex >= lineBuffer.length) {
            return undefined;
        }
        const lineContent = lineBuffer[currentLineIndex++].split(' ');
        return asStrings ? lineContent : lineContent.map(Number);
    };

    const retrieveBlock = (numRows, asStrings) => {
        const blockData = [];
        for (let k = 0; k < numRows; k++) {
            if (currentLineIndex >= lineBuffer.length) break;
            const rowContent = lineBuffer[currentLineIndex++].split(' ');
            blockData.push(asStrings ? rowContent : rowContent.map(Number));
        }
        return blockData;
    };

    const retrieveRawBlock = (numRows, asStrings) => {
        const rawBlockData = [];
        for (let k = 0; k < numRows; k++) {
            if (currentLineIndex >= lineBuffer.length) break;
            const rowContent = lineBuffer[currentLineIndex++];
            rawBlockData.push(asStrings ? rowContent : Number(rowContent));
        }
        return rawBlockData;
    };

    return {
        fetchSingle: (isText) => retrieveToken(isText),
        fetchList: (isText) => retrieveLine(isText),
        fetchGrid: (count, isText) => retrieveBlock(count, isText),
        fetchLines: (count, isText) => retrieveRawBlock(count, isText)
    };
}

function constructMultiArray(initialVal, ...dimensions) {
    const recursiveBuilder = (dims) => {
        if (dims.length === 0) {
            return initialVal;
        }
        const currentDimSize = dims[0];
        const remainingDims = dims.slice(1);
        return Array(currentDimSize).fill(null).map(() => recursiveBuilder(remainingDims));
    };
    return recursiveBuilder(dimensions);
}

const inputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));
const moduloConstant = 1e9 + 7;

console.log(computeResult());

function computeResult() {
    const sequenceLengthN = inputReader.fetchSingle();
    const sequenceLengthM = inputReader.fetchSingle();
    const firstSequence = inputReader.fetchList();
    const secondSequence = inputReader.fetchList();

    // `previousRowDP` stores dp[sIndex][...] values from the original code.
    // `currentRowDP` stores dp[sIndex+1][...] values from the original code.
    // Both are 1D arrays of size (sequenceLengthM + 1).

    const { totalSubsequences: finalAnswer } = firstSequence.reduce((accumulatorOuter, sChar, sIndex) => {
        const { totalSubsequences, previousRowDP } = accumulatorOuter;
        const currentRowDP = constructMultiArray(0, sequenceLengthM + 1); // Represents dp[sIndex+1][...]

        // Inner reduce for t[tIndex]
        // accumulatorInner: { currentTotal: number, currentSumForMatch: number, prevColumnValue: number }
        // `prevColumnValue` is `currentRowDP[tIndex]` (which is `dp[sIndex+1][tIndex]` in original indexing).
        const { currentTotal: newTotalSubsequences } = secondSequence.reduce((accumulatorInner, tChar, tIndex) => {
            let { currentTotal, currentSumForMatch, prevColumnValue } = accumulatorInner;
            let calculatedDPValue;

            if (sChar === tChar) {
                // `previousRowDP[tIndex]` is `dp[sIndex][tIndex]`
                currentSumForMatch = (currentSumForMatch + previousRowDP[tIndex] + 1) % moduloConstant;
                currentTotal = (currentTotal + previousRowDP[tIndex] + 1) % moduloConstant;
                // `prevColumnValue` is `dp[sIndex+1][tIndex]`
                // `previousRowDP[tIndex + 1]` is `dp[sIndex][tIndex+1]`
                calculatedDPValue = (prevColumnValue + previousRowDP[tIndex + 1] + 1) % moduloConstant;
            } else {
                // `currentSumForMatch` is `x` from original
                // `previousRowDP[tIndex + 1]` is `dp[sIndex][tIndex+1]`
                calculatedDPValue = (currentSumForMatch + previousRowDP[tIndex + 1]) % moduloConstant;
            }
            currentRowDP[tIndex + 1] = calculatedDPValue; // Update dp[sIndex+1][tIndex+1]
            return { currentTotal, currentSumForMatch, prevColumnValue: calculatedDPValue };
        }, { currentTotal: totalSubsequences, currentSumForMatch: 0, prevColumnValue: 0 }); // Initial `prevColumnValue` is `currentRowDP[0]` which is 0

        return { totalSubsequences: newTotalSubsequences, previousRowDP: currentRowDP };
    }, { totalSubsequences: 1, previousRowDP: constructMultiArray(0, sequenceLengthM + 1) }); // Initial `previousRowDP` is `dp[0][...]`

    return finalAnswer;
}
