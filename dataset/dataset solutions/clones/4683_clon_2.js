module.exports = function (moduleDefinitions) {
  var loadedModules = {};

  function retrieveModule (moduleId) {
    if (loadedModules[moduleId]) {
      return loadedModules[moduleId].exportedContent;
    }

    var newModule = loadedModules[moduleId] = {
      idKey: moduleId,
      isLoaded: false,
      exportedContent: {}
    };

    moduleDefinitions[moduleId].call(
      newModule.exportedContent,
      newModule,
      newModule.exportedContent,
      retrieveModule
    );

    newModule.isLoaded = true;
    return newModule.exportedContent;
  }

  retrieveModule.definitions = moduleDefinitions;
  retrieveModule.cache = loadedModules;

  retrieveModule.defineExport = function (exportObj, propName, propGetter) {
    if (!retrieveModule.hasProperty(exportObj, propName)) {
      Object.defineProperty(exportObj, propName, {
        enumerable: true,
        get: propGetter
      });
    }
  };

  retrieveModule.registerNamespace = function (namespaceObj) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(namespaceObj, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(namespaceObj, "__esModule", { value: true });
  };

  retrieveModule.resolveExport = function (moduleRef, exportFlags) {
    if (1 & exportFlags) {
      moduleRef = retrieveModule(moduleRef);
    }
    if (8 & exportFlags) {
      return moduleRef;
    }
    if (4 & exportFlags && typeof moduleRef === "object" && moduleRef && moduleRef.__esModule) {
      return moduleRef;
    }

    var tempExports = Object.create(null);
    retrieveModule.registerNamespace(tempExports);

    Object.defineProperty(tempExports, "default", {
      enumerable: true,
      value: moduleRef
    });

    if (2 & exportFlags && typeof moduleRef !== "string") {
      for (var memberKey in moduleRef) {
        retrieveModule.defineExport(
          tempExports,
          memberKey,
          (function (key) {
            return moduleRef[key];
          }).bind(null, memberKey)
        );
      }
    }
    return tempExports;
  };

  retrieveModule.createDefaultAccessor = function (moduleItem) {
    var accessorFunc = moduleItem && moduleItem.__esModule
      ? function () { return moduleItem.default; }
      : function () { return moduleItem; };

    retrieveModule.defineExport(accessorFunc, "a", accessorFunc);
    return accessorFunc;
  };

  retrieveModule.hasProperty = function (checkObj, keyName) {
    return Object.prototype.hasOwnProperty.call(checkObj, keyName);
  };

  retrieveModule.assetPath = "";

  return retrieveModule(retrieveModule.startId = 0);
}(
  [
    function (currentMod, modExports, modRequire) {
      modRequire(1)(modRequire(2).readFileSync("/dev/stdin", "UTF-8"));
    },
    function (moduleContext, exportContext) {
      moduleContext.exportedContent = function (inputDataString) {
        var dataLines = inputDataString.split("\n");
        var targetSumValue = Number(dataLines[0]);
        var resultCount = 0;
        var iterationIndex = 0;

        while (iterationIndex <= targetSumValue) {
          if (((1 + iterationIndex) * iterationIndex) / 2 >= targetSumValue) {
            resultCount = iterationIndex;
            break;
          }
          iterationIndex++;
        }
        console.log(resultCount);
      };
    },
    function (moduleHandle, exportsHandle) {
      moduleHandle.exportedContent = require("fs");
    }
  ]
);