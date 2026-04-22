"use strict"; /* Strict mode enabled for the module */

/**
 * Helper function to safely destructure an array-like object.
 * @param {Array|Iterable} sourceArray - The array or iterable to destructure.
 * @param {number} limit - The maximum number of elements to extract.
 * @returns {Array} The destructured array.
 */
function _destructureArray(sourceArray, limit) {
  return _checkArrayValidity(sourceArray) || _iterateWithLimit(sourceArray, limit) || _throwNonIterableError();
}

/**
 * Throws an error for invalid attempts to destructure non-iterable instances.
 * This is a Babel-generated helper.
 */
function _throwNonIterableError() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

/**
 * Iterates over an array-like object up to a specified limit.
 * @param {Array|Iterable} sourceArray - The array or iterable to process.
 * @param {number} limit - The maximum number of items to collect.
 * @returns {Array|null} An array of collected items, or null if not iterable.
 */
function _iterateWithLimit(sourceArray, limit) {
  var collectedItems = [];
  var isNotDone = true;
  var didErrorOccur = false;
  var capturedError = undefined;
  try {
    for (var iteratorObj = sourceArray[Symbol.iterator](), iteratorResult; !(isNotDone = (iteratorResult = iteratorObj.next()).done); isNotDone = true) {
      collectedItems.push(iteratorResult.value);
      if (limit && collectedItems.length === limit) break;
    }
  } catch (caughtException) {
    didErrorOccur = true;
    capturedError = caughtException;
  } finally {
    try {
      if (!isNotDone && iteratorObj["return"] != null) iteratorObj["return"]();
    } finally {
      if (didErrorOccur) throw capturedError;
    }
  }
  return collectedItems;
}

/**
 * Checks if the given input is a valid array.
 * @param {any} sourceArray - The value to check.
 * @returns {Array|null} The array itself if valid, otherwise null.
 */
function _checkArrayValidity(sourceArray) {
  if (Array.isArray(sourceArray)) return sourceArray;
}

/**
 * Ensures a class constructor is called with 'new'.
 * @param {object} objectInstance - The instance being created.
 * @param {Function} ClassReference - The constructor function.
 * @throws {TypeError} If the constructor is not called with 'new'.
 */
function _ensureInstanceType(objectInstance, ClassReference) {
  if (!(objectInstance instanceof ClassReference)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/**
 * Defines properties on an object.
 * @param {object} targetObject - The object to define properties on.
 * @param {Array<object>} propertyDescriptors - An array of property descriptors.
 */
function _configureProperties(targetObject, propertyDescriptors) {
  for (var k = 0; k < propertyDescriptors.length; k++) {
    var propDescriptor = propertyDescriptors[k];
    propDescriptor.enumerable = propDescriptor.enumerable || false;
    propDescriptor.configurable = true;
    if ("value" in propDescriptor) propDescriptor.writable = true;
    Object.defineProperty(targetObject, propDescriptor.key, propDescriptor);
  }
}

/**
 * Creates a class with prototype and static properties.
 * @param {Function} ClassReference - The constructor function.
 * @param {Array<object>} prototypeProperties - Descriptors for prototype methods/properties.
 * @param {Array<object>} staticMemberProperties - Descriptors for static methods/properties.
 * @returns {Function} The constructed class.
 */
function _buildClass(ClassReference, prototypeProperties, staticMemberProperties) {
  if (prototypeProperties) _configureProperties(ClassReference.prototype, prototypeProperties);
  if (staticMemberProperties) _configureProperties(ClassReference, staticMemberProperties);
  return ClassReference;
}

/* Main application module wrapped in an IIFE */
!function (fileSystemModule) {
  "use strict"; /* Apply strict mode within this scope as well */

  /*
   * Implementation of a Randomized Binary Search Tree (Treap).
   * Combines properties of binary search trees and heaps.
   */
  var PrioritySearchTree =
    /*#__PURE__*/
    function () {
      /**
       * Initializes a new PrioritySearchTree.
       * @param {Function} getKeyExtractor - A function to extract the sort key from an item.
       */
      function PrioritySearchTree(getKeyExtractor) {
        _ensureInstanceType(this, PrioritySearchTree); /* Ensure constructor is called correctly */

        this.keyExtractor = getKeyExtractor || function (inputVal) {
          return inputVal;
        };

        this.treeRoot = null; /* The root node of the tree */
      }

      _buildClass(PrioritySearchTree, [{
        key: "insert",
        value: function insert(itemValue) {
          var nodePriority = Math.random(); /* Assign a random priority */
          var treeNode = {
            value: itemValue,
            key: this.keyExtractor(itemValue),
            priority: nodePriority,
            leftChild: null,
            rightChild: null
          };
          this.treeRoot = this._recursiveInsert(this.treeRoot, treeNode);
        }
      }, {
        key: "erase",
        value: function erase(itemValue) {
          var sortKey = this.keyExtractor(itemValue);
          this.treeRoot = this._recursiveErase(this.treeRoot, sortKey);
        }
      }, {
        key: "contains",
        value: function contains(itemValue) {
          return null != this._locateItem(itemValue);
        }
      }, {
        key: "findMin",
        value: function findMin() {
          var currentTraversalNode = this.treeRoot;

          for (; null != currentTraversalNode;) {
            if (null == currentTraversalNode.leftChild) return currentTraversalNode.value;
            currentTraversalNode = currentTraversalNode.leftChild;
          }

          return null; /* No minimum found if tree is empty */
        }
      }, {
        key: "_recursiveInsert",
        value: function _recursiveInsert(currentNode, treeNode) {
          if (null == currentNode) return treeNode; /* Found insertion point */
          if (treeNode.key === currentNode.key) return currentNode; /* Duplicate key, return existing node */
          else if (treeNode.key < currentNode.key) {
            var newlyInsertedNode = this._recursiveInsert(currentNode.leftChild, treeNode);

            currentNode.leftChild = newlyInsertedNode;
            if (newlyInsertedNode.priority < currentNode.priority) return currentNode; /* Heap property maintained */
            else return this._performRightRotation(currentNode); /* Perform rotation to maintain heap property */
          } else {
            var anotherInsertedNode = this._recursiveInsert(currentNode.rightChild, treeNode);

            currentNode.rightChild = anotherInsertedNode;
            if (anotherInsertedNode.priority < currentNode.priority) return currentNode; /* Heap property maintained */
            else return this._performLeftRotation(currentNode); /* Perform rotation to maintain heap property */
          }
        }
      }, {
        key: "_performRightRotation",
        value: function _performRightRotation(parentNode) {
          var childNode = parentNode.leftChild;
          if (null == childNode) return parentNode; /* No child to rotate with */
          parentNode.leftChild = childNode.rightChild;
          childNode.rightChild = parentNode;
          return childNode; /* New root of the subtree */
        }
      }, {
        key: "_performLeftRotation",
        value: function _performLeftRotation(parentNode) {
          var childNode = parentNode.rightChild;
          if (null == childNode) return parentNode; /* No child to rotate with */
          parentNode.rightChild = childNode.leftChild;
          childNode.leftChild = parentNode;
          return childNode; /* New root of the subtree */
        }
      }, {
        key: "_recursiveErase",
        value: function _recursiveErase(currentEraseNode, sortKey) {
          if (null == currentEraseNode) return null; /* Key not found */

          if (sortKey < currentEraseNode.key) {
            currentEraseNode.leftChild = this._recursiveErase(currentEraseNode.leftChild, sortKey);
            return currentEraseNode;
          } else if (sortKey > currentEraseNode.key) {
            currentEraseNode.rightChild = this._recursiveErase(currentEraseNode.rightChild, sortKey);
            return currentEraseNode;
          }

          /* Node to be deleted found */
          if (null == currentEraseNode.leftChild && null == currentEraseNode.rightChild) return null; /* Leaf node */

          /* Handle cases with one or two children by rotating */
          if ((currentEraseNode.leftChild ? currentEraseNode.leftChild.priority : -1) > (currentEraseNode.rightChild ? currentEraseNode.rightChild.priority : -1)) {
            /* Left child has higher priority, rotate right */
            var promotedParent = currentEraseNode.leftChild;
            var promotedRightChild = promotedParent.rightChild;
            currentEraseNode.leftChild = promotedRightChild;
            promotedParent.rightChild = this._recursiveErase(currentEraseNode, sortKey);
            if (promotedParent.rightChild && promotedParent.rightChild.priority > promotedParent.priority) return this._performLeftRotation(promotedParent);
            else return promotedParent;
          } else {
            /* Right child has higher priority or no children, rotate left */
            var altPromotedParent = currentEraseNode.rightChild;
            var promotedLeftChild = altPromotedParent.leftChild;
            currentEraseNode.rightChild = promotedLeftChild;
            altPromotedParent.leftChild = this._recursiveErase(currentEraseNode, sortKey);
            if (altPromotedParent.leftChild && altPromotedParent.leftChild.priority > altPromotedParent.priority) return this._performRightRotation(altPromotedParent);
            else return altPromotedParent;
          }
        }
      }, {
        key: "_locateItem",
        value: function _locateItem(itemValue) {
          var currentSearchNode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.treeRoot;
          if (null == currentSearchNode) return null; /* Item not found */
          if (currentSearchNode.value === itemValue) return currentSearchNode; /* Item found */
          if (itemValue < currentSearchNode.value) return this._locateItem(itemValue, currentSearchNode.leftChild);
          else return this._locateItem(itemValue, currentSearchNode.rightChild);
        }
      }]);

      return PrioritySearchTree;
    }();

  /* Main execution block for the problem solution */
  !function () {
    /**
     * Parses a string or array of strings into an array of integers.
     * @param {string|Array<string>} inputString - The string or array of strings to parse.
     * @returns {Array<number>} An array of parsed integers.
     */
    function parseNumbersFromString(inputString) {
      return (Array.isArray(inputString) ? inputString : inputString.split(/\s+/)).map(function (numStr) {
        return parseInt(numStr);
      });
    }

    /**
     * Sorts an array of objects based on specified keys and their order.
     * @param {Array<object>} dataArray - The array of objects to sort.
     * @param {string|Array<string|Array>} sortKeys - Single key string or array of key strings/tuples [key, order].
     * @returns {Array<object>} The sorted array.
     */
    function sortArrayByKeys(dataArray, sortKeys) {
      if (!Array.isArray(sortKeys)) sortKeys = [sortKeys]; /* Ensure sortKeys is an array */
      return dataArray.sort(function (itemA, itemB) {
        var iterCompletionStatus = true;
        var iterErrorFlag = false;
        var iterErrorMessage = undefined;

        try {
          for (var keyIterator = sortKeys[Symbol.iterator](), currentKeyStep; !(iterCompletionStatus = (currentKeyStep = keyIterator.next()).done); iterCompletionStatus = true) {
            var currentSortKey = currentKeyStep.value;

            if ("string" == typeof currentSortKey) {
              var diffValue = itemA[currentSortKey] - itemB[currentSortKey];
              if (0 !== diffValue) return diffValue;
            } else {
              var altDiffValue = itemA[currentSortKey[0]] - itemB[currentSortKey[0]];

              var signMultiplier = "desc" === currentSortKey[1] ? -1 : "asc" === currentSortKey[1] ? 1 : Number(currentSortKey[1]);
              if (0 !== altDiffValue) return altDiffValue * signMultiplier;
            }
          }
        } catch (caughtException) {
          iterErrorFlag = true;
          iterErrorMessage = caughtException;
        } finally {
          try {
            if (!iterCompletionStatus && keyIterator.return != null) {
              keyIterator.return();
            }
          } finally {
            if (iterErrorFlag) {
              throw iterErrorMessage;
            }
          }
        }

        return 0; /* Items are equal based on all keys */
      });
    }

    /* Main processing logic for the input data */
    !function (rawInputData) {
      var inputLines = rawInputData.split("\n"); /* Split input into individual lines */

      var parsedCounts = parseNumbersFromString(inputLines[0]),
        destructuredCounts = _destructureArray(parsedCounts, 2),
        totalProjects = destructuredCounts[0],
        numQueries = destructuredCounts[1];

      /* Process construction project data */
      var constructionProjects = inputLines.slice(1, totalProjects + 1).map(function (projectLine, projectIndex) {
        var projectData = parseNumbersFromString(projectLine),
          destructuredProject = _destructureArray(projectData, 3),
          startCoord = destructuredProject[0],
          endCoord = destructuredProject[1],
          offsetValue = destructuredProject[2];

        return {
          idx: projectIndex,
          start: startCoord,
          end: endCoord,
          offset: offsetValue,
          effectiveStart: startCoord - offsetValue - .5, /* Adjusted start time */
          effectiveEnd: endCoord - offsetValue - .6 /* Adjusted end time */
        };
      });

      var queryLocations = parseNumbersFromString(inputLines.slice(totalProjects + 1)).slice(0, numQueries);
      var timelineEvents = []; /* Collect all events (add/delete project offsets) */
      var eventIterCompletion = true;
      var eventIterErrorFlag = false;
      var eventIterErrorMessage = undefined;

      try {
        for (var projectIterator = constructionProjects[Symbol.iterator](), currentProjectStep; !(eventIterCompletion = (currentProjectStep = projectIterator.next()).done); eventIterCompletion = true) {
          var projectDetails = currentProjectStep.value,
            eventOffset = projectDetails.offset,
            effectiveStart = projectDetails.effectiveStart,
            effectiveEnd = projectDetails.effectiveEnd;
          timelineEvents.push({
            eventType: "add",
            eventTime: effectiveStart,
            eventXValue: eventOffset
          }, {
            eventType: "delete",
            eventTime: effectiveEnd,
            eventXValue: eventOffset
          });
        }
      } catch (caughtError) {
        eventIterErrorFlag = true;
        eventIterErrorMessage = caughtError;
      } finally {
        try {
          if (!eventIterCompletion && projectIterator.return != null) {
            projectIterator.return();
          }
        } finally {
          if (eventIterErrorFlag) {
            throw eventIterErrorMessage;
          }
        }
      }

      var queryPointer = 0; /* Index for current query location */
      sortArrayByKeys(timelineEvents, ["eventTime"]); /* Sort events by time */
      var activeOffsetsTree = new PrioritySearchTree(); /* Treap to manage active offsets */

      /* Process timeline events and queries simultaneously */
      for (var eventIndex = 0; eventIndex < timelineEvents.length; eventIndex++) {
        var currentEventData = timelineEvents[eventIndex],
          eventType = currentEventData.eventType,
          eventTime = currentEventData.eventTime,
          eventXValue = currentEventData.eventXValue;

        /* Process all pending queries up to the current event time */
        for (; queryPointer < queryLocations.length && eventTime > queryLocations[queryPointer];) {
          var minAvailableOffset = activeOffsetsTree.findMin();

          console.info(null == minAvailableOffset ? -1 : minAvailableOffset); /* Output the smallest offset or -1 */
          queryPointer++;
        }

        /* Apply event: add or remove offset from the treap */
        if ("add" === eventType) activeOffsetsTree.insert(eventXValue);
        else if ("delete" === eventType) activeOffsetsTree.erase(eventXValue);
      }

      /* Process any remaining queries after all events have been processed */
      for (; queryPointer < queryLocations.length; queryPointer++) {
        var finalMinOffset = activeOffsetsTree.findMin();
        console.info(null == finalMinOffset ? -1 : finalMinOffset);
      }
    }(fileSystemModule.readTextFileSync("/app/input.txt", "utf-8")); /* Read input from a file */
  }();
}(require("fs")); /* Require the Node.js file system module */