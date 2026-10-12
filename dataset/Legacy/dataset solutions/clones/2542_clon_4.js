class InputSource {
    constructor(sourceText) {
        this.rawLines = sourceText.trim().split('\n');
        this.linePointer = 0;
        this.currentLineSegments = [];
        this.segmentPointer = 0;
    }

    // Corresponds to original GET.a()
    retrieveSegment(asString) {
        if (this.segmentPointer >= this.currentLineSegments.length) {
            if (this.linePointer >= this.rawLines.length) {
                return undefined;
            }
            this.currentLineSegments = this.rawLines[this.linePointer].split(' ');
            this.linePointer++;
            this.segmentPointer = 0;
        }
        const segment = this.currentLineSegments[this.segmentPointer];
        this.segmentPointer++;
        return asString ? segment : +segment;
    }

    // Corresponds to original GET.l()
    retrieveLine(asString) {
        if (this.linePointer >= this.rawLines.length) {
            return undefined;
        }
        const lineContent = this.rawLines[this.linePointer];
        this.linePointer++;
        this.currentLineSegments = [];
        this.segmentPointer = 0;
        const segments = lineContent.split(' ');
        return asString ? segments : segments.map(Number);
    }

    // Corresponds to original GET.m()
    retrieveMatrix(count, asString) {
        const collectedMatrix = [];
        for (let i = 0; i < count; i++) {
            collectedMatrix.push(this.retrieveLine(asString));
        }
        return collectedMatrix;
    }

    // Corresponds to original GET.r()
    retrieveRawLines(count, asString) {
        const collectedLines = [];
        for (let i = 0; i < count; i++) {
            if (this.linePointer >= this.rawLines.length) {
                break;
            }
            const lineContent = this.rawLines[this.linePointer];
            this.linePointer++;
            this.currentLineSegments = [];
            this.segmentPointer = 0;
            collectedLines.push(asString ? lineContent : Number(lineContent));
        }
        return collectedLines;
    }
}

// Replaces xArray
function constructMultiDimensionalArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array.from({ length: currentDimensionSize }, () =>
        constructMultiDimensionalArray(initialValue, ...remainingDimensions)
    );
}

const inputSource = new InputSource(require("fs").readFileSync("/dev/stdin", "utf8"));

function processGridTransformation() {
    const gridHeight = inputSource.retrieveSegment();
    const gridWidth = inputSource.retrieveSegment();
    const columnThreshold = inputSource.retrieveSegment();
    const rowThreshold = inputSource.retrieveSegment();

    const transformedGrid = Array.from({ length: gridHeight }, (_, rowIndex) => {
        const shouldFlipRow = (rowIndex >= rowThreshold);
        return Array.from({ length: gridWidth }, (_, colIndex) => {
            let cellState = 0;
            if (colIndex >= columnThreshold) {
                cellState = 1;
            }
            if (shouldFlipRow) {
                cellState ^= 1;
            }
            return cellState;
        });
    });

    return transformedGrid.map(row => row.join("")).join("\n");
}

console.log(processGridTransformation());
