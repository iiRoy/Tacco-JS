"use strict";

const inputProcessor = (function() {
    class DataStream {
        constructor(rawContent) {
            this.sourceLines = rawContent.trim().split("\n");
            this.linePointer = 0;
            this.currentLineTokens = null;
        }

        fetchValue(asString) {
            if (this.currentLineTokens === null || this.currentLineTokens.length === 0) {
                if (this.linePointer >= this.sourceLines.length) {
                    throw new Error("End of input stream for value.");
                }
                this.currentLineTokens = this.sourceLines[this.linePointer].split(" ").reverse();
            }
            const token = this.currentLineTokens.pop();
            if (this.currentLineTokens.length === 0) {
                this.linePointer++;
                this.currentLineTokens = null;
            }
            return asString ? token : Number(token);
        }

        fetchLine(asString) {
            if (this.linePointer >= this.sourceLines.length) {
                throw new Error("End of input stream for line.");
            }
            this.currentLineTokens = null;

            const line = this.sourceLines[this.linePointer++];
            const parts = line.split(" ");
            return asString ? parts : parts.map(Number);
        }

        fetchMatrix(numRows, asString) {
            const matrix = [];
            for (let i = 0; i < numRows; i++) {
                matrix.push(this.fetchLine(asString));
            }
            return matrix;
        }

        fetchRows(numRows, asString) {
            const rows = [];
            for (let i = 0; i < numRows; i++) {
                if (this.linePointer >= this.sourceLines.length) {
                    throw new Error("End of input stream for rows.");
                }
                const line = this.sourceLines[this.linePointer++];
                rows.push(asString ? line : Number(line));
            }
            return rows;
        }
    }
    return (s) => new DataStream(s);
})();

const inputReader = inputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

const evaluateCandidate = (candidateIndex, allElements, M, V, P, N) => {
    const effectiveValue = allElements[candidateIndex] + M;
    const pthLargestElement = allElements[N - P];

    if (effectiveValue < pthLargestElement) {
        return false;
    }

    if (V <= candidateIndex + P) {
        return true;
    }

    let requiredBoost = (V - candidateIndex - P) * M;

    const elementsToConsiderForBoost = allElements.slice(candidateIndex + 1, N - P + 1);

    const finalBoostRemaining = elementsToConsiderForBoost.reduce((currentBoost, elementScore) => {
        if (currentBoost <= 0) {
            return currentBoost;
        }
        return currentBoost - (effectiveValue - elementScore);
    }, requiredBoost);

    return finalBoostRemaining <= 0;
};

function findSmallestSatisfyingIndex(exclusiveLowerBound, inclusiveUpperBound, checkFunction) {
    let currentSmallestValid = inclusiveUpperBound;
    let currentLargestInvalid = exclusiveLowerBound;

    while (currentSmallestValid - currentLargestInvalid > 1) {
        const midIndex = (currentSmallestValid + currentLargestInvalid + 1) >>> 1;

        if (checkFunction(midIndex)) {
            currentSmallestValid = midIndex;
        } else {
            currentLargestInvalid = midIndex;
        }
    }
    return currentSmallestValid;
}

function processCompetition() {
    const N = inputReader.fetchValue();
    const M = inputReader.fetchValue();
    const V = inputReader.fetchValue();
    const P = inputReader.fetchValue();

    const allScores = inputReader.fetchLine();
    allScores.sort((a, b) => a - b);

    const smallestValidIndex = findSmallestSatisfyingIndex(
        -1,
        N - P,
        (idx) => evaluateCandidate(idx, allScores, M, V, P, N)
    );

    return N - smallestValidIndex;
}

console.log(processCompetition());
