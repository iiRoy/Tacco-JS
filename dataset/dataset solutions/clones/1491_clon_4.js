(async () => {
    const MOD = 998244353;
    const INV_9 = 443664157; // Modular multiplicative inverse of 9 mod 998244353

    let powersOf10; // powersOf10[k] = 10^k % MOD
    let sumGeometricSeries; // sumGeometricSeries[k] = (1 + 10 + ... + 10^k) % MOD

    // Precomputes powers of 10 and sums of geometric series (1 + 10 + ... + 10^k)
    function precomputePowersAndSums(maximumN) {
        powersOf10 = new Array(maximumN + 2); // Need up to 10^(maximumN+1)
        sumGeometricSeries = new Array(maximumN + 1); // Need up to sumGeometricSeries[maximumN]

        powersOf10[0] = 1;
        for (let i = 1; i <= maximumN + 1; i++) {
            powersOf10[i] = (powersOf10[i - 1] * 10) % MOD;
        }

        sumGeometricSeries[0] = 1; // Represents 10^0
        for (let i = 1; i <= maximumN; i++) {
            // sumGeometricSeries[i] = (10^(i+1) - 1) * INV_9 % MOD
            sumGeometricSeries[i] = (powersOf10[i + 1] - 1 + MOD) % MOD;
            sumGeometricSeries[i] = (sumGeometricSeries[i] * INV_9) % MOD;
        }
    }

    // Represents a node in the segment tree
    class SegmentTreeNode {
        constructor() {
            this.value = 0;
            this.lazyDigit = null; // null means no lazy update, a digit (0-9) means update to that digit
        }
    }

    // Implements a segment tree with lazy propagation for range updates
    class DigitSegmentTree {
        constructor(arrayLength) {
            this.arraySize = arrayLength;
            this.treeNodes = new Array(4 * arrayLength); // Max size for segment tree
            for (let i = 0; i < this.treeNodes.length; i++) {
                this.treeNodes[i] = new SegmentTreeNode();
            }
            this.constructTree(1, 0, this.arraySize - 1);
        }

        // Calculates the sum of powers of 10 for a given range of indices
        // This corresponds to (10^(arraySize-1-startIndex) + ... + 10^(arraySize-1-endIndex)) % MOD
        // which simplifies to 10^(arraySize-1-endIndex) * (1 + 10 + ... + 10^(endIndex-startIndex)) % MOD
        getRangePowerSum(startIndex, endIndex) {
            if (startIndex > endIndex) return 0;
            const lengthOfSeries = endIndex - startIndex;
            const exponentForRightmost = this.arraySize - 1 - endIndex;
            return (powersOf10[exponentForRightmost] * sumGeometricSeries[lengthOfSeries]) % MOD;
        }

        // Builds the segment tree, initializing all digits to 1
        constructTree(nodeIndex, rangeStart, rangeEnd) {
            if (rangeStart === rangeEnd) {
                // Initial value for each digit is 1
                this.treeNodes[nodeIndex].value = (1 * powersOf10[this.arraySize - 1 - rangeStart]) % MOD;
            } else {
                const mid = Math.floor((rangeStart + rangeEnd) / 2);
                this.constructTree(2 * nodeIndex, rangeStart, mid);
                this.constructTree(2 * nodeIndex + 1, mid + 1, rangeEnd);
                this.treeNodes[nodeIndex].value = (this.treeNodes[2 * nodeIndex].value + this.treeNodes[2 * nodeIndex + 1].value) % MOD;
            }
        }

        // Pushes down lazy updates to children nodes
        propagateLazy(nodeIndex, rangeStart, rangeEnd) {
            const currentNode = this.treeNodes[nodeIndex];
            if (currentNode.lazyDigit !== null && rangeStart !== rangeEnd) {
                const mid = Math.floor((rangeStart + rangeEnd) / 2);

                // Apply lazy to left child
                const leftChild = this.treeNodes[2 * nodeIndex];
                leftChild.lazyDigit = currentNode.lazyDigit;
                leftChild.value = (currentNode.lazyDigit * this.getRangePowerSum(rangeStart, mid)) % MOD;

                // Apply lazy to right child
                const rightChild = this.treeNodes[2 * nodeIndex + 1];
                rightChild.lazyDigit = currentNode.lazyDigit;
                rightChild.value = (currentNode.lazyDigit * this.getRangePowerSum(mid + 1, rangeEnd)) % MOD;
            }
            currentNode.lazyDigit = null; // Clear lazy tag after pushing down
        }

        // Updates a range [queryL, queryR] with a new digit D
        applyRangeUpdate(nodeIndex, rangeStart, rangeEnd, queryL, queryR, digitD) {
            // If current node's range is outside query range, do nothing
            if (rangeStart > queryR || rangeEnd < queryL) {
                return;
            }

            // If current node's range is fully within query range
            if (queryL <= rangeStart && rangeEnd <= queryR) {
                this.treeNodes[nodeIndex].lazyDigit = digitD;
                this.treeNodes[nodeIndex].value = (digitD * this.getRangePowerSum(rangeStart, rangeEnd)) % MOD;
                return;
            }

            // Partial overlap, propagate lazy and recurse
            this.propagateLazy(nodeIndex, rangeStart, rangeEnd);

            const mid = Math.floor((rangeStart + rangeEnd) / 2);
            this.applyRangeUpdate(2 * nodeIndex, rangeStart, mid, queryL, queryR, digitD);
            this.applyRangeUpdate(2 * nodeIndex + 1, mid + 1, rangeEnd, queryL, queryR, digitD);

            // Update current node's value from children
            this.treeNodes[nodeIndex].value = (this.treeNodes[2 * nodeIndex].value + this.treeNodes[2 * nodeIndex + 1].value) % MOD;
        }

        // Retrieves the total value of the number represented by the segment tree
        getOverallValue() {
            return this.treeNodes[1].value;
        }
    }

    let rawInputData = '';
    for await (const chunk of process.stdin) rawInputData += chunk;
    const inputLines = rawInputData.split(/\n/);

    const [numElements, numQueries] = inputLines[0].split(/\s/).map(Number);
    const queryDetails = inputLines.slice(1, numQueries + 1).map(line => line.split(/\s/).map(Number));

    precomputePowersAndSums(numElements);

    const digitStructure = new DigitSegmentTree(numElements);

    for (const currentQuery of queryDetails) {
        const [leftBoundary, rightBoundary, newDigitValue] = [currentQuery[0] - 1, currentQuery[1] - 1, currentQuery[2]];
        digitStructure.applyRangeUpdate(1, 0, numElements - 1, leftBoundary, rightBoundary, newDigitValue);
        console.log(digitStructure.getOverallValue());
    }
})();
