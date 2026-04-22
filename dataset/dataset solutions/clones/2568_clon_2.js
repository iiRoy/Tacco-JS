global.exports = (function (moduleDefinitions) {

    var moduleCache = {};

    function loadModule(identifier) {
        if (moduleCache[identifier]) {
            return moduleCache[identifier].exports;
        }

        var currentModuleObject = moduleCache[identifier] = {
            id: identifier,
            loaded: false,
            exports: {}
        };

        moduleDefinitions[identifier].call(currentModuleObject.exports, currentModuleObject, currentModuleObject.exports, loadModule);

        currentModuleObject.loaded = true;
        return currentModuleObject.exports;
    }

    loadModule.allDefinitions = moduleDefinitions;
    loadModule.loadedModules = moduleCache;

    loadModule.defineProperty = function (targetObject, propName, getterFunc) {
        if (!loadModule.hasOwn(targetObject, propName)) {
            Object.defineProperty(targetObject, propName, {
                enumerable: true,
                get: getterFunc
            });
        }
    };

    loadModule.registerESModule = function (targetObj) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetObj, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(targetObj, "__esModule", {
            value: true
        });
    };

    loadModule.transformModule = function (inputModule, transformFlags) {
        if (transformFlags & 1) {
            inputModule = loadModule(inputModule);
        }
        if (transformFlags & 8) {
            return inputModule;
        }
        if (transformFlags & 4 && typeof inputModule === 'object' && inputModule && inputModule.__esModule) {
            return inputModule;
        }

        var moduleWrapper = Object.create(null);
        loadModule.registerESModule(moduleWrapper);
        Object.defineProperty(moduleWrapper, "default", {
            enumerable: true,
            value: inputModule
        });

        if (transformFlags & 2 && typeof inputModule !== 'string') {
            for (var keyIter in inputModule) {
                loadModule.defineProperty(moduleWrapper, keyIter, (function (propKey) {
                    return inputModule[propKey];
                }).bind(null, keyIter));
            }
        }
        return moduleWrapper;
    };

    loadModule.interopDefaultExport = function (targetModule) {
        var defaultAccessor = targetModule && targetModule.__esModule ? function () {
            return targetModule.default;
        } : function () {
            return targetModule;
        };
        loadModule.defineProperty(defaultAccessor, "a", defaultAccessor);
        return defaultAccessor;
    };

    loadModule.hasOwn = function (objRef, propKey) {
        return Object.prototype.hasOwnProperty.call(objRef, propKey);
    };

    loadModule.basePath = "";

    return loadModule(loadModule.startupId = 0);

})([
    function (currentMod, modExports, modLoader) {
        modLoader(1)(modLoader(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },
    function (currentMod, modExports) {
        function extractElements(sourceArr, numLimit) {
            if (Array.isArray(sourceArr)) {
                return sourceArr;
            }

            var collectedItems = [];
            var continueIteration = true;
            var encounteredError = false;
            var thrownError = undefined;

            try {
                for (var arrayIterator = sourceArr[Symbol.iterator](); !(continueIteration = (iteratorResult = arrayIterator.next()).done) && (collectedItems.push(iteratorResult.value), !numLimit || collectedItems.length !== numLimit); continueIteration = true) {}
            } catch (err) {
                encounteredError = true;
                thrownError = err;
            } finally {
                try {
                    if (!continueIteration && arrayIterator.return != null) {
                        arrayIterator.return();
                    }
                } finally {
                    if (encounteredError) {
                        throw thrownError;
                    }
                }
            }
            return collectedItems;
        }

        currentMod.exports = function (inputDataLines) {
            var initialParams = extractElements(inputDataLines[0].split(" ").map(function (valStr) {
                return Number(valStr);
            }), 2);
            var itemQuantity = initialParams[0];
            var halvingOperations = initialParams[1];

            var valueList = inputDataLines[1].split(" ").map(function (valStr) {
                return Number(valStr);
            });

            valueList.sort(function (valA, valB) {
                return valB - valA;
            });

            var finalSum = 0;
            var opsRemaining = halvingOperations;

            for (var itemIndex = 0; itemIndex < itemQuantity; itemIndex++) {
                var currentValue = valueList[itemIndex];
                var nextValueThreshold = 0;

                if (itemIndex !== itemQuantity - 1) {
                    nextValueThreshold = Math.min(valueList[itemIndex + 1], 4);
                }

                while (opsRemaining > 0 && currentValue >= nextValueThreshold) {
                    currentValue = Math.floor(currentValue / 2);
                    opsRemaining--;
                }
                finalSum += currentValue;
            }
            console.log(finalSum);
        };
    },
    function (currentMod, modExports) {
        currentMod.exports = require("node:fs");
    }
]);