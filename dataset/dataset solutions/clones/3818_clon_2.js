module.exports=function(moduleDefinitions){
  var moduleStore={};

  function loadModule(moduleId) {
    if(moduleStore[moduleId]) return moduleStore[moduleId].exports;
    var currentModule = moduleStore[moduleId] = { identifier: moduleId, loaded: !1, exports: {} };
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);
    currentModule.loaded = !0;
    return currentModule.exports;
  }

  loadModule.definitions = moduleDefinitions;
  loadModule.moduleCache = moduleStore;

  loadModule.defineProperty = function(targetObject, propertyName, propertyDescriptor) {
    loadModule.hasOwn(targetObject, propertyName) || Object.defineProperty(targetObject, propertyName, {
      enumerable: !0,
      get: propertyDescriptor
    });
  };

  loadModule.registerNamespace = function(targetObject) {
    "undefined"!=typeof Symbol && Symbol.toStringTag && Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
    Object.defineProperty(targetObject, "__esModule", { value: !0 });
  };

  loadModule.interopRequire = function(targetModule, typeFlags) {
    if(1 & typeFlags && (targetModule = loadModule(targetModule)), 8 & typeFlags) return targetModule;
    if(4 & typeFlags && "object" == typeof targetModule && targetModule && targetModule.__esModule) return targetModule;
    var newNamespace = Object.create(null);
    loadModule.registerNamespace(newNamespace);
    Object.defineProperty(newNamespace, "default", { enumerable: !0, value: targetModule });
    if(2 & typeFlags && "string" != typeof targetModule) {
      for(var propKey in targetModule) {
        loadModule.defineProperty(newNamespace, propKey, (function(key){
          return targetModule[key];
        }).bind(null, propKey));
      }
    }
    return newNamespace;
  };

  loadModule.getExport = function(targetModule) {
    var exportGetter = targetModule && targetModule.__esModule ? function() { return targetModule.default; } : function() { return targetModule; };
    return loadModule.defineProperty(exportGetter, "a", exportGetter), exportGetter;
  };

  loadModule.hasOwn = function(targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  loadModule.publicPath = String();

  return loadModule(loadModule.startupModule = 0);
}(
[
  function(entryModule, entryExports, localRequire) {
    "use strict";
    var fileSystemUtil = localRequire(1);
    localRequire(2)(fileSystemUtil.readFileSync("/dev/stdin", "utf8"));
  },

  function(fsModule, fsExports) {
    fsModule.exports = require("node:fs");
  },

  function(processorModule, processorExports, moduleResolver) {
    "use strict";
    var dataProcessorClass = moduleResolver(3),
        executeProcessingLogic = moduleResolver(5);
    processorModule.exports = function(rawDataString) {
      var parserInstance = new dataProcessorClass(rawDataString);
      executeProcessingLogic(parserInstance);
    };
  },

  function(parserModule, parserExports, moduleFetcher) {
    "use strict";
    var tokenQueueClass = moduleFetcher(4);
    parserModule.exports = class InputDataProcessor {
      constructor(fullInputText) {
        var parsedTokens = fullInputText.trim().split(/\s+/g);
        this.tokenStream = new tokenQueueClass(parsedTokens);
      }
      readStringToken() {
        return this.tokenStream.dequeueItem();
      }
      readIntegerToken() {
        return Number.parseInt(this.tokenStream.dequeueItem(), 10);
      }
      resetParser() {
        this.tokenStream.emptyQueue();
      }
    };
  },

  function(queueModule, queueExports, moduleSource) {
    "use strict";
    queueModule.exports = class SimpleElementQueue {
      constructor() {
        var initialElements = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
        this.elementCount = initialElements.length;
        this.elementStorage = initialElements;
        this.currentIndex = 0;
      }
      enqueueItem(newItem) {
        this.elementCount += 0x1;
        this.elementStorage.push(newItem);
      }
      dequeueItem() {
        var retrievedElement = this.elementStorage[this.currentIndex];
        this.elementCount -= 0x1;
        this.currentIndex += 0x1;
        return retrievedElement;
      }
      emptyQueue() {
        this.elementStorage = [];
        this.elementCount = 0;
        this.currentIndex = 0;
      }
    };
  },

  function(logicModule, logicExports, logicResolver) {
    "use strict";
    logicModule.exports = function(inputReader) {
      for(
        var numEntries = inputReader.readIntegerToken(),
            valueArray = new Array(numEntries),
            loopCounter = 0;
        loopCounter < numEntries;
        loopCounter++
      ) {
        valueArray[loopCounter] = inputReader.readIntegerToken();
      }

      if(valueArray[0] == 0x0) {
        for(
          var totalOperations = 0,
              prevValue = 0,
              arrayIndex = 1;
          arrayIndex < numEntries;
          arrayIndex++
        ) {
          if(prevValue <= valueArray[arrayIndex]) {
            if(valueArray[arrayIndex] - prevValue > 1) {
              return void globalThis.console.log(-1);
            }
            valueArray[arrayIndex] - prevValue == 1 && totalOperations++;
            valueArray[arrayIndex] - prevValue == 0 && (totalOperations += valueArray[arrayIndex]);
          } else {
            totalOperations += valueArray[arrayIndex];
          }
          prevValue = valueArray[arrayIndex];
        }
        globalThis.console.log(totalOperations);
      } else {
        globalThis.console.log(-1);
      }
    };
  }
]);