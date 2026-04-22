module.exports = function(moduleDefinitions) {
    // This function acts as a custom module loader, similar to a simplified Webpack runtime.
    // It manages module definitions, loads them on demand, and caches their exports.

    // A cache to store modules that have already been loaded, preventing redundant execution.
    // Keys are module identifiers, values are module objects containing their exports.
    const loadedModuleCache = {};

    /**
     * The central function for loading modules.
     * It checks the cache first, then executes the module definition if not found.
     * @param {number} requestedModuleId - The unique identifier of the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function retrieveAndExecuteModule(requestedModuleId) {
        // If the module is already in our cache, we can return its exports immediately.
        if (loadedModuleCache[requestedModuleId]) {
            return loadedModuleCache[requestedModuleId].exports;
        }

        // If not cached, create a new module object.
        // Initialize it with its ID, a flag indicating it's not yet loaded, and an empty exports object.
        const currentModuleObject = loadedModuleCache[requestedModuleId] = {
            id: requestedModuleId,
            isResolved: false, // Renamed from 'l' for clarity
            exports: {}
        };

        // Execute the module's definition function.
        // The definition function receives the `module` object, its `exports` object,
        // and the `retrieveAndExecuteModule` function itself (for nested requires).
        moduleDefinitions[requestedModuleId].call(
            currentModuleObject.exports, // 'this' context for the module
            currentModuleObject,         // The module object itself
            currentModuleObject.exports, // The exports object to populate
            retrieveAndExecuteModule     // The function to require other modules
        );

        // After execution, mark the module as resolved/loaded.
        currentModuleObject.isResolved = true;
        return currentModuleObject.exports;
    }

    // Attach internal references to the loader for potential external debugging or introspection.
    retrieveAndExecuteModule.allSourceModules = moduleDefinitions;
    retrieveAndExecuteModule.activeModuleCache = loadedModuleCache;

    /**
     * Defines a getter property on an object. This is typically used for ES module compatibility
     * to expose properties as getters.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property.
     * @param {function} propertyGetter - The function that will be called to get the property's value.
     */
    retrieveAndExecuteModule.defineExportGetter = function(targetObject, propertyName, propertyGetter) {
        // Only define the property if it doesn't already exist on the target object.
        if (!retrieveAndExecuteModule.objectHasOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property visible during enumeration (e.g., `for...in`).
                get: propertyGetter // Assign the provided function as the getter.
            });
        }
    };

    /**
     * Marks an exports object as an ECMAScript module (ESM) by adding specific properties.
     * This helps in interoperability between CommonJS and ES module environments.
     * @param {object} exportsObject - The object to mark as an ES module.
     */
    retrieveAndExecuteModule.setESModuleFlag = function(exportsObject) {
        // If Symbol is available and Symbol.toStringTag exists, set it for better object identification.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Set the __esModule flag, a common convention used by bundlers like Webpack.
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };

    /**
     * Creates a synthetic namespace object for module interoperability.
     * This function handles various scenarios for converting different module types
     * (e.g., CommonJS, ES Modules) into a consistent namespace object.
     * @param {any} sourceModule - The module or module ID to process.
     * @param {number} conversionFlags - A bitmask indicating how to process the source module.
     * @returns {object} A namespace object containing default and named exports.
     */
    retrieveAndExecuteModule.createModuleNamespace = function(sourceModule, conversionFlags) {
        // Flag 1: If set, `sourceModule` is an ID, so load it first.
        if (conversionFlags & 1) {
            sourceModule = retrieveAndExecuteModule(sourceModule);
        }
        // Flag 8: If set, `sourceModule` is already a namespace object, return it directly.
        if (conversionFlags & 8) {
            return sourceModule;
        }
        // Flag 4: If set and `sourceModule` is an object and already an ES module, return it directly.
        if (conversionFlags & 4 && typeof sourceModule === 'object' && sourceModule && sourceModule.__esModule) {
            return sourceModule;
        }

        // Otherwise, construct a new namespace object.
        const namespaceResult = Object.create(null);
        retrieveAndExecuteModule.setESModuleFlag(namespaceResult); // Mark it as an ES module.

        // Define the 'default' export of the namespace, pointing to the original module.
        Object.defineProperty(namespaceResult, 'default', { enumerable: true, value: sourceModule });

        // Flag 2: If set and `sourceModule` is not a string, iterate its properties
        // and define them as named exports on the new namespace object.
        if (conversionFlags & 2 && typeof sourceModule !== 'string') {
            for (const propKey in sourceModule) {
                // Ensure proper closure for `propKey` within the getter function.
                retrieveAndExecuteModule.defineExportGetter(namespaceResult, propKey, ((currentPropKey) => sourceModule[currentPropKey]).bind(null, propKey));
            }
        }
        return namespaceResult;
    };

    /**
     * Provides a convenient getter for the default export of a module.
     * This is useful for `import * as Module from '...'` syntax where `Module.a` might be used.
     * @param {object} moduleReference - The module's exports object.
     * @returns {function} A function that, when called, returns the default export.
     */
    retrieveAndExecuteModule.getModuleDefault = function(moduleReference) {
        // Determine the actual default export. If it's an ES module, use `moduleReference.default`.
        // Otherwise, the entire `moduleReference` is considered the default export.
        const defaultAccessor = moduleReference && moduleReference.__esModule
            ? () => moduleReference.default
            : () => moduleReference;

        // Define a property 'a' on the accessor itself, which also returns the default export.
        // This is a specific Webpack convention for compatibility.
        retrieveAndExecuteModule.defineExportGetter(defaultAccessor, "a", defaultAccessor);
        return defaultAccessor;
    };

    /**
     * A utility function to check if an object has its own property (not inherited).
     * @param {object} objToCheck - The object to inspect.
     * @param {string} keyToCheck - The property key to look for.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    retrieveAndExecuteModule.objectHasOwnProperty = function(objToCheck, keyToCheck) {
        return Object.prototype.hasOwnProperty.call(objToCheck, keyToCheck);
    };

    // Placeholder for public asset path, not utilized in this specific application.
    retrieveAndExecuteModule.assetBaseUrl = "";

    // The entry point for the application. Module 0 is designated as the starting module.
    const applicationEntryModuleId = 0;
    retrieveAndExecuteModule.entryPoint = applicationEntryModuleId; // Store entry point ID for reference.

    // Execute the entry module to start the application logic.
    return retrieveAndExecuteModule(applicationEntryModuleId);

}(
    // Array containing all module definitions. Each element is a function
    // that defines a specific module's behavior and exports.
    [
        // --- Module 0: Application Startup & Input Handling ---
        function(currentModule, moduleExports, moduleRequester) {
            // This module serves as the primary entry point for the application.
            // It's responsible for reading input from stdin and orchestrating the main logic.

            // Load the Node.js 'fs' (file system) module via our custom loader.
            const fileSystemAccess = moduleRequester(2);
            // Load the main problem-solving algorithm module.
            const mainAlgorithmProcessor = moduleRequester(1);

            try {
                // Attempt to read all content from standard input synchronously.
                // It's assumed the input is UTF-8 encoded text.
                const rawInputString = fileSystemAccess.readFileSync("/dev/stdin", "UTF-8");

                // Perform basic validation on the input content.
                if (!rawInputString || rawInputString.trim().length === 0) {
                    console.error("Error: Input received from /dev/stdin was empty or contained only whitespace.");
                    // Depending on problem requirements, we might exit here or pass an empty string.
                    // For now, we'll proceed, allowing the main logic to handle empty input.
                    mainAlgorithmProcessor("");
                    return; // Stop further execution in this module.
                }

                // Pass the successfully read input string to the main algorithm for processing.
                mainAlgorithmProcessor(rawInputString);

            } catch (ioError) {
                // Catch any errors that occur during file reading (e.g., file not found, permissions).
                console.error("Failed to read input from /dev/stdin:", ioError.message);
                // In a production system, more robust error handling or exiting would be implemented.
                // For competitive programming, a crash might be acceptable.
            }
        },

        // --- Module 1: Core Problem-Solving Algorithm ---
        function(currentModule, moduleExports) {
            // This module encapsulates the main logic to solve the given algorithmic problem.
            // It processes a structured input string to determine a specific graph property.

            // The exported function takes the raw input string as its argument.
            moduleExports = function(inputDataString) {
                // Split the input string into an array of lines, filtering out any blank lines.
                const allInputLines = inputDataString.split("\n").filter(line => line.trim() !== '');

                // The first line of input specifies the total number of nodes in the graph.
                const totalNodeCount = Number(allInputLines[0]);

                // Input validation: Ensure totalNodeCount is a valid positive number.
                if (isNaN(totalNodeCount) || totalNodeCount <= 0) {
                    console.error("Error: Invalid node count specified in input. Must be a positive integer.");
                    console.log(-1); // Output -1 as an error indicator
                    return;
                }

                // Warn if the number of lines doesn't match the expected structure.
                if (allInputLines.length < totalNodeCount + 1) {
                    console.warn(`Warning: Input suggests ${totalNodeCount} nodes, but only ${allInputLines.length - 1} data lines found. Input may be incomplete.`);
                }

                // `nodeLinkOptions`: An array of arrays, where `nodeLinkOptions[i]` contains
                // all possible nodes that node `i` can link to, as specified in the input.
                const nodeLinkOptions = [];
                // `currentActiveLink`: An array where `currentActiveLink[i]` stores the
                // specific node that node `i` is *currently* considered to be pointing to.
                const currentActiveLink = [];

                // Parse the input lines to populate `nodeLinkOptions` and `currentActiveLink`.
                // Input nodes are 1-indexed, so convert them to 0-indexed for array usage.
                for (let i = 0; i < totalNodeCount; i++) {
                    const lineContent = allInputLines[i + 1]; // +1 to skip the node count line

                    // Validate that a line exists for the current node.
                    if (!lineContent) {
                        console.error(`Error: Missing connection data for node ${i + 1}.`);
                        console.log(-1);
                        return;
                    }

                    // Parse the two numbers on the line, converting to 0-indexed.
                    const parsedConnection = lineContent.split(" ").map(numStr => {
                        const parsedNum = Number(numStr);
                        if (isNaN(parsedNum)) {
                            console.error(`Error: Malformed number '${numStr}' found on line ${i + 2}.`);
                            console.log(-1);
                            return NaN; // Propagate error state
                        }
                        return parsedNum - 1; // Convert to 0-indexed
                    });

                    // Further validation: ensure two numbers were parsed and they are within valid node range.
                    if (parsedConnection.length !== 2 || parsedConnection.some(nodeId => nodeId < 0 || nodeId >= totalNodeCount)) {
                        console.error(`Error: Invalid connection format or out-of-bounds node ID on line ${i + 2}: '${lineContent}'`);
                        console.log(-1);
                        return;
                    }

                    // For node `i`, the first parsed number is its initial active link.
                    currentActiveLink.push(parsedConnection[0]);
                    // Store both parsed numbers as potential link options for node `i`.
                    nodeLinkOptions.push(parsedConnection);
                }

                // `maxPossibleMutualPairs`: The total number of unique pairs of nodes in a graph.
                // This is equivalent to "N choose 2", i.e., N * (N - 1) / 2.
                // This value is used to determine if all possible pairs have been processed.
                const maxPossibleMutualPairs = (totalNodeCount * (totalNodeCount - 1)) / 2;

                // `linkOptionTraversalCounts`: An array to track how many of the `nodeLinkOptions`
                // have been considered for each node.
                const linkOptionTraversalCounts = new Array(totalNodeCount).fill(0);

                // `nodeLevelDepths`: Stores the maximum "depth" or "level" reached for each node
                // during the processing of mutual links.
                const nodeLevelDepths = new Array(totalNodeCount).fill(0);

                // `processingQueue`: A queue containing node IDs that need to be re-evaluated.
                // Initially, all nodes are added to the queue to start the process.
                const processingQueue = [];
                for (let nodeId = 0; nodeId < totalNodeCount; nodeId++) {
                    processingQueue.push(nodeId);
                }

                let overallMaxLevel = 0;       // Keeps track of the highest `nodeLevelDepths` found across all nodes.
                let countOfMutualPairs = 0;    // Counts how many mutual link pairs have been successfully identified.

                // Main algorithmic loop: Continues as long as there are nodes to process in the queue.
                while (processingQueue.length > 0) {
                    // Dequeue the next node to examine.
                    const activeNodeId = processingQueue.shift();

                    // Determine the node that `activeNodeId` is currently pointing to.
                    const pointedToNodeId = currentActiveLink[activeNodeId];

                    // Crucial condition: Check for a "mutual link" (a 2-cycle).
                    // This occurs if `activeNodeId` points to `pointedToNodeId`, AND
                    // `pointedToNodeId` also points back to `activeNodeId` in its `currentActiveLink`.
                    if (currentActiveLink[pointedToNodeId] === activeNodeId) {
                        // A mutual link pair has been found. Increment the counter.
                        countOfMutualPairs++;

                        // Calculate the new level for both nodes in this mutual link.
                        // The level is one greater than the maximum of their current levels.
                        const calculatedNewLevel = Math.max(nodeLevelDepths[activeNodeId], nodeLevelDepths[pointedToNodeId]) + 1;

                        // Update the overall maximum level if this new level is higher.
                        if (calculatedNewLevel > overallMaxLevel) {
                            overallMaxLevel = calculatedNewLevel;
                        }

                        // Assign the new calculated level to both nodes in the mutual pair.
                        nodeLevelDepths[activeNodeId] = calculatedNewLevel;
                        nodeLevelDepths[pointedToNodeId] = calculatedNewLevel;

                        // Increment the traversal count for both nodes, indicating they've been part of a processed link.
                        linkOptionTraversalCounts[activeNodeId]++;
                        linkOptionTraversalCounts[pointedToNodeId]++;

                        // Logic for `activeNodeId`:
                        // If `activeNodeId` still has more link options to explore (i.e., its traversal count
                        // is less than the `totalNodeCount` which is a specific problem constraint):
                        if (linkOptionTraversalCounts[activeNodeId] < totalNodeCount) {
                            // Update `activeNodeId`'s `currentActiveLink` to its next available link option.
                            currentActiveLink[activeNodeId] = nodeLinkOptions[activeNodeId][linkOptionTraversalCounts[activeNodeId]];
                            // If this new link immediately forms another mutual pair, re-add `activeNodeId` to the queue.
                            if (currentActiveLink[currentActiveLink[activeNodeId]] === activeNodeId) {
                                processingQueue.push(activeNodeId);
                            }
                        }

                        // Repeat the same logic for `pointedToNodeId`:
                        if (linkOptionTraversalCounts[pointedToNodeId] < totalNodeCount) {
                            currentActiveLink[pointedToNodeId] = nodeLinkOptions[pointedToNodeId][linkOptionTraversalCounts[pointedToNodeId]];
                            if (currentActiveLink[currentActiveLink[pointedToNodeId]] === pointedToNodeId) {
                                processingQueue.push(pointedToNodeId);
                            }
                        }
                    }
                }

                // Final result check:
                // If the number of processed mutual pairs equals the maximum possible pairs,
                // it means all connections have been successfully formed and processed.
                // In this case, output the `overallMaxLevel`. Otherwise, output -1.
                if (countOfMutualPairs === maxPossibleMutualPairs) {
                    console.log(overallMaxLevel);
                } else {
                    console.log(-1);
                }
            };
        },

        // --- Module 2: Node.js File System Wrapper ---
        function(currentModule, moduleExports) {
            // This module acts as a simple wrapper to expose the Node.js built-in 'fs' module.
            // Other modules within this custom loader can then use `require('fs')` to access file system operations.
            currentModule.exports = require("fs");
        }
    ]
);