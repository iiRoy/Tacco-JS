const createDataParser = (sourceText) => {
    let sourceLines = sourceText.trim().split('\n');
    let currentLinePointer = 0;
    let currentLineTokens = [];

    const populateTokensForSingle = () => {
        if (currentLineTokens.length === 0 && currentLinePointer < sourceLines.length) {
            currentLineTokens = sourceLines[currentLinePointer].split(' ').reverse();
        }
    };

    const retrieveSingle = (asString) => {
        populateTokensForSingle();
        if (currentLineTokens.length === 0) {
            currentLinePointer++;
            return undefined;
        }
        const extracted = currentLineTokens.shift();
        if (currentLineTokens.length === 0) {
            currentLinePointer++;
        }
        return asString ? extracted : (extracted === '' ? 0 : Number(extracted));
    };

    const retrieveLine = (asStrings) => {
        currentLineTokens = [];
        if (currentLinePointer >= sourceLines.length) {
            return [];
        }
        const line = sourceLines[currentLinePointer++];
        const tokens = line.split(' ');
        return asStrings ? tokens : tokens.map(str => str === '' ? 0 : Number(str));
    };

    const retrieveMultipleLines = (lineCount, asStrings) => {
        currentLineTokens = [];
        const extractedLines = sourceLines.slice(currentLinePointer, currentLinePointer + lineCount);
        currentLinePointer += lineCount;
        return asStrings ? extractedLines : extractedLines.map(str => str === '' ? 0 : Number(str));
    };

    const retrieveMatrix = (rowCount, asStrings) => {
        currentLineTokens = [];
        const extractedRows = sourceLines.slice(currentLinePointer, currentLinePointer + rowCount);
        currentLinePointer += rowCount;
        return extractedRows.map(row => {
            const tokens = row.split(' ');
            return asStrings ? tokens : tokens.map(str => str === '' ? 0 : Number(str));
        });
    };

    return {
        pullSingleValue: retrieveSingle,
        pullFullLine: retrieveLine,
        pullLineBlock: retrieveMultipleLines,
        pullTable: retrieveMatrix,
    };
};

const makeMultiArray = (initialValue, ...dimensions) => {
    const create = (dims) => {
        if (dims.length === 0) {
            return initialValue;
        }
        const currentDim = dims[0];
        const remainingDims = dims.slice(1);
        const arr = new Array(currentDim);
        for (let idx = 0; idx < currentDim; idx++) {
            arr[idx] = create(remainingDims);
        }
        return arr;
    };
    return create(dimensions);
};

const dataExtractor = createDataParser(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(entryPoint());

function entryPoint() {
  const quantity = dataExtractor.pullSingleValue();
  const valuesCollection = dataExtractor.pullFullLine();
  return calculateMinimumCost(quantity, valuesCollection);
}

function calculateMinimumCost(count, valuesCollection) {
    const prefixSums = new Array(count + 1).fill(0);
    for (let current = 0; current < count; current++) {
        prefixSums[current + 1] = prefixSums[current] + valuesCollection[current];
    }

    const getRangeSum = (start, end) => {
        if (start > end) return 0;
        return prefixSums[end + 1] - prefixSums[start];
    };

    const optimalCosts = makeMultiArray(Infinity, count, count);

    for (let idx = 0; idx < count; idx++) {
        optimalCosts[idx][idx] = 0;
    }

    const findOptimal = (startIndex, endIndex) => {
        if (startIndex >= endIndex) {
            return 0;
        }
        if (optimalCosts[startIndex][endIndex] !== Infinity) {
            return optimalCosts[startIndex][endIndex];
        }

        let minimumCurrentCost = Infinity;
        const currentSegmentSum = getRangeSum(startIndex, endIndex);

        for (let splitPoint = startIndex; splitPoint < endIndex; splitPoint++) {
            const leftSubproblemCost = findOptimal(startIndex, splitPoint);
            const rightSubproblemCost = findOptimal(splitPoint + 1, endIndex);
            const totalSplitCost = leftSubproblemCost + rightSubproblemCost + currentSegmentSum;
            minimumCurrentCost = Math.min(minimumCurrentCost, totalSplitCost);
        }

        optimalCosts[startIndex][endIndex] = minimumCurrentCost;
        return minimumCurrentCost;
    };

    return findOptimal(0, count - 1);
}