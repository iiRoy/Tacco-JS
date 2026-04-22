(function(moduleDefinitions) {
    // A cache for already loaded modules
    var cachedModules = {};

    // The primary function to load and execute modules
    function moduleLoader(moduleKey) {
        // If the module is already in the cache, return its exports
        if (cachedModules[moduleKey]) {
            return cachedModules[moduleKey].moduleExports;
        }

        // Create a new module entry and add it to the cache
        var currentModule = cachedModules[moduleKey] = {
            id: moduleKey,
            isLoaded: false,
            moduleExports: {}
        };

        // Execute the module's definition function
        // `this` context is set to `currentModule.moduleExports`
        // Arguments: `currentModule.moduleExports`, `currentModule`, `currentModule.moduleExports`, `moduleLoader`
        moduleDefinitions[moduleKey].call(
            currentModule.moduleExports,
            currentModule.moduleExports,
            currentModule,
            currentModule.moduleExports,
            moduleLoader
        );

        // Mark the module as loaded after execution
        currentModule.isLoaded = true;

        // Return the exports of the newly loaded module
        return currentModule.moduleExports;
    }

    // Expose all module definitions for inspection or further use
    moduleLoader.definitions = moduleDefinitions;

    // Expose the module cache for debugging or external access
    moduleLoader.cache = cachedModules;

    // Utility to define a getter function for harmony exports (ES Modules)
    moduleLoader.defineExportGetter = function(targetExports, propertyName, getterFunction) {
        // Check if the property already exists to avoid overwriting
        if (!moduleLoader.hasProperty(targetExports, propertyName)) {
            Object.defineProperty(targetExports, propertyName, {
                enumerable: true, // Make it enumerable
                get: getterFunction // Assign the getter function
            });
        }
    };

    // Helper to mark an exports object as an ES Module
    moduleLoader.registerESModule = function(targetExports) {
        // If Symbol is available and toStringTag exists, set it
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetExports, Symbol.toStringTag, { value: 'Module' });
        }
        // Always set __esModule flag to true
        Object.defineProperty(targetExports, '__esModule', { value: true });
    };

    // Function to create a "fake" namespace object for interoperability
    // This handles various module modes (e.g., CommonJS, ES Module, value-only)
    moduleLoader.createNamespaceObject = function(sourceValue, processingMode) {
        // Mode 1: sourceValue is a module id, resolve it first
        if (processingMode & 1) sourceValue = moduleLoader(sourceValue);
        // Mode 8: behave like a direct `require`, return value as is
        if (processingMode & 8) return sourceValue;
        // Mode 4: if sourceValue is already an ES Module, return it
        if ((processingMode & 4) && typeof sourceValue === 'object' && sourceValue && sourceValue.__esModule) return sourceValue;

        // Create a new empty object for the namespace
        var namespace = Object.create(null);
        moduleLoader.registerESModule(namespace); // Mark as ES Module
        // Define a 'default' export pointing to the sourceValue
        Object.defineProperty(namespace, 'default', { enumerable: true, value: sourceValue });

        // Mode 2: merge all properties from sourceValue into the namespace
        if (processingMode & 2 && typeof sourceValue != 'string') {
            for (var propKey in sourceValue) {
                // Ensure property is not 'default' and is directly on sourceValue
                if (propKey !== 'default' && moduleLoader.hasProperty(sourceValue, propKey)) {
                    moduleLoader.defineExportGetter(namespace, propKey, (function(key) {
                        return function() { return sourceValue[key]; };
                    }).bind(null, propKey));
                }
            }
        }
        return namespace;
    };

    // Provides a getter function for compatibility with non-harmony modules
    moduleLoader.getCompatExport = function(targetModule) {
        // If it's an ES Module and has a default export, return a getter for it
        var compatGetter = targetModule && targetModule.__esModule ?
            function getModuleDefault() { return targetModule['default']; } :
            // Otherwise, return a getter for the entire module object
            function getPlainModuleExports() { return targetModule; };
        // Define the getter on a specific property 'a' (common webpack convention)
        moduleLoader.defineExportGetter(compatGetter, 'a', compatGetter);
        return compatGetter;
    };

    // A utility wrapper for Object.prototype.hasOwnProperty.call
    moduleLoader.hasProperty = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // Public path for assets (currently empty)
    moduleLoader.publicPath = "";

    // Load the entry module and return its exports
    return moduleLoader(moduleLoader.entryPoint = "./src/panasonic2020/C.js");
})
/************************************************************************/
({

// Module definition for the main application logic
"./src/panasonic2020/C.js":
/*!********************************!*\
  !*** ./src/panasonic2020/C.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(moduleOutput, currentModule, currentBlockExports, blockLoader) {

    // Helper function to calculate square root rounded to one decimal place.
    // This ensures consistent floating-point precision for comparisons.
    const calculateRoundedSqrt = (valueToProcess) => {
        // Basic type and value validation for robust processing
        if (typeof valueToProcess !== 'number' || isNaN(valueToProcess) || valueToProcess < 0) {
            console.error(`Error: Invalid or negative input for square root calculation: ${valueToProcess}`);
            // Depending on context, might throw or return a specific error value
            return NaN;
        }
        const rootValue = Math.sqrt(valueToProcess);
        const scaledValue = rootValue * 10;
        const roundedScaledValue = Math.round(scaledValue);
        return roundedScaledValue / 10;
    };

    // Main processing function for the given problem
    const performCoreOperation = (sourceData) => {
        let firstNum, secondNum, thirdNum;

        try {
            // Extract the first line of the input string, which contains the numbers.
            const dataLine = sourceData.split('\n')[0];
            // Split the line by spaces to get individual string representations of numbers.
            const stringValues = dataLine.split(' ');

            // Validate the number of input values.
            if (stringValues.length !== 3) {
                console.error("Input format error: Expected exactly three space-separated numbers.");
                return; // Terminate execution if input format is incorrect.
            }

            // Parse each string value into a number.
            // Using `Number()` is a concise way to convert strings to numbers.
            const parsedValues = stringValues.map(str => {
                const num = Number(str);
                // Check if parsing resulted in a valid number.
                if (isNaN(num)) {
                    throw new Error(`Invalid number detected in input: '${str}'`);
                }
                return num;
            });

            // Assign the parsed numbers to descriptive variables.
            firstNum = parsedValues[0];
            secondNum = parsedValues[1];
            thirdNum = parsedValues[2];

            // Additional validation: Ensure all numbers are non-negative for valid square root operations.
            if (firstNum < 0 || secondNum < 0 || thirdNum < 0) {
                console.error("Input numbers must be non-negative for square root calculation.");
                return; // Terminate if negative numbers are found.
            }

        } catch (parsingError) {
            // Catch any errors that occur during input parsing.
            console.error("An error occurred during input parsing:", parsingError.message);
            return; // Terminate gracefully on parsing errors.
        }

        // Apply the custom square root rounding to each input number.
        const sqrtOfA = calculateRoundedSqrt(firstNum);
        const sqrtOfB = calculateRoundedSqrt(secondNum);
        const sqrtOfC = calculateRoundedSqrt(thirdNum);

        // Calculate the sum of the first two rounded square roots.
        const sumOfFirstTwoRoots = sqrtOfA + sqrtOfB;

        // Perform the final comparison as per the problem logic.
        const comparisonOutcome = sumOfFirstTwoRoots < sqrtOfC;

        // Output the result based on the comparison.
        console.log(comparisonOutcome ? 'Yes' : 'No');
    };

    // Obtain the file system utility module via the block loader.
    const fileSystemAccessUtility = blockLoader('fs');

    // Read the input data from standard input.
    // The '/dev/stdin' path is standard for competitive programming environments.
    const rawInputContent = fileSystemAccessUtility.readFileSync('/dev/stdin', 'utf8');

    // Execute the core operation with the retrieved input.
    performCoreOperation(rawInputContent);

})
,
// Module definition for the external 'fs' (file system) module
"fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(blockOutput, currentBlock) {

    // This module simply exports the Node.js built-in 'fs' module.
    // It is wrapped in eval for compatibility with webpack's external module handling.
    eval("blockOutput.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ })

/******/ });