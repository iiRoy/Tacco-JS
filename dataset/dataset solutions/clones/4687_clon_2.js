module.exports = function (entryModuleDefinitions) {
  var moduleCache = {};

  function requireModule(moduleId) {
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    var moduleObject = moduleCache[moduleId] = {
      id: moduleId,
      isLoaded: false,
      exports: {}
    };

    entryModuleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, requireModule);

    moduleObject.isLoaded = true;

    return moduleObject.exports;
  }

  requireModule.modules = entryModuleDefinitions;

  requireModule.cachedModules = moduleCache;

  requireModule.defineExport = function (targetObject, exportName, getterFunction) {
    if (!requireModule.hasProperty(targetObject, exportName)) {
      Object.defineProperty(targetObject, exportName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  requireModule.markAsESModule = function (moduleToMark) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(moduleToMark, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(moduleToMark, "__esModule", {
      value: true
    });
  };

  requireModule.interopNamespace = function (sourceModule, interopFlags) {
    if ((interopFlags & 1) && (sourceModule = requireModule(sourceModule))) {
      return sourceModule;
    }

    if ((interopFlags & 8)) {
      return sourceModule;
    }

    if ((interopFlags & 4) && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule) {
      return sourceModule;
    }

    var newNamespaceObject = Object.create(null);

    requireModule.markAsESModule(newNamespaceObject);

    Object.defineProperty(newNamespaceObject, "default", {
      enumerable: true,
      value: sourceModule
    });

    if ((interopFlags & 2) && typeof sourceModule !== "string") {
      for (var exportKey in sourceModule) {
        requireModule.defineExport(newNamespaceObject, exportKey, function (key) {
          return sourceModule[key];
        }.bind(null, exportKey));
      }
    }

    return newNamespaceObject;
  };

  requireModule.getDefaultExportGetter = function (importedModule) {
    var defaultGetter = importedModule && importedModule.__esModule ?
      function () {
        return importedModule.default;
      } :
      function () {
        return importedModule;
      };

    requireModule.defineExport(defaultGetter, "a", defaultGetter);

    return defaultGetter;
  };

  requireModule.hasProperty = function (targetObj, propertyId) {
    return Object.prototype.hasOwnProperty.call(targetObj, propertyId);
  };

  requireModule.assetPath = "";

  return requireModule(requireModule.entryPoint = 0);

}([
  function (currentModule, moduleExports, localRequire) {
    localRequire(1)(localRequire(2).readInputSync("/dev/stdin", "UTF-8").split("\n"));
  },
  function (currentModule, moduleExports) {

    function getArrayElements(inputArray, elementCount) {
      return (function (arr) {
          if (Array.isArray(arr)) {
            return arr;
          }
        })(inputArray) ||
        (function (arr, len) {
          var temporaryElements = [],
            isIterationComplete = true,
            hasErrorOccurred = false,
            errorValue = undefined;

          try {
            for (
              var arrayIteration,
                currentIterator = arr[Symbol.iterator](); !(isIterationComplete = (arrayIteration = currentIterator.next()).done) &&
              (temporaryElements.push(arrayIteration.value), !len || temporaryElements.length !== len);
              isIterationComplete = true
            ) {}
          } catch (err) {
            hasErrorOccurred = true;
            errorValue = err;
          } finally {
            try {
              if (!isIterationComplete && currentIterator.return != null) {
                currentIterator.return();
              }
            } finally {
              if (hasErrorOccurred) {
                throw errorValue;
              }
            }
          }
          return temporaryElements;
        })(inputArray, elementCount) ||
        (function () {
          throw new TypeError("Invalid attempt to destructure non-iterable instance");
        })();
    }

    currentModule.exports = function (inputLines) {
      var initialValues = getArrayElements(
          inputLines[0].split(" ").map(function (numericString) {
            return Number(numericString);
          }),
          3
        ),
        numItems = initialValues[0],
        maxContainers = initialValues[1],
        spreadTolerance = initialValues[2],
        itemMeasurements = [];

      for (var itemIndex = 0; itemIndex < numItems; itemIndex++) {
        var currentMeasurement = Number(inputLines[itemIndex + 1]);
        itemMeasurements.push(currentMeasurement);
      }

      itemMeasurements.sort(function (valA, valB) {
        return valA - valB;
      });

      var totalGroups = 1,
        remainingCapacity = maxContainers - 1,
        currentGroupBase = itemMeasurements[0];

      for (var measureIdx = 1; measureIdx < numItems; measureIdx++) {
        if (itemMeasurements[measureIdx] <= currentGroupBase + spreadTolerance && remainingCapacity > 0) {
          remainingCapacity -= 1;
        } else {
          totalGroups += 1;
          remainingCapacity = maxContainers - 1;
          currentGroupBase = itemMeasurements[measureIdx];
        }
      }
      console.log(totalGroups);
    };
  },
  function (currentModule, moduleExports) {
    currentModule.exports = require("filesystem");
  }
]);