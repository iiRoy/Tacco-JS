let allSourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
let currentLineIndex = 0;

function retrieveNextLine() {
  if (currentLineIndex >= allSourceLines.length) {
    throw new Error("Input buffer exhausted.");
  }
  return allSourceLines[currentLineIndex++];
}

function extractNumericSequence() {
  return retrieveNextLine().split(" ").map(Number);
}

function outputResult(val) {
  console.log(val);
}

class DisjointSetStructure {
  constructor(totalElements) {
    this.parentPointers = new Array(totalElements);
    this.setSizes = new Array(totalElements);

    for (let j = 0; j < totalElements; j++) {
      this.parentPointers[j] = j;
      this.setSizes[j] = 1;
    }
  }

  findRepresentative(elementIndex) {
    if (this.parentPointers[elementIndex] === elementIndex) {
      return elementIndex;
    }
    this.parentPointers[elementIndex] = this.findRepresentative(this.parentPointers[elementIndex]);
    return this.parentPointers[elementIndex];
  }

  mergeSets(firstElement, secondElement) {
    let rootA = this.findRepresentative(firstElement);
    let rootB = this.findRepresentative(secondElement);

    if (rootA !== rootB) {
      if (this.setSizes[rootA] < this.setSizes[rootB]) {
        [rootA, rootB] = [rootB, rootA];
      }
      this.parentPointers[rootB] = rootA;
      this.setSizes[rootA] += this.setSizes[rootB];
      return true;
    }
    return false;
  }

  areElementsLinked(firstElement, secondElement) {
    return this.findRepresentative(firstElement) === this.findRepresentative(secondElement);
  }
}

function commenceProcessing() {
  const initialParameters = extractNumericSequence();
  const totalNodes = initialParameters[0];
  const unionOperations = initialParameters[1];

  const desiredMappings = extractNumericSequence();

  const dsuInstance = new DisjointSetStructure(totalNodes);

  for (let k = 0; k < unionOperations; k++) {
    const connectionPair = extractNumericSequence();
    dsuInstance.mergeSets(connectionPair[0] - 1, connectionPair[1] - 1);
  }

  let matchingElements = 0;
  for (let k = 0; k < totalNodes; k++) {
    const currentPosition = k;
    const targetPosition = desiredMappings[k] - 1;

    if (dsuInstance.areElementsLinked(currentPosition, targetPosition)) {
      matchingElements++;
    }
  }

  outputResult(matchingElements);
}

commenceProcessing();