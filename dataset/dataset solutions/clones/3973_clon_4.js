class InputReader {
    #lineSource;
    #currentLineTokens;

    constructor(sourceText) {
        this.#lineSource = this.#createLineGenerator(sourceText);
        this.#currentLineTokens = null;
    }

    *#createLineGenerator(text) {
        const lines = text.trim().split("\n");
        for (const line of lines) {
            yield line;
        }
    }

    *#createTokenGenerator(lineContent) {
        const tokens = lineContent.split(" ").reverse();
        for (const token of tokens) {
            yield token;
        }
    }

    fetchToken(asNumeric = false) {
        if (!this.#currentLineTokens) {
            const { value: nextLine, done: linesExhausted } = this.#lineSource.next();
            if (linesExhausted) return undefined;
            this.#currentLineTokens = this.#createTokenGenerator(nextLine);
        }

        let { value: tokenValue, done: tokensExhausted } = this.#currentLineTokens.next();
        if (tokensExhausted) {
            this.#currentLineTokens = null;
            return this.fetchToken(asNumeric);
        }
        return asNumeric ? Number(tokenValue) : tokenValue;
    }

    fetchLine(asStrings = false) {
        const { value: currentLine, done: linesExhausted } = this.#lineSource.next();
        if (linesExhausted) return undefined;
        const parts = currentLine.split(" ");
        return asStrings ? parts : parts.map(Number);
    }

    fetchMatrix(numRows, asStrings = false) {
        const resultMatrix = [];
        for (let i = 0; i < numRows; i++) {
            const row = this.fetchLine(asStrings);
            if (row === undefined) break;
            resultMatrix.push(row);
        }
        return resultMatrix;
    }

    fetchRawLines(numRows, asStrings = false) {
        const rawLines = [];
        for (let i = 0; i < numRows; i++) {
            const { value: currentLine, done: linesExhausted } = this.#lineSource.next();
            if (linesExhausted) break;
            rawLines.push(asStrings ? currentLine : Number(currentLine));
        }
        return rawLines;
    }
}

function findInsertionPoint(sortedArray, searchStart, searchEnd, targetValue) {
    if (searchStart >= searchEnd) {
        return searchStart;
    }
    const midPoint = Math.floor((searchStart + searchEnd) / 2);
    if (sortedArray[midPoint] < targetValue) {
        return findInsertionPoint(sortedArray, midPoint + 1, searchEnd, targetValue);
    } else {
        return findInsertionPoint(sortedArray, searchStart, midPoint, targetValue);
    }
}

function filterOddCounts(sourceCollection) {
    const frequencyCounter = new Map();
    for (const item of sourceCollection) {
        frequencyCounter.set(item, (frequencyCounter.get(item) || 0) + 1);
    }
    const filteredList = [];
    for (const [value, count] of frequencyCounter.entries()) {
        if (count % 2 !== 0) {
            filteredList.push(value);
        }
    }
    return filteredList;
}

console.log(processBitwiseSum());

function processBitwiseSum() {
    const dataStream = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));
    const totalElements = dataStream.fetchToken(true);
    let primaryArray = dataStream.fetchLine(false);
    let secondaryArray = dataStream.fetchLine(false);

    let cumulativeSumResult = 0;
    secondaryArray.sort((valA, valB) => valA - valB);

    for (let bitIndex = 28; bitIndex >= 0; bitIndex--) {
        const currentPowerOfTwo = 1 << bitIndex;
        const twiceCurrentPower = currentPowerOfTwo * 2;
        const thriceCurrentPower = currentPowerOfTwo * 3;
        const bitTruncationMask = currentPowerOfTwo - 1;

        let currentIterationParity = (primaryArray.length * primaryArray.length) % 2;

        for (const primaryVal of primaryArray) {
            const range1LowerBound = findInsertionPoint(secondaryArray, 0, secondaryArray.length, currentPowerOfTwo - primaryVal);
            const range1UpperBound = findInsertionPoint(secondaryArray, 0, secondaryArray.length, twiceCurrentPower - primaryVal);
            const countForRange1 = range1UpperBound - range1LowerBound;

            const range2LowerBound = findInsertionPoint(secondaryArray, 0, secondaryArray.length, twiceCurrentPower - primaryVal);
            const range2UpperBound = findInsertionPoint(secondaryArray, 0, secondaryArray.length, thriceCurrentPower - primaryVal);
            const countForRange2 = range2UpperBound - range2LowerBound;

            currentIterationParity = (currentIterationParity + countForRange1 - countForRange2 + 2) % 2;
        }

        if (currentIterationParity !== 0) {
            cumulativeSumResult += currentPowerOfTwo;
        }

        primaryArray = primaryArray.map(val => val & bitTruncationMask);
        secondaryArray = secondaryArray.map(val => val & bitTruncationMask);

        if (bitIndex < 18) {
            primaryArray = filterOddCounts(primaryArray);
            secondaryArray = filterOddCounts(secondaryArray);
        } else {
            secondaryArray.sort((valA, valB) => valA - valB);
        }
    }
    return cumulativeSumResult;
}
