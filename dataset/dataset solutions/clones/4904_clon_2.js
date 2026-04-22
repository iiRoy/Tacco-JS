var applicationModules = function (moduleDefinitions) {
  var moduleCache = {};

  function retrieveModule(moduleId) {
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    var moduleObject = moduleCache[moduleId] = {
      id: moduleId,
      loaded: false,
      exports: {}
    };

    moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, retrieveModule);

    moduleObject.loaded = true;
    return moduleObject.exports;
  }

  retrieveModule.moduleStore = moduleDefinitions;
  retrieveModule.moduleMap = moduleCache;

  retrieveModule.defineExport = function (targetObject, propertyName, getterFunction) {
    if (!retrieveModule.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  retrieveModule.registerEsModule = function (targetModule) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetModule, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(targetModule, "__esModule", {
      value: true
    });
  };

  retrieveModule.getExport = function (moduleValue, exportFlags) {
    if (exportFlags & 1) {
      moduleValue = retrieveModule(moduleValue);
    }
    if (exportFlags & 8) {
      return moduleValue;
    }
    if (exportFlags & 4 && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
      return moduleValue;
    }

    var exportContainer = Object.create(null);
    retrieveModule.registerEsModule(exportContainer);
    Object.defineProperty(exportContainer, "default", {
      enumerable: true,
      value: moduleValue
    });

    if (exportFlags & 2 && typeof moduleValue !== "string") {
      for (var propName in moduleValue) {
        retrieveModule.defineExport(exportContainer, propName, function (key) {
          return moduleValue[key];
        }.bind(null, propName));
      }
    }
    return exportContainer;
  };

  retrieveModule.getNamespace = function (moduleRef) {
    var defaultGetter = moduleRef && moduleRef.__esModule ? function () {
      return moduleRef.default;
    } : function () {
      return moduleRef;
    };
    retrieveModule.defineExport(defaultGetter, "a", defaultGetter);
    return defaultGetter;
  };

  retrieveModule.hasOwn = function (targetObj, propName) {
    return Object.prototype.hasOwnProperty.call(targetObj, propName);
  };

  retrieveModule.publicPath = "";

  return retrieveModule(retrieveModule.startupModule = 0);
}([function (moduleObj, moduleExports, moduleLoader) {
  "use strict";
  var fileSystemUtil = moduleLoader(1);
  moduleLoader(2)(fileSystemUtil.readFileSync("/dev/stdin", "utf8"));
}, function (moduleObj, moduleExports) {
  moduleObj.exports = require("fs");
}, function (moduleObj, moduleExports, moduleLoader) {
  "use strict";
  var inputReaderClass = moduleLoader(3);
  var processDataFunc = moduleLoader(5);
  moduleObj.exports = function (inputString) {
    var readerInstance = new inputReaderClass(inputString);
    processDataFunc(readerInstance);
  };
}, function (moduleObj, moduleExports, moduleLoader) {
  "use strict";
  var dataQueueClass = moduleLoader(4);
  moduleObj.exports = class InputHandler {
    constructor(initialData) {
      var processedTokens = initialData.trim().split(/\s+/g);
      this.inputQueue = new dataQueueClass(processedTokens);
    }
    readRaw() {
      return this.inputQueue.dequeueItem();
    }
    readInt() {
      return parseInt(this.inputQueue.dequeueItem(), 10);
    }
    finalize() {
      this.inputQueue.resetQueue();
    }
  };
}, function (moduleObj, moduleExports, moduleLoader) {
  "use strict";
  moduleObj.exports = class ItemQueue {
    constructor() {
      var initialItems = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      this.currentSize = initialItems.length;
      this.queueElements = initialItems;
      this.currentIndex = 0;
    }
    enqueueItem(itemToAdd) {
      this.currentSize += 1;
      this.queueElements.push(itemToAdd);
    }
    dequeueItem() {
      var retrievedItem = this.queueElements[this.currentIndex];
      this.currentSize -= 1;
      this.currentIndex += 1;
      return retrievedItem;
    }
    resetQueue() {
      this.queueElements = [];
      this.currentSize = 0;
      this.currentIndex = 0;
    }
  };
}, function (moduleObj, moduleExports, moduleLoader) {
  "use strict";
  moduleObj.exports = function (dataProcessor) {
    dataProcessor.readInt();
    for (var elementsCount = dataProcessor.readInt(), numberArray = new Array(elementsCount), maxVal = 0, maxIdx = 0, loopCounter = 0; loopCounter < elementsCount; loopCounter++) {
      numberArray[loopCounter] = dataProcessor.readInt();
      if (numberArray[loopCounter] > maxVal) {
        maxVal = numberArray[loopCounter];
        maxIdx = loopCounter;
      }
    }
    for (var sumOfOthers = 0, anotherCounter = 0; anotherCounter < elementsCount; anotherCounter++) {
      if (anotherCounter !== maxIdx) {
        sumOfOthers += numberArray[anotherCounter];
      }
    }
    var finalResult = maxVal - 1 - sumOfOthers;
    if (finalResult < 0) {
      console.log(0);
    } else {
      console.log(finalResult);
    }
  };
}]);