module.exports = function (moduleDefinitions) {
    var moduleCache = {};

    function getModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        var moduleInstance = moduleCache[moduleId] = {
            identifier: moduleId,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(moduleInstance.exports, moduleInstance, moduleInstance.exports, getModule);

        moduleInstance.loaded = true;
        return moduleInstance.exports;
    }

    getModule.moduleDefinitions = moduleDefinitions;
    getModule.moduleCache = moduleCache;

    getModule.definePropertyGetter = function (targetObject, propertyName, getterFunction) {
        getModule.checkOwnProperty(targetObject, propertyName) || Object.defineProperty(targetObject, propertyName, {
            enumerable: true,
            get: getterFunction
        });
    };

    getModule.markAsESModule = function (targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    getModule.interopRequireDefault = function (sourceModule, flags) {
        if (1 & flags && (sourceModule = getModule(sourceModule))) {
            // Module already processed by 'getModule'
        }
        if (8 & flags) {
            return sourceModule;
        }
        if (4 & flags && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule) {
            return sourceModule;
        }

        var defaultExport = Object.create(null);
        getModule.markAsESModule(defaultExport);

        Object.defineProperty(defaultExport, "default", {
            enumerable: true,
            value: sourceModule
        });

        if (2 & flags && typeof sourceModule !== "string") {
            for (var key in sourceModule) {
                getModule.definePropertyGetter(defaultExport, key, (function (propName) {
                    return sourceModule[propName];
                }).bind(null, key));
            }
        }
        return defaultExport;
    };

    getModule.normalizeDefault = function (sourceModule) {
        var defaultFn = sourceModule && sourceModule.__esModule ? function () {
            return sourceModule.default;
        } : function () {
            return sourceModule;
        };
        getModule.definePropertyGetter(defaultFn, "a", defaultFn);
        return defaultFn;
    };

    getModule.checkOwnProperty = function (targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    getModule.publicPath = "";

    return getModule(getModule.entryPoint = 0);
}(
    [
        function (currentModule, exportsObject, moduleLoader) {
            "use strict";
            var fileSystemUtil = moduleLoader(1);
            moduleLoader(2)(fileSystemUtil.readFileSync("/dev/stdin", "utf8"));
        },

        function (currentModule, exportsObject) {
            currentModule.exports = require("fs");
        },

        function (currentModule, exportsObject, moduleLoader) {
            "use strict";
            var dataParser = moduleLoader(3),
                sequenceProcessor = moduleLoader(5);
            currentModule.exports = function (inputString) {
                var inputProcessorInstance = new dataParser(inputString);
                sequenceProcessor(inputProcessorInstance);
            };
        },

        function (currentModule, exportsObject, moduleLoader) {
            "use strict";
            var sequenceBuffer = moduleLoader(4);
            currentModule.exports = class InputDataProcessor {
                constructor(inputContent) {
                    var tokenArray = inputContent.trim().split(/\s+/g);
                    this.inputBuffer = new sequenceBuffer(tokenArray);
                }
                readRawString() {
                    return this.inputBuffer.dequeueItem();
                }
                readInteger() {
                    return parseInt(this.inputBuffer.dequeueItem(), 10);
                }
                finishProcessing() {
                    this.inputBuffer.resetQueue();
                }
            };
        },

        function (currentModule, exportsObject, moduleLoader) {
            "use strict";
            currentModule.exports = class DataElementQueue {
                constructor() {
                    var initialElements = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
                    this.currentSize = initialElements.length;
                    this.dataElements = initialElements;
                    this.currentIndex = 0;
                }
                enqueueItem(itemToAdd) {
                    this.currentSize += 1;
                    this.dataElements.push(itemToAdd);
                }
                dequeueItem() {
                    var retrievedItem = this.dataElements[this.currentIndex];
                    this.currentSize -= 1;
                    this.currentIndex += 1;
                    return retrievedItem;
                }
                resetQueue() {
                    this.dataElements = [];
                    this.currentSize = 0;
                    this.currentIndex = 0;
                }
            };
        },

        function (currentModule, exportsObject, moduleLoader) {
            "use strict";
            currentModule.exports = function (inputHandler) {
                for (
                    var inputSequence = inputHandler.readRawString(),
                        sequenceLength = inputSequence.length,
                        maximumLength = 0,
                        outerIndex = 0;
                    outerIndex < sequenceLength - 1;
                    outerIndex++
                ) {
                    for (
                        var currentSegmentLength = 0,
                            innerIndex = outerIndex;
                        innerIndex < sequenceLength &&
                        ("A" === inputSequence[innerIndex] ||
                            "C" === inputSequence[innerIndex] ||
                            "G" === inputSequence[innerIndex] ||
                            "T" === inputSequence[innerIndex]);
                        innerIndex++
                    ) {
                        currentSegmentLength++;
                    }
                    maximumLength = Math.max(maximumLength, currentSegmentLength);
                }
                console.log(maximumLength);
            };
        }
    ]
);