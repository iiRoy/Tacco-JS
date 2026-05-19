class InputReader {
  constructor(inputString) {
    this._sourceLines = inputString.split("\n");
    this._currentLineIndex = 0;
  }

  readAtom(asString) {
    const currentLineData = this._sourceLines[this._currentLineIndex];
    let lineParts;

    if (typeof currentLineData === "string") {
      lineParts = currentLineData.split(" ").reverse();
      this._sourceLines[this._currentLineIndex] = lineParts;
    } else {
      lineParts = currentLineData;
    }

    const extractedValue = lineParts.pop();

    if (lineParts.length === 0) {
      this._currentLineIndex++;
    }

    return asString ? extractedValue : Number(extractedValue);
  }

  readLine(asString) {
    const currentLineContent = this._sourceLines[this._currentLineIndex++];
    const splitValues = currentLineContent.split(" ");
    
    return asString ? splitValues : splitValues.map(val => Number(val));
  }

  readMatrix(count, asString) {
    const matrixRows = [];
    const startLineIndex = this._currentLineIndex;
    const endLineIndex = startLineIndex + count;

    for (let loopRow = startLineIndex; loopRow < endLineIndex; loopRow++) {
      const currentLine = this._sourceLines[loopRow];
      const rowValues = currentLine.split(" ");
      
      if (asString) {
        matrixRows.push(rowValues);
      } else {
        matrixRows.push(rowValues.map(val => Number(val)));
      }
    }
    this._currentLineIndex = endLineIndex;
    return matrixRows;
  }
}

let parentArray = [];

const findRoot = (elementIndex) => {
  if (parentArray[elementIndex] === elementIndex) {
    return elementIndex;
  }
  parentArray[elementIndex] = findRoot(parentArray[elementIndex]);
  return parentArray[elementIndex];
};

const areConnected = (elementX, elementY) => {
  return findRoot(elementX) === findRoot(elementY);
};

const unionSets = (elementX, elementY) => {
  let rootX = findRoot(elementX);
  let rootY = findRoot(elementY);

  if (rootX === rootY) {
    return;
  }
  parentArray[rootX] = rootY;
};

const inputHandler = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

const initializeUnionFind = (size) => {
  for (let k = 0; k <= size; k++) {
    parentArray[k] = k;
  }
};

const solveProblem = () => {
  const numElements = inputHandler.readAtom();
  const numOperations = inputHandler.readAtom();

  const permutationArray = inputHandler.readLine();

  initializeUnionFind(numElements);

  for (let loopCounter = 0; loopCounter < numOperations; loopCounter++) {
    const tempPair = inputHandler.readLine();
    const firstElement = tempPair[0];
    const secondElement = tempPair[1];
    unionSets(firstElement, secondElement);
  }

  let matchingCount = 0;
  const startIndex = 1;
  const endIndex = numElements;

  for (let loopCounter = startIndex; loopCounter <= endIndex; loopCounter++) {
    const permutedValue = permutationArray[loopCounter - 1];
    const currentValue = loopCounter;
    if (areConnected(permutedValue, currentValue)) {
      matchingCount++;
    }
  }
  return matchingCount;
};

console.log(solveProblem());
