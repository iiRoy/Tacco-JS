class InputParser {
    constructor(sourceContent) {
        this.sourceLines = sourceContent.trim().split("\n");
        this.currentLineIndex = 0;
        this.currentLineTokens = [];
    }

    _ensureCurrentLineTokens() {
        if (this.currentLineTokens.length === 0 && this.currentLineIndex < this.sourceLines.length) {
            const lineData = this.sourceLines[this.currentLineIndex];
            // Original 'a' method only splits if the line is a string.
            // Our sourceLines are always strings from readFileSync.
            this.currentLineTokens = lineData.split(" ").reverse();
        }
    }

    readNextToken(asString = false) {
        this._ensureCurrentLineTokens();
        let extractedToken;
        if (this.currentLineTokens.length > 0) {
            extractedToken = this.currentLineTokens.pop();
            if (this.currentLineTokens.length === 0) {
                this.currentLineIndex++; // Move to next line only when current line's tokens are exhausted
            }
        } else {
            return undefined; // No more tokens or lines
        }
        return asString ? extractedToken : Number(extractedToken);
    }

    readLineTokens(asString = false) {
        if (this.currentLineIndex >= this.sourceLines.length) {
            return [];
        }
        const lineParts = this.sourceLines[this.currentLineIndex++].split(" ");
        return asString ? lineParts : lineParts.map(token => Number(token));
    }

    readMatrix(numRows, asString = false) {
        const collectedRows = [];
        for (let i = 0; i < numRows; i++) {
            if (this.currentLineIndex >= this.sourceLines.length) break;
            collectedRows.push(this.sourceLines[this.currentLineIndex++].split(" "));
        }
        return asString ? collectedRows : collectedRows.map(row => row.map(token => Number(token)));
    }

    readRawLines(numLines, asString = false) {
        const rawSegment = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
        this.currentLineIndex += numLines;
        return asString ? rawSegment : rawSegment.map(line => Number(line));
    }
}

// Helper function to count set bits in a number up to a specified bit limit.
// This is a structural extraction and uses a different bit-checking mechanism (right shift).
function countSetBitsLimited(value, bitLimit) {
    let setBitsCount = 0;
    for (let i = 0; i < bitLimit; i++) {
        if (((value >> i) & 1) !== 0) {
            setBitsCount++;
        }
    }
    return setBitsCount;
}

// Instantiate the input parser directly, replacing the original factory pattern.
const inputParser = new InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(executeMainProgram());

function executeMainProgram() {
    const totalBits = inputParser.readNextToken();
    const initialValueA = inputParser.readNextToken();
    const initialValueB = inputParser.readNextToken();

    let combinedSetBits = 0;
    combinedSetBits += countSetBitsLimited(initialValueA, totalBits);
    combinedSetBits += countSetBitsLimited(initialValueB, totalBits);

    if (combinedSetBits % 2 === 0) {
        return "NO";
    }

    const outputSequence = [];

    // This recursive function is a closure, capturing 'outputSequence' and 'totalBits'.
    function generatePathSequence(currentA, currentB, processedBitmask) {
        if (currentA === currentB) {
            outputSequence.push(currentA);
            return;
        }

        const differenceXOR = currentA ^ currentB;
        let nextStateY = currentA;
        let nextStateZ = currentA;
        let yBitModified = false; // Corresponds to original 'u' flag
        let zBitModified = false; // Corresponds to original 'v' flag

        for (let bitPosition = 0; bitPosition < totalBits; bitPosition++) {
            const currentBitIdentifier = 1 << bitPosition;

            // Skip if this bit has already been handled in a parent call
            if ((processedBitmask & currentBitIdentifier) !== 0) {
                continue;
            }

            const isBitDifferent = (differenceXOR & currentBitIdentifier) !== 0;

            if (!isBitDifferent) { // Bits are identical in currentA and currentB
                if (!yBitModified) {
                    yBitModified = true;
                    nextStateY ^= currentBitIdentifier;
                    nextStateZ ^= currentBitIdentifier;
                }
            } else { // Bits are different in currentA and currentB
                if (!zBitModified) {
                    zBitModified = true;
                    nextStateZ ^= currentBitIdentifier;
                    // Mark this bit as processed for subsequent recursive calls
                    processedBitmask |= currentBitIdentifier;
                }
            }
        }
        generatePathSequence(currentA, nextStateY, processedBitmask);
        generatePathSequence(nextStateZ, currentB, processedBitmask);
    }

    generatePathSequence(initialValueA, initialValueB, 0);
    console.log("YES");
    return outputSequence.join(" ");
}
