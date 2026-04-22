module.exports = function(moduleSource) {
  var moduleCache = {};
  function loadModule(moduleIndex) {
    if (moduleCache[moduleIndex]) {
      return moduleCache[moduleIndex].exports;
    }
    var moduleEntry = moduleCache[moduleIndex] = {
      id: moduleIndex,
      isLoaded: false,
      exports: {}
    };
    moduleSource[moduleIndex].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, loadModule);
    moduleEntry.isLoaded = true;
    return moduleEntry.exports;
  }
  loadModule.sources = moduleSource;
  loadModule.cache = moduleCache;
  loadModule.defineExport = function(targetObject, propertyName, getterFunction) {
    if (!loadModule.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };
  loadModule.markAsEsModule = function(moduleObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(moduleObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(moduleObject, "__esModule", {
      value: true
    });
  };
  loadModule.interopRequireDefault = function(value, mode) {
    if (1 & mode) {
      value = loadModule(value);
    }
    if (8 & mode) {
      return value;
    }
    if (4 & mode && typeof value === "object" && value && value.__esModule) {
      return value;
    }
    var defaultObject = Object.create(null);
    loadModule.markAsEsModule(defaultObject);
    Object.defineProperty(defaultObject, "default", {
      enumerable: true,
      value: value
    });
    if (2 & mode && typeof value !== "string") {
      for (var propName in value) {
        loadModule.defineExport(defaultObject, propName, (function(currentProp) {
          return value[currentProp];
        }).bind(null, propName));
      }
    }
    return defaultObject;
  };
  loadModule.createGetter = function(moduleInstance) {
    var getter = moduleInstance && moduleInstance.__esModule ?
      function() {
        return moduleInstance.default;
      } :
      function() {
        return moduleInstance;
      };
    loadModule.defineExport(getter, "a", getter);
    return getter;
  };
  loadModule.hasOwn = function(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
  loadModule.publicPath = "";
  return loadModule(loadModule.startupModule = 0);
}(
  [
    function(moduleObj, exportsObj, resolveModule) {
      "use strict";
      var fileUtil = resolveModule(1);
      resolveModule(2)(fileUtil.readFileSync("/dev/std_input", "utf_8"));
    },
    function(moduleObj, exportsObj) {
      moduleObj.exports = require("node:fs");
    },
    function(moduleObj, exportsObj, resolveModule) {
      "use strict";
      var parserClass = resolveModule(3);
      var processorFunction = resolveModule(5);
      moduleObj.exports = function(inputData) {
        var dataParser = new parserClass(inputData);
        processorFunction(dataParser);
      };
    },
    function(moduleObj, exportsObj, resolveModule) {
      "use strict";
      var queueClass = resolveModule(4);
      moduleObj.exports = class DataInterpreter {
        constructor(rawData) {
          var tokens = rawData.trim().split(/\s+/g);
          this.tokenQueue = new queueClass(tokens);
        }
        readNextString() {
          return this.tokenQueue.dequeue();
        }
        readNextInteger() {
          return parseInt(this.tokenQueue.dequeue(), 10);
        }
        finishReading() {
          this.tokenQueue.resetQueue();
        }
      };
    },
    function(moduleObj, exportsObj, resolveModule) {
      "use strict";
      moduleObj.exports = class StringQueue {
        constructor() {
          var initialItems = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          this.itemCount = initialItems.length;
          this.itemArray = initialItems;
          this.currentIndex = 0;
        }
        enqueue(valueToAdd) {
          this.itemCount += 1;
          this.itemArray.push(valueToAdd);
        }
        dequeue() {
          var retrievedItem = this.itemArray[this.currentIndex];
          this.itemCount -= 1;
          this.currentIndex += 1;
          return retrievedItem;
        }
        resetQueue() {
          this.itemArray = [];
          this.itemCount = 0;
          this.currentIndex = 0;
        }
      };
    },
    function(moduleObj, exportsObj, resolveModule) {
      "use strict";
      var floydWarshallAlgorithm = resolveModule(6);
      moduleObj.exports = function(inputReader) {
        var nodeCount = inputReader.readNextInteger();
        var edgeCount = inputReader.readNextInteger();
        var maxAllowedDistance = inputReader.readNextInteger();
        var adjacencyMatrix = new Array(nodeCount);
        for (var idx = 0; idx < nodeCount; idx++) {
          adjacencyMatrix[idx] = new Array(nodeCount).fill(9876543210);
        }
        for (var edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
          var sourceNode = inputReader.readNextInteger();
          var targetNode = inputReader.readNextInteger();
          var weight = inputReader.readNextInteger();
          adjacencyMatrix[sourceNode - 1][targetNode - 1] = weight;
          adjacencyMatrix[targetNode - 1][sourceNode - 1] = weight;
        }
        var shortestPaths = floydWarshallAlgorithm(adjacencyMatrix);
        for (var rowIdx = 0; rowIdx < nodeCount; rowIdx++) {
          for (var colIdx = 0; colIdx < nodeCount; colIdx++) {
            if (shortestPaths[rowIdx][colIdx] <= maxAllowedDistance) {
              adjacencyMatrix[rowIdx][colIdx] = 1;
              adjacencyMatrix[colIdx][rowIdx] = 1;
            } else {
              adjacencyMatrix[rowIdx][colIdx] = 9876543210;
            }
          }
        }
        var reachabilityMatrix = floydWarshallAlgorithm(adjacencyMatrix);
        var queryCount = inputReader.readNextInteger();
        for (var queryIdx = 0; queryIdx < queryCount; queryIdx++) {
          var startNode = inputReader.readNextInteger();
          var endNode = inputReader.readNextInteger();
          var calculatedPath = reachabilityMatrix[startNode - 1][endNode - 1];
          if (calculatedPath === 9876543210) {
            console.log(-1);
          } else {
            console.log(calculatedPath - 1);
          }
        }
      };
    },
    function(moduleObj, exportsObj, resolveModule) {
      "use strict";
      moduleObj.exports = function(graphMatrix) {
        var matrixSize = graphMatrix.length;
        var distanceMatrix = [];
        for (var outerIdx = 0; outerIdx < matrixSize; outerIdx++) {
          distanceMatrix.push(graphMatrix[outerIdx].concat());
        }
        for (var intermediateNodeIdx = 0; intermediateNodeIdx < matrixSize; intermediateNodeIdx++) {
          for (var startNodeIdx = 0; startNodeIdx < matrixSize; startNodeIdx++) {
            for (var endNodeIdx = 0; endNodeIdx < matrixSize; endNodeIdx++) {
              if (distanceMatrix[startNodeIdx][endNodeIdx] > distanceMatrix[startNodeIdx][intermediateNodeIdx] + distanceMatrix[intermediateNodeIdx][endNodeIdx]) {
                distanceMatrix[startNodeIdx][endNodeIdx] = distanceMatrix[startNodeIdx][intermediateNodeIdx] + distanceMatrix[intermediateNodeIdx][endNodeIdx];
              }
            }
          }
        }
        return distanceMatrix;
      };
    }
  ]
);