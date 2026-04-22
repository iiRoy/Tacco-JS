"use strict";

// Internal utility to convert an iterable into an array, supporting spread operations.
function _convertToArray(sourceIterable) {
  return _arrayFromIterable(sourceIterable) || _convertIterToArr(sourceIterable) || _throwNonIterable();
}

// Throws a specific error if an entity is attempted to be spread but isn't iterable.
function _throwNonIterable() {
  throw new TypeError("Cannot spread a non-iterable instance");
}

// Creates a new array from an existing array, ensuring no 'holes' (undefined elements).
function _arrayFromIterable(inputArray) {
  if (Array.isArray(inputArray)) {
    for (var currentIdx = 0, resultArray = new Array(inputArray.length); currentIdx < inputArray.length; currentIdx++) {
      resultArray[currentIdx] = inputArray[currentIdx];
    }
    return resultArray;
  }
}

// Verifies that a class constructor has been invoked using 'new'.
function _verifyInstance(objInstance, TargetClass) {
  if (!(objInstance instanceof TargetClass)) {
    throw new TypeError("Cannot call a class constructor as a function");
  }
}

// Defines multiple properties on a given object, configuring their attributes.
function _setObjectProps(targetObject, propertyDescriptors) {
  for (var propIdx = 0; propIdx < propertyDescriptors.length; propIdx++) {
    var desc = propertyDescriptors[propIdx];
    desc.enumerable = desc.enumerable || false;
    desc.configurable = true;
    if ("value" in desc) desc.writable = true;
    Object.defineProperty(targetObject, desc.key, desc);
  }
}

// Constructs a class with specified prototype methods and static properties.
function _makeClass(ConstructorFunc, prototypeProperties, staticProperties) {
  if (prototypeProperties) _setObjectProps(ConstructorFunc.prototype, prototypeProperties);
  if (staticProperties) _setObjectProps(ConstructorFunc, staticProperties);
  return ConstructorFunc;
}

// Converts an array-like or iterable structure into a true array.
function _extractArray(sourceArray) {
  return _checkArrayType(sourceArray) || _convertIterToArr(sourceArray) || _throwInvalidRest();
}

// Converts a generic iterable (or arguments object) into an array.
function _convertIterToArr(iterableObj) {
  if (Symbol.iterator in Object(iterableObj) || Object.prototype.toString.call(iterableObj) === "[object Arguments]") return Array.from(iterableObj);
}

// Breaks an array into parts, potentially limiting the number of elements.
function _splitArrayToParts(inputArr, limit) {
  return _checkArrayType(inputArr) || _limitedIterToArray(inputArr, limit) || _throwInvalidRest();
}

// Throws an error for an invalid attempt to destructure a non-iterable as a rest parameter.
function _throwInvalidRest() {
  throw new TypeError("Invalid attempt to destructure a non-iterable instance");
}

// Converts an iterable into an array, stopping after a specified number of elements.
function _limitedIterToArray(iterableInput, limitNum) {
  var tempArr = [];
  var isDone = true;
  var hasError = false;
  var errorObj = undefined;
  try {
    for (var _iterSource = iterableInput[Symbol.iterator](), _iterItem; !(isDone = (_iterItem = _iterSource.next()).done); isDone = true) {
      tempArr.push(_iterItem.value);
      if (limitNum && tempArr.length === limitNum) break;
    }
  } catch (err) {
    hasError = true;
    errorObj = err;
  } finally {
    try {
      if (!isDone && _iterSource["return"] != null) {
        _iterSource["return"]();
      }
    } finally {
      if (hasError) throw errorObj;
    }
  }
  return tempArr;
}

// Checks if the provided argument is an Array type.
function _checkArrayType(potentialArray) {
  if (Array.isArray(potentialArray)) return potentialArray;
}

// The core program execution function.
function _executeProgram() {
  // --- Start of helper functions ---

  // Parses a string or array of strings into an array of integers.
  function parseNumbers(inputStr) {
    return (Array.isArray(inputStr) ? inputStr : inputStr.split(/\s+/)).map(function (numVal) {
      return parseInt(numVal);
    });
  }

  // Implementation of an arbitrary-precision unsigned integer class.
  var BigIntContainer =
  /*#__PURE__*/
  function () {
    function BigIntContainer(initialValue) {
      _verifyInstance(this, BigIntContainer); // Ensure constructor is called correctly.

      // Stores number segments; sufficient for 64-bit values.
      this.components = [0, 0, 0];
      var indexPos = 0;

      while (initialValue !== 0) {
        this.components[indexPos] = initialValue % BigIntContainer.boundary;
        initialValue = Math.floor(initialValue / BigIntContainer.boundary);
        indexPos++;
      }
    }

    _makeClass(BigIntContainer, [{
      key: "sum",
      value: function sum(otherContainer) {
        var sumResult = new BigIntContainer(0);
        var maxLength = Math.max(this.components.length, otherContainer.components.length);
        var overflow = 0;
        var currIndex = 0;

        for (; currIndex < maxLength; currIndex++) {
          var currentSum = (this.components[currIndex] || 0) + (otherContainer.components[currIndex] || 0) + overflow;
          sumResult.components[currIndex] = currentSum % BigIntContainer.boundary;
          overflow = Math.floor(currentSum / BigIntContainer.boundary);
        }

        if (overflow > 0) {
          sumResult.components[currIndex] = overflow;
        }

        return sumResult;
      }
    }, {
      key: "multiply",
      value: function multiply(multiplier) {
        var productResult = new BigIntContainer(0);

        for (var leftIndex = 0; leftIndex < this.components.length; leftIndex++) {
          for (var rightIndex = 0; rightIndex < multiplier.components.length; rightIndex++) {
            var partialProduct = this.components[leftIndex] * multiplier.components[rightIndex];
            var targetIndex = leftIndex + rightIndex;
            var currentValue = partialProduct;

            while (currentValue > 0) {
              var segmentSum = (productResult.components[targetIndex] || 0) + currentValue;
              productResult.components[targetIndex] = segmentSum % BigIntContainer.boundary;
              currentValue = Math.floor(segmentSum / BigIntContainer.boundary);
              targetIndex++;
            }
          }
        }

        return productResult;
      }
    }, {
      key: "toText",
      value: function toText() {
        var reversedComponents = this.components.concat().reverse(); // Reverse a copy of components.

        // Custom function to find the index of the first non-zero component.
        var firstNonZeroIndex = function (componentArray, predicateFn) {
          for (var iterIndex = 0; iterIndex < componentArray.length; iterIndex++) {
            if (predicateFn(componentArray[iterIndex], iterIndex)) {
              return iterIndex;
            }
          }
          return null; // Return null if all components are zero.
        } // This is a simplified `findIndex` equivalent.
        (reversedComponents, function (componentValue) {
          return componentValue !== 0;
        });

        if (firstNonZeroIndex == null) {
          return "0"; // If all components are zero, the number is "0".
        }

        return reversedComponents.slice(firstNonZeroIndex).map(function (componentValue, iterIndex) {
          if (iterIndex === 0) {
            return String(componentValue);
          } else {
            // Pad subsequent components with leading zeros to maintain format.
            return padPrefix(String(componentValue), BigIntContainer.numDigits, "0");
          }
        }).join(""); // Join all string components.

        // Helper function to add padding characters to the start of a string.
        function padPrefix(inputString, targetLength, paddingChar) {
          var charsToAdd = targetLength - inputString.length;
          var paddedString = "";

          for (var iter = 0; iter < charsToAdd; iter++) {
            paddedString += paddingChar;
          }

          return paddedString + inputString;
        }
      }
    }]);

    return BigIntContainer;
  }();
  // Specifies the number of decimal digits per component.
  BigIntContainer.numDigits = 7;
  // The numerical base for each component (e.g., 10^7).
  BigIntContainer.boundary = Math.pow(10, BigIntContainer.numDigits);

  // Disjoint Set Union (DSU) data structure for managing sets of integers.
  var DisjointSet =
  /*#__PURE__*/
  function () {
    function DisjointSet(elementCount) {
      _verifyInstance(this, DisjointSet); // Validate the constructor call.

      this.elements = new Array(elementCount).fill(null).map(function () {
        return {
          ancestor: null, // Points to the parent node in the set.
          // The count of members in the set; only valid for the root node.
          memberCount: 1
        };
      });
    }
    // Locates the root (representative) of the set containing `itemIndex`.
    _makeClass(DisjointSet, [{
      key: "findRoot",
      value: function findRoot(itemIndex) {
        var currentNode = this.elements[itemIndex];
        var pathNodes = []; // Collects nodes along the path to the root.

        while (currentNode.ancestor != null) {
          pathNodes.push(currentNode);
          currentNode = currentNode.ancestor;
        }

        // Applies path compression: all nodes on the path now point directly to the root.
        for (var iterIndex = 0; iterIndex < pathNodes.length; iterIndex++) {
          var pathNode = pathNodes[iterIndex];
          pathNode.ancestor = currentNode; // Direct assignment to the root.
        }

        return currentNode; // Returns the identified root node.
      }
      // Merges two sets represented by `firstItem` and `secondItem`.
      // @returns The new root of the combined set, or `undefined` if already united.
    }, {
      key: "uniteSets",
      value: function uniteSets(firstItem, secondItem) {
        var rootOne = this.findRoot(firstItem);
        var rootTwo = this.findRoot(secondItem);

        if (rootOne === rootTwo) {
          return; // Items are already in the same set.
        }

        // Merges the sets by making one root the ancestor of the other.
        rootTwo.ancestor = rootOne;
        rootOne.memberCount += rootTwo.memberCount; // Updates the size of the combined set.
        return rootOne; // Returns the new root.
      }
    }]);

    return DisjointSet;
  }();

  // --- End of helper functions ---

  // Main processing logic for the input data.
  (function (rawData) {
    var dataLines = rawData.split("\n");

    var _parsedNums = parseNumbers(dataLines[0]),
        _firstLineParts = _splitArrayToParts(_parsedNums, 2),
        totalNodes = _firstLineParts[0],
        totalEdges = _firstLineParts[1];

    var connections = dataLines.slice(1, totalEdges + 1).map(function (connLine) {
      var _connParts = parseNumbers(connLine),
          _connPartsArray = _splitArrayToParts(_connParts, 2),
          nodeA = _connPartsArray[0],
          nodeB = _connPartsArray[1];

      return {
        nodeA,
        nodeB
      };
    });

    var computedResults = [];
    connections.reverse(); // Process connections in reverse order for correct accumulation.

    var disjointStructure = new DisjointSet(totalNodes);
    var pairCount = 0; // Tracks the number of pairs that are connected.
    var _iterComplete = true;
    var _iterHadError = false;
    var _iterErrorObj = undefined;

    try {
      for (var _connIterator = connections[Symbol.iterator](), _iterStep; !(_iterComplete = (_iterStep = _connIterator.next()).done); _iterComplete = true) {
        var _currentConn = _iterStep.value,
            nodeA = _currentConn.nodeA,
            nodeB = _currentConn.nodeB;
        computedResults.push(pairCount); // Store the current pair count before processing the edge.

        var rootOne = disjointStructure.findRoot(nodeA - 1);
        var rootTwo = disjointStructure.findRoot(nodeB - 1);

        if (rootOne === rootTwo) {
          // If nodes are already in the same set, this edge doesn't connect new pairs.
          continue;
        }

        // If nodes were in different sets, adding this edge connects all pairs
        // between the two sets.
        pairCount += rootOne.memberCount * rootTwo.memberCount;
        disjointStructure.uniteSets(nodeA - 1, nodeB - 1); // Merge the two sets.
      }
    } catch (err) {
      _iterHadError = true;
      _iterErrorObj = err;
    } finally {
      try {
        if (!_iterComplete && _connIterator["return"] != null) {
          _connIterator["return"]();
        }
      } finally {
        if (_iterHadError) {
          throw _iterErrorObj;
        }
      }
    }

    computedResults.reverse(); // Revert results to the original order of edges.

    // Calculate the final answer: total possible pairs minus the 'bad' connected pairs.
    var finalOutcomes = computedResults.map(function (badPairs) {
      return totalNodes * (totalNodes - 1) / 2 - badPairs;
    });

    finalOutcomes.forEach(function (outputVal) {
      return console.log(outputVal);
    });
  })(require("node:fs").readFileSync("/dev/stdin", "utf-8")); // Read input from standard input.
}

_executeProgram(); // Initiate the program.