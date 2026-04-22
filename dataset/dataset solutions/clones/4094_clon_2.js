module.exports = function(sourceUnits) {
  var moduleRegistry = {};

  function fetchModule(unitId) {
    if (moduleRegistry[unitId]) {
      return moduleRegistry[unitId].exports;
    }

    var currentUnit = moduleRegistry[unitId] = {
      id: unitId,
      loaded: false,
      exports: {}
    };

    sourceUnits[unitId].call(currentUnit.exports, currentUnit, currentUnit.exports, fetchModule);
    currentUnit.loaded = true;
    return currentUnit.exports;
  }

  fetchModule.units = sourceUnits;
  fetchModule.cache = moduleRegistry;

  fetchModule.defineExport = function(exportObject, propertyName, valueGetter) {
    if (!fetchModule.hasProperty(exportObject, propertyName)) {
      Object.defineProperty(exportObject, propertyName, {
        enumerable: true,
        get: valueGetter
      });
    }
  };

  fetchModule.markAsModule = function(exportObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(exportObject, "__esModule", {
      value: true
    });
  };

  fetchModule.createNamespace = function(inputVal, processingMode) {
    if (1 & processingMode) {
      inputVal = fetchModule(inputVal);
    }
    if (8 & processingMode) {
      return inputVal;
    }
    if (4 & processingMode && typeof inputVal === "object" && inputVal && inputVal.__esModule) {
      return inputVal;
    }

    var namespaceObject = Object.create(null);
    fetchModule.markAsModule(namespaceObject);
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: inputVal
    });

    if (2 & processingMode && typeof inputVal !== "string") {
      for (var propKey in inputVal) {
        fetchModule.defineExport(namespaceObject, propKey, function(propertyName) {
          return inputVal[propertyName];
        }.bind(null, propKey));
      }
    }
    return namespaceObject;
  };

  fetchModule.retrieveDefault = function(targetModule) {
    var accessFunction = targetModule && targetModule.__esModule ? function() {
      return targetModule.default;
    } : function() {
      return targetModule;
    };
    fetchModule.defineExport(accessFunction, "a", accessFunction);
    return accessFunction;
  };

  fetchModule.hasProperty = function(targetObject, checkProperty) {
    return Object.prototype.hasOwnProperty.call(targetObject, checkProperty);
  };

  fetchModule.assetPath = "";

  return fetchModule(fetchModule.initialUnit = 0);
}([function(currentModule, exportedContent, fetchModule) {
  "use strict";
  var dataHandler = fetchModule(1);
  fetchModule(2)(dataHandler.readTextFile("/dev/stdin", "utf8"));
}, function(currentModule, exportedContent) {
  currentModule.exports = require("fs");
}, function(currentModule, exportedContent, fetchModule) {
  "use strict";
  var DataStream = fetchModule(3);
  var ProblemSolver = fetchModule(5);

  currentModule.exports = function(rawInputText) {
    var streamInstance = new DataStream(rawInputText);
    ProblemSolver(streamInstance);
  };
}, function(currentModule, exportedContent, fetchModule) {
  "use strict";
  var ItemQueue = fetchModule(4);

  currentModule.exports = class InputDataProcessor {
    constructor(sourceString) {
      var stringParts = sourceString.trim().split(/\s+/g);
      this.dataQueue = new ItemQueue(stringParts);
    }

    getNextString() {
      return this.dataQueue.dequeueElement();
    }

    getNextInteger() {
      return parseInt(this.dataQueue.dequeueElement(), 10);
    }

    finalizeProcessing() {
      this.dataQueue.resetCollection();
    }
  };
}, function(currentModule, exportedContent, fetchModule) {
  "use strict";
  currentModule.exports = class ElementStore {
    constructor() {
      var initialElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      this.elementCount = initialElements.length;
      this.elementList = initialElements;
      this.readIndex = 0;
    }

    enqueueElement(newElement) {
      this.elementCount += 1;
      this.elementList.push(newElement);
    }

    dequeueElement() {
      var extractedElement = this.elementList[this.readIndex];
      this.elementCount -= 1;
      this.readIndex += 1;
      return extractedElement;
    }

    resetCollection() {
      this.elementList = [];
      this.elementCount = 0;
      this.readIndex = 0;
    }
  };
}, function(currentModule, exportedContent, fetchModule) {
  "use strict";

  currentModule.exports = function(dataProcessor) {
    var elementCount = dataProcessor.getNextInteger();
    var valueStorage = new Array(elementCount);

    for (var loopIndex = 0; loopIndex < elementCount; loopIndex++) {
      valueStorage[loopIndex] = dataProcessor.getNextInteger();
    }

    var lowerBounds = new Array(elementCount + 1);
    var upperBounds = new Array(elementCount + 1);
    lowerBounds[elementCount] = 2;
    upperBounds[elementCount] = 2;

    for (var currentPos = elementCount - 1; currentPos >= 0; currentPos--) {
      for (var currentValue = valueStorage[currentPos]; currentValue <= lowerBounds[currentPos + 1];) {
        currentValue += valueStorage[currentPos];
      }

      if (lowerBounds[currentPos] = currentValue - 1, upperBounds[currentPos] = currentValue - valueStorage[currentPos], lowerBounds[currentPos] < valueStorage[currentPos] || upperBounds[currentPos] > lowerBounds[currentPos]) {
        return void console.log(-1);
      }
    }
    console.log(`${upperBounds[0]} ${lowerBounds[0]}`);
  };
}]);