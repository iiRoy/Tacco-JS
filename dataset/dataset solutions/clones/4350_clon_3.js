module.exports = function(moduleDefinitions) {
    // A cache to store already loaded modules, preventing redundant execution.
    let moduleCache = {};

    /**
     * This function acts as a custom module loader, similar to Node.js's 'require'.
     * It handles module loading, caching, and execution.
     * @param {number} moduleId - The unique identifier for the module to be loaded.
     * @returns {object} The exports object of the specified module.
     */
    function moduleLoader(moduleId) {
        // If the module is already in our cache, return its exports immediately.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // If not cached, prepare a new module entry.
        // The 'i' (id) property tracks the module's identifier.
        // The 'l' (isLoaded) property indicates if the module's code has been executed.
        // The 'exports' object will hold what the module makes available to others.
        let currentModule = moduleCache[moduleId] = {
            id: moduleId,
            isLoaded: false,
            exports: {}
        };

        // Execute the module's definition function.
        // This function is expected to populate `currentModule.exports`.
        // It receives the module object, its exports object, and the moduleLoader itself (for nested requires).
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);

        // Mark the module as fully loaded after its definition function has run.
        currentModule.isLoaded = true;

        // Return the populated exports object.
        return currentModule.exports;
    }

    // --- Auxiliary functions for module system interoperability and property definition ---

    // Store a reference to the array of all module definitions.
    moduleLoader.definitions = moduleDefinitions;

    // Expose the internal module cache for debugging or advanced use cases.
    moduleLoader.cache = moduleCache;

    /**
     * Defines a getter function for a specific property on an object.
     * This is used to lazily evaluate module exports or create virtual properties.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {function} getterFunction - The function that will be called to retrieve the property's value.
     */
    moduleLoader.defineExportGetter = function(targetObject, propertyName, getterFunction) {
        // Only define the property if it doesn't already exist to prevent errors.
        if (!moduleLoader.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,  // Make the property visible during enumeration (e.g., in for...in loops).
                get: getterFunction // Assign the provided function as the getter.
            });
        }
    };

    /**
     * Marks an exports object as an ES Module and sets its Symbol.toStringTag.
     * This helps with interoperability between CommonJS and ES Modules.
     * @param {object} exportsObject - The module's exports object.
     */
    moduleLoader.registerEsModuleExports = function(exportsObject) {
        // Set Symbol.toStringTag if Symbol is supported, indicating it's a module object.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Explicitly mark the object as an ES Module.
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };

    /**
     * Creates a namespace object from a module's raw exports, handling various interop modes.
     * This function is crucial for reconciling different module formats (e.g., CommonJS, ES Modules).
     * @param {*} rawModuleValue - The raw value exported by a module.
     * @param {number} processingMode - A bitmask indicating how to transform the raw value.
     *   - Bit 1 (& 1): Load the module if `rawModuleValue` is a module ID.
     *   - Bit 8 (& 8): Return the processed value directly.
     *   - Bit 4 (& 4): Check if the processed value is already an ES module.
     *   - Bit 2 (& 2): Copy all properties from the processed value to the namespace object.
     * @returns {object} A standardized namespace object for the module's exports.
     */
    moduleLoader.createNamespaceObject = function(rawModuleValue, processingMode) {
        // Step 1: If the mode indicates, load the module using its ID.
        let actualModuleExports = (processingMode & 1) ? moduleLoader(rawModuleValue) : rawModuleValue;

        // Step 2: If the mode indicates to return the value as is, do so.
        if (processingMode & 8) return actualModuleExports;

        // Step 3: If it's an ES module and the mode allows, return it directly.
        if ((processingMode & 4) && typeof actualModuleExports === 'object' && actualModuleExports && actualModuleExports.__esModule) {
            return actualModuleExports;
        }

        // Step 4: Otherwise, create a new empty object to serve as the namespace.
        let namespaceContainer = Object.create(null);
        // Mark this new object as an ES Module.
        moduleLoader.registerEsModuleExports(namespaceContainer);

        // Define a 'default' export property, pointing to the original module's value.
        Object.defineProperty(namespaceContainer, 'default', { enumerable: true, value: actualModuleExports });

        // Step 5: If the mode indicates to copy properties (and it's not a primitive string).
        if ((processingMode & 2) && typeof actualModuleExports !== 'string') {
            for (let propertyKey in actualModuleExports) {
                // Ensure the property is directly on the module exports and not already on the namespace.
                if (moduleLoader.hasOwn(actualModuleExports, propertyKey) && !moduleLoader.hasOwn(namespaceContainer, propertyKey)) {
                    moduleLoader.defineExportGetter(
                        namespaceContainer,
                        propertyKey,
                        // Create a getter that returns the value from the original exports.
                        // Using a IIFE to capture `propertyKey` for each iteration.
                        ((key) => () => actualModuleExports[key]).bind(null, propertyKey)
                    );
                }
            }
        }
        return namespaceContainer;
    };

    /**
     * Generates an accessor function for a module's default export.
     * This handles cases where a module might or might not have an explicit '__esModule' flag.
     * @param {object} moduleExports - The exports object of a module.
     * @returns {function} A function that, when called, returns the module's default export.
     */
    moduleLoader.getDefaultExportAccessor = function(moduleExports) {
        // Determine the appropriate accessor: either `moduleExports.default` or `moduleExports` itself.
        const exportAccessor = moduleExports && moduleExports.__esModule
            ? () => moduleExports.default
            : () => moduleExports;

        // Also define a property 'a' on the accessor function itself, pointing back to the accessor.
        // This is a common pattern in bundled code.
        moduleLoader.defineExportGetter(exportAccessor, 'a', exportAccessor);
        return exportAccessor;
    };

    /**
     * A utility function to check if an object has a specific property as its own (not inherited).
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyName - The name of the property to check for.
     * @returns {boolean} True if the object has the property directly, false otherwise.
     */
    moduleLoader.hasOwn = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // The public path for assets, typically an empty string for local bundles.
    moduleLoader.publicAssetPath = '';

    // Define the initial entry point module for the application.
    const entryPointModuleId = 0;
    moduleLoader.entry = entryPointModuleId; // Store the entry ID for clarity.

    // Start the application by loading and executing the entry point module.
    return moduleLoader(moduleLoader.entry);
}([ // Array containing all module definitions

    /**
     * Module 0: The primary entry point for the application.
     * This module is responsible for reading the program's input and invoking the main solver.
     * @param {object} moduleRef - The module object for this module.
     * @param {object} moduleExports - The exports object for this module.
     * @param {function} customRequire - The custom module loader function.
     */
    function(moduleRef, moduleExports, customRequire) {
        // Obtain the Node.js 'fs' (file system) module via our custom loader (Module 2).
        const fileSystemUtil = customRequire(2);
        // Define the standard input file path.
        const standardInputPath = "/dev/stdin";

        let applicationInputData = '';
        try {
            // Attempt to synchronously read the content from standard input, encoded as UTF-8.
            applicationInputData = fileSystemUtil.readFileSync(standardInputPath, "UTF-8");
        } catch (readError) {
            // If an error occurs during file reading, log it and terminate the process.
            console.error(`ERROR: Failed to read input from ${standardInputPath}. Details: ${readError.message}`);
            process.exit(1); // Exit with a non-zero code to indicate an error.
        }

        // Load the main problem-solving module (Module 1) and call its exported function
        // with the input data obtained from stdin.
        const problemSolverFunction = customRequire(1);
        problemSolverFunction.solveMixtureProblem(applicationInputData);
    },

    /**
     * Module 1: Contains the core logic to solve the mixture optimization problem.
     * It parses input parameters and uses a Breadth-First Search (BFS) algorithm
     * to find the mixture with the highest possible sugar concentration within given constraints.
     * @param {object} moduleRef - The module object for this module (not directly used here).
     * @param {object} moduleExports - The exports object for this module.
     */
    function(moduleRef, moduleExports) {
        // The original `t` destructuring helper function has been removed.
        // Modern ES6 destructuring is used directly for improved readability and reduced boilerplate.

        /**
         * Solves the mixture problem: find the highest sugar concentration within limits.
         * The solution must not exceed a maximum total volume and a maximum sugar-to-total-mixture ratio.
         * The problem involves adding specific "granules" of water and sugar.
         * @param {string} rawInputString - A string containing space-separated numeric parameters.
         *   Format: "waterA waterB sugarA sugarB maxConcentration maxVolume"
         */
        moduleExports.solveMixtureProblem = function(rawInputString) {
            // --- Input Parsing and Validation ---

            const inputLines = rawInputString.split('\n');
            // Guard clause: Check if any input lines are present.
            if (inputLines.length === 0 || inputLines[0].trim() === '') {
                console.error('Input Error: No valid input line found. Please provide parameters.');
                return; // Terminate execution if input is invalid.
            }

            const firstParameterLine = inputLines[0];
            const stringParameters = firstParameterLine.split(' ');

            // Convert all string parameters to numbers.
            const numericParameters = stringParameters.map(value => Number(value));

            // Validate that all parameters are successfully converted to numbers.
            if (numericParameters.some(isNaN)) {
                console.error('Input Error: All provided parameters must be valid numeric values.');
                return; // Terminate if non-numeric input is detected.
            }

            const EXPECTED_NUMBER_OF_PARAMS = 6;
            // Validate the count of parameters.
            if (numericParameters.length < EXPECTED_NUMBER_OF_PARAMS) {
                console.error(`Input Error: Expected ${EXPECTED_NUMBER_OF_PARAMS} parameters, but received only ${numericParameters.length}.`);
                return; // Terminate if parameter count is insufficient.
            }

            // Destructure the numeric parameters into clearly named constants.
            // Note: Water granules are typically 100 times their given value in these problems.
            const [
                waterGranuleUnitA,          // e.g., 1 (meaning 100g water)
                waterGranuleUnitB,          // e.g., 2 (meaning 200g water)
                sugarGranuleWeightA,        // e.g., 10 (meaning 10g sugar)
                sugarGranuleWeightB,        // e.g., 20 (meaning 20g sugar)
                maxSugarConcentrationPercent, // Max sugar concentration as a percentage (e.g., 15 for 15%)
                maximumOverallVolume          // Max total volume allowed for the mixture (e.g., 1000g)
            ] = numericParameters;

            // Calculate the maximum permissible sugar-to-total-mixture ratio.
            // Formula: (100 * sugar_concentration_percent) / (100 + sugar_concentration_percent)
            const maximumAllowedSugarRatio = (100 * maxSugarConcentrationPercent) / (100 + maxSugarConcentrationPercent);

            // A map (using an object) to store states that have already been visited during BFS.
            // This prevents redundant calculations and infinite loops.
            // Keys are strings in "waterAmount-sugarAmount" format.
            let exploredMixtureStates = {};

            // An object to keep track of the best mixture found so far.
            // 'density' is initialized to an impossible negative value.
            let currentBestMixture = {
                water: 0,
                sugar: 0,
                density: -1
            };

            // A queue to manage states for the Breadth-First Search (BFS).
            let mixtureDiscoveryQueue = [];

            // Add the initial state to the queue: an empty mixture (0 water, 0 sugar).
            mixtureDiscoveryQueue.push({ water: 0, sugar: 0 });

            // --- Breadth-First Search (BFS) Algorithm ---

            // Continue as long as there are states to explore in the queue.
            while (mixtureDiscoveryQueue.length > 0) {
                // Dequeue the next mixture state to process.
                const currentMixtureState = mixtureDiscoveryQueue.shift();
                const currentWaterAmount = currentMixtureState.water;
                const currentSugarAmount = currentMixtureState.sugar;

                const currentTotalMixtureVolume = currentWaterAmount + currentSugarAmount;
                const uniqueStateKey = `${currentWaterAmount}-${currentSugarAmount}`;

                // --- Optimization and Guard Clauses for BFS ---

                // 1. If the current mixture's total volume exceeds the maximum allowed, skip it.
                if (currentTotalMixtureVolume > maximumOverallVolume) {
                    continue;
                }
                // 2. If this mixture state has already been visited, skip it to avoid cycles and re-processing.
                if (exploredMixtureStates[uniqueStateKey]) {
                    continue;
                }
                // Mark the current state as visited.
                exploredMixtureStates[uniqueStateKey] = true;

                // Calculate the actual sugar concentration for the current mixture.
                let actualSugarConcentration = 0;
                // Prevent division by zero if the mixture has no volume yet.
                if (currentTotalMixtureVolume > 0) {
                    actualSugarConcentration = (100 * currentSugarAmount) / currentTotalMixtureVolume;
                }

                // Check if the current mixture's sugar concentration is within the allowed limits.
                if (actualSugarConcentration <= maximumAllowedSugarRatio) {
                    // If the current mixture has a higher concentration than the best found so far, update.
                    if (actualSugarConcentration > currentBestMixture.density) {
                        currentBestMixture.density = actualSugarConcentration;
                        currentBestMixture.water = currentWaterAmount;
                        currentBestMixture.sugar = currentSugarAmount;
                    } else if (actualSugarConcentration === currentBestMixture.density) {
                        // Tie-breaking rule: If concentrations are equal, prefer the mixture with larger total volume.
                        const currentMixtureVolume = currentWaterAmount + currentSugarAmount;
                        const bestMixtureVolume = currentBestMixture.water + currentBestMixture.sugar;
                        if (currentMixtureVolume > bestMixtureVolume) {
                            currentBestMixture.water = currentWaterAmount;
                            currentBestMixture.sugar = currentSugarAmount;
                        }
                    }
                }

                // --- Generate and Enqueue Next Possible States ---
                // Explore adding each type of granule to the current mixture.

                // Option 1: Add water granule A. Water granules are 100g per unit.
                mixtureDiscoveryQueue.push({
                    water: currentWaterAmount + (100 * waterGranuleUnitA),
                    sugar: currentSugarAmount
                });
                // Option 2: Add water granule B.
                mixtureDiscoveryQueue.push({
                    water: currentWaterAmount + (100 * waterGranuleUnitB),
                    sugar: currentSugarAmount
                });
                // Option 3: Add sugar granule A.
                mixtureDiscoveryQueue.push({
                    water: currentWaterAmount,
                    sugar: currentSugarAmount + sugarGranuleWeightA
                });
                // Option 4: Add sugar granule B.
                mixtureDiscoveryQueue.push({
                    water: currentWaterAmount,
                    sugar: currentSugarAmount + sugarGranuleWeightB
                });
            }

            // --- Final Result Handling ---

            // Edge case: If no sugar could be added at all (e.g., due to strict volume/density limits),
            // the problem implies a solution with just the smallest possible amount of water.
            if (currentBestMixture.water === 0 && currentBestMixture.sugar === 0) {
                currentBestMixture.water = 100 * waterGranuleUnitA;
                // Sugar remains 0 in this scenario.
            }

            // Calculate the total volume of the optimal mixture.
            const finalOptimalTotalVolume = currentBestMixture.water + currentBestMixture.sugar;

            // Output the result in the required format: "total_volume sugar_amount".
            console.log(`${finalOptimalTotalVolume} ${currentBestMixture.sugar}`);
        };
    },

    /**
     * Module 2: Provides access to Node.js's built-in 'fs' (file system) module.
     * This allows other modules to perform file-related operations like reading from stdin.
     * @param {object} moduleRef - The module object for this module.
     * @param {object} moduleExports - The exports object for this module.
     */
    function(moduleRef, moduleExports) {
        // Simply re-export the native Node.js 'fs' module.
        // This makes the 'fs' module available through our custom loader.
        moduleExports = require("fs");
    }
]);