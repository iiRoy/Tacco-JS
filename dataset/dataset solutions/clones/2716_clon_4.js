class DataStreamer {
    #sourceContent;
    #linePointer = 0;
    #currentLineElements = [];
    #elementPointer = 0;

    constructor(initialContent) {
        this.#sourceContent = initialContent.trim().split('\n');
        this.#refreshLineElements();
    }

    #refreshLineElements() {
        if (this.#linePointer < this.#sourceContent.length) {
            this.#currentLineElements = this.#sourceContent[this.#linePointer].split(' ');
            this.#elementPointer = 0;
        } else {
            this.#currentLineElements = [];
            this.#elementPointer = 0;
        }
    }

    extractSingle(asString) {
        if (this.#elementPointer >= this.#currentLineElements.length) {
            this.#linePointer++;
            this.#refreshLineElements();
            if (this.#elementPointer >= this.#currentLineElements.length) {
                return undefined;
            }
        }
        const value = this.#currentLineElements[this.#elementPointer];
        this.#elementPointer++;
        return asString ? value : +value;
    }

    extractLine(asStrings) {
        if (this.#linePointer >= this.#sourceContent.length) {
            return undefined;
        }
        const fullLine = this.#sourceContent[this.#linePointer];
        this.#linePointer++;
        this.#refreshLineElements();
        const lineParts = fullLine.split(' ');
        return asStrings ? lineParts : lineParts.map(v => +v);
    }

    extractLines(count, asStrings) {
        const resultCollection = [];
        for (let i = 0; i < count; i++) {
            if (this.#linePointer >= this.#sourceContent.length) break;
            const currentLine = this.#sourceContent[this.#linePointer];
            this.#linePointer++;
            this.#refreshLineElements();
            resultCollection.push(asStrings ? currentLine : +currentLine);
        }
        return resultCollection;
    }

    extractNestedArrays(rows, asStrings) {
        const nestedCollection = [];
        for (let i = 0; i < rows; i++) {
            if (this.#linePointer >= this.#sourceContent.length) break;
            const currentLine = this.#sourceContent[this.#linePointer];
            this.#linePointer++;
            this.#refreshLineElements();
            const lineParts = currentLine.split(' ');
            nestedCollection.push(asStrings ? lineParts : lineParts.map(v => +v));
        }
        return nestedCollection;
    }
}

function InputSource(textInput) {
    return new DataStreamer(textInput);
}

function constructNArray(fillValue, ...dimensions) {
    const recursiveBuilder = (depth) => {
        if (depth === dimensions.length) {
            return fillValue;
        }
        const currentSize = dimensions[depth];
        return Array.from({ length: currentSize }, () => recursiveBuilder(depth + 1));
    };
    return recursiveBuilder(0);
}

class TextPatternMatcher {
    #textData;
    #currentTextLength;
    #primeFactors = [1013, 1009];
    #moduloValues = [1000000007, 1000000009];
    #exponentPowers = [[], []];
    #cumulativeHashes = [[], []];

    constructor(initialText) {
        this.#textData = initialText;
        this.#currentTextLength = initialText.length;
        this.#initializeHashTables();
    }

    #performModularMultiplication(operand1, operand2, modulus) {
        const highBits1 = operand1 >> 16;
        const lowBits1 = operand1 & 0xFFFF;

        let resultTerm1 = (highBits1 * operand2) % modulus;
        resultTerm1 = (resultTerm1 * 65536) % modulus;

        let resultTerm2 = (lowBits1 * operand2) % modulus;

        return (resultTerm1 + resultTerm2) % modulus;
    }

    #initializeHashTables() {
        for (let j = 0; j < this.#moduloValues.length; j++) {
            const currentMod = this.#moduloValues[j];
            const currentFactor = this.#primeFactors[j];

            this.#exponentPowers[j] = new Array(this.#currentTextLength + 1);
            this.#cumulativeHashes[j] = new Array(this.#currentTextLength + 1);

            this.#exponentPowers[j][0] = 1;
            this.#cumulativeHashes[j][0] = 0;

            for (let i = 0; i < this.#currentTextLength; i++) {
                this.#exponentPowers[j][i + 1] = this.#performModularMultiplication(this.#exponentPowers[j][i], currentFactor, currentMod);
                let charCode = this.#textData.charCodeAt(i);
                this.#cumulativeHashes[j][i + 1] = (this.#performModularMultiplication(this.#cumulativeHashes[j][i], currentFactor, currentMod) + charCode) % currentMod;
                if (this.#cumulativeHashes[j][i + 1] < 0) this.#cumulativeHashes[j][i + 1] += currentMod;
            }
        }
    }

    #calculatePatternFingerprints(pattern) {
        const fingerprints = [];
        for (let j = 0; j < this.#moduloValues.length; j++) {
            const currentMod = this.#moduloValues[j];
            const currentFactor = this.#primeFactors[j];
            let currentHash = 0;
            for (let i = 0; i < pattern.length; i++) {
                currentHash = (this.#performModularMultiplication(currentHash, currentFactor, currentMod) + pattern.charCodeAt(i)) % currentMod;
            }
            fingerprints.push(currentHash);
        }
        return fingerprints;
    }

    #retrieveSegmentFingerprint(startIdx, endIdx, hashTypeIndex) {
        const currentMod = this.#moduloValues[hashTypeIndex];
        const hashRight = this.#cumulativeHashes[hashTypeIndex][endIdx];
        const hashLeft = this.#cumulativeHashes[hashTypeIndex][startIdx];
        const powerTerm = this.#exponentPowers[hashTypeIndex][endIdx - startIdx];

        let resultHash = (hashRight - this.#performModularMultiplication(hashLeft, powerTerm, currentMod));
        if (resultHash < 0) {
            resultHash += currentMod;
        }
        return resultHash;
    }

    findOccurrence(searchPattern, startPosition = 0) {
        const patternLength = searchPattern.length;
        if (patternLength === 0 || patternLength > this.#currentTextLength) {
            return -1;
        }
        const patternFingerprints = this.#calculatePatternFingerprints(searchPattern);
        const maxScanIndex = this.#currentTextLength - patternLength;

        for (let i = startPosition; i <= maxScanIndex; i++) {
            let allHashesMatch = true;
            for (let j = 0; j < this.#moduloValues.length; j++) {
                const segmentFingerprint = this.#retrieveSegmentFingerprint(i, i + patternLength, j);
                if (segmentFingerprint !== patternFingerprints[j]) {
                    allHashesMatch = false;
                    break;
                }
            }
            if (allHashesMatch) {
                return i;
            }
        }
        return -1;
    }

    appendToSource(additionalText) {
        const oldLength = this.#currentTextLength;
        this.#textData += additionalText;
        this.#currentTextLength += additionalText.length;

        for (let j = 0; j < this.#moduloValues.length; j++) {
            const currentMod = this.#moduloValues[j];
            const currentFactor = this.#primeFactors[j];

            this.#exponentPowers[j].length = this.#currentTextLength + 1;
            this.#cumulativeHashes[j].length = this.#currentTextLength + 1;

            for (let i = oldLength; i < this.#currentTextLength; i++) {
                this.#exponentPowers[j][i + 1] = this.#performModularMultiplication(this.#exponentPowers[j][i], currentFactor, currentMod);
                let charCode = this.#textData.charCodeAt(i);
                this.#cumulativeHashes[j][i + 1] = (this.#performModularMultiplication(this.#cumulativeHashes[j][i], currentFactor, currentMod) + charCode) % currentMod;
                if (this.#cumulativeHashes[j][i + 1] < 0) this.#cumulativeHashes[j][i + 1] += currentMod;
            }
        }
        return this.#currentTextLength;
    }
}

function createTextPatternMatcher(text) {
    return new TextPatternMatcher(text);
}

function processChallenge() {
    const inputStream = InputSource(require("fs").readFileSync("/dev/stdin", "utf8"));
    const primaryString = inputStream.extractSingle(true);
    const secondaryString = inputStream.extractSingle(true);

    let extendedPrimary = primaryString;
    while (extendedPrimary.length < secondaryString.length) {
        extendedPrimary += primaryString;
    }

    const matcherService = createTextPatternMatcher(extendedPrimary + extendedPrimary);

    const firstMatchPosition = matcherService.findOccurrence(secondaryString);
    if (firstMatchPosition === -1) {
        return 0;
    }

    const recursiveConcatenationSearch = (currentAccumulatedTarget, currentSearchOffset, currentCount, lastSuccessfulStart) => {
        const nextMatchPosition = matcherService.findOccurrence(currentAccumulatedTarget, currentSearchOffset);
        if (nextMatchPosition === -1) {
            return { finalAccumulated: currentAccumulatedTarget, finalStartPos: lastSuccessfulStart, finalCountValue: currentCount };
        }
        return recursiveConcatenationSearch(
            currentAccumulatedTarget + secondaryString,
            nextMatchPosition,
            currentCount + 1,
            nextMatchPosition
        );
    };

    const { finalAccumulated, finalStartPos, finalCountValue } = recursiveConcatenationSearch(
        secondaryString,
        firstMatchPosition,
        1,
        firstMatchPosition
    );

    matcherService.appendToSource(primaryString);

    if (matcherService.findOccurrence(finalAccumulated, finalStartPos) >= 0) {
        return -1;
    }

    return finalCountValue;
}

console.log(processChallenge());