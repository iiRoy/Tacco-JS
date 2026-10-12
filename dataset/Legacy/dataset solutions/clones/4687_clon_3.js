module.exports = function(modules) {
    var installedModules = {};

    function webpackRequire(moduleId) {
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        modules[moduleId].call(module.exports, module, module.exports, webpackRequire);
        module.l = true;
        return module.exports;
    }

    webpackRequire.m = modules;
    webpackRequire.c = installedModules;
    webpackRequire.d = function(exports, name, getter) {
        if (!webpackRequire.o(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true,
                get: getter
            });
        }
    };
    webpackRequire.r = function(exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(exports, '__esModule', {
            value: true
        });
    };
    webpackRequire.t = function(value, mode) {
        if (mode & 1) value = webpackRequire(value);
        if (mode & 8) return value;
        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
        var ns = Object.create(null);
        webpackRequire.r(ns);
        Object.defineProperty(ns, 'default', {
            enumerable: true,
            value: value
        });
        if (mode & 2 && typeof value != 'string')
            for (var key in value) webpackRequire.d(ns, key, function(key) {
                return value[key];
            }.bind(null, key));
        return ns;
    };
    webpackRequire.n = function(module) {
        var getter = module && module.__esModule ?
            function getDefault() {
                return module['default'];
            } :
            function getModuleExports() {
                return module;
            };
        webpackRequire.d(getter, 'a', getter);
        return getter;
    };
    webpackRequire.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };
    webpackRequire.p = "";

    return webpackRequire(webpackRequire.s = 0);
}([
    function(moduleExports, exports, webpackRequire) {
        const fileSystemModule = webpackRequire(2);
        const inputDataLines = fileSystemModule.readFileSync("/dev/stdin", "UTF-8").split("\n");
        webpackRequire(1)(inputDataLines);
    },
    function(moduleExports, exports) {
        const processInputData = function(inputLinesArray) {
            // Helper function to parse the initial configuration from the first line
            const extractConfiguration = (firstLine) => {
                const numericParts = firstLine.split(" ").map(Number);
                // Using modern destructuring instead of the original polyfill-like helper
                if (numericParts.length !== 3) {
                    // This is a guard clause, adding a check for input validity
                    throw new Error("Input format error: Expected three numbers on the first line.");
                }
                const [totalItems, initialCapacity, maxDifferenceThreshold] = numericParts;
                return { totalItems, initialCapacity, maxDifferenceThreshold };
            };

            const { totalItems, initialCapacity, maxDifferenceThreshold } = extractConfiguration(inputLinesArray[0]);

            // Helper function to read and convert subsequent item values
            const retrieveItemValues = (lines, count) => {
                const valuesCollection = [];
                for (let itemIdx = 0; itemIdx < count; itemIdx++) {
                    const currentItemValue = Number(lines[itemIdx + 1]);
                    valuesCollection.push(currentItemValue);
                }
                return valuesCollection;
            };

            let itemValuesList = retrieveItemValues(inputLinesArray, totalItems);

            // Sort the collected item values in ascending order
            itemValuesList.sort((valueA, valueB) => valueA - valueB);

            // Initialize variables for the grouping algorithm
            let currentGroupCount = 1;
            let currentRemainingCapacity = initialCapacity - 1;
            let currentGroupAnchorValue = itemValuesList[0];

            // Iterate through the sorted items to form groups
            // Start from the second item as the first one already forms the initial group
            for (let itemIterator = 1; itemIterator < totalItems; itemIterator++) {
                const currentItemBeingProcessed = itemValuesList[itemIterator];
                const groupMaximumAcceptableValue = currentGroupAnchorValue + maxDifferenceThreshold;

                // Check if the current item can be added to the existing group
                const canAddItemToCurrentGroup = currentItemBeingProcessed <= groupMaximumAcceptableValue;
                const hasCapacityInCurrentGroup = currentRemainingCapacity > 0;

                if (canAddItemToCurrentGroup && hasCapacityInCurrentGroup) {
                    // If it fits and there's capacity, consume one capacity slot
                    currentRemainingCapacity--;
                } else {
                    // Otherwise, start a new group
                    currentGroupCount++;
                    currentRemainingCapacity = initialCapacity - 1; // Reset capacity for the new group
                    currentGroupAnchorValue = currentItemBeingProcessed; // New group starts with this item
                }
            }

            // Output the final count of groups
            console.log(currentGroupCount);
        };

        moduleExports.exports = processInputData;
    },
    function(moduleExports, exports) {
        moduleExports.exports = require("fs");
    }
]);
