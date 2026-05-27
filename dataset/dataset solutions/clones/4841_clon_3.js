const createModuleRuntime = function(moduleDefinitions) {
    const moduleCache = {};

    function executeModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        const moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, executeModule);
        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    executeModule.moduleDefinitions = moduleDefinitions;
    executeModule.moduleCache = moduleCache;

    executeModule.defineExportGetter = function(targetObject, propertyName, getterFunction) {
        executeModule.hasOwn(targetObject, propertyName) || Object.defineProperty(targetObject, propertyName, {
            enumerable: true,
            get: getterFunction
        });
    };

    executeModule.markAsEsModule = function(targetModule) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetModule, "__esModule", {
            value: true
        });
    };

    executeModule.interopDefault = function(moduleReference, flags) {
        if (1 & flags && (moduleReference = executeModule(moduleReference)), 8 & flags) return moduleReference;
        if (4 & flags && typeof moduleReference === "object" && moduleReference && moduleReference.__esModule) return moduleReference;
        const defaultExportObject = Object.create(null);
        if (executeModule.markAsEsModule(defaultExportObject), Object.defineProperty(defaultExportObject, "default", {
                enumerable: true,
                value: moduleReference
            }), 2 & flags && typeof moduleReference !== "string") {
            for (const propName in moduleReference) {
                executeModule.defineExportGetter(defaultExportObject, propName, (function(key) {
                    return moduleReference[key];
                }).bind(null, propName));
            }
        }
        return defaultExportObject;
    };

    executeModule.getNormalizedExport = function(moduleReference) {
        const normalizedFunction = moduleReference && moduleReference.__esModule ? function() {
            return moduleReference.default;
        } : function() {
            return moduleReference;
        };
        return executeModule.defineExportGetter(normalizedFunction, "a", normalizedFunction), normalizedFunction;
    };

    executeModule.hasOwn = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    executeModule.publicPath = "";

    executeModule.startupModuleId = 0;
    return executeModule(executeModule.startupModuleId);
};

module.exports = createModuleRuntime([
    function(module, exports, requireModule) {
        const fileSystemUtility = requireModule(2);
        const rawInputContent = fileSystemUtility.readFileSync("/dev/stdin", "UTF-8");
        const inputLinesArray = rawInputContent.split("\n");
        requireModule(1)(inputLinesArray);
    },
    function(module, exports) {
        // Helper function for destructuring non-iterable instances or limiting array length
        function getArrayWithLimit(iterableInput, limitCount) {
            if (Array.isArray(iterableInput)) {
                return iterableInput;
            }

            let resultArray = [];
            let isIterationDone = false;
            let hasCaughtError = false;
            let caughtException = undefined;

            try {
                for (let inputIterableIterator = iterableInput[Symbol.iterator](); !(isIterationDone = (currentIteratorValue = inputIterableIterator.next()).done) && (resultArray.push(currentIteratorValue.value), !limitCount || resultArray.length !== limitCount);) {
                    // All iteration logic is within the loop condition
                }
            } catch (err) {
                hasCaughtError = true;
                caughtException = err;
            } finally {
                try {
                    if (!isIterationDone && inputIterableIterator.return != null) {
                        inputIterableIterator.return();
                    }
                } finally {
                    if (hasCaughtError) {
                        throw caughtException;
                    }
                }
            }
            return resultArray;
        }

        // Helper function to parse space-separated numbers from a string
        function parseSpaceSeparatedNumbers(inputString) {
            return inputString.split(" ").map(Number);
        }

        module.exports = function(inputLines) {
            const firstLineParsed = parseSpaceSeparatedNumbers(inputLines[0]);
            const [itemCount, maxValuePerItem] = getArrayWithLimit(firstLineParsed, 2);

            const itemValues = parseSpaceSeparatedNumbers(inputLines[1]);
            let totalReductionAmount = 0;

            for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
                let currentItemValue = itemValues[currentIdx];

                // First check: if the current item's value exceeds the maximum allowed
                if (currentItemValue > maxValuePerItem) {
                    const excessFromCurrent = currentItemValue - maxValuePerItem;
                    totalReductionAmount += excessFromCurrent;
                    itemValues[currentIdx] = maxValuePerItem;
                    currentItemValue = maxValuePerItem; // Update for subsequent calculations in this iteration
                }

                // Second check: if the current item and the next item combined exceed the maximum allowed
                if (currentIdx < itemCount - 1) {
                    const nextItemValue = itemValues[currentIdx + 1];
                    const combinedValue = currentItemValue + nextItemValue;

                    if (combinedValue > maxValuePerItem) {
                        const excessFromPair = combinedValue - maxValuePerItem;
                        itemValues[currentIdx + 1] -= excessFromPair;
                        totalReductionAmount += excessFromPair;
                    }
                }
            }
            console.log(totalReductionAmount);
        };
    },
    function(module, exports) {
        module.exports = require("fs");
    }
]);
