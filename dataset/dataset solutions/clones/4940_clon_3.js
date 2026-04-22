'use strict';

/**
 * Solves a grid connectivity problem by finding the minimum spanning cost
 * to connect all points in a grid. This implementation uses a recursive
 * Kruskal's-like approach combined with a Disjoint Set Union (DSU) data structure
 * for efficient component management.
 *
 * @param {string} problemInput Raw input string containing grid dimensions and edge weights.
 */
function SolveGridPuzzle(problemInput) {
  // Define a constant for a very large number, representing an effectively infinite cost
  // for non-existent or invalid edge weights.
  const MAX_EDGE_WEIGHT_SENTINEL = 100000001; // A value greater than any possible valid edge weight (10^8)

  /**
   * Helper class implementing the Disjoint Set Union (DSU) data structure.
   * Used to efficiently track connected components and perform union operations.
   */
  class DisjointSetUnion {
    constructor(totalElements) {
      // Initialize each element to be its own parent, forming 'totalElements' distinct sets.
      this.parents = Array.from({ length: totalElements }, (_, i) => i);
      // Ranks are used for optimization (union by rank) to keep trees flat.
      this.ranks = Array(totalElements).fill(0);
      // Tracks the number of currently disjoint sets.
      this.numDisjointSets = totalElements;
    }

    /**
     * Finds the representative (root) of the set containing element 'elementIndex'.
     * Applies path compression during traversal to flatten the tree for future lookups.
     * @param {number} elementIndex The index of the element to find the set representative for.
     * @returns {number} The representative of the set.
     */
    find(elementIndex) {
      if (this.parents[elementIndex] === elementIndex) {
        return elementIndex; // 'elementIndex' is its own parent, so it's the root.
      }
      // Recursively find the root and compress the path by setting the parent directly to the root.
      return (this.parents[elementIndex] = this.find(this.parents[elementIndex]));
    }

    /**
     * Merges the sets containing elements 'idxA' and 'idxB'.
     * Uses union by rank to maintain a balanced tree structure.
     * @param {number} idxA An element in the first set.
     * @param {number} idxB An element in the second set.
     * @returns {boolean} True if a union operation occurred (i.e., elements were in different sets), false otherwise.
     */
    unite(idxA, idxB) {
      let rootA = this.find(idxA);
      let rootB = this.find(idxB);

      if (rootA !== rootB) {
        // Perform union by rank: attach the smaller rank tree under the root of the larger rank tree.
        if (this.ranks[rootA] < this.ranks[rootB]) {
          this.parents[rootA] = rootB;
        } else if (this.ranks[rootA] > this.ranks[rootB]) {
          this.parents[rootB] = rootA;
        } else {
          // If ranks are equal, attach one to the other and increment the rank of the new root.
          this.parents[rootB] = rootA;
          this.ranks[rootA]++;
        }
        this.numDisjointSets--; // Successfully merged two sets into one.
        return true;
      }
      return false; // Elements were already in the same set, no union performed.
    }

    /**
     * Checks if all elements managed by this DSU instance are part of a single connected component.
     * @returns {boolean} True if only one disjoint set remains, indicating full connectivity.
     */
    isFullyConnected() {
      return this.numDisjointSets === 1;
    }
  }

  // --- Input Parsing and Grid Setup ---

  const lineData = problemInput.split("\n"); // Split raw input into individual lines.

  const gridSizeTokens = lineData[0].split(" "); // First line contains dimensions "W H".
  const numCols = parseInt(gridSizeTokens[0]); // Grid width (W from original problem).
  const numRows = parseInt(gridSizeTokens[1]); // Grid height (H from original problem).

  // Basic validation for grid dimensions.
  if (isNaN(numCols) || isNaN(numRows) || numCols < 0 || numRows < 0) {
    console.error("Error: Invalid grid dimensions provided. Please check input format.");
    return; // Terminate execution if dimensions are invalid.
  }

  // Arrays to store the costs for horizontal and vertical connections.
  // horizontalEdgeWeights[c] is the cost to connect a node at column 'c' to 'c+1'.
  const horizontalEdgeWeights = [];
  // verticalEdgeWeights[r] is the cost to connect a node at row 'r' to 'r+1'.
  const verticalEdgeWeights = [];

  // Populate horizontal edge weights from input lines.
  // These costs correspond to the 'p' array in the original code.
  for (let idx = 0; idx < numCols; idx++) {
    const rawValue = lineData[1 + idx];
    horizontalEdgeWeights.push(parseInt(rawValue) || MAX_EDGE_WEIGHT_SENTINEL);
  }

  // Populate vertical edge weights from input lines.
  // These costs correspond to the 'q' array in the original code.
  for (let idx = 0; idx < numRows; idx++) {
    const rawValue = lineData[1 + numCols + idx];
    verticalEdgeWeights.push(parseInt(rawValue) || MAX_EDGE_WEIGHT_SENTINEL);
  }

  // The grid consists of (numRows + 1) rows and (numCols + 1) columns of "points" or "nodes".
  // Each point can be uniquely identified by a linear index for the DSU structure.
  const totalGridPoints = (numRows + 1) * (numCols + 1);
  const connectivityManager = new DisjointSetUnion(totalGridPoints);

  /**
   * Helper function to convert 2D grid coordinates (row, col) into a linear index.
   * This is essential for mapping grid points to the 1D array used by the DSU.
   * @param {number} r The row index of the grid point.
   * @param {number} c The column index of the grid point.
   * @returns {number} The linear index corresponding to (r, c).
   */
  const getLinearIndex = (r, c) => r * (numCols + 1) + c;

  /**
   * Recursively finds the minimum cost edge that connects two previously disjoint components
   * and adds its weight to the accumulated total. This process continues until all grid points
   * are connected into a single component, effectively building a Minimum Spanning Tree (MST).
   * This function mirrors the recursive structure of the original 'kruskal' function.
   *
   * @param {number} currentAccumulatedCost The sum of weights of edges added to the MST so far.
   * @param {DisjointSetUnion} dsu The DSU instance managing the connectivity of grid points.
   * @returns {number} The final total minimum spanning cost.
   */
  function findMinConnectivityCost(currentAccumulatedCost, dsu) {
    // Base case: If all grid points are already connected, return the accumulated cost.
    if (dsu.isFullyConnected()) {
      return currentAccumulatedCost;
    }

    let cheapestEdgeWeight = MAX_EDGE_WEIGHT_SENTINEL;
    // 'selectedEdgeConnection' will store [node1_linear_idx, node2_linear_idx, edge_weight]
    let selectedEdgeConnection = null;

    // --- Phase 1: Search for the minimum cost horizontal edge ---
    // Iterate through all rows of nodes (from 0 to numRows)
    for (let r = 0; r <= numRows; r++) {
      // Iterate through all possible horizontal edges within a row (connecting 'c' to 'c+1')
      for (let c = 0; c < numCols; c++) {
        const node1LinearIdx = getLinearIndex(r, c);
        const node2LinearIdx = getLinearIndex(r, c + 1);

        // Check if these two nodes are in different connected components.
        if (dsu.find(node1LinearIdx) !== dsu.find(node2LinearIdx)) {
          const edgeWeight = horizontalEdgeWeights[c]; // Get the cost for this specific horizontal connection.
          if (edgeWeight < cheapestEdgeWeight) {
            cheapestEdgeWeight = edgeWeight;
            selectedEdgeConnection = [node1LinearIdx, node2LinearIdx, edgeWeight];
          }
        }
      }
    }

    // --- Phase 2: Search for the minimum cost vertical edge ---
    // Iterate through all possible vertical edges within a column (connecting 'r' to 'r+1')
    for (let r = 0; r < numRows; r++) {
      // Iterate through all columns of nodes (from 0 to numCols)
      for (let c = 0; c <= numCols; c++) {
        const node1LinearIdx = getLinearIndex(r, c);
        const node2LinearIdx = getLinearIndex(r + 1, c);

        // Check if these two nodes are in different connected components.
        if (dsu.find(node1LinearIdx) !== dsu.find(node2LinearIdx)) {
          const edgeWeight = verticalEdgeWeights[r]; // Get the cost for this specific vertical connection.
          if (edgeWeight < cheapestEdgeWeight) {
            cheapestEdgeWeight = edgeWeight;
            selectedEdgeConnection = [node1LinearIdx, node2LinearIdx, edgeWeight];
          }
        }
      }
    }

    // If no connectable edge was found, but the graph is not fully connected,
    // this indicates a problem (e.g., disconnected graph, invalid input, or algorithm error).
    // In a valid MST problem, an edge should always be found until fully connected.
    if (!selectedEdgeConnection) {
        console.warn("Warning: No connectable edge found, but the grid is not fully connected. This might indicate an issue with the input or graph structure.");
        return currentAccumulatedCost; // Return current cost as a fallback.
    }

    // Extract details of the selected cheapest edge.
    const [nodeU, nodeV, edgeWeightToAdd] = selectedEdgeConnection;

    // Unite the sets of the two nodes connected by the selected edge.
    dsu.unite(nodeU, nodeV);
    // Add the weight of this edge to the total accumulated cost.
    currentAccumulatedCost += edgeWeightToAdd;

    // Recursively call the function to find the next cheapest edge until all components merge.
    return findMinConnectivityCost(currentAccumulatedCost, dsu);
  }

  // Initiate the MST calculation process with an initial cost of zero.
  const finalMinCost = findMinConnectivityCost(0, connectivityManager);
  console.log(finalMinCost);
}

// Standard input reading for competitive programming environments.
// Reads the entire content of stdin as a UTF-8 string and passes it to the solver.
SolveGridPuzzle(require("fs").readFileSync("/dev/stdin", "utf8"));