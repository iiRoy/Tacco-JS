'use strict'; // Enforce strict mode for cleaner code execution.

// Import the file system module for reading input.
const fileSystemModule = require('fs');

// Define a large prime modulus for BigInt operations.
const primeModulus = BigInt(1000000000 + 7);


/**
 * A collection of static methods to solve various programming problems from contest ABC041.
 */
class ProblemSolverA {

  /**
   * Solves problem A: Given a string and an index, print the character at that index.
   * @param {string} inputData - The raw input string containing the string and the 1-based index.
   */
  static SolveProblemA(inputData) {
    let targetString, targetIndex; // Declare variables for the string and its index.

    // Process the input: remove leading/trailing whitespace and split by newline.
    const processedInput = inputData.trim().split('\n');

    // Destructure the array to assign values.
    [targetString, targetIndex] = processedInput;

    // Convert the index string to an integer.
    const numericIndex = parseInt(targetIndex, 10);

    // Output the character at the (numericIndex - 1) position (0-based indexing).
    console.log(targetString[numericIndex - 1]);
  }

  /**
   * Solves problem B: Calculate (A * B * C) % M using BigInts.
   * @param {string} inputData - The raw input string containing three space-separated numbers.
   */
  static SolveProblemB(inputData) {
    let valueA, valueB, valueC; // Variables to hold the three BigInt numbers.

    // Parse input: trim, split by space, and convert each part to BigInt.
    const bigIntValues = inputData.trim().split(' ').map(BigInt);

    // Assign the parsed BigInts.
    [valueA, valueB, valueC] = bigIntValues;

    // Perform the calculation using BigInt arithmetic and the global modulus.
    let finalResult = (valueA * valueB) % primeModulus * valueC % primeModulus;

    // Convert the BigInt result back to a standard JavaScript Number for output.
    const numericOutput = Number(finalResult);

    // Print the final numeric result.
    console.log(numericOutput);
  }

  /**
   * Solves problem C: Sort items by height in descending order and print their original 1-based indices.
   * @param {string} inputData - The raw input string with N on the first line and N heights on the second.
   */
  static SolveProblemC(inputData) {
    // Split input into lines and parse N and the heights.
    const [numItemsStr, heightsStr] = inputData.trim().split('\n');
    const itemHeights = heightsStr.split(' ').map(h => parseInt(h, 10));
    const totalItems = parseInt(numItemsStr, 10); // N is not strictly needed after parsing heights.

    // Create an array of [original_1_based_index, height] pairs.
    // Object.keys(itemHeights) gives string indices, convert to int and add 1.
    const indexedHeights = Object.keys(itemHeights).map(currentKey => [parseInt(currentKey, 10) + 1, itemHeights[currentKey]]);

    // Sort the array based on height in descending order.
    indexedHeights.sort(function(elementOne, elementTwo) {
      // Sort by the second element (height) in descending order.
      return (elementTwo[1] - elementOne[1]);
    });

    // Iterate through the sorted array and print the original 1-based index.
    for (const [itemIndex, _discardedValue] of indexedHeights) {
      console.log(itemIndex);
    }
  }

  /**
   * Solves problem D: Count the number of topological sorts for a given DAG.
   * Uses dynamic programming with bitmasks.
   * @param {string} inputData - The raw input string describing the graph.
   */
  static SolveProblemD(inputData) {
    const inputLines = inputData.trim().split('\n');
    // Parse number of nodes (n) and edges (m) from the first line.
    const [nodeCount, edgeCount] = inputLines[0].split(' ').map(numStr => +numStr);

    // Initialize an array to store adjacency bitmasks for each node.
    // `adjacencyBitmasks[i]` will have a bit set at `j` if there's an edge from `j` to `i`.
    // This represents incoming edges.
    const adjacencyBitmasks = new Array(nodeCount).fill(0);

    // Process each edge to build the adjacency bitmasks.
    for (let loopCounter = 0; loopCounter < edgeCount; loopCounter++) {
      const [startNode, endNode] = inputLines[1 + loopCounter].split(' ').map(numStr => +numStr);
      // An edge from (startNode-1) to (endNode-1) means (endNode-1) has an incoming edge from (startNode-1).
      // So, we set the bit corresponding to (startNode-1) in the bitmask for (endNode-1).
      adjacencyBitmasks[endNode - 1] |= (1 << (startNode - 1));
    }

    // Initialize a memoization table for dynamic programming.
    // `memoizationTable[bitmask]` will store the count of topological sorts for the subset of nodes represented by `bitmask`.
    const memoizationTable = new Array(1 << nodeCount).fill(null);
    memoizationTable[0] = 1; // Base case: an empty set of nodes has one topological sort (the empty sort).

    /**
     * Recursively calculates the number of topological sorts for a given subset of nodes.
     * @param {number[]} currentEdges - The current state of incoming edge bitmasks for each node.
     * @param {number} currentBitmask - A bitmask representing the set of nodes currently being considered.
     * @returns {number} The number of topological sorts for the given subset of nodes.
     */
    function calculatePaths(currentEdges, currentBitmask) {
      // If the result for this bitmask is already computed, return it.
      if (memoizationTable[currentBitmask] !== null) {
        return memoizationTable[currentBitmask];
      }

      // Initialize the count for the current bitmask to 0.
      memoizationTable[currentBitmask] = 0;

      // Iterate through all nodes to find potential starting nodes for the current subset.
      for (let nodeIterator = 0; nodeIterator < nodeCount; nodeIterator++) {
        // Check if the current node is in the `currentBitmask` AND has no incoming edges from other nodes in `currentBitmask`.
        // `currentBitmask >> nodeIterator & 1` checks if `nodeIterator`-th bit is set in `currentBitmask`.
        // `!currentEdges[nodeIterator]` checks if the node has no incoming edges (i.e., it's a source node in the current subgraph).
        if ((currentBitmask >> nodeIterator & 1) && !currentEdges[nodeIterator]) {
          // If it's a valid source node, consider removing it and solving for the remaining subgraph.

          // Create the next bitmask by removing the current node.
          const nextBitmask = currentBitmask & ~(1 << nodeIterator);

          // Create a copy of the current edges state to modify for the next recursive call.
          const nextEdgesState = currentEdges.slice();

          // Update incoming edges for all other nodes: remove the current node as a potential source.
          for (let neighborIterator = 0; neighborIterator < nodeCount; neighborIterator++) {
            nextEdgesState[neighborIterator] &= ~(1 << nodeIterator);
          }

          // Add the count from the recursive call to the total for the current bitmask.
          memoizationTable[currentBitmask] += calculatePaths(nextEdgesState, nextBitmask);
        }
      }
      // Return the computed count.
      return memoizationTable[currentBitmask];
    }

    // Call the function to calculate paths for all nodes (represented by (1 << nodeCount) - 1).
    console.log(calculatePaths(adjacencyBitmasks, (1 << nodeCount) - 1));
  }
}

/**
 * A collection of static methods to solve various programming problems from contest ABC173.
 */
class ProblemSolverB {

  /**
   * Solves problem A: Calculate change from 1000 yen.
   * @param {string} inputData - The raw input string containing a single number N.
   */
  static SolveProblemE(inputData) {
    const inputNumber = +inputData.trim(); // Convert input string to number.
    // Calculate the smallest multiple of 1000 greater than or equal to N, then subtract N.
    const changeAmount = Math.floor((inputNumber + 999) / 1000) * 1000 - inputNumber;
    console.log(changeAmount);
  }

  /**
   * Solves problem B: Count occurrences of different submission statuses.
   * @param {string} inputData - The raw input string with N on the first line and N statuses following.
   */
  static SolveProblemF(inputData) {
    const inputLines = inputData.trim().split('\n');
    const numCases = +inputLines[0]; // Number of test cases/submissions.

    // Initialize an object to store counts for each status.
    const statusCounts = {
      'AC': 0, // Accepted
      'WA': 0, // Wrong Answer
      'TLE': 0, // Time Limit Exceeded
      'RE': 0   // Runtime Error
    };

    // Iterate through the submission statuses and increment their counts.
    for (let caseIndex = 0; caseIndex < numCases; caseIndex++) {
      statusCounts[inputLines[1 + caseIndex]]++;
    }

    // Iterate through the status counts and print them in the specified format.
    for (const [verdictString, countValue] of Object.entries(statusCounts)) {
      console.log(`${verdictString} x ${countValue}`);
    }
  }

  /**
   * Solves problem C: Count ways to select rows and columns to have exactly K black cells.
   * @param {string} inputData - The raw input string describing the grid and target K.
   */
  static SolveProblemG(inputData) {
    const inputLines = inputData.trim().split('\n');
    // Parse grid dimensions (H, W) and target black cells (K).
    const [heightDim, widthDim, targetBlackCells] = inputLines[0].split(' ').map(coordStr => +coordStr);

    // Extract the grid data (rows of characters).
    const gridData = inputLines.slice(1);

    let totalValidConfigurations = 0; // Counter for configurations that meet the criteria.

    // Iterate through all possible combinations of rows to keep (2^H possibilities).
    for (let rowMask = 0; rowMask < (1 << heightDim); rowMask++) {
      // Iterate through all possible combinations of columns to keep (2^W possibilities).
      for (let colMask = 0; colMask < (1 << widthDim); colMask++) {
        let currentBlackCellCount = 0; // Count black cells for the current row/column selection.

        // Iterate through each cell of the grid.
        for (let rowIdx = 0; rowIdx < heightDim; rowIdx++) {
          // If the current row is marked for deletion (bit is set in rowMask), skip it.
          if (rowMask >> rowIdx & 1) continue;

          for (let colIdx = 0; colIdx < widthDim; colIdx++) {
            // If the cell is '#' AND its column is NOT marked for deletion (bit is NOT set in colMask),
            // then it's a black cell in the selected subgrid.
            if (gridData[rowIdx][colIdx] === '#' && !(colMask >> colIdx & 1)) {
              currentBlackCellCount++;
            }
          }
        }
        // If the count of black cells matches the target K, increment the total valid configurations.
        if (currentBlackCellCount === targetBlackCells) {
          totalValidConfigurations++;
        }
      }
    }
    // Print the final count.
    console.log(totalValidConfigurations);
  }

  /**
   * Placeholder for problem D.
   * @param {string} inputData - The raw input string.
   */
  static SolveProblemH(inputData) {
    // Implementation for problem D would go here.
  }

  /**
   * Placeholder for problem E.
   * @param {string} inputData - The raw input string.
   */
  static SolveProblemI(inputData) {
    // Implementation for problem E would go here.
  }

  /**
   * Placeholder for problem F.
   * @param {string} inputData - The raw input string.
   */
  static SolveProblemJ(inputData) {
    // Implementation for problem F would go here.
  }
}


// Read the entire input from standard input, assuming UTF-8 encoding.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Call the specific problem solver method with the input content.
// This line determines which problem's solution is executed.
ProblemSolverB.SolveProblemG(rawInputContent);
