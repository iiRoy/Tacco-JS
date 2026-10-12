module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function loadModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleEntry = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, loadModule);
        moduleEntry.l = true;
        return moduleEntry.exports;
    }

    loadModule.modules = moduleDefinitions;
    loadModule.cache = moduleCache;

    loadModule.defineExport = function(targetObject, propertyName, getterFunction) {
        if (!loadModule.hasOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    loadModule.registerModule = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    loadModule.createNamespaceObject = function(moduleValue, flag) {
        if (flag & 1) moduleValue = loadModule(moduleValue);
        if (flag & 8) return moduleValue;
        if ((flag & 4) && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) return moduleValue;
        var namespaceObject = Object.create(null);
        loadModule.registerModule(namespaceObject);
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: moduleValue
        });
        if (flag & 2 && typeof moduleValue !== "string") {
            for (var key in moduleValue) {
                loadModule.defineExport(namespaceObject, key, (function(currentKey) {
                    return moduleValue[currentKey];
                }).bind(null, key));
            }
        }
        return namespaceObject;
    };

    loadModule.interopDefault = function(moduleValue) {
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

    loadModule.hasOwnProperty = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    loadModule.publicPath = "";

    return loadModule(loadModule.startupModuleId = 0);
}([
    function(module0Exports, module0Module, loadModule) {
        const fileSystemModule = loadModule(2);
        const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        const inputLinesArray = rawInputContent.split("\n");
        loadModule(1)(inputLinesArray);
    },
    function(module1Exports, module1Module) {
        function extractArrayPair(iterableInput, limitCount) {
            return (function(arr) {
                if (Array.isArray(arr)) return arr;
            })(iterableInput) || (function(iterableInput, limitCount) {
                var resultArray = [];
                var isDone = true;
                var hasError = false;
                var errorValue = undefined;
                try {
                    for (var inputIterator, iteratorItem = iterableInput[Symbol.iterator](); !(isDone = (inputIterator = iteratorItem.next()).done) && (resultArray.push(inputIterator.value), !limitCount || resultArray.length !== limitCount); isDone = true);
                } catch (err) {
                    hasError = true;
                    errorValue = err;
                } finally {
                    try {
                        if (!isDone && iteratorItem["return"] != null) iteratorItem["return"]();
                    } finally {
                        if (hasError) throw errorValue;
                    }
                }
                return resultArray;
            })(iterableInput, limitCount) || (function() {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            })();
        }

        function parseNumbersFromLine(lineContent) {
            const stringNumbers = lineContent.split(" ");
            return stringNumbers.map(function(str) {
                return Number(str);
            });
        }

        function performSpecificGCDCalculation(valA, valB) {
            let currentQuotient = Math.floor(valB / valA);
            let currentRemainder = valB % valA;

            while (currentRemainder > 0) {
                const tempRemainderHolder = currentRemainder;
                currentRemainder = currentQuotient % currentRemainder;
                currentQuotient = tempRemainderHolder;
            }
            return currentQuotient;
        }

        module1Exports.exports = function(inputLines) {
            const parsedValues = parseNumbersFromLine(inputLines[0]);
            const extractedPair = extractArrayPair(parsedValues, 2);

            const firstNum = extractedPair[0];
            const secondNum = extractedPair[1];

            const finalResult = performSpecificGCDCalculation(firstNum, secondNum);
            console.log(finalResult);
        };
    },
    function(module2Exports, module2Module) {
        module2Exports.exports = require("fs");
    }
]);
