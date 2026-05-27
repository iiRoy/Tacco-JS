module.exports = (function(moduleDefinitions) {
    var moduleCache = {};

    function loadModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleEntry = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, loadModule);
        moduleEntry.loaded = true;
        return moduleEntry.exports;
    }

    loadModule.modules = moduleDefinitions;
    loadModule.cache = moduleCache;

    loadModule.defineExport = function(target, exportName, getterFunction) {
        if (!loadModule.hasOwnPropertyCheck(target, exportName)) {
            Object.defineProperty(target, exportName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    loadModule.registerModule = function(targetModule) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetModule, "__esModule", {
            value: true
        });
    };

    loadModule.interopRequireWildcard = function(moduleValue, flag) {
        if (flag & 1) {
            moduleValue = loadModule(moduleValue);
        }
        if (flag & 8) {
            return moduleValue;
        }
        if (flag & 4 && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }
        var newModuleObject = Object.create(null);
        loadModule.registerModule(newModuleObject);
        Object.defineProperty(newModuleObject, "default", {
            enumerable: true,
            value: moduleValue
        });
        if (flag & 2 && typeof moduleValue !== "string") {
            for (var key in moduleValue) {
                loadModule.defineExport(newModuleObject, key, (function(currentKey) {
                    return moduleValue[currentKey];
                }).bind(null, key));
            }
        }
        return newModuleObject;
    };

    loadModule.interopRequireDefault = function(moduleValue) {
        var defaultGetter = moduleValue && moduleValue.__esModule ?
            function() {
                return moduleValue.default;
            } :
            function() {
                return moduleValue;
            };
        loadModule.defineExport(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    loadModule.hasOwnPropertyCheck = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    loadModule.publicPath = "";

    return loadModule(loadModule.modules.length - 1);
})([
    function(module, exports, requireModule) {
        "use strict";
        module.exports = class DataQueue {
            constructor(initialElements = []) {
                this.currentSize = initialElements.length;
                this.elementStorage = initialElements;
                this.readPointer = 0;
            }

            enqueue(elementToEnqueue) {
                this.currentSize += 1;
                this.elementStorage.push(elementToEnqueue);
            }

            dequeue() {
                const dequeuedElement = this.elementStorage[this.readPointer];
                this.currentSize -= 1;
                this.readPointer += 1;
                return dequeuedElement;
            }

            clearQueue() {
                this.elementStorage = [];
                this.currentSize = 0;
                this.readPointer = 0;
            }
        };
    },
    function(module, exports, requireModule) {
        "use strict";
        var fileSystemModule = requireModule(2);
        var processInput = requireModule(3);
        processInput(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
    },
    function(module, exports) {
        module.exports = require("fs");
    },
    function(module, exports, requireModule) {
        "use strict";
        var InputParserClass = requireModule(4);
        var mainProcessingLogic = requireModule(5);
        module.exports = function(inputString) {
            var inputProcessorInstance = new InputParserClass(inputString);
            mainProcessingLogic(inputProcessorInstance);
        };
    },
    function(module, exports, requireModule) {
        "use strict";
        var DataQueue = requireModule(0);
        module.exports = class InputParser {
            constructor(sourceString) {
                const trimmedInput = sourceString.trim();
                const tokenizedInput = trimmedInput.split(/\s+/g);
                this.inputQueue = new DataQueue(tokenizedInput);
            }

            readRawToken() {
                return this.inputQueue.dequeue();
            }

            readInteger() {
                const rawValue = this.inputQueue.dequeue();
                return parseInt(rawValue, 10);
            }

            finishParsing() {
                this.inputQueue.clearQueue();
            }
        };
    },
    function(module, exports, requireModule) {
        "use strict";
        requireModule(0); // Ensure DataQueue is loaded, though not directly used here.
        module.exports = function(dataReader) {
            const numberOfNodes = dataReader.readInteger();
            const nodeRankTracker = new Array(numberOfNodes).fill(0);
            const parentRankTracker = new Array(numberOfNodes).fill(0);
            const edgeRankResults = new Array(numberOfNodes - 1);

            let overallMaxRank = 0;

            for (let loopCounter = 0; loopCounter < numberOfNodes - 1; loopCounter++) {
                let firstNodeIndex = dataReader.readInteger() - 1;
                let secondNodeIndex = dataReader.readInteger() - 1;

                nodeRankTracker[firstNodeIndex]++;

                // If the new rank of firstNodeIndex matches its parent's rank, increment again.
                // This is a specific logic from the original code: r[u]==n[u]&&r[u]++
                if (nodeRankTracker[firstNodeIndex] === parentRankTracker[firstNodeIndex]) {
                    nodeRankTracker[firstNodeIndex]++;
                }

                overallMaxRank = Math.max(overallMaxRank, nodeRankTracker[firstNodeIndex]);
                parentRankTracker[secondNodeIndex] = nodeRankTracker[firstNodeIndex];
                edgeRankResults[loopCounter] = nodeRankTracker[firstNodeIndex];
            }

            console.log(overallMaxRank);

            for (let outputLoopCounter = 0; outputLoopCounter < numberOfNodes - 1; outputLoopCounter++) {
                console.log(edgeRankResults[outputLoopCounter]);
            }
        };
    }
]);
