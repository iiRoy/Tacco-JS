module.exports = (function(moduleDefinitions) {
    const moduleCache = {};

    function customModuleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        const currentModuleEntry = moduleCache[moduleId] = {
            identifier: moduleId,
            isLoaded: false,
            exports: {}
        };

        moduleDefinitions[moduleId].call(
            currentModuleEntry.exports,
            currentModuleEntry,
            currentModuleEntry.exports,
            customModuleLoader
        );

        currentModuleEntry.isLoaded = true;
        return currentModuleEntry.exports;
    }

    return customModuleLoader(0);
})([
    function(moduleZero, exportsZero, requireZero) {
        const fsModule = requireZero(2);
        const processInputFunction = requireZero(1);

        const stdinContent = fsModule.readFileSync("/dev/stdin", "UTF-8");
        processInputFunction(stdinContent);
    },
    function(moduleOne, exportsOne) {
        exportsOne.exports = function(inputDataString) {
            const linesArray = inputDataString.split("\n");
            const targetNumericValue = Number(linesArray[0]);

            let finalCalculatedResult = 0;

            if (targetNumericValue <= 0) {
                finalCalculatedResult = 0;
            } else {
                const discriminantValue = 1 + (8 * targetNumericValue);
                const squareRootOfDiscriminant = Math.sqrt(discriminantValue);
                const rawSolution = (-1 + squareRootOfDiscriminant) / 2;
                finalCalculatedResult = Math.ceil(rawSolution);
            }

            console.log(finalCalculatedResult);
        };
    },
    function(moduleTwo, exportsTwo) {
        exportsTwo.exports = require("fs");
    }
]);
