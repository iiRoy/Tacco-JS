const rlInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let receivedLines = [];
rlInterface.on('line', (lineContent) => {
  receivedLines.push(lineContent);
});

rlInterface.on('close', () => {
  let linePointer = 0;
  let currentInputTokens = [];
  let tokenPointer = 0;

  function extractNextNumber() {
    while (tokenPointer >= currentInputTokens.length) {
      if (linePointer >= receivedLines.length) {
        throw new Error("Input data exhausted.");
      }
      currentInputTokens = receivedLines[linePointer++].split(/\s+/).filter(segment => segment !== '');
      tokenPointer = 0;
    }
    return +currentInputTokens[tokenPointer++];
  }

  function extractNumberSequence(quantity) {
    let sequence = [];
    for (let k = 0; k < quantity; k++) {
      sequence.push(extractNextNumber());
    }
    return sequence;
  }

  class AccumulatorTree { // Segment Tree for point updates and range sums
    constructor(totalPoints) {
      this.limit = totalPoints; // Represents the maximum 1-indexed position
      // The internal array needs size 2*N for a segment tree where leaves are N to 2N-1
      this.dataStore = Array(2 * totalPoints).fill(0);
    }

    // Adjust value at a specific point (1-indexed)
    modifyPoint(pointId, changeAmount) {
      pointId += this.limit; // Convert 1-indexed pointId to internal leaf index
      this.dataStore[pointId] += changeAmount;
      // Propagate changes up to the root
      while (pointId > 1) {
        this.dataStore[Math.floor(pointId / 2)] = this.dataStore[pointId] + this.dataStore[pointId ^ 1];
        pointId = Math.floor(pointId / 2);
      }
    }

    // Get sum for a range [startId, endId] (inclusive, 1-indexed)
    retrieveRangeSum(startId, endId) {
      let totalSum = 0;
      startId += this.limit; // Convert 1-indexed startId to internal leaf index
      endId += this.limit;   // Convert 1-indexed endId to internal leaf index
      // Traverse up from leaves to find sum in range
      while (startId <= endId) {
        if (startId % 2 === 1) { // If startId is a right child, include its value and move to next node
          totalSum += this.dataStore[startId];
          startId++;
        }
        if (endId % 2 === 0) { // If endId is a left child, include its value and move to previous node
          totalSum += this.dataStore[endId];
          endId--;
        }
        startId = Math.floor(startId / 2);
        endId = Math.floor(endId / 2);
      }
      return totalSum;
    }
  }

  function determineOutcome() {
    const totalElements = extractNextNumber(); // n
    const totalQueries = extractNextNumber();   // q
    const originalColorArray = extractNumberSequence(totalElements); // c

    // Normalize colors to be 0-indexed for easier use as map keys or array indices
    // (assuming colors are 1-indexed in input, e.g., 1 to K)
    const normalizedColors = originalColorArray.map(val => val - 1);

    // Prepare query objects: [left_boundary, right_boundary, original_query_index]
    const allQueryRequests = [];
    for (let k = 0; k < totalQueries; k++) {
      allQueryRequests.push([extractNextNumber(), extractNextNumber(), k]);
    }

    // Sort queries by their right boundary (R) for efficient offline processing
    allQueryRequests.sort((reqA, reqB) => reqA[1] - reqB[1]);

    const finalAnswerSet = Array(totalQueries); // Array to store results in original query order
    // Map to track the last seen 1-indexed position for each color
    const colorLastSeenMap = new Map();

    // Initialize the segment tree. It needs to cover positions 1 to totalElements.
    // So, capacity is totalElements + 1 to handle 1-indexing correctly.
    const dataStructure = new AccumulatorTree(totalElements + 1);

    let arrayTraversalPointer = 0; // Pointer to iterate through the `normalizedColors` array

    // Process queries in the sorted order (by right boundary)
    for (let currentQueryIdx = 0; currentQueryIdx < totalQueries; currentQueryIdx++) {
      const [leftBoundary, rightBoundary, originalQueryOrder] = allQueryRequests[currentQueryIdx];

      // Advance arrayTraversalPointer up to the current query's right boundary
      // For each element processed:
      //   - If its color was seen before, remove its previous mark from the segment tree.
      //   - Mark its current position in the segment tree.
      while (arrayTraversalPointer < rightBoundary) {
        const currentElementValue = normalizedColors[arrayTraversalPointer];
        const currentPositionInArray = arrayTraversalPointer + 1; // 1-indexed position

        if (colorLastSeenMap.has(currentElementValue)) {
          // If this color was seen before, its previous occurrence is no longer the "last" one
          // within the current window up to `rightBoundary`. So, remove its contribution.
          const previousPosition = colorLastSeenMap.get(currentElementValue);
          dataStructure.modifyPoint(previousPosition, -1);
        }
        // Mark the current position as the last occurrence of this color
        dataStructure.modifyPoint(currentPositionInArray, 1);
        colorLastSeenMap.set(currentElementValue, currentPositionInArray);
        arrayTraversalPointer++;
      }

      // Once arrayTraversalPointer reaches `rightBoundary`, the segment tree
      // correctly reflects the distinct elements up to this `rightBoundary`.
      // Query the sum in the range [leftBoundary, rightBoundary] to get distinct count.
      finalAnswerSet[originalQueryOrder] = dataStructure.retrieveRangeSum(leftBoundary, rightBoundary);
    }

    return finalAnswerSet.join("\n");
  }

  let computedOutput = determineOutcome();
  if (computedOutput !== undefined) {
    console.log(String(computedOutput));
  }
});