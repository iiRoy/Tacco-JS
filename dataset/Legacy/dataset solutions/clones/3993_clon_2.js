mainExport = function(allModuleSources) {

    // A map to store modules that have already been loaded and initialized.
    var moduleCache = {};

    // The primary function responsible for loading and resolving modules.
    function loadProcessor(targetIndex) {
        // If the module is already in our cache, return its previously exported values.
        if (moduleCache[targetIndex]) {
            return moduleCache[targetIndex].exportObject;
        }

        // If not cached, create a new module entry.
        var activeModule = moduleCache[targetIndex] = {
            identifierCode: targetIndex, // Unique ID for this module.
            isInitialized: false,        // Flag to track if the module's code has been executed.
            exportObject: {}             // The object that will hold the module's exports.
        };

        // Execute the module's source function.
        // It receives the module object itself, its exports, and the loader function.
        allModuleSources[targetIndex].call(activeModule.exportObject, activeModule, activeModule.exportObject, loadProcessor);

        // Mark the module as fully initialized after its execution.
        activeModule.isInitialized = true;

        // Return the final exports of the module.
        return activeModule.exportObject;
    }

    // Store the collection of all module source functions on the loader.
    loadProcessor.sourceMap = allModuleSources;

    // Store the module cache on the loader for direct access if needed.
    loadProcessor.cachedMap = moduleCache;

    // A utility function to define a getter for a property on an object.
    loadProcessor.defineExportGetter = function(targetObj, propKey, getterFunc) {
        // Only define the property if it doesn't already exist on the target object.
        if (!loadProcessor.objectHasOwn(targetObj, propKey)) {
            Object.defineProperty(targetObj, propKey, {
                enumerable: true, // Make the property enumerable.
                get: getterFunc   // The function to call when the property is accessed.
            });
        }
    };

    // Marks an export object as an ECMAScript module for compatibility.
    loadProcessor.registerEsModule = function(exportsContainer) {
        // If Symbol.toStringTag is available, set it to "Module".
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportsContainer, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Define the __esModule property to signify it's an ES module.
        Object.defineProperty(exportsContainer, "__esModule", {
            value: true
        });
    };

    // Handles interoperability for various module export formats.
    loadProcessor.handleInterop = function(importedValue, importTypeFlags) {
        // If flag 1 is set, it means the value is a module ID, so load it.
        if (importTypeFlags & 1) {
            importedValue = loadProcessor(importedValue);
        }

        // If flag 8 is set, return the value as is.
        if (importTypeFlags & 8) {
            return importedValue;
        }

        // If flag 4 is set, and it's an object that's already an ES module, return it.
        if ((importTypeFlags & 4) && typeof importedValue === "object" && importedValue && importedValue.__esModule) {
            return importedValue;
        }

        // Create a new object to act as an interop proxy.
        var interopProxy = Object.create(null);

        // Register this proxy as an ES module.
        loadProcessor.registerEsModule(interopProxy);

        // Define a 'default' export getter pointing to the imported value.
        Object.defineProperty(interopProxy, "default", {
            enumerable: true,
            value: importedValue
        });

        // If flag 2 is set and the imported value is not a string, copy all its properties.
        if ((importTypeFlags & 2) && typeof importedValue !== "string") {
            for (var memberKey in importedValue) {
                loadProcessor.defineExportGetter(interopProxy, memberKey, (function(key) {
                    return importedValue[key];
                }).bind(null, memberKey));
            }
        }

        return interopProxy;
    };

    // Creates an accessor function for a module's default export.
    loadProcessor.createDefaultExportAccessor = function(potentialModule) {
        var defaultAccessor = potentialModule && potentialModule.__esModule ?
            function() {
                return potentialModule.default;
            } :
            function() {
                return potentialModule;
            };
        // Attach the accessor itself as a property 'exportAlias' for some internal mechanism.
        loadProcessor.defineExportGetter(defaultAccessor, "exportAlias", defaultAccessor);
        return defaultAccessor;
    };

    // Checks if an object directly owns a specific property (not inherited).
    loadProcessor.objectHasOwn = function(testObject, testProperty) {
        return Object.prototype.hasOwnProperty.call(testObject, testProperty);
    };

    // Sets the public path for asset loading (empty string in this case).
    loadProcessor.assetPath = "";

    // Kick off the module loading process by initiating the entry point module (module 0).
    return loadProcessor(loadProcessor.entryPoint = 0);

}([
    // Module Definition 0: The main entry point of the application.
    function(mod0_moduleObj, mod0_exportsObj, mod0_loader) {
        // This module calls module 1, passing it the result of reading from stdin via module 2.
        mod0_loader(1)(mod0_loader(2).readFileSync("/dev/stdin", "UTF-8"));
    },

    // Module Definition 1: Contains the core business logic for calculation.
    function(mod1_exportsTarget, mod1_moduleMeta) {

        // A private helper function to extract elements from an iterable, similar to destructuring.
        function retrieveElements(sourceCollection, extractionLimit) {
            // Path 1: If the input is already an array, return it directly.
            if (Array.isArray(sourceCollection)) {
                return sourceCollection;
            }

            // Path 2: Attempt to iterate and collect elements.
            return (function(inputIterable, maxItemsToExtract) {
                var collectedElements = [];
                var iterationContinuing = true;
                var errorOccurred = false;
                var capturedError = undefined;

                try {
                    var currentResult;
                    // Loop through the iterable, collecting elements until done or limit reached.
                    for (
                        var dataIterator = inputIterable[Symbol.iterator]();
                        !(iterationContinuing = (currentResult = dataIterator.next()).done) &&
                        (collectedElements.push(currentResult.value), !maxItemsToExtract || collectedElements.length !== maxItemsToExtract);
                        iterationContinuing = true
                    ) {
                        /* Loop body is intentionally empty as all logic is in the condition. */
                    }
                } catch (err) {
                    errorOccurred = true;
                    capturedError = err;
                } finally {
                    try {
                        // Ensure the iterator's 'return' method is called if available and iteration wasn't completed.
                        if (!iterationContinuing && dataIterator["return"] != null) {
                            dataIterator["return"]();
                        }
                    } finally {
                        // Re-throw any captured error.
                        if (errorOccurred) {
                            throw capturedError;
                        }
                    }
                }
                return collectedElements;
            })(sourceCollection, extractionLimit) || (function() {
                // Path 3: If the input is not iterable, throw a TypeError.
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            })();
        }

        // Assign the main calculation logic to this module's exports.
        mod1_exportsTarget.exports = function(initialInputData) {
            // Process the input: take the first line, split by space, convert to numbers, and extract the first two.
            var processedValues = retrieveElements(initialInputData.split("\n")[0].split(" ").map(function(numberString) {
                return Number(numberString);
            }), 2);

            // Extract the two primary numerical inputs.
            var valueA = processedValues[0];
            var valueB = processedValues[1];

            // Initialize a variable to accumulate the calculation result.
            var accumulatedResult = 0;

            // Iterate from 1 up to and including valueA.
            for (var counterVariable = 1; counterVariable <= valueA; counterVariable++) {
                // Calculate the remainder when valueA is divided by the current counter.
                var remainderValue = valueA % counterVariable;

                // Perform the complex accumulation based on the formula.
                accumulatedResult += Math.floor(valueA / counterVariable) * Math.max(0, counterVariable - valueB) + Math.max(0, remainderValue - valueB + 1);
            }

            // Apply a specific adjustment if valueB is zero.
            if (0 === valueB) {
                accumulatedResult -= valueA;
            }

            // Output the final computed result to the console.
            console.log(accumulatedResult);
        };
    },

    // Module Definition 2: Provides access to Node.js's native 'fs' (filesystem) module.
    function(mod2_exportObject, mod2_moduleInfo) {
        // Simply exports the 'fs' module obtained via Node's built-in require.
        mod2_exportObject.exports = require("fs");
    }
]);