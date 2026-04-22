class InputDataProcessor {
    constructor(sourceInputString) {
        this.sourceLines = sourceInputString.trim().split("\n");
        this.currentLinePointer = 0;
        this.activeLineSegments = null;
    }

    retrieveScalar(asStringOutput) {
        if (!this.activeLineSegments) {
            if (this.currentLinePointer >= this.sourceLines.length) {
                throw new Error("End of input stream reached for scalar retrieval.");
            }
            this.activeLineSegments = this.sourceLines[this.currentLinePointer].split(" ").reverse();
        }

        if (this.activeLineSegments.length === 0) {
            this.currentLinePointer++;
            this.activeLineSegments = null;
            return this.retrieveScalar(asStringOutput);
        }

        const extractedValue = this.activeLineSegments.pop();
        return asStringOutput ? extractedValue : Number(extractedValue);
    }

    retrieveLine(asStringOutput) {
        if (this.currentLinePointer >= this.sourceLines.length) {
            throw new Error("End of input stream reached for line retrieval.");
        }
        
        const lineContent = this.sourceLines[this.currentLinePointer];
        this.currentLinePointer++;
        this.activeLineSegments = null;

        const parts = lineContent.split(" ");
        return asStringOutput ? parts : parts.map(Number);
    }

    retrieveMatrix(numRowsToRead, asStringOutput) {
        const resultMatrix = [];
        for (let i = 0; i < numRowsToRead; i++) {
            resultMatrix.push(this.retrieveLine(asStringOutput));
        }
        return resultMatrix;
    }

    retrieveRawLines(numLinesToRead, asStringOutput) {
        const resultLines = [];
        for (let i = 0; i < numLinesToRead; i++) {
            if (this.currentLinePointer >= this.sourceLines.length) {
                throw new Error("End of input stream reached for raw line retrieval.");
            }
            const lineData = this.sourceLines[this.currentLinePointer];
            this.currentLinePointer++;
            this.activeLineSegments = null;
            resultLines.push(asStringOutput ? lineData : Number(lineData));
        }
        return resultLines;
    }
}

const transformScalar = (numericValue, lookupIndex) => {
    const modifierFunctions = [
        (val) => val,
        (val) => (val === 0 ? 2 : val % 2),
        (val) => (val + 1) % 2,
        (val) => (val === 0 ? 2 : val % 2),
        (val) => val
    ];
    return modifierFunctions[lookupIndex](numericValue);
};

const executeComputation = () => {
    const sourceProvider = new InputDataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalCount = sourceProvider.retrieveScalar();
    const inputValues = sourceProvider.retrieveRawLines(totalCount);

    let currentPathCosts = Array.from({ length: 5 }, (_, index) => transformScalar(inputValues[0], index));

    const finalPathCosts = inputValues.slice(1).reduce((previousPathCosts, currentValue) => {
        const nextPathCosts = Array(5).fill(Infinity);
        
        nextPathCosts[0] = previousPathCosts[0] + currentValue;

        Array.from({ length: 4 }, (_, stateIndex) => stateIndex + 1)
            .forEach(jState => {
                Array.from({ length: jState + 1 }, (_, prevKIndex) => prevKIndex)
                    .forEach(kPrevState => {
                        const potentialCost = previousPathCosts[kPrevState] + transformScalar(currentValue, jState);
                        
                        if (nextPathCosts[jState] > potentialCost) {
                            nextPathCosts[jState] = potentialCost;
                        }
                    });
            });
        return nextPathCosts;
    }, currentPathCosts);

    return Math.min(...finalPathCosts);
};

console.log(executeComputation());