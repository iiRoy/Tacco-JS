class SourceInterpreter {
  #textLines;
  #lineIndex;
  #lineTokens;

  constructor(rawContent) {
    this.#textLines = rawContent.trim().split("\n");
    this.#lineIndex = 0;
    this.#lineTokens = [];
  }

  grabSingle(asStringOutput = false) {
    if (this.#lineTokens.length === 0) {
      if (this.#lineIndex >= this.#textLines.length) {
        throw new Error("Input exhausted.");
      }
      this.#lineTokens = this.#textLines[this.#lineIndex].split(" ");
      this.#lineIndex++;
    }
    const extractedToken = this.#lineTokens.shift();
    return asStringOutput ? extractedToken : Number(extractedToken);
  }

  readEntireLine(asStringOutput = false) {
    if (this.#lineIndex >= this.#textLines.length) {
      throw new Error("Input exhausted.");
    }
    const currentLine = this.#textLines[this.#lineIndex++];
    this.#lineTokens = [];
    const tokens = currentLine.split(" ");
    return asStringOutput ? tokens : tokens.map(Number);
  }

  fetchGrid(numberOfRows, asStringOutput = false) {
    const gridData = [];
    for (let i = 0; i < numberOfRows; i++) {
      if (this.#lineIndex >= this.#textLines.length) {
        throw new Error("Input exhausted while reading grid.");
      }
      const lineContent = this.#textLines[this.#lineIndex++];
      const rowTokens = lineContent.split(" ");
      gridData.push(asStringOutput ? rowTokens : rowTokens.map(Number));
    }
    this.#lineTokens = [];
    return gridData;
  }

  retrieveList(countElements, asStringOutput = false) {
    const listContent = [];
    for (let i = 0; i < countElements; i++) {
      if (this.#lineIndex >= this.#textLines.length) {
        throw new Error("Input exhausted while reading list.");
      }
      const itemContent = this.#textLines[this.#lineIndex++];
      listContent.push(asStringOutput ? itemContent : Number(itemContent));
    }
    this.#lineTokens = [];
    return listContent;
  }
}

function createNestedArray(initialValueSpec, ...dimensions) {
  const recursiveBuilder = (dims, currentDepth) => {
    if (currentDepth === dims.length - 1) {
      if (initialValueSpec === "[]") {
        return Array.from({ length: dims[currentDepth] }, () => []);
      } else {
        return Array(dims[currentDepth]).fill(Number(initialValueSpec));
      }
    } else {
      return Array.from({ length: dims[currentDepth] }, () =>
        recursiveBuilder(dims, currentDepth + 1)
      );
    }
  };

  if (dimensions.length === 0) {
    return initialValueSpec === "[]" ? [] : Number(initialValueSpec);
  }
  return recursiveBuilder(dimensions, 0);
}

class PathCalculator {
  static DIST_INFINITY = 1000000000000;
  static NEG_CYCLE_REACHED = -1000000000000;

  #nodeDistances;

  constructor(adjacencyList, originNode) {
    const totalNodes = adjacencyList.length;
    this.#nodeDistances = new Array(totalNodes).fill(PathCalculator.DIST_INFINITY);
    this.#nodeDistances[originNode] = 0;

    for (let iteration = 0; iteration < totalNodes * 2; iteration++) {
      for (let currentVertex = 0; currentVertex < totalNodes; currentVertex++) {
        if (this.#nodeDistances[currentVertex] === PathCalculator.DIST_INFINITY) continue;

        for (const { targetVertex, edgeWeight } of adjacencyList[currentVertex]) {
          const newPathDistance = this.#nodeDistances[currentVertex] + edgeWeight;

          if (this.#nodeDistances[targetVertex] > newPathDistance) {
            if (iteration >= totalNodes - 1) {
              this.#nodeDistances[targetVertex] = PathCalculator.NEG_CYCLE_REACHED;
            } else {
              this.#nodeDistances[targetVertex] = newPathDistance;
            }
          }
        }
      }
    }
  }

  getDistanceTo(vertexIndex) {
    return this.#nodeDistances[vertexIndex];
  }
}

function initializePathFinder(graphData, startPoint) {
  return new PathCalculator(graphData, startPoint);
}

const inputReader = new SourceInterpreter(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(executeProblem());

function executeProblem() {
  const N_nodes = inputReader.grabSingle();
  const M_edges = inputReader.grabSingle();
  const P_profit = inputReader.grabSingle();

  const graphStructure = createNestedArray("[]", N_nodes);

  for (let i_edge = 0; i_edge < M_edges; i_edge++) {
    const [u_from, v_to, cost_val] = inputReader.readEntireLine();
    graphStructure[u_from - 1].push({ targetVertex: v_to - 1, edgeWeight: P_profit - cost_val });
  }

  const pathSolution = initializePathFinder(graphStructure, 0);

  const distanceToLastNode = pathSolution.getDistanceTo(N_nodes - 1);

  if (distanceToLastNode === PathCalculator.NEG_CYCLE_REACHED) {
    return -1;
  }
  if (distanceToLastNode >= 0) {
    return 0;
  }
  return -distanceToLastNode;
}