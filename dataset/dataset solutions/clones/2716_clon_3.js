const InputReaderUtil = (function () {

    function createReaderInstance(rawInputString) {
        return new LineParser(rawInputString);
    }

    class LineParser {
        constructor(initialString) {
            this.lineBuffer = initialString.trim().split("\n");
            this.currentLinePointer = 0;
            this.currentLineTokens = [];
        }

        extractNextToken(asString = false) {
            const lines = this.lineBuffer;
            let currentIdx = this.currentLinePointer;

            if (this.currentLineTokens.length === 0) {
                if (currentIdx >= lines.length) {
                    throw new Error("Attempted to read past end of input.");
                }
                const lineContent = lines[currentIdx];
                this.currentLineTokens = lineContent.split(" ").reverse();
            }

            const extractedToken = this.currentLineTokens.pop();

            if (this.currentLineTokens.length === 0) {
                this.currentLinePointer++;
            }

            return asString ? extractedToken : Number.parseInt(extractedToken, 10);
        }

        parseLineAsNumbers(keepStrings = false) {
            this.currentLineTokens = [];
            
            const lineContent = this.lineBuffer[this.currentLinePointer];
            this.currentLinePointer++;

            const tokens = lineContent.split(" ");
            return keepStrings ? tokens : tokens.map(str => Number.parseInt(str, 10));
        }

        readMatrixData(numRows, asStrings = false) {
            this.currentLineTokens = [];

            const startIdx = this.currentLinePointer;
            const endIdx = startIdx + numRows;

            this.currentLinePointer = endIdx;

            const rawRows = this.lineBuffer.slice(startIdx, endIdx);
            const processedMatrix = rawRows.map(line => line.split(" "));

            return asStrings ? processedMatrix : processedMatrix.map(row => row.map(val => Number.parseInt(val, 10)));
        }

        fetchLinesAsStrings(count, numericConvert = false) {
            this.currentLineTokens = [];

            const startPosition = this.currentLinePointer;
            const endPosition = startPosition + count;

            this.currentLinePointer = endPosition;

            const rawSegment = this.lineBuffer.slice(startPosition, endPosition);
            return numericConvert ? rawSegment.map(line => Number.parseInt(line, 10)) : rawSegment;
        }

        peekNextLine() {
            if (this.currentLinePointer < this.lineBuffer.length) {
                return this.lineBuffer[this.currentLinePointer];
            }
            return undefined;
        }

        hasMoreLines() {
            return this.currentLinePointer < this.lineBuffer.length;
        }
    }

    return createReaderInstance;
})();

const inputReader = InputReaderUtil(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialFillValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialFillValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    if (currentDimensionSize < 0 || !Number.isInteger(currentDimensionSize)) {
        throw new Error(`Invalid dimension size: ${currentDimensionSize}. Must be a non-negative integer.`);
    }

    const newArray = new Array(currentDimensionSize);

    if (remainingDimensions.length === 0) {
        for (let i = 0; i < currentDimensionSize; i++) {
            newArray[i] = initialFillValue;
        }
    } else {
        for (let i = 0; i < currentDimensionSize; i++) {
            newArray[i] = createMultiDimArray(initialFillValue, ...remainingDimensions);
        }
    }

    return newArray;
}

const StringHasher = (function () {

    const DEFAULT_PRIME_BASES = [1009, 1007];
    const DEFAULT_HASH_MODULI = [1_000_000_007, 1_000_000_009];

    function modularMultiply(val1, val2, modulus) {
        return Number((BigInt(val1) * BigInt(val2)) % BigInt(modulus));
    }

    function createHasher(initialText) {
        return new StringHasherClass(initialText);
    }

    class StringHasherClass {
        constructor(initialText) {
            if (typeof initialText !== 'string' || initialText.length === 0) {
                console.warn("StringHasher initialized with an empty or non-string input.");
                this.currentTextLength = 0;
                this.powerTable = [[], []];
                this.prefixHashValues = [[], []];
                return;
            }

            this.currentTextLength = initialText.length;
            this.primeBases = [...DEFAULT_PRIME_BASES];
            this.hashModuli = [...DEFAULT_HASH_MODULI];

            this.powerTable = Array(this.hashModuli.length).fill(null).map(() => []);
            this.prefixHashValues = Array(this.hashModuli.length).fill(null).map(() => []);

            for (let hashFuncIdx = 0; hashFuncIdx < this.hashModuli.length; hashFuncIdx++) {
                const currentBase = this.primeBases[hashFuncIdx];
                const currentModulus = this.hashModuli[hashFuncIdx];

                this.powerTable[hashFuncIdx].length = this.currentTextLength + 1;
                this.prefixHashValues[hashFuncIdx].length = this.currentTextLength + 1;

                this.powerTable[hashFuncIdx][0] = 1;
                this.prefixHashValues[hashFuncIdx][0] = 0;

                for (let charIndex = 0; charIndex < this.currentTextLength; charIndex++) {
                    const charCode = initialText.charCodeAt(charIndex);

                    this.powerTable[hashFuncIdx][charIndex + 1] = modularMultiply(
                        this.powerTable[hashFuncIdx][charIndex],
                        currentBase,
                        currentModulus
                    );

                    let newHash = modularMultiply(
                        this.prefixHashValues[hashFuncIdx][charIndex],
                        currentBase,
                        currentModulus
                    );
                    newHash = (newHash + charCode) % currentModulus;
                    this.prefixHashValues[hashFuncIdx][charIndex + 1] = newHash;
                }
            }
        }

        calculatePatternHash(patternString) {
            const patternHashes = [];
            for (let hashFuncIdx = 0; hashFuncIdx < this.hashModuli.length; hashFuncIdx++) {
                const currentBase = this.primeBases[hashFuncIdx];
                const currentModulus = this.hashModuli[hashFuncIdx];
                let currentPatternHash = 0;

                for (let charIndex = 0; charIndex < patternString.length; charIndex++) {
                    currentPatternHash = modularMultiply(currentPatternHash, currentBase, currentModulus);
                    currentPatternHash = (currentPatternHash + patternString.charCodeAt(charIndex)) % currentModulus;
                }
                patternHashes.push(currentPatternHash);
            }
            return patternHashes;
        }

        retrieveSubsegmentHash(startIdx, endIdx, hashFuncIdx) {
            const currentModulus = this.hashModuli[hashFuncIdx];
            const hashBeforeEnd = this.prefixHashValues[hashFuncIdx][endIdx];
            const hashBeforeStart = this.prefixHashValues[hashFuncIdx][startIdx];
            const powerFactor = this.powerTable[hashFuncIdx][endIdx - startIdx];

            let segmentHash = hashBeforeEnd - modularMultiply(hashBeforeStart, powerFactor, currentModulus);

            return (segmentHash % currentModulus + currentModulus) % currentModulus;
        }

        findPatternOccurrence(searchPattern, searchOffset = 0) {
            if (searchPattern.length === 0 || searchPattern.length > this.currentTextLength) {
                return -1;
            }

            const patternHashValues = this.calculatePatternHash(searchPattern);
            const patternLength = searchPattern.length;
            const numHashFunctions = this.hashModuli.length;

            const maxSearchIndex = this.currentTextLength - patternLength;

            for (let currentPos = searchOffset; currentPos <= maxSearchIndex; currentPos++) {
                let matchedHashCount = 0;

                const textSegmentHash0 = this.retrieveSubsegmentHash(currentPos, currentPos + patternLength, 0);
                if (textSegmentHash0 === patternHashValues[0]) {
                    matchedHashCount = 1;

                    for (let hfIdx = 1; hfIdx < numHashFunctions; hfIdx++) {
                        const textSegmentHash = this.retrieveSubsegmentHash(currentPos, currentPos + patternLength, hfIdx);
                        if (textSegmentHash !== patternHashValues[hfIdx]) {
                            break;
                        }
                        matchedHashCount++;
                    }
                }

                if (matchedHashCount === numHashFunctions) {
                    return currentPos;
                }
            }

            return -1;
        }

        appendSegmentAndRehash(newSegment) {
            if (typeof newSegment !== 'string' || newSegment.length === 0) {
                return this.currentTextLength;
            }

            const previousLength = this.currentTextLength;
            this.currentTextLength += newSegment.length;

            for (let hashFuncIdx = 0; hashFuncIdx < this.hashModuli.length; hashFuncIdx++) {
                const currentBase = this.primeBases[hashFuncIdx];
                const currentModulus = this.hashModuli[hashFuncIdx];

                this.powerTable[hashFuncIdx].length = this.currentTextLength + 1;
                this.prefixHashValues[hashFuncIdx].length = this.currentTextLength + 1;

                for (let i = previousLength; i < this.currentTextLength; i++) {
                    const charCode = newSegment.charCodeAt(i - previousLength);

                    this.powerTable[hashFuncIdx][i + 1] = modularMultiply(
                        this.powerTable[hashFuncIdx][i],
                        currentBase,
                        currentModulus
                    );

                    let newHash = modularMultiply(
                        this.prefixHashValues[hashFuncIdx][i],
                        currentBase,
                        currentModulus
                    );
                    newHash = (newHash + charCode) % currentModulus;
                    this.prefixHashValues[hashFuncIdx][i + 1] = newHash;
                }
            }
            return this.currentTextLength;
        }
    }

    return createHasher;
})();

function solveProblem() {
    const patternA = inputReader.extractNextToken(true);
    const patternB = inputReader.extractNextToken(true);

    if (patternB.length === 0) {
        return -1;
    }
    if (patternA.length === 0) {
        return 0;
    }

    let extendedPatternA = patternA;
    while (extendedPatternA.length < patternB.length) {
        extendedPatternA += patternA;
    }

    const textSearcher = StringHasher(extendedPatternA + extendedPatternA);

    let currentPatternBRepeated = patternB;
    let lastMatchPosition = -1;
    let concatenationCount = 0;

    let currentMatchPosition = textSearcher.findPatternOccurrence(currentPatternBRepeated);

    if (currentMatchPosition === -1) {
        return 0;
    }

    while (currentMatchPosition !== -1) {
        concatenationCount++;
        lastMatchPosition = currentMatchPosition;

        currentPatternBRepeated += patternB;

        currentMatchPosition = textSearcher.findPatternOccurrence(currentPatternBRepeated, currentMatchPosition);
    }

    const lastSuccessfulPattern = patternB.repeat(concatenationCount);

    textSearcher.appendSegmentAndRehash(extendedPatternA);

    if (textSearcher.findPatternOccurrence(lastSuccessfulPattern, lastMatchPosition) !== -1) {
        return -1;
    }

    return concatenationCount;
}

console.log(solveProblem());