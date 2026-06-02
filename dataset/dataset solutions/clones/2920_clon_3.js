const MIN_SENTINEL_VALUE = 2e9;

function createInputReaderFactory() {
    function createReaderInstance(rawInputString) {
        return new InputReader(rawInputString);
    }

    function InputReader(inputString) {
        this.rawInputLines = inputString.trim().split("\n");
        this.currentLineIdx = 0;
    }

    InputReader.prototype.readNextValue = function(returnAsString) {
        let currentLineContent = this.rawInputLines[this.currentLineIdx];
        if (typeof currentLineContent === "string") {
            currentLineContent = currentLineContent.split(" ").reverse();
            this.rawInputLines[this.currentLineIdx] = currentLineContent;
        }
        const extractedValue = currentLineContent.pop();
        if (currentLineContent.length === 0) {
            this.currentLineIdx++;
        }
        return returnAsString ? extractedValue : Number(extractedValue);
    };

    InputReader.prototype.readCurrentLineValues = function(returnAsStrings) {
        const line = this.rawInputLines[this.currentLineIdx++];
        const values = line.split(" ");
        return returnAsStrings ? values : values.map(val => Number(val));
    };

    InputReader.prototype.readMultiLineMatrix = function(numRows, returnAsStrings) {
        const matrixRows = this.rawInputLines.slice(this.currentLineIdx, this.currentLineIdx += numRows);
        return returnAsStrings ?
            matrixRows.map(row => row.split(" ")) :
            matrixRows.map(row => row.split(" ").map(val => Number(val)));
    };

    InputReader.prototype.readMultiLineValues = function(numLines, returnAsStrings) {
        const lines = this.rawInputLines.slice(this.currentLineIdx, this.currentLineIdx += numLines);
        return returnAsStrings ? lines : lines.map(val => Number(val));
    };

    return createReaderInstance;
}

var inputReaderFactory = createInputReaderFactory();
var inputProcessor = inputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimensionalArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        evalString = "Array(args[" + (--argCount) + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        evalString = "Array(args[" + argCount + "]).fill(0).map(x=>" + evalString + ")";
    }
    return eval(evalString);
}

function findInsertionPoint(sortedArray, startIndex, endIndex, targetValue) {
    let low = startIndex;
    let high = endIndex;
    let mid;
    while (1 < high - low) {
        mid = Math.floor((low + high) / 2);
        if (sortedArray[mid] < targetValue) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return sortedArray[low] < targetValue ? high : low;
}

function MinSegmentTree(size) {
    let tempSize = size - 1;
    let treeCapacity = 2;
    while (tempSize) {
        tempSize >>= 1;
        treeCapacity <<= 1;
    }
    this.treeNodes = Array(treeCapacity - 1).fill(MIN_SENTINEL_VALUE);
    this.leafNodeOffset = treeCapacity >> 1;
}

MinSegmentTree.prototype = {
    queryMinimum: function(leafIndex) {
        let currentNodeIndex = leafIndex + this.leafNodeOffset - 1;
        let currentMin = MIN_SENTINEL_VALUE;
        while (currentNodeIndex >= 0) {
            if (this.treeNodes[currentNodeIndex] < currentMin) {
                currentMin = this.treeNodes[currentNodeIndex];
            }
            currentNodeIndex = Math.floor((currentNodeIndex - 1) / 2);
        }
        return currentMin === MIN_SENTINEL_VALUE ? -1 : currentMin;
    },

    updateRange: function(queryStart, queryEnd, targetValue) {
        const nodeValues = this.treeNodes;

        function _recursiveRangeUpdate(currentQueryL, currentQueryR, nodeRangeStart, nodeRangeEnd, nodeIndex) {
            if (nodeRangeEnd <= currentQueryL || nodeRangeStart >= currentQueryR) {
                return;
            }

            if (currentQueryL <= nodeRangeStart && nodeRangeEnd <= currentQueryR) {
                nodeValues[nodeIndex] = targetValue;
                return;
            }

            const midPoint = Math.floor((nodeRangeStart + nodeRangeEnd) / 2);
            const leftChildIndex = 2 * nodeIndex + 1;
            const rightChildIndex = 2 * nodeIndex + 2;

            if (currentQueryL < midPoint) {
                _recursiveRangeUpdate(currentQueryL, currentQueryR, nodeRangeStart, midPoint, leftChildIndex);
            }
            if (currentQueryR > midPoint) {
                _recursiveRangeUpdate(currentQueryL, currentQueryR, midPoint, nodeRangeEnd, rightChildIndex);
            }
        }
        _recursiveRangeUpdate(queryStart, queryEnd, 0, this.leafNodeOffset, 0);
    },
};

console.log(main());

function main() {
    const numDataEntries = inputProcessor.readNextValue();
    const numQueryPoints = inputProcessor.readNextValue();
    const dataSegments = inputProcessor.readMultiLineMatrix(numDataEntries);
    const queryPoints = inputProcessor.readMultiLineValues(numQueryPoints);

    const minSegmentTree = new MinSegmentTree(numQueryPoints);

    const compareSegmentsByValueDescending = (segmentA, segmentB) => segmentB[2] - segmentA[2];
    dataSegments.sort(compareSegmentsByValueDescending);

    for (let dataIdx = 0; dataIdx < numDataEntries; dataIdx++) {
        const currentSegment = dataSegments[dataIdx];
        const segmentStartCoord = currentSegment[0];
        const segmentEndCoord = currentSegment[1];
        const segmentValue = currentSegment[2];

        if (segmentEndCoord - segmentValue - 1 < queryPoints[0]) {
            continue;
        }

        const affectedRangeStartIdx = findInsertionPoint(queryPoints, 0, numQueryPoints, segmentStartCoord - segmentValue);
        const affectedRangeEndIdx = findInsertionPoint(queryPoints, affectedRangeStartIdx, numQueryPoints, segmentEndCoord - segmentValue);

        minSegmentTree.updateRange(affectedRangeStartIdx, affectedRangeEndIdx, segmentValue);
    }

    const resultValues = Array(numQueryPoints);
    for (let queryIdx = 0; queryIdx < numQueryPoints; queryIdx++) {
        resultValues[queryIdx] = minSegmentTree.queryMinimum(queryIdx);
    }

    return resultValues.join("\n");
}
