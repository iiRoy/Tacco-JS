const determineGCD = (val1, val2) => {
    while (val2 !== 0) {
        let temporary = val2;
        val2 = val1 % val2;
        val1 = temporary;
    }
    return val1;
};

let segmentStore;
let originalElements;
let treeSize;

const constructTree = (nodePointer, rangeStart, rangeEnd) => {
    if (rangeStart === rangeEnd) {
        segmentStore[nodePointer] = originalElements[rangeStart];
        return;
    }
    const midPoint = Math.floor((rangeStart + rangeEnd) / 2);
    constructTree(2 * nodePointer + 1, rangeStart, midPoint);
    constructTree(2 * nodePointer + 2, midPoint + 1, rangeEnd);
    segmentStore[nodePointer] = determineGCD(segmentStore[2 * nodePointer + 1], segmentStore[2 * nodePointer + 2]);
};

const retrieveGCD = (nodePointer, nodeRangeStart, nodeRangeEnd, queryRangeStart, queryRangeEnd) => {
    if (queryRangeStart > nodeRangeEnd || queryRangeEnd < nodeRangeStart) {
        return 0;
    }
    if (queryRangeStart <= nodeRangeStart && nodeRangeEnd <= queryRangeEnd) {
        return segmentStore[nodePointer];
    }
    const midPoint = Math.floor((nodeRangeStart + nodeRangeEnd) / 2);
    const leftGCD = retrieveGCD(2 * nodePointer + 1, nodeRangeStart, midPoint, queryRangeStart, queryRangeEnd);
    const rightGCD = retrieveGCD(2 * nodePointer + 2, midPoint + 1, nodeRangeEnd, queryRangeStart, queryRangeEnd);
    
    if (leftGCD === 0) return rightGCD;
    if (rightGCD === 0) return leftGCD;
    
    return determineGCD(leftGCD, rightGCD);
};

function processChallenge(inputPayload) {
    const dataLines = inputPayload.trim().split('\n');
    const elementCount = parseInt(dataLines[0], 10);
    originalElements = dataLines[1].split(' ').map(Number);

    treeSize = 4 * elementCount;
    segmentStore = new Array(treeSize).fill(0);

    constructTree(0, 0, elementCount - 1);

    let highestAchievedGCD = 0;

    for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
        let leftSegmentGCD = 0;
        if (currentIdx > 0) {
            leftSegmentGCD = retrieveGCD(0, 0, elementCount - 1, 0, currentIdx - 1);
        }

        let rightSegmentGCD = 0;
        if (currentIdx < elementCount - 1) {
            rightSegmentGCD = retrieveGCD(0, 0, elementCount - 1, currentIdx + 1, elementCount - 1);
        }
        
        let currentCombinedGCD;
        if (leftSegmentGCD === 0) {
            currentCombinedGCD = rightSegmentGCD;
        } else if (rightSegmentGCD === 0) {
            currentCombinedGCD = leftSegmentGCD;
        } else {
            currentCombinedGCD = determineGCD(leftSegmentGCD, rightSegmentGCD);
        }

        if (currentCombinedGCD > highestAchievedGCD) {
            highestAchievedGCD = currentCombinedGCD;
        }
    }

    console.log(highestAchievedGCD);
}

if (typeof window === "undefined") {
    processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));
}