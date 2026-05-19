const fileSystem = require("fs");
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const dataTokens = rawInputContent.trim().split(/\s+/);
let tokenCursor = 0;

function extractInteger() {
    return parseInt(dataTokens[tokenCursor++], 10);
}

function extractNumericSequence(count) {
    const sequence = new Array(count);
    for (let i = 0; i < count; i++) {
        sequence[i] = extractInteger();
    }
    return sequence;
}

const outputBuffer = [];
function appendOutput(content) {
    outputBuffer.push(String(content));
}

const initialValue = 0;

class SegmentManager {
    constructor(domainUpperLimit) {
        let treeCapacity = 1;
        while (treeCapacity < domainUpperLimit) {
            treeCapacity <<= 1;
        }
        this.leafOffset = treeCapacity;
        this.treeNodes = new Array(2 * treeCapacity).fill(initialValue);
    }

    updatePointMax(position, newValue) {
        let currentNodeIndex = position + this.leafOffset;
        this.treeNodes[currentNodeIndex] = Math.max(this.treeNodes[currentNodeIndex], newValue);
        
        currentNodeIndex >>= 1;
        while (currentNodeIndex > 0) {
            this.treeNodes[currentNodeIndex] = Math.max(
                this.treeNodes[currentNodeIndex * 2],
                this.treeNodes[currentNodeIndex * 2 + 1]
            );
            currentNodeIndex >>= 1;
        }
    }

    queryRangeMax(queryStart, queryEnd) {
        let maximumFound = initialValue;
        let leftPointer = queryStart + this.leafOffset;
        let rightPointer = queryEnd + this.leafOffset;

        while (leftPointer <= rightPointer) {
            if (leftPointer % 2 === 1) {
                maximumFound = Math.max(maximumFound, this.treeNodes[leftPointer]);
                leftPointer++;
            }
            if (rightPointer % 2 === 0) {
                maximumFound = Math.max(maximumFound, this.treeNodes[rightPointer]);
                rightPointer--;
            }
            leftPointer >>= 1;
            rightPointer >>= 1;
        }
        return maximumFound;
    }
}

function executeSolution() {
    const [elementCount, maxDifference] = extractNumericSequence(2);
    const valueArray = extractNumericSequence(elementCount);

    const segmentHandler = new SegmentManager(300001);

    for (let idx = 0; idx < elementCount; idx++) {
        const currentElementValue = valueArray[idx];

        const lowerBound = Math.max(0, currentElementValue - maxDifference);
        const upperBound = Math.min(300000, currentElementValue + maxDifference);

        const maxPrevLength = segmentHandler.queryRangeMax(lowerBound, upperBound);

        segmentHandler.updatePointMax(currentElementValue, maxPrevLength + 1);
    }

    const finalResult = segmentHandler.queryRangeMax(0, 300000);
    return finalResult;
}

const programResult = executeSolution();
if (programResult !== undefined) {
    console.log(String(programResult));
}
if (outputBuffer.length > 0) {
    console.log(outputBuffer.join("\n"));
}
