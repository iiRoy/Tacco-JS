function ProcessInput(rawData) {
  rawData = rawData.split("\n");

  const [arraySize, queryCount] = rawData.shift().split(" ").map((valStr) => parseInt(valStr, 10));
  const dataElements = rawData.shift().split(" ").map((valStr) => parseInt(valStr, 10));

  // This array stores the last seen index for each number in 'dataElements'.
  const lastOccurrenceIndex = new Array(arraySize + 1).fill(-1);
  // 'previousIndices' is an array of arrays, where previousIndices[k] contains
  // a list of indices 'j' such that dataElements[j] is a duplicate of dataElements[k]
  // and 'j' appeared after 'k'.
  const previousIndices = new Array(arraySize + 1);
  for (let idx = 0; idx < previousIndices.length; idx++) {
    previousIndices[idx] = [];
  }

  // Populate the 'previousIndices' array by iterating through 'dataElements'.
  for (let idx = 0; idx < arraySize; idx++) {
    const prevIdx = lastOccurrenceIndex[dataElements[idx]];
    if (prevIdx !== -1) {
      previousIndices[prevIdx].push(idx);
    }
    lastOccurrenceIndex[dataElements[idx]] = idx;
  }

  // 'queryRequests' stores queries, grouped by their left boundary (0-indexed).
  // queryRequests[leftBound] will contain an array of [rightBound, originalQueryIndex] pairs.
  const queryRequests = new Array(arraySize + 1);
  for (let idx = 0; idx < queryRequests.length; idx++) {
    queryRequests[idx] = [];
  }

  // Parse and store all queries from the input.
  for (let currentQueryIdx = 0; currentQueryIdx < queryCount; currentQueryIdx++) {
    let [leftBound, rightBound] = rawData[currentQueryIdx].split(" ").map((valStr) => parseInt(valStr, 10));
    leftBound--; // Convert 1-based index to 0-based
    rightBound--; // Convert 1-based index to 0-based
    queryRequests[leftBound].push([rightBound, currentQueryIdx]);
  }

  // 'resultsArray' will hold the final answers for each query in their original order.
  const resultsArray = [];

  // Initialize a Fenwick tree (Binary Indexed Tree) for efficient range sum queries.
  const fenwickTree = new Array(arraySize + 1).fill(0);

  // Iterate backwards through the main data array to process elements and queries.
  for (let currentPos = arraySize - 1; currentPos >= 0; --currentPos) {
    const prevIndicesLen = previousIndices[currentPos].length;
    // For each index 'j' that is a duplicate of dataElements[currentPos]
    // and appeared after currentPos, update the Fenwick tree.
    for (let innerLoopIdx = 0; innerLoopIdx < prevIndicesLen; innerLoopIdx++) {
      let treeIndex = previousIndices[currentPos][innerLoopIdx];
      // Note: The original code used 'this.n' here. In a non-strict global context,
      // 'this' refers to the global object, and 'this.n' would be undefined.
      // This behavior is preserved by using 'this.arraySize', which will also be undefined,
      // effectively preventing the BIT update loop from executing as intended.
      for (treeIndex++; treeIndex <= this.arraySize; treeIndex += treeIndex & -treeIndex) {
        fenwickTree[treeIndex] += 1;
      }
    }

    const queryRequestsLen = queryRequests[currentPos].length;
    // Process all queries whose left boundary is 'currentPos'.
    for (let innerLoopIdx = 0; innerLoopIdx < queryRequestsLen; innerLoopIdx++) {
      const [rightBound, queryIdx] = queryRequests[currentPos][innerLoopIdx];
      let currentSum = 0;
      let rangeIndex = rightBound;
      // Query the Fenwick tree for the sum of marked elements up to 'rightBound'.
      for (rangeIndex++; rangeIndex; rangeIndex -= rangeIndex & -rangeIndex) {
        currentSum += fenwickTree[rangeIndex];
      }
      // Calculate the number of unique elements in the range [currentPos, rightBound].
      // This calculation will reflect the (potentially buggy) behavior of the Fenwick tree.
      resultsArray[queryIdx] = (rightBound - currentPos + 1) - currentSum;
    }
  }

  // Output the computed results for all queries.
  for (let idx = 0; idx < queryCount; idx++) {
    console.log(resultsArray[idx]);
  }
  return;
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
