"use strict";

// Utility function to safely extract elements from an array-like structure.
// This is a re-implementation of a common pattern for destructuring assignments.
function extractParts(inputArray, expectedCount) {
  // Check if the input is already an array.
  if (Array.isArray(inputArray)) return inputArray;
  // If not an array, attempt to iterate and collect elements.
  let collectedItems = [];
  let isDone = false;
  let iteratorError = undefined;
  try {
    // Acquire the iterator for the input.
    for (let currentIterator = inputArray[Symbol.iterator](), currentItem; !(isDone = (currentItem = currentIterator.next()).done); isDone = true) {
      collectedItems.push(currentItem.value);
      // If a specific count is expected and reached, stop early.
      if (expectedCount && collectedItems.length === expectedCount) break;
    }
  } catch (err) {
    iteratorError = err; // Store any error during iteration.
  } finally {
    try {
      // Ensure the iterator is properly closed if it has a 'return' method.
      if (!isDone && currentIterator["return"] != null) {
        currentIterator["return"]();
      }
    } finally {
      // Re-throw any stored iteration error.
      if (iteratorError) throw iteratorError;
    }
  }
  return collectedItems;
}

// Helper for when an iterable is expected but a non-iterable is provided for destructuring.
function enforceIterable() {
  throw new TypeError("Cannot destructure non-iterable instance. Provided value must be iterable.");
}

// Helper to confirm an object is an instance of a constructor.
function verifyInstance(obj, constructorFunc) {
  if (!(obj instanceof constructorFunc)) {
    throw new TypeError("Class constructor cannot be invoked without 'new'");
  }
}

// Helper to attach properties to an object (used for class methods/getters/setters).
function defineObjectProps(targetObject, propertyDescriptors) {
  for (let idx = 0; idx < propertyDescriptors.length; idx++) {
    const currentDescriptor = propertyDescriptors[idx];
    currentDescriptor.enumerable = currentDescriptor.enumerable || false;
    currentDescriptor.configurable = true;
    if ("value" in currentDescriptor) currentDescriptor.writable = true;
    Object.defineProperty(targetObject, currentDescriptor.key, currentDescriptor);
  }
}

// Helper to construct a class with prototype and static properties.
function constructClass(ConstructorRef, prototypeProps, staticProps) {
  if (prototypeProps) defineObjectProps(ConstructorRef.prototype, prototypeProps);
  if (staticProps) defineObjectProps(ConstructorRef, staticProps);
  return ConstructorRef;
}

// Main application logic encapsulated in an immediately invoked function expression.
!function () {

  // The Fenwick Tree (Binary Indexed Tree) data structure.
  // This structure efficiently calculates prefix sums and updates individual elements.
  const FenwickTree = /*#__PURE__*/ (function () {
    // Constructor initializes the tree with a given maximum size.
    function FenwickTree(maxSize) {
      verifyInstance(this, FenwickTree); // Ensure 'new' keyword was used.
      this.maximumSize = maxSize; // The maximum index this tree can handle.
      this.treeValues = new Array(maxSize + 1).fill(0); // Internal array storing tree data.
    }

    // Define methods for the FenwickTree class.
    constructClass(FenwickTree, [{
      key: "updateValue",
      // Adds a 'delta' value to the element at 'targetIndex'.
      // All prefix sums affected by this index are updated.
      value: function updateValue(targetIndex, delta) {
        let currentIdx = targetIndex;
        // Iterate through the tree, updating parent nodes.
        while (currentIdx <= this.maximumSize) {
          this.treeValues[currentIdx] += delta;
          currentIdx += currentIdx & (-currentIdx); // Move to the next parent.
        }
      }
    }, {
      key: "queryPrefixSum",
      // Calculates the sum of elements from index 1 up to 'targetIndex'.
      value: function queryPrefixSum(targetIndex) {
        let cumulativeSum = 0;
        let currentIdx = targetIndex;
        // Iterate through the tree, summing up relevant nodes.
        while (currentIdx > 0) {
          cumulativeSum += this.treeValues[currentIdx];
          currentIdx -= currentIdx & (-currentIdx); // Move to the next ancestor.
        }
        return cumulativeSum;
      }
    }]);

    return FenwickTree;
  }());

  // A utility class for coordinate compression.
  // It maps original values to a smaller, contiguous range of indices.
  const CoordinateMapper = /*#__PURE__*/ (function () {
    function CoordinateMapper(rawElements) {
      verifyInstance(this, CoordinateMapper);

      // Guard against empty input to avoid errors.
      if (!rawElements || rawElements.length === 0) {
        this.originalValues = [];
        this.valueToIndexMap = new Map();
        this.distinctElementCount = 0;
        this.minOriginal = null;
        this.maxOriginal = null;
        return;
      }

      // 1. Collect unique elements using a Set.
      const uniqueSortedElements = Array.from(new Set(rawElements)).sort((valA, valB) => valA - valB);

      this.minOriginal = uniqueSortedElements[0];
      this.maxOriginal = uniqueSortedElements[uniqueSortedElements.length - 1];

      this.originalValues = uniqueSortedElements; // Stores sorted unique original values.
      this.valueToIndexMap = new Map(); // Maps original value to its compressed index.
      this.distinctElementCount = uniqueSortedElements.length;

      // 2. Populate the mapping from original value to compressed index.
      for (let k = 0; k < uniqueSortedElements.length; k++) {
        this.valueToIndexMap.set(uniqueSortedElements[k], k);
      }
    }

    // Define methods for the CoordinateMapper class.
    constructClass(CoordinateMapper, [{
      key: "getOriginal",
      // Retrieves the original value given a compressed index.
      value: function getOriginal(compressedIdx) {
        // Add a bounds check for robustness.
        if (compressedIdx < 0 || compressedIdx >= this.originalValues.length) {
          console.warn(`Attempted to access original value with out-of-bounds index: ${compressedIdx}`);
          return undefined; // Or throw an error.
        }
        return this.originalValues[compressedIdx];
      }
    }, {
      key: "getMappedIndex",
      // Retrieves the compressed index given an original value.
      value: function getMappedIndex(originalVal) {
        return this.valueToIndexMap.get(originalVal);
      }
    }, {
      key: "getTotalDistinctCount",
      // Returns the total number of distinct elements after compression.
      value: function getTotalDistinctCount() {
        return this.distinctElementCount;
      }
    }]);

    return CoordinateMapper;
  }());

  // Parses a line of text, splitting it by whitespace and converting parts to integers.
  function parseNumericLine(textData) {
    // If the input is already an array, assume it's pre-parsed numbers.
    // Otherwise, split the string by one or more whitespace characters.
    const stringParts = Array.isArray(textData) ? textData : textData.split(/\s+/);
    // Convert each string part to an integer.
    return stringParts.map((numericStr) => Number(numericStr));
  }

  // Main processing function that takes raw input and performs operations.
  !function (rawData) {
    const inputLines = rawData.split("\n").filter(line => line.trim() !== ''); // Filter out empty lines.

    // Parse the first line to get the total number of queries.
    const [totalQueries] = extractParts(parseNumericLine(inputLines[0]), 1);

    // Validate totalQueries.
    if (totalQueries <= 0) {
      // console.error("No queries provided or invalid query count.");
      return; // Exit if no queries.
    }

    // Process all query lines into a structured array.
    const processedQueries = inputLines.slice(1, totalQueries + 1).map((currentLine) => {
      const [queryKind, firstParam, secondParam] = extractParts(parseNumericLine(currentLine), 3);
      return {
        kind: queryKind,
        arg1: firstParam,
        arg2: secondParam
      };
    });

    // Extract all 'a' parameters from queries of type 1 for coordinate compression.
    const valuesToCompress = [];
    for (const q of processedQueries) {
      if (q.kind === 1) {
        valuesToCompress.push(q.arg1);
      }
    }
    
    // Create a CoordinateMapper instance for the relevant values.
    const valueCompressor = new CoordinateMapper(valuesToCompress);
    
    // Initialize the Fenwick Tree with the count of distinct values.
    const treeStructure = new FenwickTree(valueCompressor.getTotalDistinctCount());

    // Variables to track the state of the minimum point and its associated cost.
    let currentMinimumCost = 0;
    // The optimal position (compressed index) in the data structure.
    // Initialized to null, signifying no elements added yet.
    let optimalPositionIndex = null; 

    // Iterate through each processed query.
    for (const currentQuery of processedQueries) {
      const { kind: queryKind, arg1: paramA, arg2: paramB } = currentQuery;

      if (queryKind === 1) { // Type 1 query: Add an element and update costs.
        // Get the compressed index for paramA. Add 1 because Fenwick Tree is 1-indexed.
        const compressedIndexA = valueCompressor.getMappedIndex(paramA) + 1;

        // Perform Fenwick Tree updates:
        // - Decrement count for index 1 (effectively increasing the range of negative values)
        // - Increment count by 2 for the compressedIndexA (effectively shifting the zero point)
        treeStructure.updateValue(1, -1);
        treeStructure.updateValue(compressedIndexA, 2);

        // Update the current minimum cost.
        if (optimalPositionIndex === null) {
          // If this is the first element, the initial cost is just paramB.
          currentMinimumCost = paramB;
        } else {
          // Calculate the absolute difference between the new element and the previous optimal point.
          // Add this difference and paramB to the current minimum cost.
          const prevOptimalOriginalValue = valueCompressor.getOriginal(optimalPositionIndex);
          const costDelta = Math.abs(paramA - prevOptimalOriginalValue);
          currentMinimumCost += costDelta + paramB;
        }
        
        // Recalculate the new optimal position (median-like point).
        optimalPositionIndex = findOptimalPosition();

      } else if (queryKind === 2) { // Type 2 query: Output the current state.
        // Retrieve the original value corresponding to the optimal compressed index.
        const originalOptimalValue = valueCompressor.getOriginal(optimalPositionIndex);
        // Output the original value and the current minimum cost.
        console.log(`${originalOptimalValue} ${currentMinimumCost}`);
      }
    }

    // Helper function to find the optimal position (compressed index) in the Fenwick Tree.
    // This uses binary search to find the smallest index 'k' such that the prefix sum up to 'k' is >= 0.
    function findOptimalPosition() {
      let searchStart = 1; // Minimum possible compressed index (1-indexed).
      let searchEnd = valueCompressor.getTotalDistinctCount() + 1; // One past max possible index.
      let resultIndex = -1; // To store the found optimal index.

      // Binary search loop.
      while (searchStart < searchEnd) {
        // Calculate the middle point.
        const midPoint = searchStart + Math.floor((searchEnd - searchStart) / 2);
        // Query the prefix sum up to the middle point.
        const prefixSumAtMid = treeStructure.queryPrefixSum(midPoint);

        if (prefixSumAtMid > 0) {
          // If sum is positive, the optimal point is at or before midPoint.
          resultIndex = midPoint; // This could be our answer.
          searchEnd = midPoint; // Search in the left half.
        } else if (prefixSumAtMid === 0) {
          // If sum is zero, midPoint itself is a candidate.
          // We prefer the smallest such index, so we record it and continue searching left.
          resultIndex = midPoint;
          searchEnd = midPoint; // Search in the left half, could find an even smaller one.
        } else { // prefixSumAtMid < 0
          // If sum is negative, the optimal point must be after midPoint.
          searchStart = midPoint + 1; // Search in the right half.
        }
      }
      
      // If no suitable index was found (shouldn't happen with valid data), fall back.
      if (resultIndex === -1) {
          // Fallback to the smallest possible index if binary search fails to converge.
          return 0; // Corresponds to the first compressed value.
      }

      // Convert the 1-indexed Fenwick Tree result back to 0-indexed for the compressor.
      return resultIndex - 1;
    }

  }(require("node:fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard input.
}();