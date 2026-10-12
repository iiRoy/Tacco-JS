"use strict";

/**
 * Utility function to safely destructure an array-like object.
 * @param {Array|Iterable} sourceArr The array or iterable to destructure.
 * @param {number} elementCount The number of elements expected.
 * @returns {Array} An array containing the destructured elements.
 */
function _destructureArrayElements(sourceArr, elementCount) {
  // Check if it's a valid array first.
  const validatedArray = _checkArrayValidity(sourceArr);
  if (validatedArray) return validatedArray;

  // If not a simple array, try to limit an iterable.
  const limitedIterable = _limitIterableToArray(sourceArr, elementCount);
  if (limitedIterable) return limitedIterable;

  // If all else fails, throw an error for non-iterable rest.
  return _handleNonIterableDestructuring();
}

/**
 * Throws an error indicating an invalid attempt to destructure a non-iterable instance.
 * This function handles cases where destructuring assignment fails for non-array/non-iterable types.
 * @throws {TypeError} Always throws a TypeError.
 */
function _handleNonIterableDestructuring() {
  throw new TypeError("Invalid attempt to destructure a non-iterable instance. Check source data type.");
}

/**
 * Attempts to convert an iterable into an array, limiting its size if specified.
 * @param {Iterable} inputIterable The iterable object.
 * @param {number} [limit] The maximum number of elements to extract.
 * @returns {Array|null} An array of extracted elements up to the limit, or null if not an iterable.
 */
function _limitIterableToArray(inputIterable, limit) {
  const resultArr = [];
  let isDone = false;
  let hasError = false;
  let currentError = undefined;

  try {
    // Obtain the iterator for the input.
    const iterator = inputIterable[Symbol.iterator]();
    let iteratorStep;

    // Loop through the iterator steps.
    while (!(isDone = (iteratorStep = iterator.next()).done)) {
      resultArr.push(iteratorStep.value);
      // Break if limit is reached and specified.
      if (limit && resultArr.length === limit) break;
    }
  } catch (err) {
    hasError = true;
    currentError = err;
  } finally {
    // Ensure iterator's 'return' method is called if available and not already done.
    try {
      if (!isDone && iterator && typeof iterator["return"] === "function") {
        iterator["return"]();
      }
    } finally {
      // Re-throw any error encountered during iteration.
      if (hasError) throw currentError;
    }
  }
  return resultArr;
}

/**
 * Checks if the given input is a valid array and returns it.
 * @param {any} inputCandidate The value to check.
 * @returns {Array|null} The input array if it's an array, otherwise null.
 */
function _checkArrayValidity(inputCandidate) {
  if (Array.isArray(inputCandidate)) {
    return inputCandidate;
  }
  return null;
}

/**
 * Enforces that a class constructor is called with `new`.
 * @param {object} instance The `this` context of the constructor.
 * @param {Function} Constructor The constructor function itself.
 * @throws {TypeError} If the constructor was not called with `new`.
 */
function _ensureClassInstantiated(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function. Use 'new' keyword.");
  }
}

/**
 * Defines properties on an object.
 * @param {object} targetObject The object to define properties on.
 * @param {Array<object>} propertyDescriptors An array of property descriptor objects.
 */
function _defineObjectProperties(targetObject, propertyDescriptors) {
  for (let idx = 0; idx < propertyDescriptors.length; idx++) {
    const currentDescriptor = propertyDescriptors[idx];
    // Ensure default descriptor properties are set if not present.
    currentDescriptor.enumerable = currentDescriptor.enumerable ?? false;
    currentDescriptor.configurable = currentDescriptor.configurable ?? true;
    if ("value" in currentDescriptor) {
      currentDescriptor.writable = currentDescriptor.writable ?? true;
    }
    Object.defineProperty(targetObject, currentDescriptor.key, currentDescriptor);
  }
}

/**
 * Creates a class definition by applying prototype and static properties.
 * @param {Function} ClassConstructor The constructor function of the class.
 * @param {Array<object>} [prototypeProperties] An array of property descriptors for the prototype.
 * @param {Array<object>} [staticProperties] An array of property descriptors for static methods/properties.
 * @returns {Function} The fully defined class constructor.
 */
function _constructClassDefinition(ClassConstructor, prototypeProperties, staticProperties) {
  // Apply prototype properties if provided.
  if (prototypeProperties) {
    _defineObjectProperties(ClassConstructor.prototype, prototypeProperties);
  }
  // Apply static properties if provided.
  if (staticProperties) {
    _defineObjectProperties(ClassConstructor, staticProperties);
  }
  return ClassConstructor;
}

// Self-executing anonymous function to encapsulate the application's scope.
// It receives the file system module as an argument.
(function (fileSystemOps) {
  "use strict"; // Ensure strict mode within this module as well.

  /**
   * Represents a node in the AugmentedBinaryTree (Treap).
   * @typedef {object} TreeNode
   * @property {any} dataPayload - The actual data stored in the node.
   * @property {number} sortKey - The key used for binary search tree ordering.
   * @property {number} randPriority - The random priority used for heap ordering.
   * @property {TreeNode|null} leftChild - Reference to the left child node.
   * @property {TreeNode|null} rightChild - Reference to the right child node.
   * @property {number} subtreeSize - The number of nodes in the subtree rooted at this node (including itself).
   */

  /**
   * An Augmented Binary Search Tree (Treap) implementation.
   * Combines properties of a Binary Search Tree (keys ordered) and a Binary Heap (priorities ordered).
   * Nodes also track subtree size.
   */
  const AugmentedBinaryTree =
  /*#__PURE__*/
  (function () {
    /**
     * Initializes a new AugmentedBinaryTree instance.
     * @param {function(any): number} [keyExtractor] - A function to extract the sort key from a value.
     *   If not provided, the value itself is used as the key.
     */
    function AugmentedBinaryTree(keyExtractor) {
      _ensureClassInstantiated(this, AugmentedBinaryTree); // Ensure 'new' was used.

      // Store the function to determine the sort key for elements.
      this.comparisonKeyFn = keyExtractor || function (val) {
        return val;
      };
      // The root of the treap. Initially null for an empty tree.
      this.treeRoot = null;
      // Keep track of the total number of elements in the tree.
      this._totalElements = 0;
    }

    _constructClassDefinition(AugmentedBinaryTree, [{
      key: "addEntry",
      value: function addEntry(elementData) {
        // Generate a random priority for the new node.
        const nodePriority = Math.random();
        // Create the new node object.
        const newNode = {
          dataPayload: elementData,
          sortKey: this.comparisonKeyFn(elementData),
          randPriority: nodePriority,
          leftChild: null,
          rightChild: null,
          subtreeSize: 1 // A new node initially has a size of 1.
        };
        // Recursively insert the new node into the tree.
        const oldRoot = this.treeRoot;
        this.treeRoot = this._recursiveInsert(this.treeRoot, newNode);
        // Only increment if a new node was actually added (not a duplicate key or null root).
        if (oldRoot !== this.treeRoot || (this.treeRoot && this.treeRoot === newNode)) {
            this._totalElements++;
        }
      }
    }, {
      key: "removeEntry",
      value: function removeEntry(elementValue) {
        // Extract the sort key for the element to be removed.
        const targetKey = this.comparisonKeyFn(elementValue);
        // Recursively remove the node from the tree.
        this.treeRoot = this._recursiveErase(this.treeRoot, targetKey);
      }
    }, {
      key: "hasElement",
      value: function hasElement(elementValue) {
        // Use the iterative search method to find the node.
        return null !== this._iterativeSearchNode(elementValue);
      }
    }, {
      key: "findSmallestValue",
      value: function findSmallestValue() {
        let currentNode = this.treeRoot;
        // Traverse left until the leftmost node is found.
        while (currentNode !== null && currentNode.leftChild !== null) {
          currentNode = currentNode.leftChild;
        }
        // Return the data payload of the leftmost node, or null if the tree is empty.
        return currentNode ? currentNode.dataPayload : null;
      }
    }, {
      key: "findLargestValue",
      value: function findLargestValue() {
        let currentNode = this.treeRoot;
        // Traverse right until the rightmost node is found.
        while (currentNode !== null && currentNode.rightChild !== null) {
          currentNode = currentNode.rightChild;
        }
        // Return the data payload of the rightmost node, or null if the tree is empty.
        return currentNode ? currentNode.dataPayload : null;
      }
    }, {
      key: "isEmpty",
      value: function isEmpty() {
        return this.treeRoot === null;
      }
    }, {
      key: "size",
      get: function() {
        return this._totalElements; // Return the cached size.
      }
    }, {
      key: "_updateSubtreeSize",
      value: function _updateSubtreeSize(node) {
        if (node === null) return 0;
        node.subtreeSize = 1 + this._getSubtreeSize(node.leftChild) + this._getSubtreeSize(node.rightChild);
        return node.subtreeSize;
      }
    }, {
      key: "_getSubtreeSize",
      value: function _getSubtreeSize(node) {
        return node === null ? 0 : node.subtreeSize;
      }
    }, {
      key: "_recursiveInsert",
      value: function _recursiveInsert(currentSubtreeRoot, newNode) {
        // Base case: if the current root is null, the new node becomes the root of this subtree.
        if (currentSubtreeRoot === null) {
          return newNode;
        }

        // If the new node's key is identical to the current node's key,
        // do not insert. Original behavior.
        if (newNode.sortKey === currentSubtreeRoot.sortKey) {
          return currentSubtreeRoot;
        }

        // Decide whether to go left or right based on the sort key.
        if (newNode.sortKey < currentSubtreeRoot.sortKey) {
          currentSubtreeRoot.leftChild = this._recursiveInsert(currentSubtreeRoot.leftChild, newNode);
          // After insertion, check heap property (priority).
          // If the child's priority is lower (higher value) than parent's, rotate right.
          if (currentSubtreeRoot.leftChild.randPriority < currentSubtreeRoot.randPriority) {
            currentSubtreeRoot = this._performRightRotation(currentSubtreeRoot);
          }
        } else { // newNode.sortKey > currentSubtreeRoot.sortKey
          currentSubtreeRoot.rightChild = this._recursiveInsert(currentSubtreeRoot.rightChild, newNode);
          // After insertion, check heap property (priority).
          // If the child's priority is lower (higher value) than parent's, rotate left.
          if (currentSubtreeRoot.rightChild.randPriority < currentSubtreeRoot.randPriority) {
            currentSubtreeRoot = this._performLeftRotation(currentSubtreeRoot);
          }
        }

        // Update the subtree size after potential rotations or insertions.
        this._updateSubtreeSize(currentSubtreeRoot);
        return currentSubtreeRoot;
      }
    }, {
      key: "_performRightRotation",
      value: function _performRightRotation(parentNode) {
        // Guard against null left child, which would make rotation invalid.
        if (parentNode === null || parentNode.leftChild === null) {
          return parentNode;
        }
        const pivotNode = parentNode.leftChild;
        // Perform rotation: parent's left child becomes pivot's right child.
        parentNode.leftChild = pivotNode.rightChild;
        // Pivot's right child becomes the parent.
        pivotNode.rightChild = parentNode;

        // Update sizes after rotation. Order matters: parent first, then pivot.
        this._updateSubtreeSize(parentNode);
        this._updateSubtreeSize(pivotNode);

        return pivotNode; // The pivot node is the new root of this subtree.
      }
    }, {
      key: "_performLeftRotation",
      value: function _performLeftRotation(parentNode) {
        // Guard against null right child.
        if (parentNode === null || parentNode.rightChild === null) {
          return parentNode;
        }
        const pivotNode = parentNode.rightChild;
        // Perform rotation: parent's right child becomes pivot's left child.
        parentNode.rightChild = pivotNode.leftChild;
        // Pivot's left child becomes the parent.
        pivotNode.leftChild = parentNode;

        // Update sizes after rotation. Order matters.
        this._updateSubtreeSize(parentNode);
        this._updateSubtreeSize(pivotNode);

        return pivotNode; // The pivot node is the new root of this subtree.
      }
    }, {
      key: "_recursiveErase",
      value: function _recursiveErase(currentSubtreeRoot, targetKey) {
        // Base case: element not found.
        if (currentSubtreeRoot === null) {
          return null;
        }

        if (targetKey < currentSubtreeRoot.sortKey) {
          // If key is smaller, go left.
          currentSubtreeRoot.leftChild = this._recursiveErase(currentSubtreeRoot.leftChild, targetKey);
        } else if (targetKey > currentSubtreeRoot.sortKey) {
          // If key is larger, go right.
          currentSubtreeRoot.rightChild = this._recursiveErase(currentSubtreeRoot.rightChild, targetKey);
        } else {
          // Found the node to delete.
          // If it's a leaf node.
          if (currentSubtreeRoot.leftChild === null && currentSubtreeRoot.rightChild === null) {
            this._totalElements--; // Decrement count when node is actually removed.
            return null; // Remove the node.
          }

          // If only one child exists.
          if (currentSubtreeRoot.leftChild === null) {
            this._totalElements--; // Decrement count.
            return currentSubtreeRoot.rightChild;
          }
          if (currentSubtreeRoot.rightChild === null) {
            this._totalElements--; // Decrement count.
            return currentSubtreeRoot.leftChild;
          }

          // If two children exist, rotate the node down based on priority
          // until it becomes a leaf or has only one child.
          const leftPriority = currentSubtreeRoot.leftChild ? currentSubtreeRoot.leftChild.randPriority : -Infinity;
          const rightPriority = currentSubtreeRoot.rightChild ? currentSubtreeRoot.rightChild.randPriority : -Infinity;

          if (leftPriority > rightPriority) {
            // Left child has higher priority (smaller value), rotate right.
            currentSubtreeRoot = this._performRightRotation(currentSubtreeRoot);
            // Recursively delete from the right child (where the node has moved).
            currentSubtreeRoot.rightChild = this._recursiveErase(currentSubtreeRoot.rightChild, targetKey);
          } else {
            // Right child has higher priority, rotate left.
            currentSubtreeRoot = this._performLeftRotation(currentSubtreeRoot);
            // Recursively delete from the left child (where the node has moved).
            currentSubtreeRoot.leftChild = this._recursiveErase(currentSubtreeRoot.leftChild, targetKey);
          }
        }

        // Update subtree size after any modifications/rotations.
        if (currentSubtreeRoot) {
            this._updateSubtreeSize(currentSubtreeRoot);
        }
        return currentSubtreeRoot;
      }
    }, {
      key: "_iterativeSearchNode",
      value: function _iterativeSearchNode(targetValue) {
        let currentNode = this.treeRoot;
        // Keep traversing until the node is found or a null link is encountered.
        while (currentNode !== null) {
          // If the current node's data matches the target, return the node.
          if (currentNode.dataPayload === targetValue) {
            return currentNode;
          }
          // Decide whether to go left or right.
          if (targetValue < currentNode.dataPayload) {
            currentNode = currentNode.leftChild;
          } else {
            currentNode = currentNode.rightChild;
          }
        }
        // If loop finishes, element was not found.
        return null;
      }
    }]);

    return AugmentedBinaryTree;
  })();

  /**
   * Parses a string or array of strings into an array of integers.
   * Handles whitespace separation for string input.
   * @param {string|string[]} inputLine - The line(s) to parse.
   * @returns {number[]} An array of parsed integers.
   */
  function parseNumericLine(inputLine) {
    if (typeof inputLine === 'string') {
        const parts = inputLine.trim().split(/\s+/);
        // Filter out empty strings that might result from extra whitespace.
        const numericParts = parts.filter(part => part.length > 0);
        // Use Number() constructor for parsing, which also handles non-numeric strings to NaN.
        return numericParts.map(Number);
    } else if (Array.isArray(inputLine)) {
        // If already an array, ensure all elements are numbers.
        return inputLine.map(Number);
    }
    // Handle invalid input type.
    applicationLogger("Warning: parseNumericLine received unexpected input type: " + typeof inputLine);
    return [];
  }

  /**
   * Sorts an array of objects based on one or more keys/criteria.
   * @param {Array<object>} collection - The array of objects to sort.
   * @param {Array<string|Array>} criteria - An array of sort criteria.
   *   Each criterion can be a string (for ascending sort by that key)
   *   or an array `[key, direction]` where direction is "asc", "desc", or a number (1 for asc, -1 for desc).
   * @returns {Array<object>} The sorted array.
   */
  function orderItemsByCriteria(collection, criteria) {
    // Ensure criteria is always an array for consistent processing.
    const sortCriteria = Array.isArray(criteria) ? criteria : [criteria];

    // Return a shallow copy of the array sorted.
    return [...collection].sort((itemA, itemB) => {
      for (const criterion of sortCriteria) {
        let keyName;
        let sortDirection = 1; // Default to ascending.

        if (typeof criterion === "string") {
          keyName = criterion;
        } else if (Array.isArray(criterion) && criterion.length >= 1) {
          keyName = criterion[0];
          if (criterion.length > 1) {
            const dir = criterion[1];
            if (dir === "desc") sortDirection = -1;
            else if (dir === "asc") sortDirection = 1;
            else if (typeof dir === "number") sortDirection = dir;
          }
        } else {
          // Skip invalid criteria.
          continue;
        }

        const valueA = itemA[keyName];
        const valueB = itemB[keyName];

        // Basic numeric comparison.
        if (valueA < valueB) return -1 * sortDirection;
        if (valueA > valueB) return 1 * sortDirection;
      }
      return 0; // All criteria equal.
    });
  }

  /**
   * A simple logger function that can be easily swapped out for a more complex one.
   * @param {any} message - The message to log.
   */
  function applicationLogger(message) {
    console.log(message);
  }

  // --- Main Execution Block ---
  (function processInputAndSolve() {
    const INPUT_FILE_PATH = "/dev/stdin";
    const EVENT_TIME_EPSILON_START = 0.000001; // Small delta to ensure strict inequality for event timing
    const EVENT_TIME_EPSILON_END = 0.000002; // A slightly different epsilon for end times

    let rawInputContent;
    try {
      rawInputContent = fileSystemOps.readFileSync(INPUT_FILE_PATH, "utf8");
    } catch (error) {
      applicationLogger(`Error reading input file: ${error.message}`);
      return; // Exit if input cannot be read.
    }

    const inputLines = rawInputContent.split("\n").filter(line => line.trim().length > 0); // Filter empty lines.
    if (inputLines.length === 0) {
        applicationLogger("Empty input received. Exiting.");
        return;
    }

    // Parse the first line for total projects (N) and total queries (Q).
    const [totalProjects, totalQueries] = _destructureArrayElements(parseNumericLine(inputLines[0]), 2);

    // Basic validation for N and Q.
    if (isNaN(totalProjects) || isNaN(totalQueries) || totalProjects < 0 || totalQueries < 0) {
        applicationLogger("Invalid N or Q values in input. Exiting.");
        return;
    }

    // Extract and process construction project data.
    const constructionTasks = inputLines.slice(1, totalProjects + 1).map((line, idx) => {
      const [startCoord, endCoord, offsetValue] = _destructureArrayElements(parseNumericLine(line), 3);
      // Validate project data.
      if (isNaN(startCoord) || isNaN(endCoord) || isNaN(offsetValue)) {
          applicationLogger(`Warning: Invalid project data on line ${idx + 2}. Skipping.`);
          return null; // Return null for invalid entries.
      }
      return {
        projectId: idx, // Original 'i' field renamed and made more descriptive.
        startCoord: startCoord,
        endCoord: endCoord,
        offsetValue: offsetValue,
        // Calculate effective start and end times with small deltas.
        effectiveStartMoment: startCoord - offsetValue - EVENT_TIME_EPSILON_START,
        effectiveEndMoment: endCoord - offsetValue - EVENT_TIME_EPSILON_END
      };
    }).filter(task => task !== null); // Filter out any null (invalid) tasks.

    // Extract and process query days.
    const observationPoints = parseNumericLine(inputLines.slice(totalProjects + 1).join(' ')).slice(0, totalQueries);
    if (observationPoints.some(isNaN)) {
        applicationLogger("Warning: Some query days are invalid numbers. They will be treated as NaN.");
    }

    // Prepare a list of all timeline events (add/delete project offsets).
    const timelineEvents = [];
    constructionTasks.forEach(task => {
      // Add event for when a project's offset becomes active.
      timelineEvents.push({
        eventType: "project_start",
        eventTime: task.effectiveStartMoment,
        eventOffset: task.offsetValue
      });
      // Add event for when a project's offset becomes inactive.
      timelineEvents.push({
        eventType: "project_end",
        eventTime: task.effectiveEndMoment,
        eventOffset: task.offsetValue
      });
    });

    // Sort all events chronologically.
    const sortedTimelineEvents = orderItemsByCriteria(timelineEvents, ["eventTime"]);

    let queryIndex = 0; // Pointer for the observationPoints array.
    const currentOffsetsStructure = new AugmentedBinaryTree(); // Our Treap instance.

    // Process events and queries simultaneously.
    for (const currentEvent of sortedTimelineEvents) {
      const { eventType, eventTime, eventOffset } = currentEvent;

      // Process all pending queries whose observation time is before the current event time.
      while (queryIndex < observationPoints.length && eventTime > observationPoints[queryIndex]) {
        const minimumActiveOffset = currentOffsetsStructure.findSmallestValue();
        // Log the minimum offset, or -1 if no projects are active.
        applicationLogger(minimumActiveOffset ?? -1);
        queryIndex++;
      }

      // Handle the current event: add or remove an offset from the active set.
      if (eventType === "project_start") {
        currentOffsetsStructure.addEntry(eventOffset);
      } else if (eventType === "project_end") {
        currentOffsetsStructure.removeEntry(eventOffset);
      }
    }

    // After all events are processed, handle any remaining queries.
    while (queryIndex < observationPoints.length) {
      const minimumActiveOffset = currentOffsetsStructure.findSmallestValue();
      applicationLogger(minimumActiveOffset ?? -1);
      queryIndex++;
    }
  })(); // End of main execution block IIFE.

})(require("fs")); // Pass the Node.js 'fs' module to the outer IIFE.