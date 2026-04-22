module.exports = function(sourceModules) {
  var moduleCache = {};

  function moduleLoader(moduleId) {
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }
    var currentModule = moduleCache[moduleId] = {
      id: moduleId,
      isLoaded: false,
      exports: {}
    };
    sourceModules[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);
    currentModule.isLoaded = true;
    return currentModule.exports;
  }

  moduleLoader.sources = sourceModules;
  moduleLoader.cached = moduleCache;

  moduleLoader.defineExport = function(targetObject, exportName, getterFunction) {
    if (!moduleLoader.hasOwn(targetObject, exportName)) {
      Object.defineProperty(targetObject, exportName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  moduleLoader.registerNamespace = function(targetObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(targetObject, "__esModule", {
      value: true
    });
  };

  moduleLoader.createNamespace = function(dependency, flags) {
    if (flags & 1) {
      dependency = moduleLoader(dependency);
    }
    if (flags & 8) {
      return dependency;
    }
    if (flags & 4 && typeof dependency === "object" && dependency && dependency.__esModule) {
      return dependency;
    }
    var newNamespace = Object.create(null);
    moduleLoader.registerNamespace(newNamespace);
    Object.defineProperty(newNamespace, "default", {
      enumerable: true,
      value: dependency
    });
    if (flags & 2 && typeof dependency !== "string") {
      for (var propName in dependency) {
        moduleLoader.defineExport(newNamespace, propName, (function(prop) {
          return dependency[prop];
        }).bind(null, propName));
      }
    }
    return newNamespace;
  };

  moduleLoader.getDefaultExport = function(moduleReference) {
    var exportGetter = moduleReference && moduleReference.__esModule ?
      function() {
        return moduleReference.default;
      } :
      function() {
        return moduleReference;
      };
    moduleLoader.defineExport(exportGetter, "a", exportGetter);
    return exportGetter;
  };

  moduleLoader.hasOwn = function(targetObject, propertyKey) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
  };

  moduleLoader.publicPath = "";

  return moduleLoader(moduleLoader.startupModule = 0);
}([
  function(moduleObj, moduleExports, localLoader) {
    localLoader(1)(localLoader(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
  },
  function(mod, exp) {
    function arrayDestructHelper(iterableInput, limitCount) {
      return (function(val) {
          if (Array.isArray(val)) return val;
        })(iterableInput) ||
        (function(val, lim) {
          var tempArr = [];
          var notDone = true;
          var errorOccurred = false;
          var errorValue = undefined;
          try {
            for (var iteratorItem, iteratorObj = val[Symbol.iterator](); !(notDone = (iteratorItem = iteratorObj.next()).done) && (tempArr.push(iteratorItem.value), !lim || tempArr.length !== lim); notDone = true);
          } catch (err) {
            errorOccurred = true;
            errorValue = err;
          } finally {
            try {
              if (!notDone && iteratorObj["return"] != null) iteratorObj["return"]();
            } finally {
              if (errorOccurred) throw errorValue;
            }
          }
          return tempArr;
        })(iterableInput, limitCount) ||
        (function() {
          throw new TypeError("Cannot destructure non-iterable instance");
        })();
    }
    mod.exports = function(inputLines) {
      var parsedNumbers = arrayDestructHelper(inputLines[0].split(" ").map(function(valStr) {
        return Number(valStr);
      }), 2);
      var arrayLength = parsedNumbers[0];
      var maxAllowed = parsedNumbers[1];
      var itemCounts = inputLines[1].split(" ").map(function(valStr) {
        return Number(valStr);
      });
      var totalRemoved = 0;
      for (var currentIndex = 0; currentIndex < arrayLength; currentIndex++) {
        if (itemCounts[currentIndex] > maxAllowed) {
          totalRemoved += itemCounts[currentIndex] - maxAllowed;
          itemCounts[currentIndex] = maxAllowed;
        }
        if (currentIndex < arrayLength - 1 && itemCounts[currentIndex] + itemCounts[currentIndex + 1] > maxAllowed) {
          var excessAmount = itemCounts[currentIndex] + itemCounts[currentIndex + 1] - maxAllowed;
          itemCounts[currentIndex + 1] -= excessAmount;
          totalRemoved += excessAmount;
        }
      }
      console.log(totalRemoved);
    };
  },
  function(currentMod, modExports) {
    currentMod.exports = require("fs");
  }
]);