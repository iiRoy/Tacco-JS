module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function localRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, localRequire);
        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    localRequire.m = moduleDefinitions;
    localRequire.c = moduleCache;

    localRequire.d = function(targetExports, propertyName, getterFunction) {
        localRequire.o(targetExports, propertyName) || Object.defineProperty(targetExports, propertyName, {
            enumerable: true,
            get: getterFunction
        });
    };

    localRequire.r = function(targetExports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetExports, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(targetExports, '__esModule', {
            value: true
        });
    };

    localRequire.t = function(moduleValue, modeFlags) {
        if (modeFlags & 1 && (moduleValue = localRequire(moduleValue))) return moduleValue;
        if (modeFlags & 8) return moduleValue;
        if (modeFlags & 4 && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) return moduleValue;
        var newObject = Object.create(null);
        localRequire.r(newObject);
        Object.defineProperty(newObject, 'default', {
            enumerable: true,
            value: moduleValue
        });
        if (modeFlags & 2 && typeof moduleValue !== 'string') {
            for (var propName in moduleValue) {
                localRequire.d(newObject, propName, (function(currentProp) {
                    return moduleValue[currentProp];
                }).bind(null, propName));
            }
        }
        return newObject;
    };

    localRequire.n = function(moduleValue) {
        var defaultGetter = moduleValue && moduleValue.__esModule ?
            function() {
                return moduleValue.default;
            } :
            function() {
                return moduleValue;
            };
        localRequire.d(defaultGetter, 'a', defaultGetter);
        return defaultGetter;
    };

    localRequire.o = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    localRequire.p = '';
    return localRequire(localRequire.s = 0);
}([
    function(currentModule, moduleExports, localRequire) {
        "use strict";
        var fileSystemModule = localRequire(1);
        localRequire(2)(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
    },
    function(currentModule, moduleExports) {
        currentModule.exports = require("fs");
    },
    function(currentModule, moduleExports, localRequire) {
        "use strict";
        var inputParserClass = localRequire(3);
        var solverFunction = localRequire(5);
        currentModule.exports = function(inputString) {
            var parserInstance = new inputParserClass(inputString);
            solverFunction(parserInstance);
        };
    },
    function(currentModule, moduleExports, localRequire) {
        "use strict";
        var queueClass = localRequire(4);
        currentModule.exports = class InputProcessor {
            constructor(rawInput) {
                var parsedTokens = rawInput.trim().split(/\s+/g);
                this.inputQueue = new queueClass(parsedTokens);
            }
            readString() {
                return this.inputQueue.dequeue();
            }
            readInt() {
                return parseInt(this.inputQueue.dequeue(), 10);
            }
            finishProcessing() {
                this.inputQueue.clearQueue();
            }
        };
    },
    function(currentModule, moduleExports, localRequire) {
        "use strict";
        currentModule.exports = class SimpleQueue {
            constructor() {
                var initialElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                this.queueSize = initialElements.length;
                this.queueElements = initialElements;
                this.currentIndex = 0;
            }
            enqueue(elementToAdd) {
                this.queueSize += 1;
                this.queueElements.push(elementToAdd);
            }
            dequeue() {
                var dequeuedElement = this.queueElements[this.currentIndex];
                this.queueSize -= 1;
                this.currentIndex += 1;
                return dequeuedElement;
            }
            clearQueue() {
                this.queueElements = [];
                this.queueSize = 0;
                this.currentIndex = 0;
            }
        };
    },
    function(currentModule, moduleExports, localRequire) {
        "use strict";
        currentModule.exports = function(inputReader) {
            inputReader.readInt(); // Discard first integer
            var arrayLength = inputReader.readInt();
            var dataArray = new Array(arrayLength);
            var maxValue = 0;
            var maxIndex = 0;

            for (var loopCounter = 0; loopCounter < arrayLength; loopCounter++) {
                dataArray[loopCounter] = inputReader.readInt();
                if (dataArray[loopCounter] > maxValue) {
                    maxValue = dataArray[loopCounter];
                    maxIndex = loopCounter;
                }
            }

            var sumOfOthers = 0;
            for (var iteratorVar = 0; iteratorVar < arrayLength; iteratorVar++) {
                if (iteratorVar !== maxIndex) {
                    sumOfOthers += dataArray[iteratorVar];
                }
            }

            var finalResult = maxValue - 1 - sumOfOthers;
            if (finalResult < 0) {
                console.log(0);
            } else {
                console.log(finalResult);
            }
        };
    }
]);
