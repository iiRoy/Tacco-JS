class InputProcessorContext {
    constructor(sourceString) {
        this.allLines = sourceString.trim().split('\n');
        this.currentLineIndex = 0;
        this.currentLineTokens = [];
        this.tokenPosition = 0;
    }

    pullNextValue(asString) {
        if (this.tokenPosition >= this.currentLineTokens.length) {
            if (this.currentLineIndex >= this.allLines.length) {
                return undefined;
            }
            this.currentLineTokens = this.allLines[this.currentLineIndex].split(' ');
            this.currentLineIndex++;
            this.tokenPosition = 0;
        }
        const value = this.currentLineTokens[this.tokenPosition];
        this.tokenPosition++;
        return asString ? value : Number(value);
    }

    pullFullLine(asString) {
        if (this.currentLineIndex >= this.allLines.length) {
            return undefined;
        }
        const line = this.allLines[this.currentLineIndex];
        this.currentLineIndex++;
        this.currentLineTokens = [];
        this.tokenPosition = 0;
        const tokens = line.split(' ');
        return asString ? tokens : tokens.map(Number);
    }

    pullValueMatrix(rowsToRead, asString) {
        const matrix = [];
        for (let i = 0; i < rowsToRead; i++) {
            matrix.push(this.pullFullLine(asString));
        }
        return matrix;
    }

    pullValueVector(elementsToRead, asString) {
        const vector = [];
        for (let i = 0; i < elementsToRead; i++) {
            const lineTokens = this.pullFullLine(asString);
            vector.push(asString ? lineTokens[0] : Number(lineTokens[0]));
        }
        return vector;
    }
}

const InputProcessor = (source) => new InputProcessorContext(source);

function makeMultiDimensionalArray(dimensions, initializerValue) {
    if (dimensions.length === 0) {
        return typeof initializerValue === 'function' ? initializerValue() : initializerValue;
    }

    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);

    return Array.from({ length: currentDimSize }, () =>
        makeMultiDimensionalArray(remainingDims, initializerValue)
    );
}

const dataPipe = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function calculateZeroKSequence(dimension) {
    const totalElements = 1 << (dimension + 1);
    return Array.from({ length: totalElements }, (_, idx) => Math.floor(idx / 2)).join(" ");
}

function computeSolution() {
    const paramM = dataPipe.pullNextValue();
    const paramK = dataPipe.pullNextValue();

    if (paramK >= (1 << paramM)) return -1;
    if (paramK !== 0 && paramM === 1) return -1;
    if (paramK === 0) return calculateZeroKSequence(paramM);

    const twoPowerM = 1 << paramM;

    const firstSegment = Array.from({ length: twoPowerM }, (_, idx) => idx)
                               .filter(val => val !== paramK);
    
    const secondSegment = [...firstSegment].reverse();

    const finalSequence = [...firstSegment, paramK, ...secondSegment, paramK];

    return finalSequence.join(" ");
}

console.log(computeSolution());