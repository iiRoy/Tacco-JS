module.exports = function (moduleDefinitions) {
  var moduleCache = {};

  function moduleLoader(moduleId) {
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }
    var moduleObject = moduleCache[moduleId] = {
      moduleId: moduleId,
      isLoaded: false,
      exports: {}
    };
    moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, moduleLoader);
    moduleObject.isLoaded = true;
    return moduleObject.exports;
  }

  moduleLoader.moduleDefinitionsMap = moduleDefinitions;
  moduleLoader.moduleCacheMap = moduleCache;

  moduleLoader.defineExport = function (target, exportName, getterFunc) {
    moduleLoader.hasOwn(target, exportName) || Object.defineProperty(target, exportName, {
      enumerable: true,
      get: getterFunc
    });
  };

  moduleLoader.registerExports = function (target) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(target, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(target, "__esModule", {
      value: true
    });
  };

  moduleLoader.interopRequireDefault = function (targetModule, mode) {
    if (1 & mode) {
      targetModule = moduleLoader(targetModule);
    }
    if (8 & mode) {
      return targetModule;
    }
    if (4 & mode && typeof targetModule === "object" && targetModule && targetModule.__esModule) {
      return targetModule;
    }
    var newObject = Object.create(null);
    moduleLoader.registerExports(newObject);
    Object.defineProperty(newObject, "default", {
      enumerable: true,
      value: targetModule
    });
    if (2 & mode && typeof targetModule !== "string") {
      for (var key in targetModule) {
        moduleLoader.defineExport(newObject, key, function (currentKey) {
          return targetModule[currentKey];
        }.bind(null, key));
      }
    }
    return newObject;
  };

  moduleLoader.getModuleExports = function (targetModule) {
    var exportGetter = targetModule && targetModule.__esModule ? function () {
      return targetModule.default;
    } : function () {
      return targetModule;
    };
    moduleLoader.defineExport(exportGetter, "a", exportGetter);
    return exportGetter;
  };

  moduleLoader.hasOwn = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  moduleLoader.publicPath = "";

  return moduleLoader(moduleLoader.startupModuleId = 0);
}([
  function (module, exports, localRequire) {
    "use strict";
    var fileSystem = localRequire(1);
    localRequire(2)(fileSystem.readFileSync("/dev/stdin", "utf8"));
  },
  function (module, exports) {
    module.exports = require("fs");
  },
  function (module, exports, localRequire) {
    "use strict";
    var inputProcessorClass = localRequire(3),
      solverLogic = localRequire(5);
    module.exports = function (inputString) {
      var processorInstance = new inputProcessorClass(inputString);
      solverLogic(processorInstance);
    };
  },
  function (module, exports, localRequire) {
    "use strict";
    var dataQueueClass = localRequire(4);
    module.exports = class InputProcessor {
      constructor(rawInputText) {
        var tokenArray = rawInputText.trim().split(/\s+/g);
        this.inputQueue = new dataQueueClass(tokenArray);
      }
      readNextString() {
        return this.inputQueue.dequeueElement();
      }
      readNextInt() {
        return parseInt(this.inputQueue.dequeueElement(), 10);
      }
      finishReading() {
        this.inputQueue.resetQueue();
      }
    };
  },
  function (module, exports, localRequire) {
    "use strict";
    module.exports = class DataQueue {
      constructor() {
        var initialElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        this.currentSize = initialElements.length;
        this.queueElements = initialElements;
        this.currentIndex = 0;
      }
      enqueueElement(elementToAdd) {
        this.currentSize += 1;
        this.queueElements.push(elementToAdd);
      }
      dequeueElement() {
        var dequeuedItem = this.queueElements[this.currentIndex];
        this.currentSize -= 1;
        this.currentIndex += 1;
        return dequeuedItem;
      }
      resetQueue() {
        this.queueElements = [];
        this.currentSize = 0;
        this.currentIndex = 0;
      }
    };
  },
  function (inputReader) {
    for (var arrayLength = inputReader.readNextInt(), inputArray = new Array(arrayLength), loopIndex = 0; loopIndex < arrayLength; loopIndex++) {
      inputArray[loopIndex] = inputReader.readNextInt();
    }
    for (var frequencyArray = new Array(arrayLength + 1).fill(0), freqLoopIndex = 1; freqLoopIndex <= arrayLength; freqLoopIndex++) {
      frequencyArray[inputArray[freqLoopIndex]] = frequencyArray[inputArray[freqLoopIndex] - 1] + 1;
    }
    for (var maxFrequency = 0, maxFreqLoopIndex = 1; maxFreqLoopIndex <= arrayLength; maxFreqLoopIndex++) {
      maxFrequency = Math.max(maxFrequency, frequencyArray[maxFreqLoopIndex]);
    }
    console.log(arrayLength - maxFrequency);
  }
]);
