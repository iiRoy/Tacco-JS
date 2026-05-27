module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function localRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var currentModule = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, localRequire);
        currentModule.loaded = true;
        return currentModule.exports;
    }

    localRequire.modules = moduleDefinitions;
    localRequire.cache = moduleCache;

    localRequire.define = function(targetObject, exportProperty, getterFunction) {
        if (!localRequire.hasOwnProperty(targetObject, exportProperty)) {
            Object.defineProperty(targetObject, exportProperty, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    localRequire.register = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    localRequire.interopDefault = function(moduleValue, flags) {
        if (1 & flags) moduleValue = localRequire(moduleValue);
        if (8 & flags) return moduleValue;
        if (4 & flags && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) return moduleValue;
        var namespaceObject = Object.create(null);
        localRequire.register(namespaceObject);
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: moduleValue
        });
        if (2 & flags && typeof moduleValue !== "string") {
            for (var propertyName in moduleValue) {
                localRequire.define(namespaceObject, propertyName, (function(key) {
                    return moduleValue[key];
                }).bind(null, propertyName));
            }
        }
        return namespaceObject;
    };

    localRequire.createNamespace = function(moduleValue) {
        var getModuleDefault = moduleValue && moduleValue.__esModule ?
            function() {
                return moduleValue.default;
            } :
            function() {
                return moduleValue;
            };
        localRequire.define(getModuleDefault, "a", getModuleDefault);
        return getModuleDefault;
    };

    localRequire.hasOwnProperty = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    localRequire.publicPath = "";

    return localRequire(localRequire.entryModuleId = 0);
}([
    function(module, exports, localRequire) {
        localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8"));
    },
    function(module, exports) {
        // Helper function for destructuring arrays with a limit, mimicking Babel's _slicedToArray
        function getSlicedArray(iterableInput, limitCount) {
            // Equivalent to _arrayWithHoles
            var checkArrayHoles = function(arr) {
                if (Array.isArray(arr)) return arr;
            };

            // Equivalent to _iterableToArrayLimit
            var extractIterableLimit = function(iterable, limit) {
                var collectedItems = [];
                var iterationComplete = false;
                var encounteredError = false;
                var caughtError = undefined;
                try {
                    for (var iter = iterable[Symbol.iterator](), iterResult; !(iterationComplete = (iterResult = iter.next()).done) && (collectedItems.push(iterResult.value), !limit || collectedItems.length !== limit); iterationComplete = true);
                } catch (err) {
                    encounteredError = true;
                    caughtError = err;
                } finally {
                    try {
                        if (!iterationComplete && iter["return"] != null) iter["return"]();
                    } finally {
                        if (encounteredError) throw caughtError;
                    }
                }
                return collectedItems;
            };

            // Equivalent to _nonIterableRest
            var throwNonIterableError = function() {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            };

            return checkArrayHoles(iterableInput) || extractIterableLimit(iterableInput, limitCount) || throwNonIterableError();
        }

        // Helper function to parse the input string into structured data
        function parseInputData(rawInputString) {
            var inputLines = rawInputString.split("\n");

            var firstLineNumbers = inputLines[0].split(" ").map(Number);
            var dimensions = getSlicedArray(firstLineNumbers, 2);
            var numRows = dimensions[0];
            var numCols = dimensions[1];

            // The original code calls Number(e[1]) but doesn't use the result.
            // This line preserves that exact behavior.
            var unusedSecondLineValue = Number(inputLines[1]);

            var segmentCountsArray = inputLines[2].split(" ").map(Number);

            return {
                numRows: numRows,
                numCols: numCols,
                segmentCounts: segmentCountsArray
            };
        }

        // Helper function to create an N x M matrix filled with zeros
        function createZeroFilledMatrix(rows, cols) {
            var matrix = [];
            for (var rowIndex = 0; rowIndex < rows; rowIndex++) {
                var currentRow = new Array(cols).fill(0);
                matrix.push(currentRow);
            }
            return matrix;
        }

        module.exports = function(inputString) {
            var parsedInput = parseInputData(inputString);
            var numRows = parsedInput.numRows;
            var numCols = parsedInput.numCols;
            var segmentCounts = parsedInput.segmentCounts;

            var outputMatrix = createZeroFilledMatrix(numRows, numCols);

            var currentSegmentIdentifier = 0; // Corresponds to 'c' in original
            var currentSegmentFillProgress = 0; // Corresponds to 'p' in original

            for (var matrixRowIndex = 0; matrixRowIndex < numRows; matrixRowIndex++) {
                var isEvenRow = (matrixRowIndex % 2 === 0);
                var cellValueToAssign = currentSegmentIdentifier + 1; // Intermediate variable for clarity

                if (isEvenRow) {
                    for (var colIndex = 0; colIndex < numCols; colIndex++) {
                        outputMatrix[matrixRowIndex][colIndex] = cellValueToAssign;
                        currentSegmentFillProgress++;

                        // Split the original combined conditional assignment for clarity
                        if (currentSegmentFillProgress >= segmentCounts[currentSegmentIdentifier]) {
                            currentSegmentFillProgress = 0;
                            currentSegmentIdentifier++;
                            cellValueToAssign = currentSegmentIdentifier + 1; // Update value for next cell
                        }
                    }
                } else { // Odd row: right to left traversal
                    for (var colIndex = numCols - 1; colIndex >= 0; colIndex--) {
                        outputMatrix[matrixRowIndex][colIndex] = cellValueToAssign;
                        currentSegmentFillProgress++;

                        // Split the original combined conditional assignment for clarity
                        if (currentSegmentFillProgress >= segmentCounts[currentSegmentIdentifier]) {
                            currentSegmentFillProgress = 0;
                            currentSegmentIdentifier++;
                            cellValueToAssign = currentSegmentIdentifier + 1; // Update value for next cell
                        }
                    }
                }
                console.log(outputMatrix[matrixRowIndex].join(" "));
            }
        };
    },
    function(module, exports) {
        module.exports = require("fs");
    }
]);
