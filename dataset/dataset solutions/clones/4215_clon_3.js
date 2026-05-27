module.exports = (function (moduleDefinitions) {
    var moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        var moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, moduleLoader);

        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    moduleLoader.moduleDefinitions = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    moduleLoader.defineExport = function (exportsObject, propertyName, getterFunction) {
        if (!moduleLoader.hasOwnProperty(exportsObject, propertyName)) {
            Object.defineProperty(exportsObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    moduleLoader.registerESModule = function (exportsObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(exportsObject, '__esModule', {
            value: true
        });
    };

    moduleLoader.createNamespaceObject = function (moduleValue, modeFlags) {
        if (modeFlags & 1) {
            moduleValue = moduleLoader(moduleValue);
        }
        if (modeFlags & 8) {
            return moduleValue;
        }
        if (modeFlags & 4 && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }
        var namespaceObject = Object.create(null);
        moduleLoader.registerESModule(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', {
            enumerable: true,
            value: moduleValue
        });
        if (modeFlags & 2 && typeof moduleValue !== 'string') {
            for (var propName in moduleValue) {
                moduleLoader.defineExport(namespaceObject, propName, (function (currentPropName) {
                    return moduleValue[currentPropName];
                }).bind(null, propName));
            }
        }
        return namespaceObject;
    };

    moduleLoader.getDefaultExport = function (moduleValue) {
        var defaultExportGetter = moduleValue && moduleValue.__esModule ?
            function () {
                return moduleValue.default;
            } :
            function () {
                return moduleValue;
            };
        moduleLoader.defineExport(defaultExportGetter, 'a', defaultExportGetter);
        return defaultExportGetter;
    };

    moduleLoader.hasOwnProperty = function (targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    moduleLoader.publicPath = "";

    return moduleLoader(moduleLoader.entryModuleId = 0);

})([
    function (moduleObj, moduleExports, localRequire) {
        "use strict";
        var fileSystemModule = localRequire(1);
        var mainProcessorFunction = localRequire(2);
        var inputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        mainProcessorFunction(inputContent);
    },
    function (moduleObj, moduleExports) {
        moduleObj.exports = require("fs");
    },
    function (moduleObj, moduleExports, localRequire) {
        "use strict";
        var InputParserClass = localRequire(3);
        var mainAlgorithmFunction = localRequire(5);

        moduleObj.exports = function (rawInputString) {
            var parserInstance = new InputParserClass(rawInputString);
            mainAlgorithmFunction(parserInstance);
        };
    },
    function (moduleObj, moduleExports, localRequire) {
        "use strict";
        var TokenQueueClass = localRequire(4);
        const RADIX_DECIMAL = 10;

        moduleObj.exports = class InputParser {
            constructor(rawInputText) {
                var trimmedInput = rawInputText.trim();
                var parsedTokens = trimmedInput.split(/\s+/g);
                this.tokenQueue = new TokenQueueClass(parsedTokens);
            }

            readRawToken() {
                return this.tokenQueue.dequeue();
            }

            readInteger() {
                const token = this.tokenQueue.dequeue();
                return parseInt(token, RADIX_DECIMAL);
            }

            clearInput() {
                this.tokenQueue.clear();
            }

            hasMoreTokens() {
                return !this.tokenQueue.isEmpty();
            }
        };
    },
    function (moduleObj, moduleExports, localRequire) {
        "use strict";
        moduleObj.exports = class TokenQueue {
            constructor(initialItemsArray = []) {
                this.currentSize = initialItemsArray.length;
                this.queueElements = initialItemsArray;
                this.headIndex = 0;
            }

            enqueue(itemToEnqueue) {
                this.currentSize++;
                this.queueElements.push(itemToEnqueue);
            }

            dequeue() {
                if (this.isEmpty()) {
                    return undefined;
                }
                const dequeuedItem = this.queueElements[this.headIndex];
                this.currentSize--;
                this.headIndex++;
                return dequeuedItem;
            }

            clear() {
                this.queueElements = [];
                this.currentSize = 0;
                this.headIndex = 0;
            }

            isEmpty() {
                return this.currentSize === 0;
            }

            peek() {
                if (this.isEmpty()) {
                    return undefined;
                }
                return this.queueElements[this.headIndex];
            }
        };
    },
    function (moduleObj, moduleExports, localRequire) {
        "use strict";

        function calculateLastConsecutiveDigitCount(numberValue) {
            let consecutiveDigitCount = 1;
            let previousDigit = -1;
            const MIN_NUMBER_FOR_LOOP = 1;

            if (numberValue < MIN_NUMBER_FOR_LOOP && numberValue !== 0) {
                return consecutiveDigitCount;
            }
            if (numberValue === 0) { // Special handling for 0 to match original behavior (e=1, r=-1, loop doesn't run, e=1)
                return 1;
            }

            let currentNumber = numberValue;

            while (currentNumber > 0) {
                const digit = currentNumber % 10;
                if (digit === previousDigit) {
                    consecutiveDigitCount++;
                } else {
                    previousDigit = digit;
                    consecutiveDigitCount = 1;
                }
                currentNumber = Math.floor(currentNumber / 10);
            }
            return consecutiveDigitCount;
        }

        moduleObj.exports = function (inputReader) {
            const numberToAnalyze = inputReader.readInteger();
            const finalConsecutiveCount = calculateLastConsecutiveDigitCount(numberToAnalyze);

            const REQUIRED_COUNT_THRESHOLD = 3;

            if (finalConsecutiveCount >= REQUIRED_COUNT_THRESHOLD) {
                console.log("Yes");
            } else {
                console.log("No");
            }
        };
    }
]);
