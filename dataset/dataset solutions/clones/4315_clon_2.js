const transformModules = function (moduleSources) {
  let moduleCache = {};

  function loadModule(moduleId) {
    if (moduleCache[moduleId]) return moduleCache[moduleId].exports;
    const currentModule = moduleCache[moduleId] = {
      id: moduleId,
      loaded: false,
      exports: {}
    };
    moduleSources[moduleId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);
    currentModule.loaded = true;
    return currentModule.exports;
  }

  loadModule.sources = moduleSources;
  loadModule.cache = moduleCache;

  loadModule.defineProp = function (targetObject, propertyName, accessorFunction) {
    loadModule.hasOwn(targetObject, propertyName) || Object.defineProperty(targetObject, propertyName, {
      enumerable: true,
      get: accessorFunction
    });
  };

  loadModule.registerNamespace = function (targetObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(targetObject, "__esModule", {
      value: true
    });
  };

  loadModule.createExport = function (originalModule, exportFlags) {
    if (1 & exportFlags && (originalModule = loadModule(originalModule))) return originalModule;
    if (8 & exportFlags) return originalModule;
    if (4 & exportFlags && typeof originalModule === "object" && originalModule && originalModule.__esModule) return originalModule;

    const newNamespace = Object.create(null);
    loadModule.registerNamespace(newNamespace);
    Object.defineProperty(newNamespace, "default", {
      enumerable: true,
      value: originalModule
    });
    if (2 & exportFlags && typeof originalModule !== "string") {
      for (const propName in originalModule) {
        loadModule.defineProp(newNamespace, propName, ((key) => originalModule[key]).bind(null, propName));
      }
    }
    return newNamespace;
  };

  loadModule.getExport = function (moduleRef) {
    const defaultExportGetter = moduleRef && moduleRef.__esModule ? () => moduleRef.default : () => moduleRef;
    loadModule.defineProp(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  loadModule.hasOwn = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  loadModule.basePath = "";
  return loadModule(loadModule.startModule = 0);
};

module.exports = transformModules([
  function (currentModule, moduleExports, moduleLoader) {
    "use strict";
    const fileSystem = moduleLoader(1);
    const inputProcessor = new (moduleLoader(2))(
      fileSystem.readFileSync("/dev/stdin", "utf8").trim().split(/\s+/g)
    );
    moduleLoader(4)(inputProcessor);
  },
  function (currentModule, moduleExports) {
    currentModule.exports = require("fs");
  },
  function (currentModule, moduleExports, moduleLoader) {
    "use strict";
    const dataQueue = moduleLoader(3);
    currentModule.exports = class InputHandler {
      constructor(initialData) {
        this.dataHandler = new dataQueue(initialData);
      }
      readString() {
        return this.dataHandler.dequeueItem();
      }
      readNumber() {
        return parseInt(this.dataHandler.dequeueItem(), 10);
      }
      resetHandler() {
        this.dataHandler.clearQueue();
      }
    };
  },
  function (currentModule, moduleExports, moduleLoader) {
    "use strict";
    currentModule.exports = class DataStoreQueue {
      constructor() {
        const initialElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        this.elementCount = initialElements.length;
        this.dataStore = initialElements;
        this.currentIndex = 0;
      }
      enqueueItem(newItem) {
        this.elementCount += 1;
        this.dataStore.push(newItem);
      }
      dequeueItem() {
        const dequeuedValue = this.dataStore[this.currentIndex];
        this.elementCount -= 1;
        this.currentIndex += 1;
        return dequeuedValue;
      }
      clearQueue() {
        this.dataStore = [];
        this.elementCount = 0;
        this.currentIndex = 0;
      }
    };
  },
  function (currentModule, moduleExports, moduleLoader) {
    "use strict";
    currentModule.exports = function (inputReaderInstance) {
      const targetValue = inputReaderInstance.readNumber();
      for (let firstNum = 1; firstNum <= 3500; firstNum++)
        for (let secondNum = 1; secondNum <= 3500; secondNum++) {
          const thirdNum = (targetValue * firstNum * secondNum) / (4 * firstNum * secondNum - targetValue * (firstNum + secondNum));
          if (thirdNum % 1 === 0 && thirdNum > 0 && thirdNum <= 3500) {
            const solutionArray = [firstNum, secondNum, thirdNum];
            return void console.log(solutionArray.join(" "));
          }
        }
    };
  }
]);