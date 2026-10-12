module.exports = (function(allModules) {
    const moduleCache = {};

    function customRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        const moduleEntry = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        allModules[moduleId].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, customRequire);
        moduleEntry.loaded = true;
        return moduleEntry.exports;
    }

    customRequire.entryPoint = 0;
    return customRequire(customRequire.entryPoint);

})([
    function(moduleEntry, moduleExports, localRequire) {
        const processInputHandler = localRequire(1);
        const fileSystemAccess = localRequire(2);

        const rawFileContent = fileSystemAccess.readFileSync("/dev/stdin", "UTF-8");
        const inputLinesArray = rawFileContent.split("\n");

        processInputHandler(inputLinesArray);
    },
    function(moduleEntry, moduleExports, localRequire) {
        "use strict";
        moduleExports.exports = function(inputDataLines) {
            const firstLine = inputDataLines[0];
            const elementCount = Number(firstLine);

            const secondLine = inputDataLines[1];
            const spaceSeparatedValues = secondLine.split(" ");

            const parseNumericValue = (valueString) => Number(valueString);

            const numericValuesList = spaceSeparatedValues.map(parseNumericValue);

            const dataWithOriginalPositions = numericValuesList.map((val, index) => ({
                originalPosition: index + 1,
                valueToCompare: val
            }));

            const compareItemsByValue = (itemA, itemB) => itemA.valueToCompare - itemB.valueToCompare;

            dataWithOriginalPositions.sort(compareItemsByValue);

            const finalSortedPositions = dataWithOriginalPositions.map(item => item.originalPosition);

            console.log(finalSortedPositions.join(" "));
        };
    },
    function(moduleEntry, moduleExports, localRequire) {
        moduleExports.exports = require("fs");
    }
]);
