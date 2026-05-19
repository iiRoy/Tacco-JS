module.exports = function (moduleMap) {
  var moduleCache = {};

  function requireModule(moduleId) {
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    var moduleObj = moduleCache[moduleId] = {
      identifier: moduleId,
      isLoaded: false,
      exports: {}
    };

    moduleMap[moduleId].call(moduleObj.exports, moduleObj, moduleObj.exports, requireModule);

    moduleObj.isLoaded = true;

    return moduleObj.exports;
  }

  requireModule.modules = moduleMap;

  requireModule.cache = moduleCache;

  requireModule.defineExport = function (target, propName, getter) {
    if (!requireModule.hasOwnProperty(target, propName)) {
      Object.defineProperty(target, propName, {
        enumerable: true,
        get: getter
      });
    }
  };

  requireModule.registerModule = function (exportsObj) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportsObj, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(exportsObj, "__esModule", { value: true });
  };

  requireModule.createNamespaceObject = function (moduleRef, mode) {
    if (1 & mode) {
      moduleRef = requireModule(moduleRef);
    }
    if (8 & mode) {
      return moduleRef;
    }
    if (4 & mode && typeof moduleRef === "object" && moduleRef && moduleRef.__esModule) {
      return moduleRef;
    }

    var namespaceObj = Object.create(null);
    requireModule.registerModule(namespaceObj);
    Object.defineProperty(namespaceObj, "default", { enumerable: true, value: moduleRef });

    if (2 & mode && typeof moduleRef !== "string") {
      for (var propKey in moduleRef) {
        requireModule.defineExport(namespaceObj, propKey, (function (currentProp) {
          return moduleRef[currentProp];
        }).bind(null, propKey));
      }
    }
    return namespaceObj;
  };

  requireModule.getModuleExports = function (moduleExports) {
    var getterFn = moduleExports && moduleExports.__esModule
      ? function () { return moduleExports.default; }
      : function () { return moduleExports; };
    requireModule.defineExport(getterFn, "a", getterFn);
    return getterFn;
  };

  requireModule.hasOwnProperty = function (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };

  requireModule.publicPath = "";

  return requireModule(requireModule.startupModule = 0);
}([
  function (moduleRef, exportsRef, localRequire) {
    localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8"));
  },
  function (moduleRef, exportsRef) {
    moduleRef.exports = function (inputString) {
      var linesArray = inputString.split("\n");
      var moduloValue = 1000000007;
      var numLines = Number(linesArray[0]);
      var firstArray = linesArray[1].split("");
      var secondArray = linesArray[2].split("");

      var resultProduct = 1;
      var previousMatchState = 0; // 0: none, 1: same, 2: different

      for (var loopIndex = 0; loopIndex < numLines; loopIndex++) {
        if (firstArray[loopIndex] === secondArray[loopIndex]) {
          if (previousMatchState === 0) {
            resultProduct *= 3;
          } else if (previousMatchState === 1) {
            resultProduct *= 2;
          } else if (previousMatchState === 2) {
            resultProduct *= 1;
          }
          previousMatchState = 1;
          resultProduct %= moduloValue;
        } else {
          if (previousMatchState === 0) {
            resultProduct *= 6;
          } else if (previousMatchState === 1) {
            resultProduct *= 2;
          } else if (previousMatchState === 2) {
            resultProduct *= 3;
          }
          resultProduct %= moduloValue;
          previousMatchState = 2;
          loopIndex += 1;
        }
      }
      console.log(resultProduct);
    };
  },
  function (moduleRef, exportsRef) {
    moduleRef.exports = require("fs");
  }
]);
