const fileSystemModule = require('fs');

// Read standard input synchronously.
// Determine the size of the input stream.
const totalInputBytes = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data.
const inputDataBuffer = Buffer.alloc(totalInputBytes);

// Read the data from standard input into the buffer.
const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, inputDataBuffer, 0, totalInputBytes, 0);

// Convert the buffer content to a UTF-8 string and split into lines.
const rawInputLines = inputDataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Initiate the main processing routine.
processInputStreams();

/**
 * Implements a Disjoint Set Union (DSU) data structure.
 * @param {number} totalElements - The initial number of disjoint elements.
 * @returns {object} An object containing DSU operations.
 */
function DisjointSetStructure(totalElements) {
  // An array to store parent pointers. A negative value indicates a root,
  // and its absolute value is the size of the set.
  const parentRegistry = Array(totalElements).fill(-1);

  /**
   * Finds the representative (root) of the set containing element 'queryElement',
   * applying path compression for efficiency.
   * @param {number} queryElement - The element whose representative is to be found.
   * @returns {number} The representative of the set.
   */
  function findRepresentative(queryElement) {
    // If the element is a root (negative parent value), return itself.
    if (parentRegistry[queryElement] < 0) {
      return queryElement;
    }
    // Otherwise, recursively find the root and compress the path.
    parentRegistry[queryElement] = findRepresentative(parentRegistry[queryElement]);
    return parentRegistry[queryElement];
  }

  /**
   * Merges the sets containing 'elementA' and 'elementB' if they are different.
   * Uses union by size/rank heuristic.
   * @param {number} elementA - The first element.
   * @param {number} elementB - The second element.
   * @returns {boolean} True if the sets were merged, false otherwise (they were already connected).
   */
  function uniteSets(elementA, elementB) {
    let rootA = findRepresentative(elementA);
    let rootB = findRepresentative(elementB);

    // If they are already in the same set, no merge is needed.
    if (rootA === rootB) {
      return false;
    }

    // Merge the smaller set into the larger set.
    // The parent registry stores negative size for roots, so smaller absolute value means smaller set.
    if (parentRegistry[rootA] <= parentRegistry[rootB]) { // If rootA's set is larger or equal in size
      parentRegistry[rootA] += parentRegistry[rootB]; // Add rootB's size to rootA's size
      parentRegistry[rootB] = rootA; // Make rootA the parent of rootB
    } else { // If rootB's set is larger
      parentRegistry[rootB] += parentRegistry[rootA]; // Add rootA's size to rootB's size
      parentRegistry[rootA] = rootB; // Make rootB the parent of rootA
    }
    return true; // Sets were successfully merged.
  }

  /**
   * Counts the number of distinct connected components among the elements
   * that are marked as 'active' in the `activeFlags` array.
   * @param {boolean[]} activeFlags - An array indicating which elements are active.
   * @returns {number} The count of distinct components.
   */
  function countDistinctComponents(activeFlags) {
    let componentCounter = 0;
    for (let elementIndex = 0; elementIndex < totalElements; ++elementIndex) {
      // If the element is active and it's a root of its set, increment the counter.
      if (activeFlags[elementIndex] && parentRegistry[elementIndex] < 0) {
        componentCounter++;
      }
    }
    return componentCounter;
  }

  /**
   * Checks if two elements belong to the same set (are connected).
   * @param {number} elementA - The first element.
   * @param {number} elementB - The second element.
   * @returns {boolean} True if they are connected, false otherwise.
   */
  function areConnected(elementA, elementB) {
    return findRepresentative(elementA) === findRepresentative(elementB);
  }

  // Expose the DSU operations.
  return {
    unite: uniteSets,
    getRepresentative: findRepresentative,
    getComponentCount: countDistinctComponents,
    checkConnection: areConnected
  };
}

/**
 * Main function to process input streams and solve the problem.
 */
function processInputStreams() {
  let currentLineTokens;
  let numVertices, numEdges;
  let loopIdx1, loopIdx2; // Generic loop indices
  let vertexInformation;
  let graphEdges;
  let dsStructure;
  let currentMinCost;
  let activeVertexFlags; // Replaced 'use'

  // Loop indefinitely until an explicit break condition is met.
  while (true) {
    // Read the first line of a new test case, containing N and M.
    const headerLine = rawInputLines.shift();
    if (!headerLine) { // Handle potential empty line at EOF
      break;
    }
    currentLineTokens = headerLine.trim().split(/\s+/); // Robust splitting

    numVertices = Number.parseInt(currentLineTokens[0], 10);
    numEdges = Number.parseInt(currentLineTokens[1], 10);

    // Break condition: N=0, M=0 signifies end of input.
    if (numVertices === 0 && numEdges === 0) {
      break;
    }

    // Input validation: ensure positive vertex/edge counts.
    if (numVertices < 0 || numEdges < 0) {
      console.error("Warning: Encountered invalid (negative) vertex or edge count. Skipping this block.");
      // Skip remaining lines for this invalid block, if any.
      for (let skip = 0; skip < numVertices + numEdges; ++skip) {
        rawInputLines.shift();
      }
      continue; // Move to the next block of input.
    }

    // Initialize arrays for vertex details and active flags.
    vertexInformation = [];
    activeVertexFlags = Array(numVertices).fill(false);

    // Populate vertex information (node index and 'days' value).
    for (loopIdx1 = 0; loopIdx1 < numVertices; ++loopIdx1) {
      const daysValue = Number.parseInt(rawInputLines.shift(), 10);
      vertexInformation[loopIdx1] = {
        nodeIdentifier: loopIdx1,
        activationDays: daysValue
      };
    }

    // Populate graph edges (u, v, weight).
    graphEdges = [];
    for (loopIdx1 = 0; loopIdx1 < numEdges; ++loopIdx1) {
      const edgeTokens = rawInputLines.shift().trim().split(/\s+/);
      const sourceNode = Number.parseInt(edgeTokens[0], 10) - 1; // 0-indexed
      const targetNode = Number.parseInt(edgeTokens[1], 10) - 1; // 0-indexed
      const edgeWeight = Number.parseInt(edgeTokens[2], 10);
      graphEdges[loopIdx1] = [sourceNode, targetNode, edgeWeight];
    }

    // Sort vertices by their 'activationDays' in ascending order.
    vertexInformation.sort((vertexA, vertexB) => vertexA.activationDays - vertexB.activationDays);

    // Sort edges by their 'weight' in ascending order.
    graphEdges.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);

    // Initialize Disjoint Set Union structure and result variable.
    dsStructure = DisjointSetStructure(numVertices);
    currentMinCost = 0;

    // --- Kruskal-like algorithm with dynamic node activation ---
    // Iterate through vertices in reverse order of activation days (or same days together).
    // The original logic iterates from N-1 down to 0, activating nodes.
    // If multiple nodes have the same 'days' value, they are activated simultaneously.
    for (let currentVertexIndex = numVertices - 1; currentVertexIndex >= 0; --currentVertexIndex) {
      const processingNode = vertexInformation[currentVertexIndex].nodeIdentifier;
      activeVertexFlags[processingNode] = true; // Activate the current node.

      // If the current node has the same 'activationDays' as the previous one,
      // activate all such nodes together. This is crucial for the original logic.
      while (currentVertexIndex > 0 &&
             vertexInformation[currentVertexIndex].activationDays === vertexInformation[currentVertexIndex - 1].activationDays) {
        currentVertexIndex--; // Move to the previous node (which has the same days value)
        const anotherNodeWithSameDays = vertexInformation[currentVertexIndex].nodeIdentifier;
        activeVertexFlags[anotherNodeWithSameDays] = true; // Activate this node too.
      }

      // After activating nodes for the current 'days' group, re-evaluate MST.
      // Reset DSU and cost for each 'days' group to find MST on currently active nodes.
      dsStructure = DisjointSetStructure(numVertices); // Reset DSU for new state
      currentMinCost = 0; // Reset cost

      // Apply Kruskal's algorithm on the currently active nodes.
      for (loopIdx2 = 0; loopIdx2 < numEdges; ++loopIdx2) {
        const currentEdge = graphEdges[loopIdx2];
        const u = currentEdge[0];
        const v = currentEdge[1];
        const weight = currentEdge[2];

        // An edge is considered only if both its endpoints are currently active.
        if (activeVertexFlags[u] && activeVertexFlags[v]) {
          // If connecting u and v doesn't form a cycle within the currently active components,
          // unite their sets and add the edge weight to the cost.
          if (dsStructure.unite(u, v)) {
            currentMinCost += weight;
          }
        }
      }

      // Check connectivity: If the active nodes do not form a single connected component,
      // this state is invalid, and the cost for this iteration is effectively 0.
      // The `getComponentCount` checks only among `activeVertexFlags`.
      if (dsStructure.getComponentCount(activeVertexFlags) > 1) {
        // This condition implies that adding more nodes (by decrementing currentVertexIndex)
        // led to a disconnected graph of active nodes. The problem likely wants a scenario
        // where all *active* nodes are connected. If not, the result for this state is invalid.
        // The original code resets 'res' to 0 and re-initializes UF, effectively discarding
        // any MST found for this state if it's disconnected.
        currentMinCost = 0; // The problem requires all active nodes to be connected.
        // The loop will continue, potentially finding a valid state at an earlier 'days' value.
      } else {
        // If the active nodes form a single component, this is a valid result for this iteration.
        // The problem's structure suggests we might be looking for the *first* valid MST
        // when activating nodes from highest 'days' to lowest.
        // The way the original code is structured, `res` is only assigned when `uf.count(use) <= 1`.
        // And then the loop continues. This implies that the *last* valid `res` before loop exit
        // or a condition that breaks the loop, is the final answer.
        // If the current set of active nodes forms a single component, this `currentMinCost`
        // is the answer for this particular "days" threshold. The problem statement is implied
        // by the structure of the provided code. The loop continues, and `currentMinCost` will
        // be updated if a better (smaller) MST is found for a larger set of active nodes,
        // or reset if they become disconnected.
        // Given the problem context, the `currentMinCost` at the end of the *entire* loop
        // (which is implicitly the last valid one found) is the desired output.
        // No explicit `break` here, so it continues to check previous day groups.
        // The original code only prints `res` at the very end of the `while(true)` loop.
        // This means the `res` variable accumulates or holds the final value after all
        // `i` iterations for a given (N, M) block.
        // So, `currentMinCost` here is the result for the current set of active nodes.
        // The problem asks for *one* `res` output per (N,M) block.
        // The `res = 0; uf = UF(n);` inside the `if (uf.count(use) > 1)` block means that
        // if a set of active nodes is disconnected, the calculation for *that specific state*
        // is discarded, and the UF structure is reset to start fresh for the *next* iteration
        // of `i` in the outer loop. This is a very specific interpretation.
        // Let's re-align with the *original* code's behavior: `res` is modified in place.
        // If `uf.count(use) > 1`, `res` is set to 0. Otherwise, it retains the sum.
        // This means the `currentMinCost` is effectively the one from the *last* iteration
        // of the outer `for` loop that resulted in a connected component, or 0 if none did.
        // The original code has `res += e[2]` *inside* the inner Kruskal loop,
        // and then `res = 0` if `uf.count(use) > 1`.
        // This means `res` is *accumulated* across edges, then *potentially reset*.
        // My `currentMinCost` is already doing that. So the `currentMinCost = 0` is correct.
        // The final `console.log(res)` must be outside the `for` loop.
      }
    }
    // Output the final calculated minimum cost for the current test case.
    console.log(currentMinCost);
  }
}