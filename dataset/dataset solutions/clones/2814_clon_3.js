'use strict'; // Keeping strict mode for good practice, but not strictly essential for the clone

// Utility function to handle array destructuring, adapted from common transpiler outputs.
// For this specific clone, we will try to use native destructuring where possible
// to simplify and reduce reliance on these helpers, aligning with Type III changes.
function obtainArrayElements(sourceArray, count) {
  if (Array.isArray(sourceArray)) return sourceArray;
  // If not an array, attempt iterable conversion
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(sourceArray)) {
    let tempArr = [];
    let isDone = false;
    let errorOccurred = false;
    let iteratorError;
    try {
      for (let itemIterator = sourceArray[Symbol.iterator](), currentItem; !(isDone = (currentItem = itemIterator.next()).done); isDone = true) {
        tempArr.push(currentItem.value);
        if (count && tempArr.length === count) break;
      }
    } catch (err) {
      errorOccurred = true;
      iteratorError = err;
    } finally {
      try {
        if (!isDone && itemIterator["return"] != null) itemIterator["return"]();
      } finally {
        if (errorOccurred) throw iteratorError;
      }
    }
    return tempArr;
  }
  // Fallback for non-iterable, array-like objects
  return convertToArrayLike(sourceArray, count);
}

// Helper to convert array-like objects
function convertToArrayLike(obj, minimumLength) {
  if (!obj) return [];
  if (typeof obj === "string") return createArrayFromLike(obj, minimumLength);
  let objType = Object.prototype.toString.call(obj).slice(8, -1);
  if (objType === "Object" && obj.constructor) objType = obj.constructor.name;
  if (objType === "Map" || objType === "Set") return Array.from(obj);
  if (objType === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(objType)) return createArrayFromLike(obj, minimumLength);
  return []; // Default empty for unsupported types
}

// Low-level array creation from array-like
function createArrayFromLike(inputArray, targetLength) {
  if (targetLength == null || targetLength > inputArray.length) targetLength = inputArray.length;
  let resultArray = new Array(targetLength);
  for (let idx = 0; idx < targetLength; idx++) {
    resultArray[idx] = inputArray[idx];
  }
  return resultArray;
}

/**
 * Solves the graph construction problem: Given N vertices and a target number of
 * pairs (K) at distance 2, output a tree (N-1 edges) that satisfies this condition.
 *
 * The graph structure is a path 1-2-...-M, and then nodes M+1 to N are connected to node 1.
 * The number of distance-2 pairs in this structure is given by:
 *   (number of nodes in star component - 1) * (number of nodes in star component - 2) / 2
 *   + (M - 2)
 *   + (number of nodes in star component - 1)
 *
 * Where:
 *   - 'number of nodes in star component' refers to nodes {1, M+1, ..., N}. This is (N - M + 1) nodes.
 *   - (M - 2) counts pairs like (1,3), (2,4) in the path 1-2-...-M.
 *   - (number of nodes in star component - 1) is (N - M), counting pairs like (2, M+1), (2, M+2) via node 1.
 *
 * The formula simplifies to:
 *   (N - M + 1) * (N - M) / 2 + (M - 2)
 *
 * @param {string[]} inputSegments An array of strings, where the first element contains N and K.
 */
function solveGraphProblem(inputSegments) {
  // Validate input presence
  if (!inputSegments || inputSegments.length === 0) {
    console.error("Error: No input data provided.");
    return;
  }

  // Parse N (vertexCount) and K (targetDistTwoPairs) from the first line.
  // Using native destructuring for cleaner code, replacing original Babel helpers.
  const [vertexCount, targetDistTwoPairs] = inputSegments[0].split(' ').map(Number);

  // Basic input validation
  if (isNaN(vertexCount) || isNaN(targetDistTwoPairs) || vertexCount < 1 || targetDistTwoPairs < 0) {
    console.error("Error: Invalid vertex count or target distance-2 pairs. N must be >= 1, K must be >= 0.");
    console.log(-1); // Indicate failure
    return;
  }
  if (vertexCount === 1 && targetDistTwoPairs === 0) {
    console.log(0); // A single node has 0 edges and 0 dist-2 pairs
    return;
  }
  if (vertexCount === 1 && targetDistTwoPairs > 0) {
      console.log(-1); // Cannot form dist-2 pairs with only one node
      return;
  }

  let pathEndNode = -1; // Represents M in the original code. Initialized to an invalid value.
  let solutionFound = false;

  // Iterate downwards from N to find a suitable 'pathEndNode' (M).
  // The minimum useful pathEndNode is 2 (nodes 1-2). If pathEndNode is 1, it implies no path.
  // If pathEndNode = 0, the formula breaks. Let's adjust iteration to reflect that.
  for (let currentPathEndCandidate = vertexCount; currentPathEndCandidate >= 1; currentPathEndCandidate--) {
    // Calculate 'L' equivalent: number of nodes in the star component (1 and M+1 to N)
    const starComponentCount = vertexCount - currentPathEndCandidate + 1; // L-1 in original formula

    // Calculate number of distance-2 pairs within the star component (clique of leaves around node 1)
    // This is (starComponentCount choose 2)
    const pairsInStarComponent = (starComponentCount * (starComponentCount - 1)) / 2;

    // Calculate number of distance-2 pairs from the path component
    // (M-2 from path like (1,3), (2,4) etc. + (N-M) from (2, M+1) etc.)
    const pairsFromPathComponent = Math.max(0, currentPathEndCandidate - 2); // For path 1-2-...-M, (1,3), (2,4)...
    const pairsFromPathToStar = Math.max(0, vertexCount - currentPathEndCandidate); // For (2, M+1), (2, M+2)...

    const totalCalculatedPairs = pairsInStarComponent + pairsFromPathComponent + pairsFromPathToStar;

    if (totalCalculatedPairs === targetDistTwoPairs) {
      pathEndNode = currentPathEndCandidate;
      solutionFound = true;
      break; // Found a valid M, exit loop
    }
  }

  // If no suitable pathEndNode (M) was found, output -1
  if (!solutionFound) {
    console.log(-1);
    return;
  }

  // If a solution is found, construct and output the graph.
  // The graph is always a tree with N-1 edges.
  console.log(vertexCount - 1); // Total number of edges in the constructed tree

  // First, print edges for the linear (path) component: 1-2, 2-3, ..., (pathEndNode-1)-pathEndNode
  for (let currentEdgeStart = 1; currentEdgeStart < pathEndNode; currentEdgeStart++) {
    console.log(`${currentEdgeStart} ${currentEdgeStart + 1}`);
  }

  // Then, print edges connecting node 1 to the remaining isolated vertices: (1, pathEndNode+1), ..., (1, N)
  // These are the "star" edges from node 1 to the nodes not part of the path.
  for (let isolatedVertexIndex = pathEndNode + 1; isolatedVertexIndex <= vertexCount; isolatedVertexIndex++) {
    console.log(`${1} ${isolatedVertexIndex}`);
  }
}

/**
 * Sets up standard input handling to read data and pass it to the solver.
 */
function handleInputAndExecute() {
  let rawInputBuffer = "";
  // Resume stdin to start receiving data
  process.stdin.resume();
  // Set encoding to UTF-8 for proper character handling
  process.stdin.setEncoding("utf8");

  // Event listener for incoming data chunks
  process.stdin.on("data", function (dataChunk) {
    rawInputBuffer += dataChunk;
  });

  // Event listener for end of input stream
  process.stdin.on("end", function () {
    // Split the accumulated input into lines and pass to the solver
    solveGraphProblem(rawInputBuffer.split("\n"));
  });
}

// Start the program by initiating input handling
handleInputAndExecute();