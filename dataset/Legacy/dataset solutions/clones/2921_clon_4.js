class InputReader {
    constructor(sourceText) {
        this.lines = sourceText.trim().split('\n');
        this.currentLineIndex = 0;
        this.lineTokenCache = new Map();
    }

    // Corresponds to original GET.g.prototype.a
    fetchToken(asString) {
        if (this.currentLineIndex >= this.lines.length) {
            throw new Error("Input exhausted: no more tokens.");
        }

        const lineIdentifier = this.currentLineIndex;
        if (!this.lineTokenCache.has(lineIdentifier)) {
            this.lineTokenCache.set(lineIdentifier, this.lines[lineIdentifier].split(' ').reverse());
        }

        const tokensForCurrentLine = this.lineTokenCache.get(lineIdentifier);
        if (tokensForCurrentLine.length === 0) {
            this.currentLineIndex++;
            this.lineTokenCache.delete(lineIdentifier);
            return this.fetchToken(asString);
        }

        const extractedToken = tokensForCurrentLine.pop();
        if (tokensForCurrentLine.length === 0) {
            this.currentLineIndex++;
            this.lineTokenCache.delete(lineIdentifier);
        }
        return asString ? extractedToken : Number(extractedToken);
    }

    // Corresponds to original GET.g.prototype.l
    fetchLine(asString) {
        if (this.currentLineIndex >= this.lines.length) {
            throw new Error("Input exhausted: no more lines.");
        }
        const currentLineContent = this.lines[this.currentLineIndex++];
        const lineParts = currentLineContent.split(' ');
        return asString ? lineParts : lineParts.map(Number);
    }

    // Corresponds to original GET.g.prototype.m
    fetchMatrix(rowCount, asString) {
        const matrixData = [];
        for (let row = 0; row < rowCount; row++) {
            if (this.currentLineIndex >= this.lines.length) {
                throw new Error("Input exhausted: not enough lines for matrix.");
            }
            const currentLineContent = this.lines[this.currentLineIndex++];
            const rowParts = currentLineContent.split(' ');
            matrixData.push(asString ? rowParts : rowParts.map(Number));
        }
        return matrixData;
    }

    // Corresponds to original GET.g.prototype.r
    fetchRawLines(rowCount, asString) {
        const rawLineData = [];
        for (let row = 0; row < rowCount; row++) {
            if (this.currentLineIndex >= this.lines.length) {
                throw new Error("Input exhausted: not enough raw lines.");
            }
            const currentLineContent = this.lines[this.currentLineIndex++];
            rawLineData.push(asString ? currentLineContent : Number(currentLineContent));
        }
        return rawLineData;
    }
}

// Helper generator function for the inner loop logic
function* generatePairsForStep(stepSize, totalLength) {
    let currentJ = stepSize;
    while (currentJ < totalLength - stepSize) {
        const symmetricT = totalLength - currentJ - 1;
        yield { j: currentJ, t: symmetricT };
        currentJ += stepSize;
    }
}

const inputSource = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function calculateMaxPairSum() {
    const totalCount = inputSource.fetchToken();
    const dataValues = inputSource.fetchLine();

    let overallMaxSum = 0;
    const halfLength = totalCount >> 1;

    // Outer loop equivalent: Iterate through possible step sizes (i in original)
    Array.from({ length: halfLength - 1 }, (_, index) => index + 1)
        .forEach(currentStep => {
            let currentIterationSum = 0;
            const visitedIndices = new Set();

            // Inner loop equivalent: Iterate through pairs generated for the current step
            for (const { j, t } of generatePairsForStep(currentStep, totalCount)) {
                // Check for break conditions: duplicate indices or middle element
                if (visitedIndices.has(j) || visitedIndices.has(t) || j === t) {
                    break;
                }

                currentIterationSum += dataValues[j] + dataValues[t];
                
                // Update the overall maximum sum found so far
                if (currentIterationSum > overallMaxSum) {
                    overallMaxSum = currentIterationSum;
                }

                visitedIndices.add(j);
                visitedIndices.add(t);
            }
        });

    return overallMaxSum;
}

console.log(calculateMaxPairSum());
