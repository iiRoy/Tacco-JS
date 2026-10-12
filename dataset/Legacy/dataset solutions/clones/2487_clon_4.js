class DataStreamHandler {
    constructor(sourceText) {
        this.lineSegments = sourceText.trim().split('\n');
        this.currentSegmentIndex = 0;
    }

    retrieveNumericItem(asStringFlag = false) {
        if (this.currentSegmentIndex >= this.lineSegments.length) {
            return undefined;
        }

        let activeSegment = this.lineSegments[this.currentSegmentIndex];

        if (typeof activeSegment === 'string') {
            this.lineSegments[this.currentSegmentIndex] = activeSegment.split(' ').reverse();
            activeSegment = this.lineSegments[this.currentSegmentIndex];
        }

        const itemValue = activeSegment.pop();

        if (activeSegment.length === 0) {
            this.currentSegmentIndex++;
        }

        return asStringFlag ? itemValue : Number(itemValue);
    }

    extractLineTokens(asStringFlag = false) {
        if (this.currentSegmentIndex >= this.lineSegments.length) {
            return [];
        }
        const lineContent = this.lineSegments[this.currentSegmentIndex++];
        const tokens = String(lineContent).split(' ');

        return asStringFlag ? tokens : tokens.map(val => Number(val));
    }

    fetchMatrix(rowCount, asStringFlag = false) {
        const resultMatrix = [];
        for (let i = 0; i < rowCount; i++) {
            if (this.currentSegmentIndex >= this.lineSegments.length) {
                break;
            }
            const lineContent = this.lineSegments[this.currentSegmentIndex++];
            resultMatrix.push(String(lineContent).split(' '));
        }
        return asStringFlag ? resultMatrix : resultMatrix.map(row => row.map(val => Number(val)));
    }

    retrieveRawLines(rowCount, asStringFlag = false) {
        const resultLines = [];
        for (let i = 0; i < rowCount; i++) {
            if (this.currentSegmentIndex >= this.lineSegments.length) {
                break;
            }
            const lineContent = this.lineSegments[this.currentSegmentIndex++];
            resultLines.push(String(lineContent));
        }
        return asStringFlag ? resultLines : resultLines.map(val => Number(val));
    }
}

function createInputHandler(inputString) {
    const handlerInstance = new DataStreamHandler(inputString);
    return {
        a: (flag) => handlerInstance.retrieveNumericItem(flag),
        l: (flag) => handlerInstance.extractLineTokens(flag),
        m: (num, flag) => handlerInstance.fetchMatrix(num, flag),
        r: (num, flag) => handlerInstance.retrieveRawLines(num, flag)
    };
}

const dataProcessor = createInputHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

function generateMultiArray(initialFillValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialFillValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array(currentDimensionSize).fill(null).map(() => {
        return generateMultiArray(initialFillValue, ...remainingDimensions);
    });
}

console.log(calculateResult());

function calculateResult() {
  const firstValue = dataProcessor.a();
  const secondValue = dataProcessor.a();
  return Math.max(0, firstValue - 2 * secondValue);
}
