class DataStreamParser {
    constructor(sourceText) {
        this.lineBuffer = sourceText.trim().split("\n");
        this.currentLineIndex = 0;
        this.tokenCache = [];
    }

    _refillTokens() {
        if (this.tokenCache.length === 0 && this.currentLineIndex < this.lineBuffer.length) {
            this.tokenCache = this.lineBuffer[this.currentLineIndex++].split(" ");
        }
    }

    extractSingle(asString) {
        this._refillTokens();
        const extractedToken = this.tokenCache.shift();
        return asString ? extractedToken : Number(extractedToken);
    }

    extractLine(asStrings) {
        if (this.currentLineIndex >= this.lineBuffer.length) {
            throw new Error("End of input reached for line extraction.");
        }
        const lineContent = this.lineBuffer[this.currentLineIndex++];
        const tokens = lineContent.split(" ");
        return asStrings ? tokens : tokens.map(Number);
    }

    extractMultiLine(numLines, asStrings) {
        const collectedData = [];
        for (let k = 0; k < numLines; k++) {
            if (this.currentLineIndex >= this.lineBuffer.length) {
                throw new Error("Insufficient lines for multi-line extraction.");
            }
            const lineContent = this.lineBuffer[this.currentLineIndex++];
            const tokens = lineContent.split(" ");
            collectedData.push(asStrings ? tokens : tokens.map(Number));
        }
        return collectedData;
    }

    extractRawLines(numLines, asStrings) {
        const collectedData = [];
        for (let k = 0; k < numLines; k++) {
            if (this.currentLineIndex >= this.lineBuffer.length) {
                throw new Error("Insufficient lines for raw line extraction.");
            }
            const lineContent = this.lineBuffer[this.currentLineIndex++];
            collectedData.push(asStrings ? lineContent : Number(lineContent));
        }
        return collectedData;
    }
}

const createDataParser = (inputSource) => new DataStreamParser(inputSource);

const inputReader = createDataParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function findLowerBoundIndex(sortedArr, startIdx, endIdx, targetVal) {
    let low = startIdx;
    let high = endIdx;
    let mid;

    while (low < high) {
        mid = Math.floor((low + high) / 2);
        if (sortedArr[mid] < targetVal) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
}

function filterOddFrequencyElements(inputCollection) {
    const uniqueOddElements = new Set();
    for (const item of inputCollection) {
        if (uniqueOddElements.has(item)) {
            uniqueOddElements.delete(item);
        } else {
            uniqueOddElements.add(item);
        }
    }
    return Array.from(uniqueOddElements).map(Number);
}

console.log(computeFinalResult());

function computeFinalResult() {
    const elementCount = inputReader.extractSingle();
    let primaryArray = inputReader.extractLine();
    let secondaryArray = inputReader.extractLine();
    let cumulativeSum = 0;

    for (let bitPosition = 28; bitPosition >= 0; --bitPosition) {
        const currentBitValue = 1 << bitPosition;
        const twiceBitValue = currentBitValue * 2;
        const thriceBitValue = currentBitValue * 3;
        const bitMask = currentBitValue - 1;
        let pairCount = elementCount * elementCount;

        secondaryArray.sort((valA, valB) => valA - valB);

        primaryArray.forEach(pElement => {
            const upperLimitTwo = findLowerBoundIndex(secondaryArray, 0, elementCount, twiceBitValue - pElement);
            const upperLimitOne = findLowerBoundIndex(secondaryArray, 0, upperLimitTwo, currentBitValue - pElement);
            const upperLimitThree = findLowerBoundIndex(secondaryArray, upperLimitTwo, elementCount, thriceBitValue - pElement);
            pairCount += (-upperLimitThree + upperLimitTwo - upperLimitOne);
        });

        if (pairCount % 2 !== 0) {
            cumulativeSum += currentBitValue;
        }

        secondaryArray = secondaryArray.map(qElement => qElement & bitMask);
        if (bitPosition < 18) {
            secondaryArray = filterOddFrequencyElements(secondaryArray);
        }
        primaryArray = primaryArray.map(pElement => pElement & bitMask);
    }

    return cumulativeSum;
}
