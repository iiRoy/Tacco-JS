packageExports.exports = function (sourceModules) {
  const cachedModules = {};

  function retrieveModule(modIdentifier) {
    if (cachedModules[modIdentifier]) {
      return cachedModules[modIdentifier].exports;
    }

    const currentModule = cachedModules[modIdentifier] = {
      id: modIdentifier,
      loaded: false,
      exports: {}
    };

    sourceModules[modIdentifier].call(currentModule.exports, currentModule, currentModule.exports, retrieveModule);
    currentModule.loaded = true;
    return currentModule.exports;
  }

  retrieveModule.moduleSources = sourceModules;
  retrieveModule.moduleCache = cachedModules;

  retrieveModule.definePropertyAccessor = function (targetObj, propName, getFunc) {
    if (!retrieveModule.hasOwnProp(targetObj, propName)) {
      Object.defineProperty(targetObj, propName, {
        enumerable: true,
        get: getFunc
      });
    }
  };

  retrieveModule.markEsModule = function (exportObj) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportObj, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(exportObj, "__esModule", {
      value: true
    });
  };

  retrieveModule.interopDefault = function (sourceVal, flagMask) {
    if (1 & flagMask) sourceVal = retrieveModule(sourceVal);
    if (8 & flagMask) return sourceVal;
    if (4 & flagMask && typeof sourceVal === "object" && sourceVal && sourceVal.__esModule) return sourceVal;

    const defaultExportObject = Object.create(null);
    retrieveModule.markEsModule(defaultExportObject);
    Object.defineProperty(defaultExportObject, "default", {
      enumerable: true,
      value: sourceVal
    });

    if (2 & flagMask && typeof sourceVal !== "string") {
      for (const propKey in sourceVal) {
        retrieveModule.definePropertyAccessor(defaultExportObject, propKey, (function (key) {
          return sourceVal[key];
        }).bind(null, propKey));
      }
    }
    return defaultExportObject;
  };

  retrieveModule.createExportNamespace = function (modRef) {
    const defaultGetter = modRef && modRef.__esModule ? function () {
      return modRef.default;
    } : function () {
      return modRef;
    };
    retrieveModule.definePropertyAccessor(defaultGetter, "a", defaultGetter);
    return defaultGetter;
  };

  retrieveModule.hasOwnProp = function (objToCheck, keyName) {
    return Object.prototype.hasOwnProperty.call(objToCheck, keyName);
  };

  retrieveModule.publicAssetPath = "";

  return retrieveModule(retrieveModule.startupModule = 0);
}([
  function (currentModule, moduleExports, getDependency) {
    getDependency(1)(getDependency(2).readFileSync("/dev/stdin", "UTF-8"));
  },
  function (currentModule, moduleExports, getDependency) {
    "use strict";

    function extractFixedLengthArray(sourceItems, desiredLength) {
      if (Array.isArray(sourceItems)) return sourceItems;

      const collectedElements = [];
      let iterationCompleted = false;
      let encounteredError = false;
      let errorDetails = undefined;

      try {
        let nextResult;
        for (
          let itemIterator = sourceItems[Symbol.iterator](); !(iterationCompleted = (nextResult = itemIterator.next()).done) &&
          (collectedElements.push(nextResult.value), !desiredLength || collectedElements.length !== desiredLength);
          iterationCompleted = true
        ) {}
      } catch (err) {
        encounteredError = true;
        errorDetails = err;
      } finally {
        try {
          if (!iterationCompleted && itemIterator.return != null) itemIterator.return();
        } finally {
          if (encounteredError) throw errorDetails;
        }
      }
      return collectedElements;
    }

    class LinkedQueue {
      constructor() {
        this.elementCount = 0;
        this.frontSentinel = {
          dataValue: undefined,
          prevNode: undefined,
          nextNode: undefined
        };
        this.backSentinel = {
          dataValue: undefined,
          prevNode: undefined,
          nextNode: undefined
        };
      }

      enqueueItem(itemData) {
        this.elementCount += 1;
        const newNode = {
          dataValue: itemData,
          prevNode: undefined,
          nextNode: undefined
        };

        if (this.frontSentinel.nextNode) {
          this.backSentinel.prevNode.nextNode = newNode;
          newNode.prevNode = this.backSentinel.prevNode;
          newNode.nextNode = this.backSentinel;
          this.backSentinel.prevNode = newNode;
        } else {
          this.frontSentinel.nextNode = newNode;
          this.backSentinel.prevNode = newNode;
          newNode.prevNode = this.frontSentinel;
          newNode.nextNode = this.backSentinel;
        }
      }

      dequeueItem() {
        if (this.elementCount !== 0) {
          this.elementCount -= 1;
          const removedValue = this.frontSentinel.nextNode.dataValue;
          this.frontSentinel.nextNode = this.frontSentinel.nextNode.nextNode;
          this.frontSentinel.nextNode.prevNode = this.frontSentinel;
          return removedValue;
        }
      }

      getAllValues() {
        const valueArray = [];
        let currentLink = this.frontSentinel.nextNode;
        while (currentLink.nextNode) {
          valueArray.push(currentLink.dataValue);
          currentLink = currentLink.nextNode;
        }
        return valueArray;
      }
    }

    currentModule.exports = function (inputStr) {
      const lineSegments = inputStr.split("\n");

      const initialNumbers = extractFixedLengthArray(
        lineSegments[0].split(" ").map(function (valStr) {
          return Number(valStr);
        }),
        2
      );

      const totalNodes = initialNumbers[0];
      const numQueries = initialNumbers[1];

      const adjacencyList = new Array(totalNodes);

      for (let edgeCounter = 0; edgeCounter < totalNodes - 1; edgeCounter++) {
        const currentEdgeNodes = extractFixedLengthArray(
          lineSegments[edgeCounter + 1].split(" ").map(function (valStr) {
            return Number(valStr) - 1;
          }),
          2
        );
        const firstNode = currentEdgeNodes[0];
        const secondNode = currentEdgeNodes[1];

        if (!adjacencyList[firstNode]) adjacencyList[firstNode] = [];
        if (!adjacencyList[secondNode]) adjacencyList[secondNode] = [];

        adjacencyList[firstNode].push(secondNode);
        adjacencyList[secondNode].push(firstNode);
      }

      const nodeValueAccumulators = new Array(totalNodes).fill(0);

      for (let queryCounter = 0; queryCounter < numQueries; queryCounter++) {
        const queryData = extractFixedLengthArray(
          lineSegments[queryCounter + totalNodes].split(" ").map(function (valStr) {
            return Number(valStr);
          }),
          2
        );
        const targetNodeIndex = queryData[0];
        const valueToAdd = queryData[1];
        nodeValueAccumulators[targetNodeIndex - 1] += valueToAdd;
      }

      const bfsQueue = new LinkedQueue();
      const nodeVisitedStatus = new Array(totalNodes).fill(0);

      bfsQueue.enqueueItem(0);

      while (bfsQueue.elementCount > 0) {
        const currentNodeIdentifier = bfsQueue.dequeueItem();
        nodeVisitedStatus[currentNodeIdentifier] = 1;

        let iterationActive = true;
        let loopHadError = false;
        let loopErrorObject = undefined;

        try {
          let nextAdjResult;
          for (
            let adjIterator = adjacencyList[currentNodeIdentifier][Symbol.iterator](); !(iterationActive = (nextAdjResult = adjIterator.next()).done);
            iterationActive = true
          ) {
            const connectedNodeIdentifier = nextAdjResult.value;
            if (nodeVisitedStatus[connectedNodeIdentifier] !== 1) {
              nodeValueAccumulators[connectedNodeIdentifier] += nodeValueAccumulators[currentNodeIdentifier];
              bfsQueue.enqueueItem(connectedNodeIdentifier);
            }
          }
        } catch (err) {
          loopHadError = true;
          loopErrorObject = err;
        } finally {
          try {
            if (!iterationActive && adjIterator.return != null) adjIterator.return();
          } finally {
            if (loopHadError) throw loopErrorObject;
          }
        }
      }

      console.log(nodeValueAccumulators.join(" "));
    };
  },
  function (currentModule, moduleExports) {
    currentModule.exports = require("fs");
  },
]);