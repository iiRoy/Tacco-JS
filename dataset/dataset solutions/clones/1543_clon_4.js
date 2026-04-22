const sourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim();
let dataLines = sourceData.split("\n");
let lineCursor = 0;

function* lineIterator(lines) {
  for (const currentLine of lines) {
    yield currentLine;
  }
}

const inputGenerator = lineIterator(dataLines);

function fetchNextLine() {
  const result = inputGenerator.next();
  if (result.done) {
    throw new Error("No more input lines available.");
  }
  return result.value;
}

const lineTransformers = new Map([
  [1, (text) => Number(text)],
  [2, (text) => text.split(" ")],
  [4, (text) => text.split(" ").map(Number)],
  [6, (text) => text.split("")],
  [7, (text) => text.split("").map(Number)],
]);

function processLine(text, transformCode) {
  const transformer = lineTransformers.get(transformCode);
  if (transformer) {
    return transformer(text);
  }
  return text; // Default: return as is if no specific transformer
}

function fetchNumericArray() {
  return processLine(fetchNextLine(), 4);
}

function fetchInteger() {
  return processLine(fetchNextLine(), 1);
}

function printOutput(content, joinMethod = '\n') {
  if (Array.isArray(content)) {
    console.log(content.join(joinMethod));
  } else {
    console.log(content);
  }
}

class DisjointSet {
  #parentLinks;
  #treeRanks;

  constructor(elementCount) {
    this.#parentLinks = new Map();
    this.#treeRanks = new Map();
    for (let i = 0; i < elementCount; i++) {
      this.#parentLinks.set(i, i);
      this.#treeRanks.set(i, 0);
    }
  }

  findSetRepresentative(nodeIdentifier) {
    let current = nodeIdentifier;
    const path = [];

    while (this.#parentLinks.get(current) !== current) {
      path.push(current);
      current = this.#parentLinks.get(current);
    }
    const root = current;

    for (const nodeOnPath of path) {
      this.#parentLinks.set(nodeOnPath, root);
    }
    return root;
  }

  uniteNodes(nodeA, nodeB) {
    let rootA = this.findSetRepresentative(nodeA);
    let rootB = this.findSetRepresentative(nodeB);

    if (rootA !== rootB) {
      const rankA = this.#treeRanks.get(rootA);
      const rankB = this.#treeRanks.get(rootB);

      if (rankA < rankB) {
        [rootA, rootB] = [rootB, rootA];
      }

      this.#parentLinks.set(rootB, rootA);
      if (rankA === rankB) {
        this.#treeRanks.set(rootA, rankA + 1);
      }
      return true;
    }
    return false;
  }

  areInSameSet(nodeA, nodeB) {
    return this.findSetRepresentative(nodeA) === this.findSetRepresentative(nodeB);
  }
}

function applicationEntry() {
  const initialParameters = fetchNumericArray();
  const elementQuantity = initialParameters[0];
  const queryQuantity = initialParameters[1];

  const setManager = new DisjointSet(elementQuantity);
  const collectedResponses = [];

  for (let q = 0; q < queryQuantity; q++) {
    const currentQuery = fetchNumericArray();
    const queryType = currentQuery[0];
    const firstArg = currentQuery[1];
    const secondArg = currentQuery[2];

    if (queryType === 0) {
      setManager.uniteNodes(firstArg, secondArg);
    } else {
      if (setManager.areInSameSet(firstArg, secondArg)) {
        collectedResponses.push("Yes");
      } else {
        collectedResponses.push("No");
      }
    }
  }

  printOutput(collectedResponses);
}

applicationEntry();