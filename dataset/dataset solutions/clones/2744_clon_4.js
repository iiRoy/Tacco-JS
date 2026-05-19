const InputReaderFactory = (function() {
    function createReader(sourceString) {
        return new DataStreamProcessor(sourceString);
    }

    function DataStreamProcessor(sourceString) {
        this.sourceLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
        this.currentLineTokens = [];
    }

    DataStreamProcessor.prototype.extractNextValue = function(asString) {
        if (this.currentLineTokens.length === 0) {
            if (this.currentLineIndex >= this.sourceLines.length) {
                return undefined;
            }
            this.currentLineTokens = this.sourceLines[this.currentLineIndex].split(" ");
        }
        const nextToken = this.currentLineTokens.shift();
        if (this.currentLineTokens.length === 0) {
            this.currentLineIndex++;
        }
        return asString ? nextToken : +nextToken;
    };

    DataStreamProcessor.prototype.fetchLineValues = function(asStrings) {
        const lineContent = this.sourceLines[this.currentLineIndex++];
        const tokens = lineContent.split(" ");
        return asStrings ? tokens : tokens.map(val => +val);
    };

    DataStreamProcessor.prototype.retrieveMatrix = function(numRows, asStrings) {
        const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
        this.currentLineIndex += numRows;
        return asStrings ?
            matrixRows.map(rowStr => rowStr.split(" ")) :
            matrixRows.map(rowStr => rowStr.split(" ").map(val => +val));
    };

    DataStreamProcessor.prototype.acquireRows = function(numRows, asStrings) {
        const rows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
        this.currentLineIndex += numRows;
        return asStrings ? rows : rows.map(val => +val);
    };

    return createReader;
})();

const inputProcessor = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function generateMultiDimArray(fillValue, ...dimensions) {
    const recursiveBuilder = (dimIndex) => {
        if (dimIndex === dimensions.length - 1) {
            return Array(dimensions[dimIndex]).fill(fillValue);
        } else {
            return Array(dimensions[dimIndex]).fill(0).map(() => recursiveBuilder(dimIndex + 1));
        }
    };
    return recursiveBuilder(0);
}

function findInsertionPoint(dataCollection, lowerBound, upperBound, targetElement) {
    let low = lowerBound;
    let high = upperBound;
    let midPoint;

    while (low < high) {
        midPoint = Math.floor((low + high) / 2);
        if (dataCollection[midPoint] <= targetElement) {
            low = midPoint + 1;
        } else {
            high = midPoint;
        }
    }
    return low;
}

console.log(solveProblem());

function solveProblem() {
    const elementCount = inputProcessor.extractNextValue();
    const inputSequence = inputProcessor.acquireRows(elementCount);

    const tailElements = [1];

    inputSequence.forEach(currentElement => {
        const negatedValue = -currentElement;
        const insertionIndex = findInsertionPoint(tailElements, 0, tailElements.length, negatedValue);

        if (insertionIndex === tailElements.length) {
            tailElements.push(negatedValue);
        } else {
            tailElements[insertionIndex] = negatedValue;
        }
    });

    return tailElements.length;
}
