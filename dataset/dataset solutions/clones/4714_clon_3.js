module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function localRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObject = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, localRequire);
        moduleObject.l = true;
        return moduleObject.exports;
    }

    var defineProperty = Object.defineProperty;

    localRequire.m = moduleDefinitions;
    localRequire.c = moduleCache;

    localRequire.d = function(exportsObj, propName, getterFn) {
        if (!localRequire.o(exportsObj, propName)) {
            defineProperty(exportsObj, propName, {
                enumerable: true,
                get: getterFn
            });
        }
    };

    localRequire.r = function(exportsObj) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            defineProperty(exportsObj, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        defineProperty(exportsObj, '__esModule', {
            value: true
        });
    };

    localRequire.t = function(value, mode) {
        if (mode & 1) value = localRequire(value);
        if (mode & 8) return value;
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
        var newObject = Object.create(null);
        localRequire.r(newObject);
        defineProperty(newObject, 'default', {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value !== 'string') {
            for (var key in value) {
                localRequire.d(newObject, key, (function(k) {
                    return value[k];
                }).bind(null, key));
            }
        }
        return newObject;
    };

    localRequire.n = function(moduleExports) {
        var getter = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        localRequire.d(getter, 'a', getter);
        return getter;
    };

    localRequire.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    localRequire.p = "";

    return localRequire(localRequire.s = 0);
}([
    function(module, exports, localRequire) {
        "use strict";
        var fsModule = localRequire(1);
        var processInputAndSolve = localRequire(2);
        var encodingType = "utf8";
        var fileContent = fsModule.readFileSync("/dev/stdin", encodingType);
        processInputAndSolve(fileContent);
    },
    function(module, exports) {
        module.exports = require("fs");
    },
    function(module, exports, localRequire) {
        "use strict";
        var InputReaderClass = localRequire(3);
        var solveGridProblem = localRequire(5);

        module.exports = function(inputString) {
            var readerInstance = new InputReaderClass(inputString);
            solveGridProblem(readerInstance);
        };
    },
    function(module, exports, localRequire) {
        "use strict";
        var TokenQueueClass = localRequire(4);

        module.exports = class InputReader {
            constructor(rawInputString) {
                var trimmedInput = rawInputString.trim();
                var whitespaceRegex = /\s+/g;
                var inputTokens = trimmedInput.split(whitespaceRegex);
                this.tokenQueue = new TokenQueueClass(inputTokens);
            }

            readNextToken() {
                return this.tokenQueue.dequeue();
            }

            readNextInt() {
                var tokenValue = this.tokenQueue.dequeue();
                var parsedInt = parseInt(tokenValue, 10);
                return parsedInt;
            }

            finishReading() {
                this.tokenQueue.resetQueue();
            }
        };
    },
    function(module, exports, localRequire) {
        "use strict";
        module.exports = class TokenQueue {
            constructor() {
                var initialElements = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
                this.size = initialElements.length;
                this.items = initialElements;
                this.currentIndex = 0;
            }

            enqueue(item) {
                this.size += 1;
                this.items.push(item);
            }

            dequeue() {
                var dequeuedItem = this.items[this.currentIndex];
                this.size -= 1;
                this.currentIndex += 1;
                return dequeuedItem;
            }

            resetQueue() {
                this.items = [];
                this.size = 0;
                this.currentIndex = 0;
            }
        };
    },
    function(module, exports, localRequire) {
        "use strict";

        function checkSubgridMatch(mainGrid, patternGrid, rowOffset, colOffset) {
            var patternSize = patternGrid.length;
            for (var patRow = 0; patRow < patternSize; patRow++) {
                for (var patCol = 0; patCol < patternSize; patCol++) {
                    if (patternGrid[patRow][patCol] !== mainGrid[rowOffset + patRow][colOffset + patCol]) {
                        return false;
                    }
                }
            }
            return true;
        }

        module.exports = function(inputReader) {
            var gridSizeN = inputReader.readNextInt();
            var patternSizeM = inputReader.readNextInt();

            var mainGrid = new Array(gridSizeN);
            for (var gridRowIdx = 0; gridRowIdx < gridSizeN; gridRowIdx++) {
                mainGrid[gridRowIdx] = inputReader.readNextToken();
            }

            var patternGrid = new Array(patternSizeM);
            for (var patternRowIdx = 0; patternRowIdx < patternSizeM; patternRowIdx++) {
                patternGrid[patternRowIdx] = inputReader.readNextToken();
            }

            var foundMatch = false;
            var maxRowOffset = gridSizeN - patternSizeM + 1;
            var maxColOffset = gridSizeN - patternSizeM + 1;

            for (var currentGridRowOffset = 0; currentGridRowOffset < maxRowOffset; currentGridRowOffset++) {
                for (var currentGridColOffset = 0; currentGridColOffset < maxColOffset; currentGridColOffset++) {
                    var isCurrentMatch = checkSubgridMatch(mainGrid, patternGrid, currentGridRowOffset, currentGridColOffset);
                    if (isCurrentMatch) {
                        foundMatch = true;
                        break;
                    }
                }
                if (foundMatch) {
                    break;
                }
            }

            if (foundMatch) {
                console.log("Yes");
            } else {
                console.log("No");
            }
        };
    }
]);
