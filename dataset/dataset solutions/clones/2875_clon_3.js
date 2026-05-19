module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var currentModule = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);
        currentModule.loaded = true;
        return currentModule.exports;
    }

    moduleLoader.moduleDefinitions = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    moduleLoader.defineExport = function(targetObject, propertyName, getterFunction) {
        if (!moduleLoader.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    moduleLoader.registerModule = function(moduleExports) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(moduleExports, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(moduleExports, "__esModule", {
            value: true
        });
    };

    moduleLoader.interopRequire = function(moduleValue, flags) {
        if (flags & 1) {
            moduleValue = moduleLoader(moduleValue);
        }
        if (flags & 8) {
            return moduleValue;
        }
        if (flags & 4 && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }
        var interopObject = Object.create(null);
        moduleLoader.registerModule(interopObject);
        Object.defineProperty(interopObject, "default", {
            enumerable: true,
            value: moduleValue
        });
        if (flags & 2 && typeof moduleValue !== "string") {
            for (var key in moduleValue) {
                moduleLoader.defineExport(interopObject, key, (function(k) {
                    return moduleValue[k];
                }).bind(null, key));
            }
        }
        return interopObject;
    };

    moduleLoader.normalizeExport = function(moduleExports) {
        var getter = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        moduleLoader.defineExport(getter, "a", getter);
        return getter;
    };

    moduleLoader.hasOwn = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    moduleLoader.publicPath = "";

    return moduleLoader(moduleLoader.entryModule = 0);
}([
    function(module, exports, requireModule) {
        const fileSystemModule = requireModule(2);
        const inputContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8");
        requireModule(1)(inputContent);
    },
    function(module, exports) {

        function getArrayItems(sourceArray, expectedCount) {
            if (Array.isArray(sourceArray)) {
                return sourceArray;
            }
            var tempItems = [];
            var iterationStatus = true;
            var hasError = false;
            var errorInstance = undefined;
            try {
                for (var iteratorResult, arrayIterator = sourceArray[Symbol.iterator](); !(iterationStatus = (iteratorResult = arrayIterator.next()).done) && (tempItems.push(iteratorResult.value), !expectedCount || tempItems.length !== expectedCount); iterationStatus = true);
            } catch (err) {
                hasError = true;
                errorInstance = err;
            } finally {
                try {
                    if (!iterationStatus && arrayIterator.return != null) {
                        arrayIterator.return();
                    }
                } finally {
                    if (hasError) {
                        throw errorInstance;
                    }
                }
            }
            return tempItems;
        }

        module.exports = function(inputDataString) {
            const inputLines = inputDataString.split("\n");

            const firstLineNumbers = inputLines[0].split(" ").map(Number);
            const parsedNumbers = getArrayItems(firstLineNumbers, 5);

            const totalLength = parsedNumbers[0];
            const startIdx = parsedNumbers[2];
            const targetIdx = parsedNumbers[3];
            const endIdx = parsedNumbers[4];

            const charSequence = inputLines[1].split("");

            const checkConsecutiveHashes = (sequence, length) => {
                for (let charPosition = 1; charPosition < length; charPosition++) {
                    if (sequence[charPosition - 1] === '#' && sequence[charPosition] === '#') {
                        return true;
                    }
                }
                return false;
            };

            if (checkConsecutiveHashes(charSequence, totalLength)) {
                console.log("No");
                return;
            }

            if (targetIdx >= endIdx) {
                console.log("Yes");
                return;
            }

            const canFindTwoDots = (sequence, startIndex, stopIndex) => {
                let consecutiveDotCount = 0;
                for (let currentPosition = startIndex; currentPosition < stopIndex; currentPosition++) {
                    if (sequence[currentPosition] === '.') {
                        consecutiveDotCount++;
                        if (consecutiveDotCount === 2) {
                            return true;
                        }
                    } else {
                        consecutiveDotCount = 0;
                    }
                }
                return false;
            };

            if (canFindTwoDots(charSequence, startIdx, endIdx - 1)) {
                console.log("Yes");
            } else {
                console.log("No");
            }
        };
    },
    function(module, exports) {
        module.exports = require("fs");
    }
]);
