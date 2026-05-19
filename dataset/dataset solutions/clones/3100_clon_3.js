module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function webpackRequire(modId) {
        if (moduleCache[modId]) {
            return moduleCache[modId].exports;
        }
        var modObject = moduleCache[modId] = {
            i: modId,
            l: false,
            exports: {}
        };
        moduleDefinitions[modId].call(modObject.exports, modObject, modObject.exports, webpackRequire);
        modObject.l = true;
        return modObject.exports;
    }

    function defineModuleProperty(target, property, descriptor) {
        Object.defineProperty(target, property, descriptor);
    }

    webpackRequire.moduleDefinitions = moduleDefinitions;
    webpackRequire.cache = moduleCache;

    webpackRequire.defineExport = function(target, propertyName, getterFunction) {
        if (!webpackRequire.hasOwnProperty(target, propertyName)) {
            defineModuleProperty(target, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    webpackRequire.registerModule = function(targetModule) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            defineModuleProperty(targetModule, Symbol.toStringTag, {
                value: "Module"
            });
        }
        defineModuleProperty(targetModule, "__esModule", {
            value: true
        });
    };

    webpackRequire.createNamespaceObject = function(targetModule, flag) {
        if (flag & 1) {
            targetModule = webpackRequire(targetModule);
        }
        if (flag & 8) {
            return targetModule;
        }
        if (flag & 4 && typeof targetModule === "object" && targetModule && targetModule.__esModule) {
            return targetModule;
        }
        var namespaceObject = Object.create(null);
        webpackRequire.registerModule(namespaceObject);
        defineModuleProperty(namespaceObject, "default", {
            enumerable: true,
            value: targetModule
        });
        if (flag & 2 && typeof targetModule !== "string") {
            for (var key in targetModule) {
                webpackRequire.defineExport(namespaceObject, key, (function(currentKey) {
                    return targetModule[currentKey];
                }).bind(null, key));
            }
        }
        return namespaceObject;
    };

    webpackRequire.createDefaultExportGetter = function(moduleRef) {
        var getterFunc = moduleRef && moduleRef.__esModule ?
            function() {
                return moduleRef.default;
            } :
            function() {
                return moduleRef;
            };
        webpackRequire.defineExport(getterFunc, "a", getterFunc);
        return getterFunc;
    };

    webpackRequire.hasOwnProperty = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    webpackRequire.publicPath = "";

    return webpackRequire(webpackRequire.s = 0);
}([
    /* Module 0 */
    function(module, exports, req) {
        "use strict";
        const STD_IN_FILE_PATH = "/dev/stdin";
        var fileSystemModule = req(1);

        function readInputFromFile(fsHandler, filePath) {
            return fsHandler.readFileSync(filePath, "utf8");
        }
        var rawInputContent = readInputFromFile(fileSystemModule, STD_IN_FILE_PATH);
        req(2)(rawInputContent);
    },
    /* Module 1 */
    function(module, exports) {
        module.exports = require("fs");
    },
    /* Module 2 */
    function(module, exports, req) {
        "use strict";
        var InputProcessorClass = req(3);
        var solveLogicFunction = req(5);

        function executeProcessingAndSolving(inputDataString) {
            var processorInstance = new InputProcessorClass(inputDataString);
            solveLogicFunction(processorInstance);
        }
        module.exports = executeProcessingAndSolving;
    },
    /* Module 3 */
    function(module, exports, req) {
        "use strict";
        var TokenQueueClass = req(4);
        const WHITESPACE_SPLIT_REGEX = /\s+/g;

        class InputProcessor {
            constructor(rawInputText) {
                var processedTokens = rawInputText.trim().split(WHITESPACE_SPLIT_REGEX);
                this.tokenQueue = new TokenQueueClass(processedTokens);
            }
            readString() {
                return this.tokenQueue.dequeue();
            }
            readInt() {
                return parseInt(this.tokenQueue.dequeue(), 10);
            }
            clearInput() {
                this.tokenQueue.clear();
            }
        }
        module.exports = InputProcessor;
    },
    /* Module 4 */
    function(module, exports, req) {
        "use strict";
        class TokenQueue {
            constructor(initialElements = []) {
                this.items = initialElements;
                this.currentIndex = 0;
            }
            enqueue(elementToEnqueue) {
                this.items.push(elementToEnqueue);
            }
            dequeue() {
                if (this.isEmpty()) {
                    return undefined;
                }
                var dequeuedElement = this.items[this.currentIndex];
                this.currentIndex++;
                return dequeuedElement;
            }
            clear() {
                this.items = [];
                this.currentIndex = 0;
            }
            get length() {
                return this.items.length - this.currentIndex;
            }
            isEmpty() {
                return this.length === 0;
            }
            peek() {
                if (this.isEmpty()) {
                    return undefined;
                }
                return this.items[this.currentIndex];
            }
        }
        module.exports = TokenQueue;
    },
    /* Module 5 */
    function(module, exports, req) {
        "use strict";
        const VALID_DNA_BASES = new Set(['A', 'C', 'G', 'T']);

        function isACGTCharacter(char) {
            return VALID_DNA_BASES.has(char);
        }

        module.exports = function(inputHandler) {
            var sequenceString = inputHandler.readString();
            var sequenceLength = sequenceString.length;
            var maxConsecutiveLength = 0;

            for (var outerLoopIdx = 0; outerLoopIdx < sequenceLength - 1; outerLoopIdx++) {
                var currentConsecutiveLength = 0;
                var innerLoopIdx = outerLoopIdx;

                for (; innerLoopIdx < sequenceLength; innerLoopIdx++) {
                    if (isACGTCharacter(sequenceString[innerLoopIdx])) {
                        currentConsecutiveLength++;
                    } else {
                        break;
                    }
                }

                if (currentConsecutiveLength > maxConsecutiveLength) {
                    maxConsecutiveLength = currentConsecutiveLength;
                }
            }
            console.log(maxConsecutiveLength);
        };
    }
]);
