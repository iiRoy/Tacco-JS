module.exports = (function (moduleDefinitions) {
    var moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleInstance = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleInstance.exports, moduleInstance, moduleInstance.exports, moduleLoader);
        moduleInstance.loaded = true;
        return moduleInstance.exports;
    }

    moduleLoader.modules = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    var defineExportProperty = function(target, property, getter) {
        if (!moduleLoader.hasOwn(target, property)) {
            Object.defineProperty(target, property, { enumerable: true, get: getter });
        }
    };

    moduleLoader.defineExport = defineExportProperty;

    moduleLoader.markAsEsModule = function (targetModule) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(targetModule, "__esModule", { value: true });
    };

    moduleLoader.interopRequireDefault = function (targetModule, mode) {
        var resolvedModule = targetModule;
        if (1 & mode) {
            resolvedModule = moduleLoader(targetModule);
        }
        if (8 & mode) {
            return resolvedModule;
        }
        var isEsModule = (4 & mode) && typeof resolvedModule === "object" && resolvedModule && resolvedModule.__esModule;
        if (isEsModule) {
            return resolvedModule;
        }

        var defaultExportObject = Object.create(null);
        moduleLoader.markAsEsModule(defaultExportObject);
        Object.defineProperty(defaultExportObject, "default", { enumerable: true, value: resolvedModule });

        if (2 & mode && typeof resolvedModule !== "string") {
            for (var key in resolvedModule) {
                var currentKey = key;
                moduleLoader.defineExport(defaultExportObject, currentKey, (function(k) {
                    return function() { return resolvedModule[k]; };
                })(currentKey));
            }
        }
        return defaultExportObject;
    };

    moduleLoader.createDefaultExportGetter = function (targetModule) {
        var getterFunction;
        if (targetModule && targetModule.__esModule) {
            getterFunction = function () { return targetModule.default; };
        } else {
            getterFunction = function () { return targetModule; };
        }
        moduleLoader.defineExport(getterFunction, "a", getterFunction);
        return getterFunction;
    };

    moduleLoader.hasOwn = function (target, property) {
        return Object.prototype.hasOwnProperty.call(target, property);
    };

    moduleLoader.publicPath = "";

    var startupModuleId = 0;
    moduleLoader.startupModuleId = startupModuleId;
    return moduleLoader(moduleLoader.startupModuleId);
})([function (module, exports, requireModule) {
    "use strict";
    var fileSystem = requireModule(1);
    var InputHandlerClass = requireModule(2);

    var rawInputBuffer = fileSystem.readFileSync("/dev/stdin", "utf8");
    var trimmedInput = rawInputBuffer.trim();
    var splitInputArray = trimmedInput.split(/\s+/g);

    var inputProcessor = new InputHandlerClass(splitInputArray);

    var executeMainLogic = function(handler) {
        requireModule(4)(handler);
    };

    executeMainLogic(inputProcessor);

}, function (module, exports) {
    module.exports = require("fs");
}, function (module, exports, requireModule) {
    "use strict";
    var DataStoreQueue = requireModule(3);
    module.exports = class InputHandler {
        constructor(initialData) {
            var queueInstance = new DataStoreQueue(initialData);
            this.dataQueue = queueInstance;
        }
        readRaw() {
            return this.dataQueue.dequeue();
        }
        readInt() {
            var rawValue = this.dataQueue.dequeue();
            return parseInt(rawValue, 10);
        }
        enqueueData(item) {
            this.dataQueue.enqueue(item);
        }
    };
}, function (module, exports) {
    "use strict";
    module.exports = class DataStoreQueue {
        constructor() {
            var initialItems = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            this.currentSize = initialItems.length;
            this.queueItems = initialItems;
            this.currentIndex = 0;
        }
        enqueue(item) {
            this.currentSize += 1;
            this.queueItems.push(item);
        }
        dequeue() {
            var dequeuedItem = this.queueItems[this.currentIndex];
            this.currentSize -= 1;
            this.currentIndex += 1;
            return dequeuedItem;
        }
    };
}, function (module, exports) {
    "use strict";
    module.exports = function (inputHandler) {
        var loopCount = inputHandler.readInt();
        var foundOddNumber = false;

        if (loopCount <= 0) {
            console.log("second");
            return;
        }

        for (var loopIndex = 0; loopIndex < loopCount; loopIndex++) {
            var currentNumber = inputHandler.readInt();
            var isOdd = (currentNumber % 2 === 1);
            if (isOdd) {
                foundOddNumber = true;
                break;
            }
        }

        if (foundOddNumber) {
            console.log("first");
        } else {
            console.log("second");
        }
    };
}]);
