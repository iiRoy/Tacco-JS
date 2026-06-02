const INF = 9999999999;

class TokenQueue {
  constructor(tokens = []) {
    this.items = tokens;
    this.index = 0;
    this.size = tokens.length;
  }

  deq() {
    const value = this.items[this.index];
    this.index += 1;
    this.size -= 1;
    return value;
  }

  enq(value) {
    this.items.push(value);
    this.size += 1;
  }

  clear() {
    this.items = [];
    this.index = 0;
    this.size = 0;
  }
}

class InputReader {
  constructor(rawInput) {
    const tokens = rawInput.trim().split(/\s+/g);
    this.inp = new TokenQueue(tokens);
  }

  inr() {
    return this.inp.deq();
  }

  in() {
    return parseInt(this.inp.deq(), 10);
  }

  fin() {
    this.inp.clear();
  }
}

function cloneMatrix(matrix) {
  const copied = [];

  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
    copied.push(matrix[rowIndex].concat());
  }

  return copied;
}

function createOriginalStyleMatrix(size) {
  const matrix = new Array(size);

  for (let rowIndex = 0; rowIndex < size; rowIndex++) {
    matrix[rowIndex] = new Array(size).fill(INF);
  }

  return matrix;
}

function floydWarshallLikeOriginal(matrix) {
  const nodeCount = matrix.length;
  const distances = cloneMatrix(matrix);

  for (let middle = 0; middle < nodeCount; middle++) {
    for (let from = 0; from < nodeCount; from++) {
      for (let to = 0; to < nodeCount; to++) {
        const candidate = distances[from][middle] + distances[middle][to];

        if (distances[from][to] > candidate) {
          distances[from][to] = candidate;
        }
      }
    }
  }

  return distances;
}

function readInitialGraph(reader, nodeCount, edgeCount) {
  const graph = createOriginalStyleMatrix(nodeCount);

  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const fromNode = reader.in();
    const toNode = reader.in();
    const cost = reader.in();

    graph[fromNode - 1][toNode - 1] = cost;
    graph[toNode - 1][fromNode - 1] = cost;
  }

  return graph;
}

function overwriteReachablePairsOnOriginalMatrix(graph, shortestDistances, limitCost) {
  const nodeCount = graph.length;

  for (let from = 0; from < nodeCount; from++) {
    for (let to = 0; to < nodeCount; to++) {
      if (shortestDistances[from][to] <= limitCost) {
        graph[from][to] = 1;
        graph[to][from] = 1;
      }
    }
  }

  return graph;
}

function answerQueries(reader, finalDistances) {
  const queryCount = reader.in();

  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const startNode = reader.in();
    const endNode = reader.in();

    const distance = finalDistances[startNode - 1][endNode - 1];

    if (distance == INF) {
      console.log(-1);
    } else {
      console.log(distance - 1);
    }
  }
}

function solve(reader) {
  const nodeCount = reader.in();
  const edgeCount = reader.in();
  const limitCost = reader.in();

  const originalMatrix = readInitialGraph(reader, nodeCount, edgeCount);

  const firstShortestDistances = floydWarshallLikeOriginal(originalMatrix);

  const reusedMatrix = overwriteReachablePairsOnOriginalMatrix(
    originalMatrix,
    firstShortestDistances,
    limitCost
  );

  const secondShortestDistances = floydWarshallLikeOriginal(reusedMatrix);

  answerQueries(reader, secondShortestDistances);
}

function main(rawInput) {
  const reader = new InputReader(rawInput);
  solve(reader);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));