module.exports = function(moduleDefinitions) {
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

    moduleLoader.definitions = moduleDefinitions;
    moduleLoader.cache = moduleCache;

    moduleLoader.defineExport = function(targetObject, propertyName, getterFunction) {
        if (!moduleLoader.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    moduleLoader.markAsEsModule = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    moduleLoader.interopRequire = function(sourceModule, resolveMode) {
        if (resolveMode & 1) sourceModule = moduleLoader(sourceModule);
        if (resolveMode & 8) return sourceModule;
        if ((resolveMode & 4) && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule) return sourceModule;
        var interopObject = Object.create(null);
        moduleLoader.markAsEsModule(interopObject);
        Object.defineProperty(interopObject, "default", {
            enumerable: true,
            value: sourceModule
        });
        if (resolveMode & 2 && typeof sourceModule !== "string") {
            for (var keyName in sourceModule) {
                moduleLoader.defineExport(interopObject, keyName, (function(key) {
                    return sourceModule[key];
                }).bind(null, keyName));
            }
        }
        return interopObject;
    };

    moduleLoader.createDefaultExport = function(moduleExports) {
        var defaultGetter = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        moduleLoader.defineExport(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    moduleLoader.hasOwn = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    moduleLoader.publicPath = "";

    return moduleLoader(moduleLoader.entryPoint = 0);
}([function(moduleExports, moduleObject, moduleLoader) {
    moduleLoader(1)(moduleLoader(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
}, function(moduleExports, moduleObject, moduleLoader) {
    // This helper is only used for `inputLines[0].split(" ").map(Number)` which is always an array.
    // The original helper's complex iteration and error handling for non-arrays/non-iterables
    // is effectively dead code for this specific usage.
    // So, a simple pass-through for arrays is sufficient to match behavior.
    function obtainFixedElements(sourceArray, requiredCount) {
        return sourceArray;
    }

    moduleExports.exports = function(inputLines) {
        // Parse first line to get item count and target value
        const [itemCount, targetValue] = obtainFixedElements(
            inputLines[0].split(" ").map(Number),
            2
        );

        // Parse second line to get the sequence of numbers
        const dataSequence = inputLines[1].split(" ").map(Number);

        // Sort the numeric sequence in ascending order
        dataSequence.sort((valA, valB) => valA - valB);

        // Check if any number in the sequence is directly equal to the target value
        const isDirectlyPossible = dataSequence.some(
            (currentNum) => currentNum === targetValue
        );

        if (isDirectlyPossible) {
            console.log("POSSIBLE");
            return;
        }

        // If no direct match, evaluate the two complex conditions
        const firstSequenceElement = dataSequence[0];

        // Condition 1: Check if any element (excluding the first) has the same remainder
        // as the target value when divided by the first element.
        const remainderMatchFound = dataSequence.slice(1).some(
            (currentNum) => (currentNum % firstSequenceElement) === (targetValue % firstSequenceElement)
        );

        // Condition 2: Check if any element in the sequence is greater than the target value.
        const valueExceedsTarget = dataSequence.some(
            (currentNum) => currentNum > targetValue
        );

        // Final decision based on both conditions being met
        if (remainderMatchFound && valueExceedsTarget) {
            console.log("POSSIBLE");
        } else {
            console.log("IMPOSSIBLE");
        }
    };
}, function(moduleExports, moduleObject, moduleLoader) {
    moduleExports.exports = require("fs");
}]);
