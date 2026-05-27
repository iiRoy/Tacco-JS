"use strict";

function executeMainLogic() {
  // Helper function to parse numbers from a string or array.
  function parseLineOfIntegers(inputLine) {
    // If input is already an array, map its elements to numbers.
    // Otherwise, split the string by whitespace and map to numbers.
    return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(Number);
  }

  /**
   * Represents an arbitrary-precision unsigned integer.
   * Uses an array of numbers, where each element stores a 'digit' in a large base.
   */
  class LargeNumber {
    // Constructor for the LargeNumber class.
    constructor(initialValue) {
      // Initialize parts array. It will store segments of the large number.
      // The initial size [0, 0, 0] is a heuristic, it will expand as needed.
      this.parts = [0, 0, 0];
      let currentIdx = 0;
      let tempValue = initialValue;

      // Convert the initial number into segments based on LargeNumber.baseValue.
      while (tempValue !== 0) {
        this.parts[currentIdx] = tempValue % LargeNumber.baseValue;
        tempValue = Math.floor(tempValue / LargeNumber.baseValue);
        currentIdx++;
      }
    }

    // Internal helper to safely get a part from an array, returning 0 if index is out of bounds.
    _getPart(arr, index) {
      return arr[index] || 0;
    }

    // Adds another LargeNumber to this one.
    add(rightOperand) {
      const result = new LargeNumber(0); // Start with a zero LargeNumber.
      const maxLength = Math.max(this.parts.length, rightOperand.parts.length);
      let carry = 0;
      let currentIdx = 0;

      for (; currentIdx < maxLength; currentIdx++) {
        const sum = this._getPart(this.parts, currentIdx) + this._getPart(rightOperand.parts, currentIdx) + carry;
        result.parts[currentIdx] = sum % LargeNumber.baseValue;
        carry = Math.floor(sum / LargeNumber.baseValue);
      }

      // If there's a remaining carry, add it as a new part.
      if (carry > 0) {
        result.parts[currentIdx] = carry;
      }

      return result;
    }

    // Multiplies this LargeNumber by another one.
    mul(rightOperand) {
      const result = new LargeNumber(0); // Start with a zero LargeNumber.

      for (let leftIdx = 0; leftIdx < this.parts.length; leftIdx++) {
        for (let rightIdx = 0; rightIdx < rightOperand.parts.length; rightIdx++) {
          const product = this._getPart(this.parts, leftIdx) * this._getPart(rightOperand.parts, rightIdx);
          let targetIdx = leftIdx + rightIdx;
          let valueToPropagate = product;

          // Propagate carries through the result parts.
          while (valueToPropagate > 0) {
            const sum = this._getPart(result.parts, targetIdx) + valueToPropagate;
            result.parts[targetIdx] = sum % LargeNumber.baseValue;
            valueToPropagate = Math.floor(sum / LargeNumber.baseValue);
            targetIdx++;
          }
        }
      }
      return result;
    }

    // Converts the LargeNumber to its string representation.
    toString() {
      // Create a copy and reverse it to process from most significant part.
      const reversedParts = this.parts.concat().reverse();

      // Find the index of the first non-zero part.
      const firstNonZeroIndex = reversedParts.findIndex(partVal => partVal !== 0);

      // If all parts are zero, the number is "0".
      if (firstNonZeroIndex === -1) {
        return "0";
      }

      // Helper function to format each part for string conversion.
      const formatPart = (partValue, indexInSlice) => {
        if (indexInSlice === 0) {
          // The most significant part is printed as is.
          return String(partValue);
        } else {
          // Other parts are padded with leading zeros to fill LargeNumber.baseDigits.
          return String(partValue).padStart(LargeNumber.baseDigits, "0");
        }
      };

      // Slice from the first non-zero part and map to formatted strings, then join.
      return reversedParts.slice(firstNonZeroIndex).map(formatPart).join("");
    }
  }

  /** Number of decimal digits stored per element in the parts array. */
  LargeNumber.baseDigits = 7;
  /** The base value for each part (e.g., 10^7). */
  LargeNumber.baseValue = Math.pow(10, LargeNumber.baseDigits);

  /**
   * Disjoint Set Union (DSU) data structure for integers in [0, N).
   */
  class DisjointSetUnion {
    constructor(numberOfElements) {
      this.elements = new Array(numberOfElements).fill(null).map(() => ({
        parent: null, // Parent pointer, null if root.
        size: 1 // Size of the set, only meaningful for root nodes.
      }));
    }

    /**
     * Finds the root of the set containing the given element, with path compression.
     * @param {number} elementIndex - The index of the element to find.
     * @returns {object} The root node object.
     */
    find(elementIndex) {
      let currentElement = this.elements[elementIndex];
      const pathNodes = []; // Stores nodes visited on the path to the root.

      // Traverse up the parent chain until the root is found.
      while (currentElement.parent != null) {
        pathNodes.push(currentElement);
        currentElement = currentElement.parent;
      }

      // Path compression: make all nodes on the path point directly to the root.
      for (const nodeToCompress of pathNodes) {
        nodeToCompress.parent = currentElement;
      }

      return currentElement; // Return the root node.
    }

    /**
     * Unions two sets containing elementIndexA and elementIndexB.
     * @param {number} elementIndexA - Index of the first element.
     * @param {number} elementIndexB - Index of the second element.
     * @returns {object|undefined} The new root of the merged set, or undefined if already in the same set.
     */
    union(elementIndexA, elementIndexB) {
      const rootA = this.find(elementIndexA);
      const rootB = this.find(elementIndexB);

      // If elements are already in the same set, do nothing.
      if (rootA === rootB) {
        return;
      }

      // Merge the sets: attach rootB's tree under rootA.
      rootB.parent = rootA;
      rootA.size += rootB.size; // Update the size of the merged set.
      return rootA; // Return the new root.
    }
  }

  // --- Main execution block ---
  // This IIFE processes the input and produces the output.
  ((rawInputString) => {
    const inputLines = rawInputString.split("\n");

    // Parse numNodes (number of nodes) and numEdges (number of edges/bridges) from the first line.
    const [numNodes, numEdges] = parseLineOfIntegers(inputLines[0]);

    // Parse bridge connections from subsequent lines.
    const edgeConnections = inputLines.slice(1, numEdges + 1).map((line) => {
      const [nodeA, nodeB] = parseLineOfIntegers(line);
      return {
        nodeA,
        nodeB
      };
    });

    const inconvenienceValues = []; // Stores the calculated inconvenience for each step.
    edgeConnections.reverse(); // Process bridges in reverse order of removal.

    const dsuStructure = new DisjointSetUnion(numNodes);
    let currentUnreachablePairCount = 0; // Tracks pairs of nodes that are currently unreachable.

    // Iterate through the bridges (now in reverse order of removal).
    for (const {
        nodeA,
        nodeB
      } of edgeConnections) {
      inconvenienceValues.push(currentUnreachablePairCount); // Store current count before processing this bridge.

      const rootOfA = dsuStructure.find(nodeA - 1); // Adjust to 0-indexed.
      const rootOfB = dsuStructure.find(nodeB - 1); // Adjust to 0-indexed.

      // If the nodes are already connected, adding this bridge changes nothing for reachability.
      if (rootOfA === rootOfB) {
        continue;
      }

      // If they were not connected, connecting them reduces the number of unreachable pairs.
      // The number of newly reachable pairs is (size of set A) * (size of set B).
      currentUnreachablePairCount += rootOfA.size * rootOfB.size;
      dsuStructure.union(nodeA - 1, nodeB - 1); // Perform the union operation.
    }

    inconvenienceValues.reverse(); // Reverse back to original order of bridge removal.

    // Calculate the total possible pairs of nodes.
    const totalPossiblePairs = numNodes * (numNodes - 1) / 2;

    // Helper function for final inconvenience calculation.
    const calculateFinalInconvenience = (totalPairs, unreachablePairs) => {
      return totalPairs - unreachablePairs;
    };

    // Map the stored unreachable pair counts to the final inconvenience values.
    const finalInconvenienceResults = inconvenienceValues.map((unreachablePairs) =>
      calculateFinalInconvenience(totalPossiblePairs, unreachablePairs)
    );

    // Print each result.
    for (const resultValue of finalInconvenienceResults) {
      console.log(resultValue);
    }
  })(require("fs").readFileSync("/dev/stdin", "utf8"));
}

executeMainLogic();
