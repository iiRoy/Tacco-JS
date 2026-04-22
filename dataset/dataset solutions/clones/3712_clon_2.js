module.exports = function (moduleDefinitions) {
  var cachedInstances = {};

  function moduleFetcher(requestedId) {
    if (cachedInstances[requestedId]) {
      return cachedInstances[requestedId].exports;
    }
    var currentModule = cachedInstances[requestedId] = {
      id: requestedId,
      loaded: false,
      exports: {}
    };
    moduleDefinitions[requestedId].call(currentModule.exports, currentModule, currentModule.exports, moduleFetcher);
    currentModule.loaded = true;
    return currentModule.exports;
  }

  moduleFetcher.catalog = moduleDefinitions;
  moduleFetcher.cache = cachedInstances;

  moduleFetcher.defineProp = function (targetObj, propName, propGetter) {
    if (!moduleFetcher.hasOwn(targetObj, propName)) {
      Object.defineProperty(targetObj, propName, {
        enumerable: true,
        get: propGetter
      });
    }
  };

  moduleFetcher.registerNamespace = function (exportObj) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportObj, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(exportObj, "__esModule", {
      value: true
    });
  };

  moduleFetcher.interopRequire = function (sourceModule, modeBits) {
    if (1 & modeBits) {
      sourceModule = moduleFetcher(sourceModule);
    }
    if (8 & modeBits) {
      return sourceModule;
    }
    if (4 & modeBits && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule) {
      return sourceModule;
    }
    var namespaceObj = Object.create(null);
    moduleFetcher.registerNamespace(namespaceObj);
    Object.defineProperty(namespaceObj, "default", {
      enumerable: true,
      value: sourceModule
    });
    if (2 & modeBits && typeof sourceModule !== "string") {
      for (var propKey in sourceModule) {
        moduleFetcher.defineProp(namespaceObj, propKey, (function (keyToBind) {
          return sourceModule[keyToBind];
        }).bind(null, propKey));
      }
    }
    return namespaceObj;
  };

  moduleFetcher.importDefault = function (inputModule) {
    var defaultGetter = inputModule && inputModule.__esModule ? function () {
      return inputModule.default;
    } : function () {
      return inputModule;
    };
    moduleFetcher.defineProp(defaultGetter, "a", defaultGetter);
    return defaultGetter;
  };

  moduleFetcher.hasOwn = function (checkObj, checkKey) {
    return Object.prototype.hasOwnProperty.call(checkObj, checkKey);
  };

  moduleFetcher.basePath = "";

  return moduleFetcher(moduleFetcher.startupId = 0);
}(
  [
    function (moduleObj0, exportsObj0, fetcher0) {
      fetcher0(1)(fetcher0(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },
    function (moduleObj1, exportsObj1) {
      moduleObj1.exports = function (inputLinesData) {
        var elementCount = Number(inputLinesData[0]);
        var numericValues = inputLinesData[1].split(" ").map(function (valStr) {
          return Number(valStr);
        });

        var adjustedValues = new Array(elementCount).fill(0);
        for (var idx = 0; idx < elementCount; idx++) {
          adjustedValues[idx] = numericValues[idx] - idx - 1;
        }

        adjustedValues.sort(function (valA, valB) {
          return valA - valB;
        });

        var centralValue = 0;
        centralValue = elementCount % 2 === 0 ? adjustedValues[elementCount / 2 - 1] + adjustedValues[elementCount / 2] : adjustedValues[Math.floor(elementCount / 2)];

        var totalAbsDiff = 0;
        for (var loopIndex = 0; loopIndex < elementCount; loopIndex++) {
          totalAbsDiff += Math.abs(adjustedValues[loopIndex] - centralValue);
        }
        console.log(totalAbsDiff);
      };
    },
    function (moduleObj2, exportsObj2) {
      moduleObj2.exports = require("fs");
    }
  ]
);