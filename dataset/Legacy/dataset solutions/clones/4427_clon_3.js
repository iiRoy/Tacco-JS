module.exports = function (moduleDefinitions) {
  var moduleCache = {};

  function resolveModule(moduleId) {
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }
    var currentModule = moduleCache[moduleId] = {
      id: moduleId,
      isLoaded: false,
      exports: {}
    };
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, resolveModule);
    currentModule.isLoaded = true;
    return currentModule.exports;
  }

  resolveModule.moduleMap = moduleDefinitions;
  resolveModule.moduleCache = moduleCache;

  resolveModule.defineGetter = function (targetObject, propertyName, getterFunction) {
    var definePropertyMethod = Object.defineProperty;
    if (!resolveModule.hasOwn(targetObject, propertyName)) {
      definePropertyMethod(targetObject, propertyName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  resolveModule.markAsEsModule = function (targetObject) {
    var symbolToStringTag = typeof Symbol !== "undefined" && Symbol.toStringTag;
    if (symbolToStringTag) {
      Object.defineProperty(targetObject, symbolToStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(targetObject, "__esModule", {
      value: true
    });
  };

  resolveModule.createNamespaceObject = function (moduleExport, typeFlags) {
    var namespaceObject;
    if (typeFlags & 1) {
      moduleExport = resolveModule(moduleExport);
    }
    if (typeFlags & 8) {
      return moduleExport;
    }
    if (typeFlags & 4 && typeof moduleExport === "object" && moduleExport && moduleExport.__esModule) {
      return moduleExport;
    }
    namespaceObject = Object.create(null);
    resolveModule.markAsEsModule(namespaceObject);
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: moduleExport
    });
    if (typeFlags & 2 && typeof moduleExport !== "string") {
      for (var propKey in moduleExport) {
        if (resolveModule.hasOwn(moduleExport, propKey)) {
          resolveModule.defineGetter(namespaceObject, propKey, (function (key) {
            return moduleExport[key];
          }).bind(null, propKey));
        }
      }
    }
    return namespaceObject;
  };

  resolveModule.getDefaultExport = function (moduleExport) {
    var defaultExportGetter = moduleExport && moduleExport.__esModule ?
      function () {
        return moduleExport.default;
      } :
      function () {
        return moduleExport;
      };
    resolveModule.defineGetter(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  resolveModule.hasOwn = function (targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  resolveModule.publicPath = "";

  return resolveModule(resolveModule.entryModuleId = 0);
}([function (module, exports, getModule) {
  var fileSystem = getModule(2);
  var processInput = getModule(1);
  var inputData = fileSystem.readFileSync("/dev/stdin", "UTF-8").split("\n");
  processInput(inputData);
}, function (module, exports, getModule) {
  "use strict";

  function getArrayParts(sourceArray, limit) {
    var resultParts = [];
    if (Array.isArray(sourceArray)) {
      return sourceArray;
    }

    var hasError = false;
    var errorObject = undefined;
    var iteratorDone = false;
    var arrayIterator = sourceArray[Symbol.iterator]();

    try {
      for (var iterResult; !(iteratorDone = (iterResult = arrayIterator.next()).done); iteratorDone = true) {
        resultParts.push(iterResult.value);
        if (limit && resultParts.length === limit) {
          break;
        }
      }
    } catch (err) {
      hasError = true;
      errorObject = err;
    } finally {
      try {
        if (!iteratorDone && arrayIterator["return"] != null) {
          arrayIterator["return"]();
        }
      } finally {
        if (hasError) {
          throw errorObject;
        }
      }
    }
    return resultParts;
  }

  function parseNumbersFromString(inputString) {
    return inputString.split(" ").map(Number);
  }

  module.exports = function (inputLines) {
    var nodeCount = Number(inputLines[0]);
    var adjacencyList = Array.from({
      length: nodeCount
    }, () => []);

    for (var edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
      var edgeData = parseNumbersFromString(inputLines[edgeIndex + 1]);
      var extractedEdge = getArrayParts(edgeData, 3);
      var nodeA = extractedEdge[0];
      var nodeB = extractedEdge[1];
      var edgeCost = extractedEdge[2];

      var edgeObjectA = {
        vertex: nodeB - 1,
        cost: edgeCost
      };
      adjacencyList[nodeA - 1].push(edgeObjectA);

      var edgeObjectB = {
        vertex: nodeA - 1,
        cost: edgeCost
      };
      adjacencyList[nodeB - 1].push(edgeObjectB);
    }

    var startNodeInfo = parseNumbersFromString(inputLines[nodeCount]);
    var startNodeId = getArrayParts(startNodeInfo, 2)[1];

    var shortestDistances = new Array(nodeCount).fill(-1);
    var bfsQueue = [];
    bfsQueue.push({
      vertex: startNodeId - 1,
      currentSum: 0
    });

    while (bfsQueue.length > 0) {
      var currentQueueItem = bfsQueue.shift();

      if (shortestDistances[currentQueueItem.vertex] !== -1) {
        continue; // Already visited with a shorter or equal path
      }

      shortestDistances[currentQueueItem.vertex] = currentQueueItem.currentSum;

      var neighborIteratorDone = false;
      var neighborIteratorError = false;
      var neighborIteratorErrorObj = undefined;

      try {
        var neighborList = adjacencyList[currentQueueItem.vertex];
        for (var neighborIterator = neighborList[Symbol.iterator](), neighborEntry; !(neighborIteratorDone = (neighborEntry = neighborIterator.next()).done); neighborIteratorDone = true) {
          var neighborData = neighborEntry.value;
          if (shortestDistances[neighborData.vertex] === -1) {
            var newPathSum = currentQueueItem.currentSum + neighborData.cost;
            bfsQueue.push({
              vertex: neighborData.vertex,
              currentSum: newPathSum
            });
          }
        }
      } catch (err) {
        neighborIteratorError = true;
        neighborIteratorErrorObj = err;
      } finally {
        try {
          if (!neighborIteratorDone && neighborIterator["return"] != null) {
            neighborIterator["return"]();
          }
        } finally {
          if (neighborIteratorError) {
            throw neighborIteratorErrorObj;
          }
        }
      }
    }

    var queryCount = getArrayParts(startNodeInfo, 2)[0];
    for (var queryIndex = 0; queryIndex < queryCount; queryIndex++) {
      var queryInputLine = parseNumbersFromString(inputLines[queryIndex + nodeCount + 1]);
      var nodeOne = getArrayParts(queryInputLine, 2)[0];
      var nodeTwo = getArrayParts(queryInputLine, 2)[1];

      var nodeOneAdjusted = nodeOne - 1;
      var nodeTwoAdjusted = nodeTwo - 1;

      var distanceNodeOne = shortestDistances[nodeOneAdjusted];
      var distanceNodeTwo = shortestDistances[nodeTwoAdjusted];

      var totalDistance = distanceNodeOne + distanceNodeTwo;
      console.log(totalDistance);
    }
  };
}, function (module, exports) {
  module.exports = require("fs");
}]);
