module.exports = function (moduleDefinitions) {
  var moduleCache = {};

  function moduleLoader(moduleId) {
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }
    var currentModule = moduleCache[moduleId] = {
      modId: moduleId,
      isLoaded: false,
      exports: {}
    };
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);
    currentModule.isLoaded = true;
    return currentModule.exports;
  }

  moduleLoader.modules = moduleDefinitions;
  moduleLoader.cache = moduleCache;

  moduleLoader.defineExport = function (targetObject, propertyName, getterFunction) {
    if (!moduleLoader.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  moduleLoader.registerModule = function (exportsObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(exportsObject, "__esModule", {
      value: true
    });
  };

  moduleLoader.interopRequireDefault = function (moduleValue, interopMode) {
    if (1 & interopMode) {
      moduleValue = moduleLoader(moduleValue);
    }
    if (8 & interopMode) {
      return moduleValue;
    }
    if (4 & interopMode && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
      return moduleValue;
    }
    var newObject = Object.create(null);
    moduleLoader.registerModule(newObject);
    Object.defineProperty(newObject, "default", {
      enumerable: true,
      value: moduleValue
    });
    if (2 & interopMode && typeof moduleValue !== "string") {
      for (var propName in moduleValue) {
        moduleLoader.defineExport(newObject, propName, (function (propName) {
          return moduleValue[propName];
        }).bind(null, propName));
      }
    }
    return newObject;
  };

  moduleLoader.getModuleExports = function (moduleRef) {
    var exportGetter = moduleRef && moduleRef.__esModule ?
      function () {
        return moduleRef.default;
      } :
      function () {
        return moduleRef;
      };
    moduleLoader.defineExport(exportGetter, "a", exportGetter);
    return exportGetter;
  };

  moduleLoader.hasOwn = function (checkObject, checkProperty) {
    return Object.prototype.hasOwnProperty.call(checkObject, checkProperty);
  };

  moduleLoader.publicPath = "";

  return moduleLoader(moduleLoader.s = 0);
}([
  function (moduleObj, exportsObj, localRequire) {
    localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
  },
  function (moduleObj, exportsObj, localRequire) {
    "use strict";

    function destructureArray(inputIterable, limitCount) {
      if (Array.isArray(inputIterable)) {
        return inputIterable;
      }
      var resultArray = [];
      var isNotDone = true;
      var hasError = false;
      var errorValue = void 0;
      try {
        for (var iteratorItem, valueIterator = inputIterable[Symbol.iterator](); !(isNotDone = (iteratorItem = valueIterator.next()).done) && (resultArray.push(iteratorItem.value), !limitCount || resultArray.length !== limitCount); isNotDone = true);
      } catch (err) {
        hasError = true;
        errorValue = err;
      } finally {
        try {
          if (!isNotDone && valueIterator.return != null) {
            valueIterator.return();
          }
        } finally {
          if (hasError) {
            throw errorValue;
          }
        }
      }
      return resultArray;
    }

    moduleObj.exports = function (inputLines) {
      var firstLineValues = destructureArray(inputLines[0].split(" ").map(function (valStr) {
        return Number(valStr);
      }), 2);
      var nodeCount = firstLineValues[0];
      var edgeCount = firstLineValues[1];

      var adjacencyList = new Array(nodeCount);
      for (var nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
        adjacencyList[nodeIndex] = [];
      }

      for (var edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
        var currentEdge = destructureArray(inputLines[edgeIndex + 1].split(" ").map(function (valStr) {
          return Number(valStr) - 1;
        }), 2);
        var sourceNode = currentEdge[0];
        var targetNode = currentEdge[1];
        adjacencyList[sourceNode].push(targetNode);
      }

      for (var startNodeIndex = 0; startNodeIndex < nodeCount; startNodeIndex++) {
        var visitedNodes = new Array(nodeCount).fill(false);
        visitedNodes[startNodeIndex] = 1;

        for (var traversalStack = [{
            currentNode: startNodeIndex,
            pathVisitedFlags: visitedNodes,
            pathLength: 1
          }]; traversalStack.length > 0;) {
          var currentTraversalState = traversalStack.pop();
          var isStillIterating = true;
          var innerLoopHasError = false;
          var innerLoopErrorValue = void 0;
          try {
            for (var neighborNode, neighborIterator = adjacencyList[currentTraversalState.currentNode][Symbol.iterator](); !(isStillIterating = (neighborNode = neighborIterator.next()).done); isStillIterating = true) {
              var currentNeighbor = neighborNode.value;
              if (currentNeighbor === startNodeIndex) {
                console.log(currentTraversalState.pathLength);
                for (var checkIndex = 0; checkIndex < nodeCount; checkIndex++) {
                  if (currentTraversalState.pathVisitedFlags[checkIndex] === 1) {
                    console.log(checkIndex + 1);
                  }
                }
                return;
              }
              if (currentTraversalState.pathVisitedFlags[currentNeighbor] !== 1) {
                var newVisitedState = currentTraversalState.pathVisitedFlags.concat();
                newVisitedState[currentNeighbor] = 1;
                traversalStack.push({
                  currentNode: currentNeighbor,
                  pathVisitedFlags: newVisitedState,
                  pathLength: currentTraversalState.pathLength + 1
                });
              }
            }
          } catch (err) {
            innerLoopHasError = true;
            innerLoopErrorValue = err;
          } finally {
            try {
              if (!isStillIterating && neighborIterator.return != null) {
                neighborIterator.return();
              }
            } finally {
              if (innerLoopHasError) {
                throw innerLoopErrorValue;
              }
            }
          }
        }
        console.log(-1);
      }
    };
  },
  function (moduleObj, exportsObj) {
    moduleObj.exports = localRequire("fs");
  }
]);
