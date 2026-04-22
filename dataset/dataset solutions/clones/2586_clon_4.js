class InputAcquirer {
    constructor(sourceText) {
        this.segments = sourceText.trim().split('\n').map(line => line.split(' '));
        this.segmentPointer = 0;
    }

    fetchScalar(returnString = false) {
        const currentSegmentTokens = this.segments[this.segmentPointer];
        if (!currentSegmentTokens || currentSegmentTokens.length === 0) {
            return undefined; 
        }
        const value = currentSegmentTokens.pop();
        if (currentSegmentTokens.length === 0) {
            this.segmentPointer++;
        }
        return returnString ? value : Number(value);
    }

    fetchSequence(returnStrings = false) {
        if (this.segmentPointer >= this.segments.length) {
            return undefined;
        }
        const tokens = this.segments[this.segmentPointer].slice();
        this.segmentPointer++;
        return returnStrings ? tokens : tokens.map(Number);
    }

    fetchBlock(rowCount, returnStrings = false) {
        const blockResult = [];
        for (let i = 0; i < rowCount; i++) {
            if (this.segmentPointer >= this.segments.length) {
                break; 
            }
            const tokens = this.segments[this.segmentPointer].slice();
            this.segmentPointer++;
            blockResult.push(returnStrings ? tokens : tokens.map(Number));
        }
        return blockResult;
    }

    fetchVector(count, returnStrings = false) {
        const vectorResult = [];
        for (let i = 0; i < count; i++) {
            if (this.segmentPointer >= this.segments.length) {
                break; 
            }
            const lineValue = this.segments[this.segmentPointer][0];
            this.segmentPointer++;
            vectorResult.push(returnStrings ? lineValue : Number(lineValue));
        }
        return vectorResult;
    }
}

function constructMultiDimensionalArray(fillValue, ...dimensions) {
    if (dimensions.length === 0) {
        return fillValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const container = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; i++) {
        container[i] = constructMultiDimensionalArray(fillValue, ...remainingDimensions);
    }
    return container;
}

class ValueSelector {
    constructor(dimensionality, sourceValues) {
        this.dim = dimensionality;
        this.orderedValues = [...sourceValues].sort((valA, valB) => valB - valA);
        this.activeIndices = new Array(1 << dimensionality).fill(false);
        this.activeIndices[0] = true;
    }

    performSelectionProcess() {
        let currentSelections = [[this.orderedValues[0], 1]];
        
        for (let currentRound = 0; currentRound < this.dim; currentRound++) {
            const nextRoundSelections = [];
            let currentGlobalCursor = 1;

            currentSelections.sort((selA, selB) => selB[0] - selA[0]);

            for (const parentEntry of currentSelections) {
                const parentConstraintValue = parentEntry[0];
                const minCursorForParent = parentEntry[1];
                
                if (currentGlobalCursor < minCursorForParent) {
                    currentGlobalCursor = minCursorForParent;
                }

                let entryFound = false;
                for (; currentGlobalCursor < this.activeIndices.length; currentGlobalCursor++) {
                    if (this.activeIndices[currentGlobalCursor]) {
                        continue;
                    }
                    
                    entryFound = true;
                    break; 
                }

                if (!entryFound || currentGlobalCursor === this.activeIndices.length) {
                    return false;
                }

                this.activeIndices[currentGlobalCursor] = true;
                nextRoundSelections.push([this.orderedValues[currentGlobalCursor], currentGlobalCursor + 1]);
                currentGlobalCursor++;
            }
            currentSelections = nextRoundSelections;
        }
        return true;
    }
}

const acquireData = new InputAcquirer(require("fs").readFileSync("/dev/stdin", "utf8"));

let problemDimension = acquireData.fetchScalar();
let numberSequence = acquireData.fetchSequence();

const gameProcessor = new ValueSelector(problemDimension, numberSequence);
const outcome = gameProcessor.performSelectionProcess();

console.log(outcome ? "Yes" : "No");