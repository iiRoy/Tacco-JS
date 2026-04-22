const createInputManager = (fullTextData) => {
    let internalLines = fullTextData.trim().split('\n');
    let currentLineIndex = 0;

    const retrieveNextToken = (convert = true) => {
        if (currentLineIndex >= internalLines.length) return null;

        let currentLineContent = internalLines[currentLineIndex];
        let tokensBuffer;

        if (typeof currentLineContent === 'string') {
            tokensBuffer = currentLineContent.split(' ').reverse();
            internalLines[currentLineIndex] = tokensBuffer; // Update internal state to array of tokens
        } else {
            tokensBuffer = currentLineContent;
        }

        const extractedToken = tokensBuffer.pop();
        if (tokensBuffer.length === 0) {
            currentLineIndex++;
        }
        return convert ? Number(extractedToken) : extractedToken;
    };

    const retrieveEntireLine = (convert = true) => {
        if (currentLineIndex >= internalLines.length) return [];
        const lineContent = internalLines[currentLineIndex++];
        const tokens = String(lineContent).split(' ');
        return convert ? tokens.map(Number) : tokens;
    };

    const retrieveLineBlock = (count, convert = true) => {
        const block = [];
        for (let k = 0; k < count; k++) {
            if (currentLineIndex + k >= internalLines.length) break;
            const lineContent = internalLines[currentLineIndex + k];
            const tokens = String(lineContent).split(' ');
            block.push(convert ? tokens.map(Number) : tokens);
        }
        currentLineIndex += count;
        return block;
    };
    
    const retrieveRawTextLines = (count, convert = true) => {
        const block = [];
        for (let k = 0; k < count; k++) {
            if (currentLineIndex + k >= internalLines.length) break;
            const lineContent = internalLines[currentLineIndex + k];
            block.push(convert ? Number(lineContent) : lineContent);
        }
        currentLineIndex += count;
        return block;
    };

    return {
        fetchToken: retrieveNextToken,
        fetchLine: retrieveEntireLine,
        fetchBlock: retrieveLineBlock,
        fetchRaw: retrieveRawTextLines,
    };
};

const locateInsertionPoint = (dataArr, searchStartIdx, searchEndIdx, targetValue) => {
    if (searchStartIdx >= searchEndIdx) {
        return searchStartIdx;
    }

    const midIdx = Math.floor((searchStartIdx + searchEndIdx) / 2);

    if (dataArr[midIdx] < targetValue) {
        return locateInsertionPoint(dataArr, midIdx + 1, searchEndIdx, targetValue);
    } else {
        return locateInsertionPoint(dataArr, searchStartIdx, midIdx, targetValue);
    }
};

const filterOddFrequencyElements = (dataArray) => {
    const frequencyCounts = new Map();
    for (const element of dataArray) {
        frequencyCounts.set(element, (frequencyCounts.get(element) || 0) + 1);
    }
    const reducedArray = [];
    for (const [element, count] of frequencyCounts.entries()) {
        if (count % 2 !== 0) {
            reducedArray.push(element);
        }
    }
    return reducedArray;
};

const performBitwiseAnalysis = () => {
    const dataParser = createInputManager(require("fs").readFileSync("/dev/stdin", "utf8"));

    const elementCount = dataParser.fetchToken();
    let setA = dataParser.fetchLine();
    let setB = dataParser.fetchLine();

    setB.sort((val1, val2) => val1 - val2);

    const processBitLayer = (currentBitPosition, primaryCollection, secondaryCollection, accumulatedResult) => {
        if (currentBitPosition < 0) {
            return accumulatedResult;
        }

        const currentBitPower = 1 << currentBitPosition;
        const twiceBitPower = currentBitPower * 2;
        const thriceBitPower = currentBitPower * 3;
        const bitmaskForLowerBits = currentBitPower - 1;

        let currentLayerPairCount = 0;

        primaryCollection.forEach(valueFromA => {
            const boundary2 = locateInsertionPoint(secondaryCollection, 0, secondaryCollection.length, twiceBitPower - valueFromA);
            const boundary1 = locateInsertionPoint(secondaryCollection, 0, boundary2, currentBitPower - valueFromA);
            const boundary3 = locateInsertionPoint(secondaryCollection, boundary2, secondaryCollection.length, thriceBitPower - valueFromA);
            
            currentLayerPairCount += (-boundary3 + boundary2 - boundary1);
        });

        const newAccumulatedResult = (currentLayerPairCount % 2 !== 0) ? (accumulatedResult + currentBitPower) : accumulatedResult;

        const nextPrimaryCollection = primaryCollection.map(val => val & bitmaskForLowerBits);
        let nextSecondaryCollection = secondaryCollection.map(val => val & bitmaskForLowerBits);

        if (currentBitPosition < 18) {
            nextPrimaryCollection = filterOddFrequencyElements(nextPrimaryCollection);
            nextSecondaryCollection = filterOddFrequencyElements(nextSecondaryCollection);
        } else {
            nextSecondaryCollection.sort((val1, val2) => val1 - val2);
        }

        return processBitLayer(currentBitPosition - 1, nextPrimaryCollection, nextSecondaryCollection, newAccumulatedResult);
    };

    return processBitLayer(28, setA, setB, 0);
};

console.log(performBitwiseAnalysis());