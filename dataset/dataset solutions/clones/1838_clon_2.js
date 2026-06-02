"use strict";

// Obtain raw input data from the standard input stream.
const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");

// Process the input string into an array of tokens, splitting by spaces or newlines.
let tokenStream = rawInput.split(/ |\n/);
let tokenIndex = 0; // Tracks the current position within the token stream.

/**
 * Retrieves the next token from the stream and parses it as a numerical value.
 * @returns {number} The parsed number.
 */
function readNum() {
  return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the stream as a string.
 * @returns {string} The string token.
 */
function readStr() {
  return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the stream and converts it into a BigInt.
 * @returns {BigInt} The parsed BigInt.
 */
function readBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads a specified number of tokens from the stream.
 * Optionally converts them to numbers if 'parseNumbers' is true.
 * @param {number} count - The quantity of tokens to read.
 * @param {boolean} parseNumbers - Flag to indicate if tokens should be converted to numbers.
 * @returns {Array<number|string>} An array containing the read tokens.
 */
function readNums(count, parseNumbers) {
  if (parseNumbers) {
    return tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
  } else {
    return tokenStream.slice(tokenIndex, tokenIndex += count);
  }
}

/**
 * Reads a matrix of specified dimensions from the token stream.
 * Elements are converted to numbers if 'parseNumbers' is true.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @param {boolean} parseNumbers - Flag to indicate if matrix elements should be numbers.
 * @returns {Array<Array<number|string>>} The constructed matrix.
 */
function readMatrix(rows, cols, parseNumbers) {
  let resultMatrix = [];
  let currentRow = 0;
  if (parseNumbers) {
    for (; currentRow < rows; currentRow++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += cols).map(val => +val));
    }
  } else {
    for (; currentRow < rows; currentRow++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += cols));
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to fill array elements with.
 * @param {...number} dimensions - The sizes for each dimension of the array.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  const args = arguments;
  let argCount = args.length;
  let arrayCreationString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Implements a min-priority queue using a binary heap data structure.
class MinHeap {
  constructor() {
    this.heapElements = []; // Stores elements as [priority_value, associated_identifier] tuples.
  }

  /**
   * Inserts a new element into the heap, maintaining the min-heap property.
   * @param {BigInt} value - The priority value of the element.
   * @param {BigInt} identifier - The data associated with the priority.
   */
  insertElement(value, identifier) {
    const elements = this.heapElements;
    let currentIdx = elements.length;
    let parentIdx;

    // Bubble up the new element to its correct position.
    for (; currentIdx > 0; currentIdx = parentIdx) {
      parentIdx = (currentIdx - 1) >> 1; // Calculate parent index.
      if (elements[parentIdx][0] <= value) {
        break; // Found the correct spot if parent is smaller or equal.
      }
      elements[currentIdx] = elements[parentIdx]; // Move parent down.
    }
    elements[currentIdx] = [value, identifier]; // Place the new element.
  }

  /**
   * Removes and returns the element with the smallest priority from the heap.
   * @returns {Array<BigInt>} The [priority_value, associated_identifier] of the minimum element.
   */
  extractMin() {
    const elements = this.heapElements;
    const minElement = elements[0]; // The smallest element is always at the root.
    const lastElement = elements.pop(); // Remove the last element to replace the root.
    const halfHeapLength = elements.length >> 1; // Optimization for loop bounds.

    let currentIdx = 0;
    let childIdx;

    // Bubble down the last element to its correct position.
    for (; currentIdx < halfHeapLength; currentIdx = childIdx) {
      childIdx = (currentIdx << 1) + 1; // Index of the left child.

      // Determine the smaller of the two children.
      if (elements[childIdx + 1] && elements[childIdx + 1][0] < elements[childIdx][0]) {
        childIdx++; // Use the right child if it's smaller.
      }

      // If the element to be placed is smaller than or equal to its smallest child, break.
      if (lastElement[0] <= elements[childIdx][0]) {
        break;
      }
      elements[currentIdx] = elements[childIdx]; // Move child up.
    }

    // If the heap is not empty, place the last element in its final sorted position.
    if (elements.length > 0) {
      elements[currentIdx] = lastElement;
    }
    return minElement;
  }

  /**
   * Gets the current number of elements stored in the heap.
   * @returns {number} The size of the heap.
   */
  get size() {
    return this.heapElements.length;
  }

  /**
   * Retrieves the element with the smallest priority without removing it.
   * @returns {Array<BigInt>} The [priority_value, associated_identifier] of the minimum element.
   */
  get top() {
    return this.heapElements[0];
  }
}

// Execute the primary problem-solving routine.
const problemResult = solveProblem();

// If the routine returns a value, print it to the console.
if (problemResult !== undefined) {
  console.log(problemResult);
}

/**
 * The main function encapsulating the problem's logic.
 * It uses a Dijkstra-like algorithm to find the minimum cost to transform a number to 0.
 */
function solveProblem() {
  const testCasesCount = readNum(); // Read the total number of test scenarios.

  // Constant array of prime factors used in operations.
  const primeFactors = [2n, 3n, 5n];

  // Process each test case sequentially.
  for (let caseIdx = 0; caseIdx < testCasesCount; caseIdx++) {
    const targetNumber = readBigInt(); // The starting number for the current test case.
    const costsForOps = [readBigInt(), readBigInt(), readBigInt()]; // Costs for dividing by 2, 3, and 5 respectively.

    // Precompute base costs for small numbers (0 to 4) to reach 0.
    const baseCosts = [0n, readBigInt()]; // baseCosts[0] is 0, baseCosts[1] is cost to reach 0 from 1.
    
    // Calculate baseCosts[2]: min(cost(1->0) + cost(1->0), cost(2->0 via op2))
    baseCosts[2] = baseCosts[1] < costsForOps[0] ? baseCosts[1] + baseCosts[1] : baseCosts[1] + costsForOps[0];
    
    // Calculate baseCosts[3]: min(cost(2->0) + cost(1->0), cost(3->0 via op3))
    baseCosts[3] = baseCosts[2] < costsForOps[1] ? baseCosts[2] + baseCosts[1] : baseCosts[1] + costsForOps[1];
    
    // Calculate baseCosts[4]: min(cost(3->0) + cost(1->0), cost(2->0) + cost(2->0 via op2), cost(1->0) + cost(5->0 via op5))
    let tempCostA = baseCosts[3] + baseCosts[1]; // Path: 4 -> 3 -> 0
    let tempCostB = baseCosts[2] + costsForOps[0]; // Path: 4 -> 2 (via op2) -> 0
    let tempCostC = baseCosts[1] + costsForOps[2]; // Path: 4 -> 5 (via op5) -> 0 (this is actually 4->1 + 1->0, not 4->5)
    
    if (tempCostC < tempCostB) {
      tempCostB = tempCostC;
    }
    if (tempCostB < tempCostA) {
      tempCostA = tempCostB;
    }
    baseCosts[4] = tempCostA;

    // Initialize the priority queue for Dijkstra's algorithm.
    const minPriorityQueue = new MinHeap();
    minPriorityQueue.insertElement(0n, targetNumber); // Start with cost 0 to reach the target number.

    // A map to store the minimum cost found so far to reach any given number.
    const minCostMap = new Map();
    minCostMap.set(targetNumber, 0n);

    // Main loop for Dijkstra's algorithm.
    while (true) {
      const [currentCost, currentNum] = minPriorityQueue.extractMin(); // Get the number with the smallest known cost.

      // If a shorter path to 'currentNum' has already been found, skip this entry.
      if (minCostMap.has(currentNum) && minCostMap.get(currentNum) < currentCost) {
        continue;
      }

      // If we have reached 0, we found the minimum cost. Print it and exit.
      if (currentNum === 0n) {
        console.log(currentCost.toString());
        break;
      }

      // For small numbers (0 to 4), use precomputed base costs to reach 0.
      if (currentNum < 5n) {
        const finalCostForZero = currentCost + baseCosts[Number(currentNum)];
        if (!minCostMap.has(0n) || minCostMap.get(0n) > finalCostForZero) {
          minCostMap.set(0n, finalCostForZero);
          minPriorityQueue.insertElement(finalCostForZero, 0n);
        }
        continue; // Proceed to the next iteration for small numbers.
      }

      // Explore possible operations (division by 2, 3, or 5) for larger numbers.
      for (let factorIndex = 0; factorIndex < 3; factorIndex++) {
        const divisor = primeFactors[factorIndex]; // The current prime factor (2n, 3n, or 5n).
        const opCost = costsForOps[factorIndex]; // The cost associated with this division operation.

        // Scenario 1: Divide 'currentNum' by 'divisor' using floor division.
        let nextNumFloor = currentNum / divisor;
        // Cost includes division cost plus cost for remainder (by subtracting 1s).
        let costToReachFloor = opCost + baseCosts[1] * (currentNum % divisor);
        // Alternative cost: repeatedly subtracting 1 until 'nextNumFloor' is reached.
        let costToReachFloorAlt = (currentNum - nextNumFloor) * baseCosts[1];
        
        if (costToReachFloorAlt < costToReachFloor) {
          costToReachFloor = costToReachFloorAlt;
        }

        // If a new minimum cost to 'nextNumFloor' is found, update and add to queue.
        if (!minCostMap.has(nextNumFloor) || minCostMap.get(nextNumFloor) > costToReachFloor + currentCost) {
          minCostMap.set(nextNumFloor, costToReachFloor + currentCost);
          minPriorityQueue.insertElement(costToReachFloor + currentCost, nextNumFloor);
        }

        // Scenario 2: If 'currentNum' is not perfectly divisible, consider dividing by 'divisor' using ceiling division.
        if (currentNum % divisor !== 0n) {
          let nextNumCeil = nextNumFloor + 1n;
          // Cost includes division cost plus cost to reach the next multiple (by adding 1s).
          let costToReachCeil = opCost + baseCosts[1] * (divisor - (currentNum % divisor));
          // Alternative cost: repeatedly subtracting 1 until 'nextNumCeil' is reached.
          let costToReachCeilAlt = (currentNum - nextNumCeil) * baseCosts[1];
          
          if (costToReachCeilAlt < costToReachCeil) {
            costToReachCeil = costToReachCeilAlt;
          }

          // If a new minimum cost to 'nextNumCeil' is found, update and add to queue.
          if (!minCostMap.has(nextNumCeil) || minCostMap.get(nextNumCeil) > costToReachCeil + currentCost) {
            minCostMap.set(nextNumCeil, costToReachCeil + currentCost);
            minPriorityQueue.insertElement(costToReachCeil + currentCost, nextNumCeil);
          }
        }
      }
    }
  }
}
