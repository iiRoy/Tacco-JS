module.exports = function(moduleDefinitions) {
    // A cache to store already loaded modules.
    var loadedModulesCache = {};

    // The custom 'require' function for this module system.
    function internalRequire(requestedModuleId) {
        // If the module is already in the cache, return its exports.
        if (loadedModulesCache[requestedModuleId]) {
            return loadedModulesCache[requestedModuleId].exports;
        }

        // Create a new module entry in the cache.
        var newModuleEntry = loadedModulesCache[requestedModuleId] = {
            id: requestedModuleId,
            isLoaded: false,
            exports: {}
        };

        // Execute the module's function, passing module, exports, and the internalRequire.
        moduleDefinitions[requestedModuleId].call(newModuleEntry.exports, newModuleEntry, newModuleEntry.exports, internalRequire);

        // Mark the module as loaded.
        newModuleEntry.isLoaded = true;

        // Return the module's exports.
        return newModuleEntry.exports;
    }

    // Store module definitions and cache on the internalRequire function for internal use.
    internalRequire.allModules = moduleDefinitions;
    internalRequire.moduleCache = loadedModulesCache;

    // Helper to define a getter for an export property.
    internalRequire.defineExportGetter = function(targetObject, propertyKey, getterFunction) {
        internalRequire.checkOwnProperty(targetObject, propertyKey) || Object.defineProperty(targetObject, propertyKey, {
            enumerable: true,
            get: getterFunction
        });
    };

    // Helper to mark an object as an ES module.
    internalRequire.setEsModuleFlag = function(targetObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    // Helper to create a namespace object for module exports.
    internalRequire.createModuleNamespace = function(moduleContent, flags) {
        // If flag 1 is set, resolve the module content first.
        if (1 & flags) {
            moduleContent = internalRequire(moduleContent);
        }
        // If flag 8 is set, return the module content directly.
        if (8 & flags) {
            return moduleContent;
        }
        // If flag 4 is set and it's an object and an ES module, return it directly.
        if (4 & flags && typeof moduleContent === "object" && moduleContent && moduleContent.__esModule) {
            return moduleContent;
        }

        // Create a new namespace object.
        var namespaceObj = Object.create(null);
        internalRequire.setEsModuleFlag(namespaceObj);
        Object.defineProperty(namespaceObj, "default", {
            enumerable: true,
            value: moduleContent
        });

        // If flag 2 is set and module content is not a string, copy properties.
        if (2 & flags && typeof moduleContent !== "string") {
            for (var propertyName in moduleContent) {
                internalRequire.defineExportGetter(namespaceObj, propertyName, (function(key) {
                    return moduleContent[key];
                }).bind(null, propertyName));
            }
        }
        return namespaceObj;
    };

    // Helper to get the default export for compatibility.
    internalRequire.getDefaultExport = function(moduleContent) {
        var defaultExportAccessor = moduleContent && moduleContent.__esModule ?
            function() {
                return moduleContent.default;
            } :
            function() {
                return moduleContent;
            };
        internalRequire.defineExportGetter(defaultExportAccessor, "a", defaultExportAccessor);
        return defaultExportAccessor;
    };

    // Helper to check if an object has its own property.
    internalRequire.checkOwnProperty = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // Public path for assets (empty in this case).
    internalRequire.assetPath = "";

    // Execute the entry module (module ID 0).
    return internalRequire(internalRequire.entryModuleId = 0);
}([
    // Module 0: Main application entry point.
    function(module, exports, localRequire) {
        // Read input from /dev/stdin and pass it to module 1.
        localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8"));
    },

    // Module 1: Implements a Breadth-First Search (BFS) algorithm.
    function(module, exports) {
        module.exports = function(inputDataString) {
            // Split the input string into individual lines.
            var allInputLines = inputDataString.split("\n");

            // Parse grid dimensions from the first line.
            var dimensionTokens = allInputLines[0].split(" ");
            var numRows = Number(dimensionTokens[0]);
            var numCols = Number(dimensionTokens[1]);

            // Data structures for the BFS.
            var gridCharacters = [];        // Stores the original grid characters.
            var bfsTraversalQueue = [];     // Queue for BFS traversal.
            var cellVisitedStatus = [];     // 2D array to track visited cells (0: unvisited, 1: visited).

            // Calculate the total number of cells in the grid.
            var unvisitedCellCount = numRows * numCols;

            // Initialize the grid and populate the BFS queue with starting '#' cells.
            for (var currentR = 0; currentR < numRows; currentR++) {
                var rowChars = allInputLines[currentR + 1].split("");
                var rowVisitedFlags = new Array(numCols).fill(0); // Initialize visited status for this row.
                cellVisitedStatus.push(rowVisitedFlags); // Add to the overall visited status grid.

                for (var currentC = 0; currentC < numCols; currentC++) {
                    // If a cell contains '#', it's a source for the BFS.
                    if ("#" === rowChars[currentC]) {
                        bfsTraversalQueue.push({
                            column: currentC,
                            row: currentR,
                            distance: 0
                        });
                    }
                }
                gridCharacters.push(rowChars); // Store the original row characters.
            }

            // Perform the BFS traversal.
            while (bfsTraversalQueue.length > 0) {
                var currentCell = bfsTraversalQueue.shift(); // Get the next cell from the queue.

                // The original code had '1,' here, which is a no-op due to the comma operator.
                // It's removed for clarity as it doesn't affect behavior.
                if (1 !== cellVisitedStatus[currentCell.row][currentCell.column]) {
                    // Mark the current cell as visited.
                    cellVisitedStatus[currentCell.row][currentCell.column] = 1;

                    // Decrement the count of unvisited cells.
                    unvisitedCellCount -= 1;

                    // If all cells have been visited, print the current distance and exit.
                    if (unvisitedCellCount <= 0) {
                        return void console.log(currentCell.distance);
                    }

                    // Explore neighbors: right, left, down, up.

                    // Check right neighbor.
                    if (currentCell.column + 1 < numCols && 1 !== cellVisitedStatus[currentCell.row][currentCell.column + 1]) {
                        bfsTraversalQueue.push({
                            column: currentCell.column + 1,
                            row: currentCell.row,
                            distance: currentCell.distance + 1
                        });
                    }
                    // Check left neighbor.
                    if (currentCell.column - 1 >= 0 && 1 !== cellVisitedStatus[currentCell.row][currentCell.column - 1]) {
                        bfsTraversalQueue.push({
                            column: currentCell.column - 1,
                            row: currentCell.row,
                            distance: currentCell.distance + 1
                        });
                    }
                    // Check down neighbor.
                    if (currentCell.row + 1 < numRows && 1 !== cellVisitedStatus[currentCell.row + 1][currentCell.column]) {
                        bfsTraversalQueue.push({
                            column: currentCell.column,
                            row: currentCell.row + 1,
                            distance: currentCell.distance + 1
                        });
                    }
                    // Check up neighbor.
                    if (currentCell.row - 1 >= 0 && 1 !== cellVisitedStatus[currentCell.row - 1][currentCell.column]) {
                        bfsTraversalQueue.push({
                            column: currentCell.column,
                            row: currentCell.row - 1,
                            distance: currentCell.distance + 1
                        });
                    }
                }
            }
        };
    },

    // Module 2: Provides the Node.js 'fs' (file system) module.
    function(module, exports) {
        module.exports = require("fs");
    }
]);
