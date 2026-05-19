class InputHandler {
  constructor(rawInput) {
    this.lineSegments = rawInput.trim().split("\n");
    this.currentSegmentIndex = 0;
  }

  retrieveNextLine() {
    if (!this.hasMoreSegments()) {
      throw new Error("NoMoreInputException: No more lines available.");
    }
    const currentSegment = this.lineSegments[this.currentSegmentIndex];
    this.currentSegmentIndex++;
    return currentSegment;
  }

  retrieveNextInteger() {
    return parseInt(this.retrieveNextLine(), 10);
  }

  retrieveNextStringArray() {
    return this.retrieveNextLine().split(" ");
  }

  retrieveNextIntegerArray() {
    return this.retrieveNextLine().split(" ").map(Number);
  }

  retrieveNextCharacterArray() {
    return this.retrieveNextLine().split("");
  }

  hasMoreSegments() {
    return this.currentSegmentIndex < this.lineSegments.length;
  }
}

class DisjointSetCollection {
  constructor(elementCount) {
    this.parentRegistry = new Map();
    this.componentSizes = new Map();

    for (let i = 0; i < elementCount; i++) {
      this.parentRegistry.set(i, i);
      this.componentSizes.set(i, 1);
    }
  }

  findRoot(element) {
    let current = element;
    const path = [];

    while (this.parentRegistry.get(current) !== current) {
      path.push(current);
      current = this.parentRegistry.get(current);
    }

    for (const nodeOnPath of path) {
      this.parentRegistry.set(nodeOnPath, current);
    }
    return current;
  }

  uniteComponents(elementA, elementB) {
    let rootA = this.findRoot(elementA);
    let rootB = this.findRoot(elementB);

    if (rootA === rootB) {
      return;
    }

    let sizeA = this.componentSizes.get(rootA);
    let sizeB = this.componentSizes.get(rootB);

    if (sizeA < sizeB) {
      [rootA, rootB] = [rootB, rootA];
      [sizeA, sizeB] = [sizeB, sizeA];
    }

    this.parentRegistry.set(rootB, rootA);
    this.componentSizes.set(rootA, sizeA + sizeB);
    this.componentSizes.delete(rootB);
  }

  areInSameComponent(elementA, elementB) {
    return this.findRoot(elementA) === this.findRoot(elementB);
  }

  getComponentSize(element) {
    return this.componentSizes.get(this.findRoot(element));
  }
}

function executeProgram() {
  const fileSystem = require("fs");
  const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
  const inputProcessor = new InputHandler(rawInputData);

  const initialParameters = inputProcessor.retrieveNextIntegerArray();
  const nodeCount = initialParameters[0];
  const queryCount = initialParameters[1];

  const disjointSet = new DisjointSetCollection(nodeCount);
  const resultAccumulator = [];

  for (let i = 0; i < queryCount; i++) {
    const currentQuery = inputProcessor.retrieveNextIntegerArray();
    const queryType = currentQuery[0];
    const firstArg = currentQuery[1];
    const secondArg = currentQuery[2];

    if (queryType === 0) {
      disjointSet.uniteComponents(firstArg, secondArg);
    } else {
      if (disjointSet.areInSameComponent(firstArg, secondArg)) {
        resultAccumulator.push("Yes");
      } else {
        resultAccumulator.push("No");
      }
    }
  }

  console.log(resultAccumulator.join("\n"));
}

executeProgram();
