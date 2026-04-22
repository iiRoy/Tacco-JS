(function(moduleDefinitions) { // System for managing and loading components
    // A cache for already loaded components
    var cachedComponents = {};

    // The primary component loading function
    function bundleLoader(componentIdentifier) {
        // First, check if the component is already in our cache
        if(cachedComponents[componentIdentifier]) {
            return cachedComponents[componentIdentifier].exportedMembers;
        }
        // If not, create a new component entry and add it to the cache
        var componentData = cachedComponents[componentIdentifier] = {
            id: componentIdentifier, // Store its unique identifier
            isLoaded: false,       // Mark it as not yet fully loaded
            exportedMembers: {}    // Initialize its export object
        };

        // Execute the component's function with its context
        moduleDefinitions[componentIdentifier].call(componentData.exportedMembers, componentData, componentData.exportedMembers, bundleLoader);

        // After execution, mark the component as loaded
        componentData.isLoaded = true;

        // Return the component's exports
        return componentData.exportedMembers;
    }


    // Expose the collection of all component definitions
    bundleLoader.loadedDefinitions = moduleDefinitions;

    // Expose the component cache reference
    bundleLoader.cachedComponentsRef = cachedComponents;

    // A utility to define a getter function for harmony exports
    bundleLoader.defineExportGetter = function(exportedMembers, memberName, valueProvider) {
        // Ensure the property doesn't already exist on the exports object
        if(!bundleLoader.hasOwnPropertyCheck(exportedMembers, memberName)) {
            Object.defineProperty(exportedMembers, memberName, { enumerable: true, get: valueProvider });
        }
    };

    // A utility to mark an exports object as an ES module
    bundleLoader.markAsESModule = function(exportedMembers) {
        if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportedMembers, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exportedMembers, '__esModule', { value: true });
    };

    // Function to create a fake namespace object from a module or value
    bundleLoader.createNamespaceObject = function(sourceValue, operationMode) {
        let processedValue = sourceValue;
        // Mode & 1: Treat value as a component ID and load it
        if(operationMode & 1) processedValue = bundleLoader(sourceValue);
        // Mode & 8: If it's already a namespace object, just return it
        if(operationMode & 8) return processedValue;
        // Mode & 4: If it's already an ES module namespace, return it
        if((operationMode & 4) && typeof processedValue === 'object' && processedValue && processedValue.__esModule) return processedValue;

        // Otherwise, create a new namespace object
        var namespaceObject = Object.create(null);
        bundleLoader.markAsESModule(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: processedValue });

        // Mode & 2: Merge all properties of the source value into the namespace
        if(operationMode & 2 && typeof processedValue != 'string') {
            for(var keyName in processedValue) {
                // Ensure key is not 'default' to avoid conflicts
                if (keyName !== 'default') {
                    bundleLoader.defineExportGetter(namespaceObject, keyName, (function(k) {
                        return processedValue[k];
                    }).bind(null, keyName));
                }
            }
        }
        return namespaceObject;
    };

    // Utility to get the default export function for compatibility
    bundleLoader.getDefaultExportFunction = function(currentModuleRef) {
        var defaultExportProvider = currentModuleRef && currentModuleRef.__esModule ?
            function getActualDefault() { return currentModuleRef['default']; } :
            function getModuleRootExports() { return currentModuleRef; };
        bundleLoader.defineExportGetter(defaultExportProvider, 'a', defaultExportProvider);
        return defaultExportProvider;
    };

    // Standard Object.prototype.hasOwnProperty.call wrapper
    bundleLoader.hasOwnPropertyCheck = function(targetObject, propertyName) { return Object.prototype.hasOwnProperty.call(targetObject, propertyName); };

    // Public path for assets - currently empty
    bundleLoader.publicPathRoot = "";


    // Load the designated entry component and return its exports
    return bundleLoader(bundleLoader.entryComponentId = "./src/contest/atcoder/msol2020/e.ts");
})
/************************************************************************/
({

// Component definition for webpack's built-in module polyfill
"./node_modules/webpack/buildin/module.js":
(function(currentModule) {

    // Check if the custom polyfill flag is not set on the current module
    if (!currentModule.customModuleFlag) {
        // Define a no-op function for deprecation warnings
        currentModule.warnDeprecated = function() {};
        // Initialize an empty array for module lookup paths
        currentModule.lookupPaths = [];
        // Ensure children property exists, though it might be undefined by default
        if (!currentModule.dependentModules) {
            currentModule.dependentModules = [];
        }
        // Define a getter for the 'isLoaded' status
        Object.defineProperty(currentModule, "isLoaded", {
            enumerable: true,
            get: function() {
                return currentModule.isLoaded; // Access the internal isLoaded flag
            }
        });
        // Define a getter for the 'uniqueId'
        Object.defineProperty(currentModule, "uniqueId", {
            enumerable: true,
            get: function() {
                return currentModule.id; // Access the internal id
            }
        });
        // Set the custom polyfill flag to indicate it has been processed
        currentModule.customModuleFlag = 1;
    }
    // Return the modified module object
    return currentModule;
}),

// Main application component for the AtCoder contest problem
"./src/contest/atcoder/msol2020/e.ts":
(function(currentModuleRef, exportedMembers, bundleLoader) {

    var importHelperFunction = (this && this.__importDefault) || function (mod) {
        // Helper to handle default imports: if it's an ES module, use it, otherwise wrap it
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exportedMembers, "__esModule", { value: true });
    // Define the main program entry point for external access
    exportedMembers.runProgram = void 0;

    // Import file system utilities for reading input
    const fileSystemAccess = importHelperFunction(bundleLoader("fs"));
    // Import custom I/O utilities
    const inputOutputUtilities = bundleLoader("./src/contest/common/io.ts");

    // Enum to represent coordinate system assignments
    var CoordSystem;
    (function (CoordSystem) {
        CoordSystem["X_COORD"] = "X_AXIS"; // Assign to X-axis
        CoordSystem["Y_COORD"] = "Y_AXIS"; // Assign to Y-axis
        CoordSystem["NONE_ASSIGNED"] = "NONE"; // No specific assignment
    })(CoordSystem || (CoordSystem = {}));

    /**
     * Calculates the total minimum cost for a given assignment of points.
     * @param {object} params - Object containing input data.
     * @param {number} params.numPoints - Total number of points.
     * @param {Array<object>} params.allPoints - Original array of point objects (x, y, p, i).
     * @param {Array<CoordSystem>} params.assignmentChoices - Array indicating the axis assignment for each point.
     * @param {Array<object>} params.sortedByX - Points sorted by their X coordinate.
     * @param {Array<object>} params.sortedByY - Points sorted by their Y coordinate.
     * @returns {number} The calculated total minimum cost.
     */
    function computeOptimalCost({ numPoints, allPoints, assignmentChoices, sortedByX, sortedByY }) {
        // Early exit for no points
        if (numPoints <= 0) {
            return 0;
        }

        // Initialize an array to store the shortest travel distance for each point
        const minDistances = new Array(numPoints);
        for (let currentIdx = 0; currentIdx < numPoints; currentIdx++) {
            const pointRef = allPoints[currentIdx];
            // Calculate initial cost: min(abs(x), abs(y)) * power
            const costX = Math.abs(pointRef.x) * pointRef.p;
            const costY = Math.abs(pointRef.y) * pointRef.p;
            minDistances[currentIdx] = (costX < costY) ? costX : costY;
        }

        let lastAssignedIndex = null;
        // First pass: iterate sorted by X, from left to right
        for (let currentIdx = 0; currentIdx < numPoints; currentIdx++) {
            const currentPoint = sortedByX[currentIdx];
            const originalPointId = currentPoint.i;
            // If the current point is assigned to Y-axis, it acts as a "source"
            if (assignmentChoices[originalPointId] === CoordSystem.Y_COORD) {
                lastAssignedIndex = currentIdx;
                minDistances[originalPointId] = 0; // Cost is zero if it's a source
            }
            // If there was a previous Y-axis source, calculate potential cost from it
            else if (lastAssignedIndex !== null) {
                const sourcePoint = sortedByX[lastAssignedIndex];
                const distanceToSource = Math.abs(currentPoint.x - sourcePoint.x);
                const travelCost = distanceToSource * currentPoint.p;
                minDistances[originalPointId] = (travelCost < minDistances[originalPointId]) ? travelCost : minDistances[originalPointId];
            }
        }

        lastAssignedIndex = null;
        // Second pass: iterate sorted by X, from right to left
        for (let currentIdx = numPoints - 1; currentIdx >= 0; currentIdx--) {
            const currentPoint = sortedByX[currentIdx];
            const originalPointId = currentPoint.i;
            // If current point is assigned to Y-axis, it acts as a "source"
            if (assignmentChoices[originalPointId] === CoordSystem.Y_COORD) {
                lastAssignedIndex = currentIdx;
                minDistances[originalPointId] = 0; // Cost is zero if it's a source
            }
            // If there was a previous Y-axis source, calculate potential cost from it
            else if (lastAssignedIndex !== null) {
                const sourcePoint = sortedByX[lastAssignedIndex];
                const distanceToSource = Math.abs(currentPoint.x - sourcePoint.x);
                const travelCost = distanceToSource * currentPoint.p;
                minDistances[originalPointId] = (travelCost < minDistances[originalPointId]) ? travelCost : minDistances[originalPointId];
            }
        }

        lastAssignedIndex = null;
        // Third pass: iterate sorted by Y, from bottom to top
        for (let currentIdx = 0; currentIdx < numPoints; currentIdx++) {
            const currentPoint = sortedByY[currentIdx];
            const originalPointId = currentPoint.i;
            // If the current point is assigned to X-axis, it acts as a "source"
            if (assignmentChoices[originalPointId] === CoordSystem.X_COORD) {
                lastAssignedIndex = currentIdx;
                minDistances[originalPointId] = 0; // Cost is zero if it's a source
            }
            // If there was a previous X-axis source, calculate potential cost from it
            else if (lastAssignedIndex !== null) {
                const sourcePoint = sortedByY[lastAssignedIndex];
                const distanceToSource = Math.abs(currentPoint.y - sourcePoint.y);
                const travelCost = distanceToSource * currentPoint.p;
                minDistances[originalPointId] = (travelCost < minDistances[originalPointId]) ? travelCost : minDistances[originalPointId];
            }
        }

        lastAssignedIndex = null;
        // Fourth pass: iterate sorted by Y, from top to bottom
        for (let currentIdx = numPoints - 1; currentIdx >= 0; currentIdx--) {
            const currentPoint = sortedByY[currentIdx];
            const originalPointId = currentPoint.i;
            // If the current point is assigned to X-axis, it acts as a "source"
            if (assignmentChoices[originalPointId] === CoordSystem.X_COORD) {
                lastAssignedIndex = currentIdx;
                minDistances[originalPointId] = 0; // Cost is zero if it's a source
            }
            // If there was a previous X-axis source, calculate potential cost from it
            else if (lastAssignedIndex !== null) {
                const sourcePoint = sortedByY[lastAssignedIndex];
                const distanceToSource = Math.abs(currentPoint.y - sourcePoint.y);
                const travelCost = distanceToSource * currentPoint.p;
                minDistances[originalPointId] = (travelCost < minDistances[originalPointId]) ? travelCost : minDistances[originalPointId];
            }
        }

        // Sum up all minimum distances to get the total cost
        let totalSumOfCosts = 0;
        for (let val of minDistances) {
            totalSumOfCosts += val;
        }
        return totalSumOfCosts;
    }

    /**
     * Recursively explores all possible axis assignments for points.
     * @param {number} currentPointIdx - The index of the point currently being considered.
     * @param {number} selectedCount - The number of points assigned to an axis so far.
     * @param {object} systemContext - Object holding shared state for the recursion.
     */
    function recursiveAssignmentSolver(currentPointIdx, selectedCount, systemContext) {
        const { assignmentChoices, numPoints, allPoints, resultCosts, sortedByX, sortedByY } = systemContext;

        // Base case: all points have been assigned
        if (currentPointIdx === numPoints) {
            // Once all assignments are made, compute the total cost for this configuration
            const currentConfigurationCost = computeOptimalCost({
                numPoints: numPoints,
                allPoints: allPoints,
                sortedByX: sortedByX,
                sortedByY: sortedByY,
                assignmentChoices: assignmentChoices
            });
            // Update the minimum cost for the current 'selectedCount'
            resultCosts[selectedCount] = Math.min(resultCosts[selectedCount], currentConfigurationCost);
            return;
        }

        // --- Recursive Steps ---

        // Option 1: Assign current point to NONE
        assignmentChoices[currentPointIdx] = CoordSystem.NONE_ASSIGNED;
        recursiveAssignmentSolver(currentPointIdx + 1, selectedCount, systemContext);

        // Option 2: Assign current point to X_COORD
        assignmentChoices[currentPointIdx] = CoordSystem.X_COORD;
        // Increment selectedCount as this point is now assigned to an axis
        recursiveAssignmentSolver(currentPointIdx + 1, selectedCount + 1, systemContext);

        // Option 3: Assign current point to Y_COORD
        assignmentChoices[currentPointIdx] = CoordSystem.Y_COORD;
        // Increment selectedCount as this point is now assigned to an axis
        recursiveAssignmentSolver(currentPointIdx + 1, selectedCount + 1, systemContext);
    }

    /**
     * Orchestrates the solution process to find minimum costs for all possible k assignments.
     * @param {object} params - Input parameters.
     * @param {number} params.totalCount - Total number of points.
     * @param {Array<object>} params.coordinatesData - Array of point objects.
     * @returns {Array<number>} An array where resultCosts[k] is the minimum cost for k assigned points.
     */
    function findMinimumCosts({ totalCount, coordinatesData }) {
        // Validate input totalCount
        if (totalCount < 0) {
            console.error("Error: totalCount cannot be negative.");
            return [];
        }

        // Initialize an array to store the minimum costs for k points (from 0 to totalCount)
        // Fill with a very large number to ensure Math.min works correctly
        const resultCosts = [];
        for (let kIndex = 0; kIndex <= totalCount; kIndex++) {
            resultCosts.push(Number.MAX_SAFE_INTEGER);
        }

        // Array to store the current assignment choices during recursion
        const currentAssignments = new Array(totalCount);

        // Create sorted copies of the coordinates data
        // Sort by X coordinate
        const xSortedCoords = Array.from(coordinatesData);
        xSortedCoords.sort((pointA, pointB) => pointA.x - pointB.x);

        // Sort by Y coordinate
        const ySortedCoords = Array.from(coordinatesData);
        ySortedCoords.sort((pointA, pointB) => pointA.y - pointB.y);

        // Prepare the shared context object for the recursive solver
        const executionEnvironment = {
            numPoints: totalCount,
            allPoints: coordinatesData,
            resultCosts: resultCosts,
            assignmentChoices: currentAssignments,
            sortedByX: xSortedCoords,
            sortedByY: ySortedCoords,
        };

        // Start the recursive process from the first point (index 0) with 0 assigned points
        recursiveAssignmentSolver(0, 0, executionEnvironment);

        return resultCosts;
    }

    /**
     * Main program entry function. Reads input, processes it, and prints the results.
     * @param {string} inputString - The entire input read from stdin.
     */
    function programEntry(inputString) {
        // Create an integer token getter from the input string
        const getIntegerToken = inputOutputUtilities.getNextIntegerToken(inputString);

        // Read the total number of points, N
        const pointCount = getIntegerToken();
        if (pointCount < 0) {
            console.error("Invalid point count received.");
            return;
        }

        // Array to store all point data
        const pointArray = [];
        // Loop to read N points
        for (let currentPointIdx = 0; currentPointIdx < pointCount; currentPointIdx++) {
            const coordX = getIntegerToken();
            const coordY = getIntegerToken();
            const powerVal = getIntegerToken();
            // Add point data along with its original index
            pointArray.push({ x: coordX, y: coordY, p: powerVal, i: currentPointIdx });
        }

        // Solve the problem and get the array of minimum costs
        const finalCosts = findMinimumCosts({ totalCount: pointCount, coordinatesData: pointArray });

        // Print each cost on a new line
        let outputBuffer = "";
        for (let i = 0; i < finalCosts.length; i++) {
            outputBuffer += finalCosts[i];
            if (i < finalCosts.length - 1) {
                outputBuffer += '\n';
            }
        }
        console.log(outputBuffer);
    }
    exportedMembers.runProgram = programEntry; // Expose main function

    // Check if this module is the entry point (main module)
    if (bundleLoader.cachedComponentsRef[bundleLoader.entryComponentId] === currentModuleRef) {
        // Read input from standard input
        const inputContent = fileSystemAccess.default.readFileSync("/dev/stdin", "utf8");
        // Execute the main program entry
        programEntry(inputContent);
    }

}),

// Input/Output utility component
"./src/contest/common/io.ts":
(function(exportedUtilities) {

    Object.defineProperty(exportedUtilities, "__esModule", { value: true });
    // Define exports for various token getters
    exportedUtilities.getNextBigIntegerToken = exportedUtilities.getNextIntegerToken = exportedUtilities.getNextStringToken = exportedUtilities.createParsedTokenIterator = exportedUtilities.createTokenIterator = void 0;

    /**
     * Creates an iterator that yields string tokens from an input line.
     * Tokens are separated by one or more whitespace characters.
     * @param {string} inputLine - The string line to tokenize.
     * @returns {Generator<string>} A generator that yields string tokens.
     */
    function* createTokenIterator(inputLine) {
        if (!inputLine || inputLine.trim().length === 0) {
            console.warn("Attempted to tokenize an empty or whitespace-only line.");
            return;
        }
        const lineTokens = inputLine.split(/\s+/);
        let tokenIndex = 0;
        while (tokenIndex < lineTokens.length) {
            const currentToken = lineTokens[tokenIndex];
            if (currentToken !== '') { // Skip empty strings that might result from split
                yield currentToken;
            }
            tokenIndex++;
        }
    }
    exportedUtilities.createTokenIterator = createTokenIterator;

    /**
     * Creates an iterator that yields parsed tokens from an input line.
     * @param {string} inputLine - The string line to tokenize.
     * @param {(token: string) => any} parsingFunction - A function to parse each token.
     * @returns {Generator<any>} A generator that yields parsed tokens.
     */
    function* createParsedTokenIterator(inputLine, parsingFunction) {
        if (typeof parsingFunction !== 'function') {
            console.error("Invalid parsing function provided.");
            return;
        }
        const lineTokens = inputLine.split(/\s+/);
        for (const rawToken of lineTokens) {
            if (rawToken !== '') {
                yield parsingFunction(rawToken);
            }
        }
    }
    exportedUtilities.createParsedTokenIterator = createParsedTokenIterator;

    /**
     * Returns a function that, when called, provides the next string token.
     * @param {string} inputLine - The line to read tokens from.
     * @returns {() => string} A function to get the next string.
     */
    function getNextStringToken(inputLine) {
        const tokenStream = createTokenIterator(inputLine);
        return () => {
            const nextItem = tokenStream.next();
            if (nextItem.done) {
                // Optionally handle end of stream, e.g., throw an error or return a default
                return undefined;
            }
            return nextItem.value;
        };
    }
    exportedUtilities.getNextStringToken = getNextStringToken;

    /**
     * Returns a function that, when called, provides the next integer token.
     * @param {string} inputLine - The line to read tokens from.
     * @returns {() => number} A function to get the next integer.
     */
    function getNextIntegerToken(inputLine) {
        const tokenStream = createTokenIterator(inputLine);
        return () => {
            const nextItem = tokenStream.next();
            if (nextItem.done) {
                return NaN; // Indicate failure to parse
            }
            const parsedValue = parseInt(nextItem.value, 10);
            if (isNaN(parsedValue)) {
                console.warn(`Could not parse "${nextItem.value}" as an integer.`);
            }
            return parsedValue;
        };
    }
    exportedUtilities.getNextIntegerToken = getNextIntegerToken;

    /**
     * Returns a function that, when called, provides the next BigInt token.
     * @param {string} inputLine - The line to read tokens from.
     * @returns {() => BigInt} A function to get the next BigInt.
     */
    function getNextBigIntegerToken(inputLine) {
        const tokenStream = createTokenIterator(inputLine);
        return () => {
            const nextItem = tokenStream.next();
            if (nextItem.done) {
                // BigInt constructor throws on invalid input, so handle it
                return BigInt(0); // Or throw an error
            }
            try {
                return BigInt(nextItem.value);
            } catch (e) {
                console.error(`Failed to parse "${nextItem.value}" as BigInt:`, e);
                return BigInt(0); // Return a default or handle error
            }
        };
    }
    exportedUtilities.getNextBigIntegerToken = getNextBigIntegerToken;


}),

// External 'fs' module reference
"fs":
(function(module, exports) {

module.exports = require("fs");

})

});
// # sourceMappingURL=submit.js.map - Original source map comment removed for Type III clone.