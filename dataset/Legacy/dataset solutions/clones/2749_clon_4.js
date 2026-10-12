class InputProcessor {
  #lineBuffer;
  #currentLineIndex;
  #tokenCache;

  constructor(sourceText) {
    this.#lineBuffer = sourceText.trim().split("\n");
    this.#currentLineIndex = 0;
    this.#tokenCache = [];
  }

  // Retrieves a single token, advancing to the next line if the current one is exhausted.
  extractToken(returnAsString = false) {
    if (this.#tokenCache.length === 0) {
      if (this.#currentLineIndex >= this.#lineBuffer.length) {
        return undefined;
      }
      this.#tokenCache = this.#lineBuffer[this.#currentLineIndex].split(" ").reverse();
      this.#currentLineIndex++;
    }
    const extracted = this.#tokenCache.pop();
    return returnAsString ? extracted : Number(extracted);
  }

  // Retrieves all tokens from the current line as an array.
  extractLine(returnAsStrings = false) {
    if (this.#currentLineIndex >= this.#lineBuffer.length) {
      return undefined;
    }
    const lineContent = this.#lineBuffer[this.#currentLineIndex].split(" ");
    this.#currentLineIndex++;
    return returnAsStrings ? lineContent : lineContent.map(Number);
  }

  // Retrieves a specified number of lines as a 2D array (matrix).
  extractMatrix(rowsToRead, returnAsStrings = false) {
    const collectedMatrix = [];
    for (let i = 0; i < rowsToRead; i++) {
      collectedMatrix.push(this.extractLine(returnAsStrings));
    }
    return collectedMatrix;
  }

  // Retrieves a specified number of lines, each assumed to contain a single element, as a 1D array (vector).
  extractVector(elementsToRead, returnAsStrings = false) {
    const collectedVector = [];
    for (let i = 0; i < elementsToRead; i++) {
      collectedVector.push(this.extractLine(returnAsStrings)[0]);
    }
    return collectedVector;
  }
}

// Creates a nested array structure with a specified initial value or function.
function constructNestedArray(dimensions, initialValueProvider) {
  const buildRecursive = (currentDimensions, valueSource) => {
    if (currentDimensions.length === 0) {
      return typeof valueSource === 'function' ? valueSource() : valueSource;
    }
    const currentSize = currentDimensions[0];
    const remainingDimensions = currentDimensions.slice(1);
    return Array(currentSize).fill(null).map(() => buildRecursive(remainingDimensions, valueSource));
  };
  return buildRecursive(dimensions, initialValueProvider);
}

// Implements a Disjoint Set Union (Union-Find) data structure.
class DisjointSet {
  #parentOrSize; // Stores parent index or negative size if it's a root.

  constructor(totalElements) {
    this.#parentOrSize = Array(totalElements + 1).fill(-1);
  }

  // Finds the representative (root) of the set containing the given element, with path compression.
  findRepresentative(elementIndex) {
    if (this.#parentOrSize[elementIndex] < 0) {
      return elementIndex;
    }
    return (this.#parentOrSize[elementIndex] = this.findRepresentative(this.#parentOrSize[elementIndex]));
  }

  // Checks if two elements belong to the same set.
  areConnected(idxA, idxB) {
    return this.findRepresentative(idxA) === this.findRepresentative(idxB);
  }

  // Unites the sets containing two elements. Returns true if a union occurred, false if they were already in the same set.
  uniteSets(idxA, idxB) {
    let rootA = this.findRepresentative(idxA);
    let rootB = this.findRepresentative(idxB);

    if (rootA === rootB) {
      return false; // Already in the same set
    }

    // Union by size: attach the smaller tree to the root of the larger tree.
    if (this.#parentOrSize[rootA] > this.#parentOrSize[rootB]) { // If set A is smaller (less negative size)
      [rootA, rootB] = [rootB, rootA]; // Swap to ensure rootA is the larger or equal set
    }
    
    this.#parentOrSize[rootA] += this.#parentOrSize[rootB]; // Update size of the new root
    this.#parentOrSize[rootB] = rootA; // Make rootA the parent of rootB

    return true; // Union successful
  }

  // Returns the size of the set containing the given element.
  getSetSize(elementIndex) {
    return -this.#parentOrSize[this.findRepresentative(elementIndex)];
  }
}

function solveGraphProblem() {
  const dataReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

  const vertexCount = dataReader.extractToken();
  const edgeCount = dataReader.extractToken();

  if (edgeCount % 2 !== 0) {
    return -1;
  }

  const incidentEdges = dataReader.extractMatrix(edgeCount);

  const connectivityStructure = new DisjointSet(vertexCount);
  const orientedEdges = [];
  const nonTreeAdjacencyList = constructNestedArray([vertexCount + 1], () => []);
  const degreeParityTracker = constructNestedArray([vertexCount + 1], 0);

  incidentEdges.forEach(currentPair => {
    const [nodeU, nodeV] = currentPair;
    if (connectivityStructure.uniteSets(nodeU, nodeV)) {
      orientedEdges.push(`${nodeU} ${nodeV}`);
      degreeParityTracker[nodeU] ^= 1; // Toggle parity for nodeU
    } else {
      nonTreeAdjacencyList[nodeU].push(nodeV);
      nonTreeAdjacencyList[nodeV].push(nodeU);
    }
  });

  // Iterative Depth-First Search to orient remaining edges, simulating post-order traversal.
  function iterativeOrientTraversal(startingNode) {
    // Stack stores [currentNode, parentNode, visitPhase]
    // visitPhase: 0 = pre-visit (children need to be pushed), 1 = post-visit (node itself needs processing)
    const traversalStack = [[startingNode, 0, 0]];

    while (traversalStack.length > 0) {
      let [currentNode, parentNode, visitPhase] = traversalStack.pop();

      if (visitPhase === 0) { // Pre-visit phase: Push self back for post-visit, then push children.
        traversalStack.push([currentNode, parentNode, 1]); // Schedule for post-visit

        // Push children onto the stack in reverse order to maintain consistent traversal order.
        for (let i = nonTreeAdjacencyList[currentNode].length - 1; i >= 0; i--) {
          const neighbor = nonTreeAdjacencyList[currentNode][i];
          if (neighbor !== parentNode) { // Avoid traversing back up the tree
            traversalStack.push([neighbor, currentNode, 0]);
          }
        }
      } else { // Post-visit phase: Process the node.
        if (parentNode === 0) continue; // Skip processing for the root of the DFS tree.

        if (degreeParityTracker[currentNode]) { // If current node has odd parity
          orientedEdges.push(`${currentNode} ${parentNode}`); // Orient edge from current to parent
        } else { // If current node has even parity
          orientedEdges.push(`${parentNode} ${currentNode}`); // Orient edge from parent to current
          degreeParityTracker[parentNode] ^= 1; // Flip parity of the parent
        }
      }
    }
  }

  // Start the traversal from node 1, with 0 as its conceptual parent.
  iterativeOrientTraversal(1);

  return orientedEdges.join("\n");
}

if (process.argv.length < 3) {
  require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
} else {
  console.log(solveGraphProblem());
}
