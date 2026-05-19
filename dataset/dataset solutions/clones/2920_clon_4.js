class InputProcessor {
    constructor(sourceText) {
        this.lineBuffer = sourceText.trim().split('\n');
        this.currentLinePointer = 0;
        this.tokenCache = [];
    }

    _refillTokens() {
        if (this.tokenCache.length === 0 && this.currentLinePointer < this.lineBuffer.length) {
            this.tokenCache = this.lineBuffer[this.currentLinePointer++].split(' ');
        }
    }

    // Corresponds to original GET.a
    fetchSingle(asString = false) {
        this._refillTokens();
        if (this.tokenCache.length === 0) {
            return undefined;
        }
        const item = this.tokenCache.shift();
        return asString ? item : Number(item);
    }

    // Corresponds to original GET.l
    fetchLine(asStrings = false) {
        if (this.currentLinePointer >= this.lineBuffer.length) {
            return undefined;
        }
        const lineItems = this.lineBuffer[this.currentLinePointer++].split(' ');
        return asStrings ? lineItems : lineItems.map(Number);
    }

    // Corresponds to original GET.m
    fetchMatrix(rowsToRead, asStrings = false) {
        const collectedRows = [];
        for (let i = 0; i < rowsToRead; i++) {
            collectedRows.push(this.fetchLine(asStrings));
        }
        return collectedRows;
    }

    // Corresponds to original GET.r
    fetchVector(elementsToRead, asStrings = false) {
        const collectedElements = [];
        for (let i = 0; i < elementsToRead; i++) {
            const elementLine = this.lineBuffer[this.currentLinePointer++];
            collectedElements.push(asStrings ? elementLine : Number(elementLine));
        }
        return collectedElements;
    }
}

// Reimplementation of lower_bound with a different iterative structure
function findFirstGreaterOrEqual(sortedArr, searchStart, searchEnd, valueToFind) {
    let lowIndex = searchStart;
    let highIndex = searchEnd; // Exclusive upper bound

    while (lowIndex < highIndex) {
        const midIndex = Math.floor((lowIndex + highIndex) / 2);
        if (sortedArr[midIndex] < valueToFind) {
            lowIndex = midIndex + 1;
        } else {
            highIndex = midIndex;
        }
    }
    return lowIndex;
}

// Segment Tree for Range Assignment and Point Query (Lazy Propagation)
class AssignmentSegmentTree {
    constructor(capacity) {
        this.treeCapacity = capacity;
        this.treeNodes = new Array(4 * capacity).fill(Infinity); // Stores assigned value for range
        this.lazyValues = new Array(4 * capacity).fill(null);    // Stores pending assignments
        this._initializeTree(1, 0, this.treeCapacity - 1);
    }

    _initializeTree(nodeIndex, rangeStart, rangeEnd) {
        if (rangeStart === rangeEnd) {
            // Leaf node, initial value is Infinity
            return;
        }
        const midPoint = Math.floor((rangeStart + rangeEnd) / 2);
        this._initializeTree(2 * nodeIndex, rangeStart, midPoint);
        this._initializeTree(2 * nodeIndex + 1, midPoint + 1, rangeEnd);
    }

    _propagateLazy(nodeIndex) {
        if (this.lazyValues[nodeIndex] !== null) {
            // Apply lazy value to children
            this.treeNodes[2 * nodeIndex] = this.lazyValues[nodeIndex];
            this.lazyValues[2 * nodeIndex] = this.lazyValues[nodeIndex];

            this.treeNodes[2 * nodeIndex + 1] = this.lazyValues[nodeIndex];
            this.lazyValues[2 * nodeIndex + 1] = this.lazyValues[nodeIndex];

            // Clear lazy value for current node
            this.lazyValues[nodeIndex] = null;
        }
    }

    // Corresponds to original segTree.prototype.update
    applyRangeAssignment(queryStart, queryEndExclusive, assignmentValue) {
        // Adjust queryEnd to be inclusive for internal _update method
        this._updateSegment(1, 0, this.treeCapacity - 1, queryStart, queryEndExclusive - 1, assignmentValue);
    }

    _updateSegment(nodeIndex, currentRangeStart, currentRangeEnd, queryStart, queryEnd, assignmentValue) {
        // If current node's range is outside the query range
        if (currentRangeStart > queryEnd || currentRangeEnd < queryStart) {
            return;
        }

        // If current node's range is fully within the query range
        if (queryStart <= currentRangeStart && currentRangeEnd <= queryEnd) {
            this.treeNodes[nodeIndex] = assignmentValue;
            this.lazyValues[nodeIndex] = assignmentValue;
            return;
        }

        // Partially overlapping, propagate lazy values and recurse
        this._propagateLazy(nodeIndex);
        const midPoint = Math.floor((currentRangeStart + currentRangeEnd) / 2);
        this._updateSegment(2 * nodeIndex, currentRangeStart, midPoint, queryStart, queryEnd, assignmentValue);
        this._updateSegment(2 * nodeIndex + 1, midPoint + 1, currentRangeEnd, queryStart, queryEnd, assignmentValue);
    }

    // Corresponds to original segTree.prototype.get
    retrievePointAssignment(pointIndex) {
        const result = this._querySegment(1, 0, this.treeCapacity - 1, pointIndex);
        return result === Infinity ? -1 : result;
    }

    _querySegment(nodeIndex, currentRangeStart, currentRangeEnd, pointIndex) {
        // If current node's range is outside the point index
        if (currentRangeStart > pointIndex || currentRangeEnd < pointIndex) {
            return Infinity;
        }

        // If current node is a leaf node
        if (currentRangeStart === currentRangeEnd) {
            return this.treeNodes[nodeIndex];
        }

        // Propagate lazy value before querying children
        this._propagateLazy(nodeIndex);

        const midPoint = Math.floor((currentRangeStart + currentRangeEnd) / 2);
        if (pointIndex <= midPoint) {
            return this._querySegment(2 * nodeIndex, currentRangeStart, midPoint, pointIndex);
        } else {
            return this._querySegment(2 * nodeIndex + 1, midPoint + 1, currentRangeEnd, pointIndex);
        }
    }
}

function executeProblemLogic() {
    const dataReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalSegments = dataReader.fetchSingle();
    const totalQueries = dataReader.fetchSingle();
    const segmentDetails = dataReader.fetchMatrix(totalSegments);
    const queryPoints = dataReader.fetchVector(totalQueries);

    const assignmentTree = new AssignmentSegmentTree(totalQueries);

    // Sort segments by their third element (value) in descending order
    segmentDetails.sort((detailA, detailB) => detailB[2] - detailA[2]);

    for (let i = 0; i < totalSegments; i++) {
        const currentDetail = segmentDetails[i];
        const detailStart = currentDetail[0];
        const detailEnd = currentDetail[1];
        const detailValue = currentDetail[2];

        // Skip condition, uses the first query point
        if (detailEnd - detailValue - 1 < queryPoints[0]) {
            continue;
        }

        // Determine the range [leftBound, rightBound) in queryPoints array
        const leftBound = findFirstGreaterOrEqual(queryPoints, 0, totalQueries, detailStart - detailValue);
        const rightBound = findFirstGreaterOrEqual(queryPoints, leftBound, totalQueries, detailEnd - detailValue);

        // Apply the assignment to the segment tree if the range is valid
        if (leftBound < rightBound) {
            assignmentTree.applyRangeAssignment(leftBound, rightBound, detailValue);
        }
    }

    const finalResults = new Array(totalQueries);
    for (let i = 0; i < totalQueries; i++) {
        finalResults[i] = assignmentTree.retrievePointAssignment(i);
    }

    return finalResults.join("\n");
}

console.log(executeProblemLogic());
