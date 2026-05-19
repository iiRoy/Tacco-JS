module.exports = function(moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    var moduleCache = {};

    // This function acts as the custom 'require' mechanism for the bundled modules.
    function moduleLoader(moduleId) {
        // If the requested module is already in the cache, return its exported value.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // If not cached, create a new module entry in the cache.
        // 'i' stores the module's identifier.
        // 'l' indicates if the module has finished loading (false initially).
        // 'exports' is the object that will hold the module's exported values.
        var currentModule = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        // Execute the module's definition function.
        // 'call' is used to set 'this' context to 'currentModule.exports'
        // and pass 'currentModule', 'currentModule.exports', and 'moduleLoader' as arguments.
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);

        // After execution, mark the module as fully loaded.
        currentModule.l = true;

        // Return the module's exports.
        return currentModule.exports;
    }

    // Attach the original module definitions array to the loader for reference.
    moduleLoader.modules = moduleDefinitions;
    // Attach the module cache to the loader.
    moduleLoader.cache = moduleCache;

    // A utility function to define a getter property on an object.
    // This is often used for lazy loading or exposing properties.
    moduleLoader.defineGetter = function(targetObject, propertyName, getterFunction) {
        // Only define the property if it doesn't already exist on the target object.
        if (!moduleLoader.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property enumerable.
                get: getterFunction // The function to execute when the property is accessed.
            });
        }
    };

    // A utility function to mark a module's exports as an ES module.
    moduleLoader.registerEsModule = function(moduleExports) {
        // If Symbol and Symbol.toStringTag are available, set the toStringTag for better debugging.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(moduleExports, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Set the __esModule flag to true, indicating it's an ES module.
        Object.defineProperty(moduleExports, "__esModule", {
            value: true
        });
    };

    // Handles interoperability for different module formats (e.g., CommonJS with ES modules).
    moduleLoader.interopRequireDefault = function(valueToProcess, modeFlags) {
        // If modeFlags indicates it's a direct module ID, load it.
        if (1 & modeFlags) {
            valueToProcess = moduleLoader(valueToProcess);
        }
        // If modeFlags indicates it's already an ES module, return it directly.
        if (8 & modeFlags) {
            return valueToProcess;
        }
        if (4 & modeFlags && typeof valueToProcess === "object" && valueToProcess && valueToProcess.__esModule) {
            return valueToProcess;
        }

        // Create a new object to represent the interop'd module.
        var interopObject = Object.create(null);
        moduleLoader.registerEsModule(interopObject); // Mark it as an ES module.
        Object.defineProperty(interopObject, "default", {
            enumerable: true,
            value: valueToProcess
        });

        // If modeFlags indicates and the value is not a string, copy all properties.
        if (2 & modeFlags && typeof valueToProcess !== "string") {
            for (var propName in valueToProcess) {
                moduleLoader.defineGetter(interopObject, propName, (function(boundProp) {
                    return valueToProcess[boundProp];
                }).bind(null, propName));
            }
        }
        return interopObject;
    };

    // Creates a getter function for the default export of a module.
    moduleLoader.createDefaultExportGetter = function(moduleRef) {
        var defaultGetter = moduleRef && moduleRef.__esModule ?
            function() {
                return moduleRef.default;
            } :
            function() {
                return moduleRef;
            };
        // Define an alias 'a' for the default getter.
        moduleLoader.defineGetter(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    // Checks if an object has a specific property directly on itself (not inherited).
    moduleLoader.hasOwn = function(objToCheck, propToCheck) {
        return Object.prototype.hasOwnProperty.call(objToCheck, propToCheck);
    };

    // The public path for assets (empty in this specific bundle).
    moduleLoader.publicPath = "";

    // Start the application by loading the entry module, which is module with ID 0.
    return moduleLoader(moduleLoader.startupModuleId = 0);

}([ // This array contains all the module definitions.

    // Module 0: The application's entry point.
    function(moduleExports0, moduleObject0, localRequire0) {
        // This module reads input from standard input and passes it to the main logic.
        // It requires module 1 (the main logic) and module 2 (Node.js 'fs' module).
        localRequire0(1)(localRequire0(2).readFileSync("/dev/stdin", "UTF-8"));
    },

    // Module 1: Contains the core application logic.
    function(moduleExports1, moduleObject1) {
        moduleExports1.exports = function(inputDataString) {
            // Split the entire input string into an array of lines.
            var inputLines = inputDataString.split("\n");
            // The first line contains the total number of elements, parsed as a number.
            var elementCount = Number(inputLines[0]);

            // 'adjacencyLists' will store the list of available choices for each element.
            // 'currentMapping' will store the current chosen mapping for each element.
            var adjacencyLists = [];
            var currentMapping = [];

            // Loop through the input lines to populate the initial data structures.
            for (var idx = 0; idx < elementCount; idx++) {
                // Parse each line (from the second line onwards) into an array of numbers.
                // Subtract 1 from each number to convert to 0-based indexing.
                var parsedLine = inputLines[idx + 1].split(" ").map(function(strNum) {
                    return Number(strNum) - 1;
                });
                // The first number in each line is the initial mapping for the current element.
                currentMapping.push(parsedLine[0]);
                // The entire parsed line represents the list of choices for the current element.
                adjacencyLists.push(parsedLine);
            }

            // Calculate the total number of unique pairs possible for 'elementCount' elements.
            var totalPairs = elementCount * (elementCount - 1) / 2;

            // 'visitCounts': An array to keep track of how many times each element's choice has been advanced.
            var visitCounts = new Array(elementCount).fill(0);
            // 'depthLevels': An array to store the maximum depth (or level) reached for each element within a cycle.
            var depthLevels = new Array(elementCount).fill(0);
            // 'processingQueue': A queue to manage elements that need to be processed or re-processed.
            var processingQueue = [];

            // Initialize the processing queue with all elements from 0 to elementCount - 1.
            for (var queueInitIdx = 0; queueInitIdx < elementCount; queueInitIdx++) {
                processingQueue.push(queueInitIdx);
            }

            // 'maxDepthAchieved': Stores the highest depth found across all cycles.
            var maxDepthAchieved = 0;
            // 'matchedPairsCount': Counts the number of successfully identified reciprocal pairs.
            var matchedPairsCount = 0;

            // Continue processing elements as long as the queue is not empty.
            while (processingQueue.length > 0) {
                var currentElement = processingQueue.shift(); // Dequeue the next element to process.

                // Check if the current element and its mapped element form a reciprocal pair (a cycle of length 2).
                if (currentMapping[currentMapping[currentElement]] === currentElement) {
                    matchedPairsCount += 1; // Increment the count of matched pairs.

                    var mappedElement = currentMapping[currentElement]; // Get the element that 'currentElement' maps to.
                    // Calculate the new depth for this cycle. It's 1 plus the maximum depth of the two elements involved.
                    var newDepth = Math.max(depthLevels[currentElement], depthLevels[mappedElement]) + 1;

                    // Update the overall maximum depth if the 'newDepth' is greater.
                    if (maxDepthAchieved < newDepth) {
                        maxDepthAchieved = newDepth;
                    }

                    // Assign the 'newDepth' to both elements in the reciprocal pair.
                    depthLevels[currentElement] = newDepth;
                    depthLevels[mappedElement] = newDepth;

                    // Increment the visit counts for both elements, indicating their current choice has been used.
                    visitCounts[currentElement] += 1;
                    visitCounts[mappedElement] += 1;

                    // If 'currentElement' still has unvisited choices:
                    if (visitCounts[currentElement] !== elementCount) {
                        // Update 'currentElement's mapping to its next available choice.
                        currentMapping[currentElement] = adjacencyLists[currentElement][visitCounts[currentElement]];
                        // If this new mapping immediately forms another reciprocal pair, add 'currentElement' back to the queue.
                        if (currentMapping[currentMapping[currentElement]] === currentElement) {
                            processingQueue.push(currentElement);
                        }
                    }

                    // If 'mappedElement' still has unvisited choices:
                    if (visitCounts[mappedElement] !== elementCount) {
                        // Update 'mappedElement's mapping to its next available choice.
                        currentMapping[mappedElement] = adjacencyLists[mappedElement][visitCounts[mappedElement]];
                        // If this new mapping immediately forms another reciprocal pair, add 'mappedElement' back to the queue.
                        if (currentMapping[currentMapping[mappedElement]] === mappedElement) {
                            processingQueue.push(mappedElement);
                        }
                    }
                }
            }

            // After processing all elements, check if all possible pairs were matched.
            if (matchedPairsCount === totalPairs) {
                // If all pairs are matched, print the maximum depth achieved.
                console.log(maxDepthAchieved);
            } else {
                // Otherwise, print -1, indicating not all pairs could be formed into reciprocal cycles.
                console.log(-1);
            }
        };
    },

    // Module 2: A simple wrapper for the Node.js 'fs' (file system) module.
    function(moduleExports2, moduleObject2) {
        moduleExports2.exports = require("fs");
    }
]);
