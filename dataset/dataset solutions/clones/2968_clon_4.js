const fileSystem = require("fs");

class DataStream {
  #sourceLines;
  #currentIdx;
  #maxIdx;

  constructor(rawData) {
    this.#sourceLines = rawData.trim().split("\n");
    this.#currentIdx = 0;
    this.#maxIdx = this.#sourceLines.length;
  }

  retrieveNext() {
    if (!this.hasMore()) {
      throw new Error("NoMoreElementsException: No further elements in stream.");
    }
    const element = this.#sourceLines[this.#currentIdx];
    this.#currentIdx++;
    return element;
  }

  hasMore() {
    return this.#currentIdx < this.#maxIdx;
  }

  // Transforms input based on a numeric code
  // 1: parseInt
  // 2: split by space
  // 4: split by space, map to Number
  // 6: split by char
  // 7: split by char, map to Number
  // 8: join by space
  // 9: join by newline
  // 0: join without separator
  // default: return as is
  transformInput(value, code) {
    try {
      const operations = {
        1: (v) => parseInt(v),
        2: (v) => v.split(" "),
        4: (v) => v.split(" ").map(Number),
        6: (v) => v.split(""),
        7: (v) => v.split("").map(Number),
        8: (v) => v.join(" "),
        9: (v) => v.join("\n"),
        0: (v) => v.join(""),
      };
      return operations[code] ? operations[code](value) : value;
    } catch (e) {
      return value;
    }
  }
}

const dataProcessor = new DataStream(fileSystem.readFileSync("/dev/stdin", "utf8"));

function getNextLine() {
  return dataProcessor.retrieveNext();
}

function checkMoreLines() {
  return dataProcessor.hasMore();
}

function emitOutput(content) {
  console.log(content);
}

function emitError(content) {
  console.error(content);
}

function executeGraphAnalysis() {
  const initialParams = dataProcessor.transformInput(getNextLine(), 4);
  const nodeCount = initialParams[0];
  const edgeCount = initialParams[1];

  // Graph representation: Map<nodeIndex, { connections: Set<nodeIndex>, visited: boolean }>
  const graphStructure = new Map();
  for (let i = 0; i < nodeCount; i++) {
    graphStructure.set(i, { connections: new Set(), visited: false });
  }

  for (let i = 0; i < edgeCount; i++) {
    const edge = dataProcessor.transformInput(getNextLine(), 4);
    const nodeA = edge[0] - 1;
    const nodeB = edge[1] - 1;
    graphStructure.get(nodeA).connections.add(nodeB);
    graphStructure.get(nodeB).connections.add(nodeA);
  }

  let componentCounter = 0;

  for (let i = 0; i < nodeCount; i++) {
    const currentNodeState = graphStructure.get(i);
    if (!currentNodeState.visited) {
      componentCounter++;
      const traversalQueue = [i];
      currentNodeState.visited = true;

      let queuePointer = 0;
      while (queuePointer < traversalQueue.length) {
        const currentVertex = traversalQueue[queuePointer++];
        const neighbors = graphStructure.get(currentVertex).connections;

        for (const neighbor of neighbors) {
          const neighborState = graphStructure.get(neighbor);
          if (!neighborState.visited) {
            neighborState.visited = true;
            traversalQueue.push(neighbor);
          }
        }
      }
    }
  }
  emitOutput(componentCounter);
}

executeGraphAnalysis();
