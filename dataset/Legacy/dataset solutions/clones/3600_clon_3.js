class InputReader {
  #sourceLines;
  #currentLineIndex;

  constructor(inputString) {
    this.#sourceLines = inputString.split("\n");
    this.#currentLineIndex = 0;
  }

  readAtomicValue(returnAsString = false) {
    let lineParts = this.#sourceLines[this.#currentLineIndex];
    if (typeof lineParts === "string") {
      lineParts = lineParts.split(" ").reverse();
      this.#sourceLines[this.#currentLineIndex] = lineParts;
    }

    const extractedValue = lineParts.pop();
    if (!lineParts.length) {
      this.#currentLineIndex++;
    }
    return returnAsString ? extractedValue : +extractedValue;
  }

  readLineValues(returnAsString = false) {
    const lineContent = this.#sourceLines[this.#currentLineIndex++];
    const parts = lineContent.split(" ");
    return returnAsString ? parts : parts.map(val => +val);
  }

  readMatrixRows(numberOfRows, returnAsString = false) {
    const resultMatrix = [];
    const startingIndex = this.#currentLineIndex;
    for (let rowIdx = 0; rowIdx < numberOfRows; rowIdx++) {
      const lineContent = this.#sourceLines[startingIndex + rowIdx];
      const rowParts = lineContent.split(" ");
      resultMatrix.push(returnAsString ? rowParts : rowParts.map(val => +val));
    }
    this.#currentLineIndex += numberOfRows;
    return resultMatrix;
  }
}

class FenwickTree {
  #treeData;

  constructor(size) {
    this.#treeData = Array(size).fill(0);
  }

  updateValue(index, weight) {
    let currentIdx = index;
    const treeSize = this.#treeData.length;
    while (currentIdx < treeSize) {
      this.#treeData[currentIdx] += weight;
      currentIdx += currentIdx & -currentIdx;
    }
  }

  queryPrefixSum(index) {
    let sum = 0;
    let currentIdx = index;
    while (currentIdx > 0) {
      sum += this.#treeData[currentIdx];
      currentIdx -= currentIdx & -currentIdx;
    }
    return sum;
  }
}

const inputProcessor = new InputReader(require("fs").readFileSync("/dev/stdin","utf8"));

function solveProblem() {
  const arraySize = inputProcessor.readAtomicValue();
  const dataElements = inputProcessor.readLineValues();

  if (arraySize <= 2) {
    return Math.max(...dataElements);
  }

  const totalPossiblePairs = arraySize * (arraySize + 1) / 2;
  const targetRank = Math.floor(totalPossiblePairs / 2) + 1;

  let searchLowerBound = 2;
  let searchUpperBound = 1e9 + 1;

  while (searchLowerBound < searchUpperBound) {
    const currentMidValue = Math.floor((searchLowerBound + searchUpperBound) / 2);
    
    const fenwickTreeSize = (arraySize + 1) * 2;
    const fenwickTree = new FenwickTree(fenwickTreeSize);
    
    let currentBalanceOffset = arraySize + 1;
    let pairsCountBelowMid = 0;

    fenwickTree.updateValue(currentBalanceOffset, 1);

    for (let elementIndex = 0; elementIndex < arraySize; elementIndex++) {
      const elementValue = dataElements[elementIndex];
      
      if (elementValue < currentMidValue) {
        currentBalanceOffset--;
      } else {
        currentBalanceOffset++;
      }
      
      pairsCountBelowMid += fenwickTree.queryPrefixSum(currentBalanceOffset);
      fenwickTree.updateValue(currentBalanceOffset, 1);
    }

    const pairsCountAtLeastMid = totalPossiblePairs - pairsCountBelowMid;

    if (pairsCountAtLeastMid < targetRank) {
      searchLowerBound = currentMidValue + 1;
    } else {
      searchUpperBound = currentMidValue;
    }
  }
  return searchLowerBound - 1;
}

console.log(solveProblem());
