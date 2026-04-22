'use strict'; // Enforce strict parsing and error handling in the script

// Import the Node.js file system module for file operations.
const fileHandler = require('node:fs');

// Define a large prime number as a BigInt constant for modulo arithmetic.
const primeModulo = BigInt(1_000_000_000 + 7);


/**
 * @class ProblemSetOne
 * @description Contains solutions for problems from an early contest (e.g., ABC041).
 */
class ProblemSetOne {

  /**
   * Solves Task Alpha. Given a string and an index, print the character at that index.
   * @param {string} dataString - The input string containing two lines: the main string and the index.
   */
  static TaskAlpha(dataString) {
    // Declare variables for the main string and the target index.
    let firstStr, secondIdx;

    // Process the input: trim whitespace, split by newline.
    dataString = dataString.trim().split('\n');

    // Destructure the array to assign values to variables.
    [firstStr, secondIdx] = dataString;

    // Convert the index string to an integer.
    secondIdx = Number.parseInt(secondIdx, 10);

    // Output the character at the specified (1-based) index.
    console.log(firstStr[secondIdx - 1]);
  } // End of TaskAlpha method


  /**
   * Solves Task Beta. Calculates (A * B * C) modulo a large prime.
   * @param {string} dataInput - A string containing three space-separated BigInt numbers.
   */
  static TaskBeta(dataInput) {
    // Declare BigInt variables for the three input numbers.
    let valA, valB, valC;

    // Parse the input string into an array of BigInts.
    dataInput = dataInput.trim().split(' ').map(BigInt);

    // Assign the parsed BigInts to their respective variables.
    [valA, valB, valC] = dataInput;

    // Perform the calculation: (valA * valB % primeModulo * valC % primeModulo).
    // This ensures intermediate results don't overflow standard JS numbers.
    let resultVal = valA * valB % primeModulo * valC % primeModulo;

    // Convert the final BigInt result to a standard JavaScript Number for output.
    resultVal = Number(resultVal);

    // Display the final computed result.
    console.log(resultVal);
  } // End of TaskBeta method


  /**
   * Solves Task Gamma. Sorts items by height and prints their original 1-based indices.
   * @param {string} incomingData - Input string with two lines: count N and N space-separated heights.
   */
  static TaskGamma(incomingData) {
    // Destructure the input into total count and a string of heights.
    let [totalNum, itemHeights] = incomingData.trim().split('\n');

    // Convert the height string into an array of integers.
    itemHeights = itemHeights.split(' ').map(currentN => Number.parseInt(currentN, 10));

    // Convert the total count string to an integer. (Though 'totalNum' is not used later, its parsing maintains structure).
    totalNum = Number.parseInt(totalNum, 10);

    // Create an array of [original_1_based_index, height] pairs.
    // Object.keys(itemHeights) gives indices as strings, which are then parsed.
    let indexedHeights = Object.keys(itemHeights).map(idxKey => [Number.parseInt(idxKey, 10) + 1, itemHeights[idxKey]]);

    // Sort the indexed heights in descending order based on their height value.
    indexedHeights.sort(function(itemOne, itemTwo) {
      return (itemTwo[1] - itemOne[1]); // Sorts by height (second element) in descending order
    });

    // Iterate through the sorted array and print the original 1-based index of each item.
    // The underscore `_discard` indicates that the height value itself is not used in the loop.
    for (const [currentIdx, _discard] of indexedHeights) {
      console.log(currentIdx);
    }
  } // End of TaskGamma method


  /**
   * Solves Task Delta. Counts Hamiltonian paths in a DAG with specific constraints.
   * Uses dynamic programming with bitmask.
   * @param {string} inputData - Input string containing graph definition.
   */
  static TaskDelta(inputData) {
    // Split the entire input into individual lines.
    let inputLines = inputData.trim().split('\n');

    // Parse the first line to get the number of nodes (N) and edges (M).
    let [nodeCount, edgeCount] = inputLines[0].split(' ').map(value => Number(value));

    // Initialize an array to represent the adjacency list (or bitmask representation of outgoing edges) for each node.
    // Each element connectionMatrix[i] will be a bitmask of nodes that node 'i' can reach.
    let connectionMatrix = new Array(nodeCount).fill(0);

    // Process each edge definition from the input.
    for (let loopIdx = 0; loopIdx < edgeCount; loopIdx++) {
      // Parse source and destination nodes for the current edge.
      let [sourceNode, destNode] = inputLines[1 + loopIdx].split(' ').map(val => Number(val));
      // Store the connection: sourceNode-1 has an outgoing edge to destNode-1.
      // Using bitwise OR to set the bit for the destination node in the source node's bitmask.
      connectionMatrix[sourceNode - 1] |= 1 << (destNode - 1);
    }

    // Initialize a memoization table for dynamic programming.
    // The size is 2^nodeCount, representing all possible subsets of nodes.
    // `null` indicates an uncomputed state, `1` for the base case (empty set).
    let memoizationTable = Array.from({ length: 1 << nodeCount }).fill(null);
    memoizationTable[0] = 1; // Base case: one way to form an empty path.


    /**
     * Recursive function to count valid paths given current connections and a bitmask of visited nodes.
     * @param {number[]} currentConnections - The adjacency list (bitmask) of remaining connections.
     * @param {number} bitmask - A bitmask representing the set of nodes currently being considered.
     * @returns {number} The number of valid paths for the given state.
     */
    function calculatePaths(currentConnections, bitmask) {
      // If the result for this bitmask has already been computed, return it.
      if (memoizationTable[bitmask] !== null) {
        return memoizationTable[bitmask];
      }

      // Initialize the count for the current bitmask to zero.
      memoizationTable[bitmask] = 0;

      // Iterate through all possible nodes.
      for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
        // Check if the current nodeIdx is part of the 'bitmask' (i.e., it's in the current subset of nodes)
        // AND if there are no outgoing edges from this node to any other node in the current subset.
        // This means nodeIdx is a valid "sink" in the current subgraph defined by 'bitmask'.
        if (((bitmask >> nodeIdx) & 1) && !currentConnections[nodeIdx]) {
          // If nodeIdx is a valid sink, remove it from the bitmask to form the next state.
          let nextBitmask = bitmask & ~(1 << nodeIdx);

          // Create a deep copy of the current connections to modify for the next state.
          let nextConnections = currentConnections.slice();

          // For each other node, remove any incoming edges from the 'nodeIdx' that was just removed.
          // This simulates removing nodeIdx from the graph.
          for (let otherNodeIdx = 0; otherNodeIdx < nodeCount; otherNodeIdx++) {
            nextConnections[otherNodeIdx] &= ~(1 << nodeIdx);
          }

          // Recursively call calculatePaths for the next state and add the result to the current count.
          memoizationTable[bitmask] += calculatePaths(nextConnections, nextBitmask);
        }
      }
      // Return the total count of paths for the current bitmask.
      return memoizationTable[bitmask];
    } // End of calculatePaths function

    // Call the recursive function with the initial graph and a bitmask representing all nodes.
    // (1 << nodeCount) - 1 creates a bitmask with all 'nodeCount' bits set to 1.
    console.log(calculatePaths(connectionMatrix, (1 << nodeCount) - 1));
  } // End of TaskDelta method

} // End of ProblemSetOne class


/**
 * @class ProblemSetTwo
 * @description Contains solutions for problems from a more recent contest (e.g., ABC173).
 */
class ProblemSetTwo {

  /**
   * Solves Task One. Calculates the amount of change needed to reach the next multiple of 1000.
   * @param {string} inputVal - A string representing an integer.
   */
  static TaskOne(inputVal) {
    // Convert the input string to a number.
    let numValue = Number(inputVal.trim());

    // Calculate the difference to the next multiple of 1000.
    // (numValue + 999) / 1000 rounds up to the next thousand, then multiply by 1000 and subtract original.
    console.log(Math.floor((numValue + 999) / 1000) * 1000 - numValue);
  } // End of TaskOne method


  /**
   * Solves Task Two. Counts occurrences of different verdict strings.
   * @param {string} incomingText - Input string: first line is N, subsequent N lines are verdict strings.
   */
  static TaskTwo(incomingText) {
    // Split the input into an array of lines.
    let textLines = incomingText.trim().split('\n');

    // Parse the first line to get the total number of entries.
    let totalEntries = Number(textLines[0]);

    // Initialize an object to store counts for specific verdict types.
    let verdictCounts = {
      'AC': 0,
      'WA': 0,
      'TLE': 0,
      'RE': 0
    };

    // Iterate through the verdict lines and increment the corresponding counter.
    for (let entryIndex = 0; entryIndex < totalEntries; entryIndex++) {
      verdictCounts[textLines[1 + entryIndex]]++;
    }

    // Iterate over the verdict counts and print each verdict and its count.
    for (const [statusVerdict, currentCount] of Object.entries(verdictCounts)) {
      console.log(`${statusVerdict} x ${currentCount}`);
    }
  } // End of TaskTwo method


  /**
   * Solves Task Three. Counts ways to select rows and columns such that exactly K '#' cells remain.
   * @param {string} rawData - Input string: first line H W K, then H lines of grid characters.
   */
  static TaskThree(rawData) {
    // Split the input into an array of rows.
    let inputRows = rawData.trim().split('\n');

    // Parse the first line for grid dimensions (height, width) and target black cells (K).
    let [gridHeight, gridWidth, targetBlackCells] = inputRows[0].split(' ').map(num => Number(num));

    // Slice the array to get only the grid character data.
    let charGrid = inputRows.slice(1);

    // Initialize a counter for the total number of valid combinations found.
    let totalCombinations = 0;

    // Iterate through all possible combinations of rows to 'remove' (represented by rowMask).
    // (1 << gridHeight) generates 2^H, covering all subsets of rows.
    for (let rowMask = 0; rowMask < (1 << gridHeight); rowMask++) {
      // For each row combination, iterate through all possible combinations of columns to 'remove' (colMask).
      // (1 << gridWidth) generates 2^W, covering all subsets of columns.
      for (let colMask = 0; colMask < (1 << gridWidth); colMask++) {
        // Initialize a counter for black cells in the current (rowMask, colMask) combination.
        let currentBlackCount = 0;

        // Iterate through each cell of the original grid.
        for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
          // If the current row is marked for 'removal' (bit is set in rowMask), skip it.
          // (rowMask >> rowIdx) & 1 checks if the rowIdx-th bit is set in rowMask.
          if ((rowMask >> rowIdx) & 1) continue;

          for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            // If the current column is marked for 'removal' (bit is set in colMask), skip it.
            // Check if the cell is '#' AND the column is NOT marked for removal.
            // If both conditions are true, increment the black cell count.
            currentBlackCount += (charGrid[rowIdx][colIdx] === '#' && !((colMask >> colIdx) & 1));
          }
        }
        // If the count of remaining black cells matches the target K, increment the total combinations.
        totalCombinations += (currentBlackCount === targetBlackCells);
      }
    }
    // Output the final total count of combinations.
    console.log(totalCombinations);
  } // End of TaskThree method


  /**
   * Task Four - Placeholder for future implementation.
   * @param {string} inputData - Unused input parameter for this empty task.
   */
  static TaskFour(inputData) {
    /* This method is intentionally left blank as per the original code structure. */
  } // End of TaskFour method


  /**
   * Task Five - Placeholder for future implementation.
   * @param {string} inputData - Unused input parameter for this empty task.
   */
  static TaskFive(inputData) {
    // No operation defined for this problem yet.
  } // End of TaskFive method


  /**
   * Task Six - Placeholder for future implementation.
   * @param {string} inputData - Unused input parameter for this empty task.
   */
  static TaskSix(inputData) {
    // This problem's solution is not provided.
  } // End of TaskSix method

} // End of ProblemSetTwo class


// Read the entire standard input as a UTF-8 string.
const fileContent = fileHandler.readFileSync('/dev/stdin', 'utf8');

// Execute the solution for a specific problem (e.g., ProblemSetTwo.TaskThree) using the read input.
ProblemSetTwo.TaskThree(fileContent);