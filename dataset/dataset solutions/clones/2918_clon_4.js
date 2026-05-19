'use strict'

// Constants
const MAX_SAFE_INT_DIV_TEN = 900719925474099;
const DATA_STRUCTURE_SENTINEL = 2e9;

// Parses a space-separated string of numbers into an array of integers
function parseNumbers(line) {
    return line.split(' ').map(Number);
}

// Finds the first index in a sorted array 'arr' (between 'low' and 'high' exclusive)
// such that arr[index] >= target. Returns 'high' if all elements are less than 'target'.
function findFirstGreaterOrEqual(arr, low, high, target) {
    let currentLow = low;
    let currentHigh = high; // exclusive upper bound

    while (currentLow < currentHigh) {
        const midPoint = Math.floor(currentLow + (currentHigh - currentLow) / 2);
        if (arr[midPoint] < target) {
            currentLow = midPoint + 1;
        } else {
            currentHigh = midPoint;
        }
    }
    return currentLow;
}

// Sqrt Decomposition for Range Minimum Set / Point Query Minimum
function SqrtDecomposition(totalElements) {
    this.totalElements = totalElements;
    this.blockSize = Math.floor(Math.sqrt(totalElements));
    if (this.blockSize === 0) this.blockSize = 1; // Ensure block size is at least 1 for small inputs
    this.numBlocks = Math.ceil(totalElements / this.blockSize);

    // `elementValues` stores the actual values, initialized to DATA_STRUCTURE_SENTINEL
    this.elementValues = Array(totalElements).fill(DATA_STRUCTURE_SENTINEL);
    // `blockMinValues` stores the minimum value in each block, considering lazy updates
    this.blockMinValues = Array(this.numBlocks).fill(DATA_STRUCTURE_SENTINEL);
    // `blockLazySetValues` stores a value if the entire block has been set to it.
    // This acts as a lazy tag for range minimum set operations.
    this.blockLazySetValues = Array(this.numBlocks).fill(DATA_STRUCTURE_SENTINEL);
}

SqrtDecomposition.prototype = {
    // Helper to recompute the minimum value for a specific block
    _recomputeBlockMinimum: function(blockIndex) {
        let currentBlockMin = DATA_STRUCTURE_SENTINEL;
        const blockStart = blockIndex * this.blockSize;
        const blockEnd = Math.min(this.totalElements, (blockIndex + 1) * this.blockSize);
        for (let i = blockStart; i < blockEnd; i++) {
            currentBlockMin = Math.min(currentBlockMin, this.elementValues[i]);
        }
        this.blockMinValues[blockIndex] = currentBlockMin;
    },

    // Helper to apply any pending lazy set value to the elements within a block
    _propagateLazySet: function(blockIndex) {
        if (this.blockLazySetValues[blockIndex] !== DATA_STRUCTURE_SENTINEL) {
            const lazyValue = this.blockLazySetValues[blockIndex];
            const blockStart = blockIndex * this.blockSize;
            const blockEnd = Math.min(this.totalElements, (blockIndex + 1) * this.blockSize);
            for (let i = blockStart; i < blockEnd; i++) {
                // Apply the lazy value as a minimum update to each element
                this.elementValues[i] = Math.min(this.elementValues[i], lazyValue);
            }
            this.blockLazySetValues[blockIndex] = DATA_STRUCTURE_SENTINEL; // Clear lazy tag
            this._recomputeBlockMinimum(blockIndex); // Recalculate block min after materializing
        }
    },

    // Applies a minimum 'value' to the range [startIdx, endIdx)
    applyRangeMin: function(startIdx, endIdx, value) {
        if (startIdx >= endIdx) return;

        const startBlock = Math.floor(startIdx / this.blockSize);
        const endBlock = Math.floor((endIdx - 1) / this.blockSize);

        // Case 1: Update is entirely within a single block
        if (startBlock === endBlock) {
            this._propagateLazySet(startBlock); // Ensure elements are up-to-date
            for (let i = startIdx; i < endIdx; i++) {
                this.elementValues[i] = Math.min(this.elementValues[i], value);
            }
            this._recomputeBlockMinimum(startBlock);
        } else {
            // Case 2: Update spans across multiple blocks

            // Update partial start block
            this._propagateLazySet(startBlock);
            for (let i = startIdx; i < (startBlock + 1) * this.blockSize; i++) {
                this.elementValues[i] = Math.min(this.elementValues[i], value);
            }
            this._recomputeBlockMinimum(startBlock);

            // Update full blocks in between
            for (let bIdx = startBlock + 1; bIdx < endBlock; bIdx++) {
                // Apply lazy update to block's lazy tag and block's minimum
                this.blockLazySetValues[bIdx] = Math.min(this.blockLazySetValues[bIdx], value);
                this.blockMinValues[bIdx] = Math.min(this.blockMinValues[bIdx], value);
            }

            // Update partial end block
            this._propagateLazySet(endBlock);
            for (let i = endBlock * this.blockSize; i < endIdx; i++) {
                this.elementValues[i] = Math.min(this.elementValues[i], value);
            }
            this._recomputeBlockMinimum(endBlock);
        }
    },

    // Queries the minimum value affecting a specific 'index'
    queryPointMin: function(index) {
        const blockIndex = Math.floor(index / this.blockSize);
        let result = this.elementValues[index];

        // If the block has a pending lazy set value, it's a candidate for the minimum
        if (this.blockLazySetValues[blockIndex] !== DATA_STRUCTURE_SENTINEL) {
            result = Math.min(result, this.blockLazySetValues[blockIndex]);
        }
        
        return result === DATA_STRUCTURE_SENTINEL ? -1 : result;
    }
};

function processInput(inputContent) {
    let inputLines = inputContent.trim().split('\n');
    let parsedHeader = parseNumbers(inputLines[0]);
    let numItems = parsedHeader.shift();
    let numQueries = parsedHeader.shift();

    let itemDetails = new Array(numItems);
    for (let i = 1; i <= numItems; i++) {
        itemDetails[i - 1] = parseNumbers(inputLines[i]);
    }

    let queryValues = new Array(numQueries);
    for (let i = 1; i <= numQueries; i++) {
        queryValues[i - 1] = parseInt(inputLines[numItems + i]);
    }

    let sqrtDecomp = new SqrtDecomposition(numQueries);
    itemDetails.sort((a, b) => b[2] - a[2]); // Sort by third element descending

    for (var i = 0; i < numItems; i++) {
        // Original condition: s[i][1]-s[i][2]-1 < d[0]
        if (itemDetails[i][1] - itemDetails[i][2] - 1 < queryValues[0]) {
            continue;
        }
        // Original: var l = lower_bound(d,0,q,s[i][0]-s[i][2]);
        let rangeStartIdx = findFirstGreaterOrEqual(queryValues, 0, numQueries, itemDetails[i][0] - itemDetails[i][2]);
        // Original: var r = lower_bound(d,l,q,s[i][1]-s[i][2]);
        let rangeEndIdx = findFirstGreaterOrEqual(queryValues, rangeStartIdx, numQueries, itemDetails[i][1] - itemDetails[i][2]);
        
        if (rangeStartIdx < rangeEndIdx) {
            sqrtDecomp.applyRangeMin(rangeStartIdx, rangeEndIdx, itemDetails[i][2]);
        }
    }

    let finalResults = Array(numQueries);
    for (var i = 0; i < numQueries; i++) {
        finalResults[i] = sqrtDecomp.queryPointMin(i);
    }
    console.log(finalResults.join("\n"));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
