function processInputData(rawData) {
  const parseInitialData = (lines) => {
    const [nStr, qStr] = lines.shift().split(" ");
    const arraySize = parseInt(nStr, 10);
    const queryCount = parseInt(qStr, 10);
    const dataArray = lines.shift().split(" ").map(val => parseInt(val, 10));
    return { arraySize, queryCount, dataArray, remainingLines: lines };
  };

  const createFenwickTree = (size) => new Array(size + 1).fill(0);

  const updateFenwickTree = (tree, zeroBasedIndex, value, maxTreeIndex) => {
    for (let i = zeroBasedIndex + 1; i <= maxTreeIndex; i += i & -i) {
      tree[i] += value;
    }
  };

  const queryFenwickTree = (tree, zeroBasedIndex) => {
    let currentSum = 0;
    for (let i = zeroBasedIndex + 1; i > 0; i -= i & -i) {
      currentSum += tree[i];
    }
    return currentSum;
  };

  const inputLines = rawData.split("\n");
  const { arraySize, queryCount, dataArray, remainingLines } = parseInitialData(inputLines);

  const lastSeenIndex = new Array(arraySize + 1).fill(-1);
  const previousOccurrencesMap = Array.from({ length: arraySize + 1 }, () => []);

  for (let i = 0; i < arraySize; ++i) {
    const currentElement = dataArray[i];
    const previousOccurrencePosition = lastSeenIndex[currentElement];
    if (previousOccurrencePosition !== -1) {
      previousOccurrencesMap[previousOccurrencePosition].push(i);
    }
    lastSeenIndex[currentElement] = i;
  }

  const queriesByLeftIndex = Array.from({ length: arraySize + 1 }, () => []);
  for (let qIdx = 0; qIdx < queryCount; ++qIdx) {
    const [rawLeft, rawRight] = remainingLines[qIdx].split(" ").map(val => parseInt(val, 10));
    const zeroBasedLeft = rawLeft - 1;
    const zeroBasedRight = rawRight - 1;
    queriesByLeftIndex[zeroBasedLeft].push([zeroBasedRight, qIdx]);
  }

  const resultsArray = new Array(queryCount);
  const fenwickTree = createFenwickTree(arraySize);

  for (let currentLeftIndex = arraySize - 1; currentLeftIndex >= 0; --currentLeftIndex) {
    const occurrencesAtCurrentLeft = previousOccurrencesMap[currentLeftIndex];
    for (const duplicateIndex of occurrencesAtCurrentLeft) {
      updateFenwickTree(fenwickTree, duplicateIndex, 1, arraySize);
    }

    const queriesForThisLeftIndex = queriesByLeftIndex[currentLeftIndex];
    for (const [rightBound, originalQueryIndex] of queriesForThisLeftIndex) {
      const countOfDuplicatesInRange = queryFenwickTree(fenwickTree, rightBound);
      const totalElementsInRange = rightBound - currentLeftIndex + 1;
      resultsArray[originalQueryIndex] = totalElementsInRange - countOfDuplicatesInRange;
    }
  }

  for (let i = 0; i < queryCount; ++i) {
    console.log(resultsArray[i]);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
