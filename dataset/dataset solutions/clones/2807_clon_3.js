module.exports = function(moduleDefinitionsArray) {
    const moduleCache = {};

    function moduleLoader(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        const currentModule = moduleCache[moduleId] = {
            identifier: moduleId,
            isLoaded: false,
            exports: {}
        };

        moduleDefinitionsArray[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);
        currentModule.isLoaded = true;
        return currentModule.exports;
    }

    return moduleLoader(0);
}([
    // Module 0: Entry point for execution
    function(currentModule, moduleExports, localRequire) {
        const fileSystemUtility = localRequire(2);
        const mainLogicProcessor = localRequire(1);
        const inputContent = fileSystemUtility.readFileSync("/dev/stdin", "UTF-8");
        mainLogicProcessor(inputContent);
    },

    // Module 1: Core calculation logic
    function(currentModule, moduleExports) {
        // Helper function to encapsulate the calculation logic
        function determineNonDivisibleCount(startValue, endValue, divisorOne, divisorTwo) {
            const totalRangeElements = endValue - startValue + 1;
            
            // Calculate count of numbers divisible by the first divisor
            const countByDivisorOne = Math.floor(totalRangeElements / divisorOne);
            
            // Calculate count of numbers divisible by the second divisor
            const countByDivisorTwo = Math.floor(totalRangeElements / divisorTwo);
            
            // Calculate count of numbers divisible by both (using product as per original logic)
            const productOfDivisors = divisorOne * divisorTwo;
            const countByBothDivisors = Math.floor(totalRangeElements / productOfDivisors);
            
            // Apply the inclusion-exclusion principle to find count divisible by either
            const countDivisibleByEither = countByDivisorOne + countByDivisorTwo - countByBothDivisors;
            
            // The final result is total elements minus those divisible by either
            return totalRangeElements - countDivisibleByEither;
        }

        currentModule.exports = function(inputStringData) {
            // Extract the first line from the input string
            const firstInputLine = inputStringData.split("\n")[0];
            
            // Split the line into string tokens based on spaces
            const stringTokens = firstInputLine.split(" ");
            
            // Convert string tokens to numeric values
            const numericValues = stringTokens.map(Number);

            // Directly destructure the numeric parameters (Type III: simplified destructuring)
            const [rangeStartValue, rangeEndValue, firstDivisorValue, secondDivisorValue] = numericValues;

            // Perform the calculation using the dedicated helper function
            const finalCalculatedCount = determineNonDivisibleCount(
                rangeStartValue,
                rangeEndValue,
                firstDivisorValue,
                secondDivisorValue
            );

            // Output the final count to the console
            console.log(finalCalculatedCount);
        };
    },

    // Module 2: File system utility
    function(currentModule, moduleExports) {
        currentModule.exports = require("fs");
    }
]);
