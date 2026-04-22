class SourceDataHydrator {
    #inputLines;
    #lineCursor;
    #lineTokenCache;

    constructor(textualSource) {
        this.#inputLines = textualSource.trim().split("\n");
        this.#lineCursor = 0;
        this.#lineTokenCache = [];
    }

    #cacheCurrentLineTokens() {
        if (this.#lineTokenCache.length === 0 && this.#lineCursor < this.#inputLines.length) {
            this.#lineTokenCache = this.#inputLines[this.#lineCursor].split(" ").reverse();
        }
    }

    extractScalar(asPlainString = false) {
        this.#cacheCurrentLineTokens();
        if (this.#lineTokenCache.length === 0) {
            throw new Error("No tokens available for scalar extraction.");
        }
        const extracted = this.#lineTokenCache.shift();
        if (this.#lineTokenCache.length === 0) {
            this.#lineCursor++;
        }
        return asPlainString ? extracted : Number(extracted);
    }

    extractSequence(asPlainStrings = false) {
        if (this.#lineCursor >= this.#inputLines.length) {
            throw new Error("No more sequences to extract.");
        }
        const currentLineContent = this.#inputLines[this.#lineCursor];
        this.#lineCursor++;
        this.#lineTokenCache = [];
        const parts = currentLineContent.split(" ");
        return asPlainStrings ? parts : parts.map(Number);
    }

    extractGrid(numRows, asPlainStrings = false) {
        const collectedRows = [];
        for (let k = 0; k < numRows; k++) {
            if (this.#lineCursor >= this.#inputLines.length) {
                throw new Error("Insufficient rows for grid extraction.");
            }
            const currentLineContent = this.#inputLines[this.#lineCursor];
            this.#lineCursor++;
            this.#lineTokenCache = [];
            const parts = currentLineContent.split(" ");
            collectedRows.push(asPlainStrings ? parts : parts.map(Number));
        }
        return collectedRows;
    }

    extractColumnVector(numElements, asPlainStrings = false) {
        const collectedElements = [];
        for (let k = 0; k < numElements; k++) {
            if (this.#lineCursor >= this.#inputLines.length) {
                throw new Error("Insufficient elements for column vector extraction.");
            }
            const currentLineContent = this.#inputLines[this.#lineCursor];
            this.#lineCursor++;
            this.#lineTokenCache = [];
            collectedElements.push(asPlainStrings ? currentLineContent : Number(currentLineContent));
        }
        return collectedElements;
    }
}

const selectOddCountElements = (elementCollection, bitCeiling) => {
    const countsMap = new Map();
    elementCollection.forEach(val => {
        countsMap.set(val, (countsMap.get(val) || 0) + 1);
    });
    const oddOccurring = [];
    for (const [value, frequency] of countsMap.entries()) {
        if (frequency % 2 === 1) {
            oddOccurring.push(value);
        }
    }
    return oddOccurring;
};

const performComplexBitwiseOperation = () => {
    const hydratorInstance = new SourceDataHydrator(require("fs").readFileSync("/dev/stdin", "utf8"));

    const arraySize = hydratorInstance.extractScalar();
    const setAlpha = hydratorInstance.extractSequence();
    const setBeta = hydratorInstance.extractSequence();

    const recursivelyCalculateBitContribution = (focusBitIndex, currentAlpha, currentBeta, finalBitwiseSum) => {
        if (focusBitIndex < 0) {
            return finalBitwiseSum;
        }

        let processedAlpha, processedBeta;

        if (focusBitIndex < 17) {
            processedBeta = selectOddCountElements(currentBeta, focusBitIndex);
            processedAlpha = selectOddCountElements(currentAlpha, focusBitIndex).reverse();
        } else {
            processedBeta = [...currentBeta].sort((val1, val2) => val1 - val2);
            processedAlpha = [...currentAlpha].sort((val1, val2) => val2 - val1);
        }

        const currentBitWeight = 1 << focusBitIndex;
        const twiceBitWeight = currentBitWeight << 1;
        const thriceBitWeight = currentBitWeight * 3;

        let cumulativeParityContribution = arraySize;
        let idxOmega = 0;
        let idxDelta = 0;
        let idxGamma = 0;

        for (const elementAlpha of processedAlpha) {
            while (idxOmega < processedBeta.length && currentBitWeight - elementAlpha > processedBeta[idxOmega]) {
                idxOmega++;
            }
            while (idxDelta < processedBeta.length && twiceBitWeight - elementAlpha > processedBeta[idxDelta]) {
                idxDelta++;
            }
            while (idxGamma < processedBeta.length && thriceBitWeight - elementAlpha > processedBeta[idxGamma]) {
                idxGamma++;
            }
            cumulativeParityContribution += (-idxGamma + idxDelta - idxOmega);
        }

        if (cumulativeParityContribution % 2 !== 0) {
            finalBitwiseSum += currentBitWeight;
        }

        const lowerBitsMask = currentBitWeight - 1;
        const reducedAlpha = currentAlpha.map(val => val & lowerBitsMask);
        const reducedBeta = currentBeta.map(val => val & lowerBitsMask);

        return recursivelyCalculateBitContribution(focusBitIndex - 1, reducedAlpha, reducedBeta, finalBitwiseSum);
    };

    return recursivelyCalculateBitContribution(28, setAlpha, setBeta, 0);
};

console.log(performComplexBitwiseOperation());