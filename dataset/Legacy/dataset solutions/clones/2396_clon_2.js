module.exports = function (moduleDefinitions) {
  var moduleCache = {};

  function getModule(moduleId) {
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    var moduleObject = moduleCache[moduleId] = {
      id: moduleId,
      loaded: false,
      exports: {}
    };

    moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, getModule);

    moduleObject.loaded = true;
    return moduleObject.exports;
  }

  getModule.modules = moduleDefinitions;
  getModule.cache = moduleCache;

  getModule.defineExport = function (targetObject, propertyName, getterFunction) {
    if (!getModule.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  getModule.registerModule = function (targetModule) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetModule, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(targetModule, "__esModule", {
      value: true
    });
  };

  getModule.createNamespace = function (value, mode) {
    if (mode & 1) {
      value = getModule(value);
    }
    if (mode & 8) {
      return value;
    }
    if ((mode & 4) && typeof value === "object" && value && value.__esModule) {
      return value;
    }

    var namespaceObject = Object.create(null);
    getModule.registerModule(namespaceObject);
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: value
    });

    if ((mode & 2) && typeof value !== "string") {
      for (var key in value) {
        getModule.defineExport(namespaceObject, key, (function (currentKey) {
          return value[currentKey];
        }).bind(null, key));
      }
    }
    return namespaceObject;
  };

  getModule.getModuleDefault = function (module) {
    var getter = module && module.__esModule ?
      function () {
        return module.default;
      } :
      function () {
        return module;
      };
    getModule.defineExport(getter, "a", getter);
    return getter;
  };

  getModule.hasOwn = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  getModule.publicPath = "";

  return getModule(getModule.startupModule = 1);
}([
  function (currentModule, moduleExports, moduleRequire) {
    "use strict";
    currentModule.exports = class DynamicQueue {
      constructor() {
        var initialElements = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
        this.currentSize = initialElements.length;
        this.elementList = initialElements;
        this.currentIndex = 0;
      }

      enqueue(elementToAdd) {
        this.currentSize += 1;
        this.elementList.push(elementToAdd);
      }

      dequeue() {
        var dequeuedElement = this.elementList[this.currentIndex];
        this.currentSize -= 1;
        this.currentIndex += 1;
        return dequeuedElement;
      }

      resetQueue() {
        this.elementList = [];
        this.currentSize = 0;
        this.currentIndex = 0;
      }
    };
  },
  function (currentModule, moduleExports, moduleRequire) {
    "use strict";
    var fileSystemAccess = moduleRequire(2);
    moduleRequire(3)(fileSystemAccess.readFileSync("/dev/stdin", "utf8"));
  },
  function (currentModule, moduleExports) {
    currentModule.exports = require("fs");
  },
  function (currentModule, moduleExports, moduleRequire) {
    "use strict";
    var InputProcessorClass = moduleRequire(4);
    var problemSolverFunction = moduleRequire(5);
    currentModule.exports = function (rawInputData) {
      var inputProcessorInstance = new InputProcessorClass(rawInputData);
      problemSolverFunction(inputProcessorInstance);
    };
  },
  function (currentModule, moduleExports, moduleRequire) {
    "use strict";
    var QueueImplementation = moduleRequire(0);
    currentModule.exports = class InputProcessorClass {
      constructor(inputStringData) {
        var tokenizedInputArray = inputStringData.trim().split(/\s+/g);
        this.inputTokenQueue = new QueueImplementation(tokenizedInputArray);
      }

      readNextString() {
        return this.inputTokenQueue.dequeue();
      }

      readNextInteger() {
        return parseInt(this.inputTokenQueue.dequeue(), 10);
      }

      clearInputBuffer() {
        this.inputTokenQueue.resetQueue();
      }
    };
  },
  function (currentModule, moduleExports, moduleRequire) {
    "use strict";
    moduleRequire(0); // Ensure QueueImplementation is loaded, though not directly used here.
    currentModule.exports = function (inputHandler) {
      var numberOfNodes = inputHandler.readNextInteger();
      var nodeDegrees = new Array(numberOfNodes).fill(0);
      var nodeParentColors = new Array(numberOfNodes).fill(0);
      var edgeAssignedColors = new Array(numberOfNodes - 1);
      var maximumColorValue = 0;

      for (var currentEdgeIndex = 0; currentEdgeIndex < numberOfNodes - 1; currentEdgeIndex++) {
        var firstNode = inputHandler.readNextInteger() - 1;
        var secondNode = inputHandler.readNextInteger() - 1;

        nodeDegrees[firstNode]++;
        if (nodeDegrees[firstNode] === nodeParentColors[firstNode]) {
          nodeDegrees[firstNode]++;
        }

        maximumColorValue = Math.max(maximumColorValue, nodeDegrees[firstNode]);
        nodeParentColors[secondNode] = nodeDegrees[firstNode];
        edgeAssignedColors[currentEdgeIndex] = nodeDegrees[firstNode];
      }

      console.log(maximumColorValue);

      for (var outputLoopIndex = 0; outputLoopIndex < numberOfNodes - 1; outputLoopIndex++) {
        console.log(edgeAssignedColors[outputLoopIndex]);
      }
    };
  }
]);
