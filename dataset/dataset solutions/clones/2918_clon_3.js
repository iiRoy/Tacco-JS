'use strict';

// Constants
const MAX_VAL_LIMIT = 900719925474099; // Represents a large numerical boundary, approximately Math.floor(Number.MAX_SAFE_INTEGER / 10)
const SEG_TREE_INITIAL_FILL = 2000000000; // Explicit value for 2e9, used as a sentinel for uninitialized segments

// Function to parse a space-separated string of numbers into an array of integers
function parseLineOfInts(lineString) {
    return lineString.split(' ').map((valStr) => parseInt(valStr, 10));
}

// Implements a binary search to find the lower bound index in a sorted array.
// Returns the index of the first element not less than the target value.
function findLowerBoundIndex(dataArr, lowIdx, highIdx, targetVal) {
    let currentMidIdx;
    // Continue searching while the range has more than one element
    while (highIdx - lowIdx > 1) {
        currentMidIdx = Math.floor((lowIdx + highIdx) / 2);
        const midVal = dataArr[currentMidIdx]; // Introduce helper variable for clarity

        if (midVal < targetVal) {
            lowIdx = currentMidIdx;
        } else {
            highIdx = currentMidIdx;
        }
    }
    // After the loop, lowIdx and highIdx are adjacent.
    // Determine the correct lower bound based on dataArr[lowIdx].
    return dataArr[lowIdx] < targetVal ? highIdx : lowIdx;
}

// SegmentTree implementation for range minimum queries and point updates (or range updates to a single value).
// This specific implementation seems to be for range updates where a range [l, r) is set to a value 't',
// and 'queryMin' retrieves the minimum value from the root to a specific leaf.
function SegmentTree(initialSize) {
    let tempN = initialSize - 1;
    let treeCapacity = 2; // This will become 2 * (smallest power of 2 >= initialSize)

    // Calculate the smallest power of 2 that is greater than or equal to initialSize.
    // This determines the number of leaf nodes in the complete binary tree.
    while (tempN > 0) {
        tempN >>= 1; // Equivalent to Math.floor(tempN / 2)
        treeCapacity <<= 1; // Equivalent to treeCapacity * 2
    }

    // The segment tree array will have (2 * leafCount - 1) nodes.
    // 'treeCapacity' here is 2 * leafCount.
    this.segmentArray = new Array(treeCapacity - 1).fill(SEG_TREE_INITIAL_FILL);
    this.leafCount = treeCapacity >> 1; // The actual number of leaves that map to data elements
}

SegmentTree.prototype = {
    // Retrieves the minimum value from the root to the specified leaf index.
    queryMin: function(targetIndex) {
        // Adjust targetIndex to be the corresponding leaf node index in the segment tree array.
        let currentSegmentIndex = targetIndex + this.leafCount - 1;
        let minimumValueFound = SEG_TREE_INITIAL_FILL;
        const sentinelValue = SEG_TREE_INITIAL_FILL; // Helper constant for clarity

        // Traverse up from the leaf node to the root, updating the minimum value.
        while (currentSegmentIndex >= 0) {
            if (this.segmentArray[currentSegmentIndex] < minimumValueFound) {
                minimumValueFound = this.segmentArray[currentSegmentIndex];
            }
            // Move to the parent node.
            currentSegmentIndex = Math.floor((currentSegmentIndex - 1) / 2); // Explicit Math.floor for (x-1)>>1
        }

        // If the minimum value is still the initial sentinel, it means no valid value was set.
        if (minimumValueFound === sentinelValue) {
            return -1;
        }
        return minimumValueFound;
    },

    // Performs a range update: sets all nodes within the range [queryL, queryR) to updateVal.
    // This is a specific type of range update where a node's value is directly set if its range
    // is fully covered by the query range. It doesn't propagate min/max.
    rangeUpdate: function(queryL, queryR, updateVal) {
        const treeNodes = this.segmentArray;
        const segmentTreeLeafCount = this.leafCount;

        // Recursive helper function for the update operation.
        // currentL, currentR: The current query range.
        // nodeStart, nodeEnd: The range covered by the current node (nodeIndex).
        // nodeIndex: The index of the current node in the segmentArray.
        const performRecursiveUpdate = (currentL, currentR, nodeStart, nodeEnd, nodeIndex) => {
            // Base case: If the current node's range exactly matches the query range, update its value.
            if (currentL === nodeStart && currentR === nodeEnd) {
                treeNodes[nodeIndex] = updateVal;
                return;
            }

            const midPoint = Math.floor((nodeStart + nodeEnd) / 2); // Midpoint of the current node's range.

            // Determine which children to recurse into based on query range overlap.
            // If the query range extends into the right child's domain (i.e., midpoint is before queryR).
            if (midPoint < currentR) {
                // If the query range also extends into the left child's domain (i.e., queryL is before midpoint).
                if (currentL < midPoint) {
                    // Query range spans both children. Recurse into both.
                    performRecursiveUpdate(currentL, midPoint, nodeStart, midPoint, 2 * nodeIndex + 1); // Left child
                    performRecursiveUpdate(midPoint, currentR, midPoint, nodeEnd, 2 * nodeIndex + 2); // Right child
                } else {
                    // Query range is entirely within the right child's domain.
                    performRecursiveUpdate(currentL, currentR, midPoint, nodeEnd, 2 * nodeIndex + 2); // Right child
                }
            } else {
                // Query range is entirely within the left child's domain (i.e., queryR is at or before midpoint).
                performRecursiveUpdate(currentL, currentR, nodeStart, midPoint, 2 * nodeIndex + 1); // Left child
            }
        };

        // Initiate the recursive update from the root node (index 0), covering the full leaf range.
        performRecursiveUpdate(queryL, queryR, 0, segmentTreeLeafCount, 0);
    },

    // Utility function to print parts of the segment tree structure (for debugging).
    // This function is not called in Main, so its exact behavior is not critical for observable output.
    displayStructure: function() {
        console.log(this.segmentArray[0]);
        let row1 = [];
        for (let i = 1; i <= 2; i++) {
            row1.push(this.segmentArray[i]);
        }
        console.log(row1.join(' '));
        let row2 = [];
        for (let i = 3; i <= 6; i++) {
            row2.push(this.segmentArray[i]);
        }
        console.log(row2.join(' '));
        let row3 = [];
        for (let i = 7; i <= 14; i++) {
            row3.push(this.segmentArray[i]);
        }
        console.log(row3.join(' '));
    },
};

function Main(inputContent) {
    const trimmedInput = inputContent.trim();
    const inputLines = trimmedInput.split('\n');

    const firstLineParts = parseLineOfInts(inputLines[0]);
    const numItems = firstLineParts.shift(); // Renamed 'n'
    const numQueries = firstLineParts.shift(); // Renamed 'q'

    // Read item data
    const itemData = new Array(numItems); // Renamed 's'
    for (let i = 0; i < numItems; i++) {
        itemData[i] = parseLineOfInts(inputLines[i + 1]);
    }

    // Read query values
    const queryValues = new Array(numQueries); // Renamed 'd'
    for (let i = 0; i < numQueries; i++) {
        queryValues[i] = parseInt(inputLines[numItems + i + 1], 10);
    }

    const segmentTreeInstance = new SegmentTree(numQueries); // Renamed 'st'

    // Sort itemData in descending order based on the third element (index 2)
    itemData.sort((itemA, itemB) => itemB[2] - itemA[2]);

    // Process each item to update the segment tree
    for (let i = 0; i < numItems; i++) {
        const currentItem = itemData[i]; // Helper variable for current item
        const itemStart = currentItem[0];
        const itemEnd = currentItem[1];
        const itemValue = currentItem[2];

        // Guard clause: if the item's effective start point is less than the first query value, skip.
        // This condition is equivalent to s[i][1]-s[i][2]-1 < d[0]
        // which translates to itemEnd - itemValue - 1 < queryValues[0]
        if (itemEnd - itemValue - 1 < queryValues[0]) {
            continue;
        }

        // Find the lower bound indices for the update range in queryValues
        const lowerBoundIdx = findLowerBoundIndex(queryValues, 0, numQueries, itemStart - itemValue); // Renamed 'l'
        const upperBoundIdx = findLowerBoundIndex(queryValues, lowerBoundIdx, numQueries, itemEnd - itemValue); // Renamed 'r'

        // If a valid range is found (lowerBoundIdx < upperBoundIdx), update the segment tree
        if (lowerBoundIdx < upperBoundIdx) {
            segmentTreeInstance.rangeUpdate(lowerBoundIdx, upperBoundIdx, itemValue);
        }
    }

    // Collect results for each query
    const resultsArray = new Array(numQueries); // Renamed 'ans'
    for (let i = 0; i < numQueries; i++) {
        resultsArray[i] = segmentTreeInstance.queryMin(i);
    }

    // Output the results, each on a new line
    console.log(resultsArray.join("\n"));
    // segmentTreeInstance.displayStructure(); // Original was commented out, keep it that way.
}

// Read input from stdin and pass it to the Main function
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
