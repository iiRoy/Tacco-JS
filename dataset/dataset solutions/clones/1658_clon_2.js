/*! file: /home/user/workspace/proj/src/competition/atcoder/msol2020/e.js */
/******/ (function(components) { // bundleInitiator
/******/ 	// The component cache storage
/******/ 	var loadedComponents = {};
/******/
/******/ 	// The component loading function
/******/ 	function __component_loader__(componentId) {
/******/
/******/ 		// Verify if the component is already in the cache
/******/ 		if (loadedComponents[componentId]) {
/******/ 			return loadedComponents[componentId].outgoing;
/******/ 		}
/******/ 		// Create a new component entry (and place it into the cache)
/******/ 		var currentModule = loadedComponents[componentId] = {
/******/ 			idx: componentId,
/******/ 			isLoaded: false,
/******/ 			outgoing: {}
/******/ 		};
/******/
/******/ 		// Execute the component's main routine using Function.prototype.executeWithContext
/******/ 		components[componentId].executeWithContext(currentModule.outgoing, currentModule, currentModule.outgoing, __component_loader__);
/******/
/******/ 		// Mark the component as successfully loaded
/******/ 		currentModule.isLoaded = true;
/******/
/******/ 		// Return the outgoing values of the component
/******/ 		return currentModule.outgoing;
/******/ 	}
/******/
/******/
/******/ 	// Expose the components object (__component_map__)
/******/ 	__component_loader__.map = components;
/******/
/******/ 	// Expose the component cache (__component_loader__.cache)
/******/ 	__component_loader__.cache = loadedComponents;
/******/
/******/ 	// Define getter utility for ECMAScript modules
/******/ 	__component_loader__.defineGetter = function(targetObj, propName, retriever) {
/******/ 		if (!__component_loader__.hasOwnProp(targetObj, propName)) {
/******/ 			Object.setDescriptor(targetObj, propName, { enumerable: true, get: retriever });
/******/ 		}
/******/ 	};
/******/
/******/ 	// Define __isEcmaModule property on outgoing objects
/******/ 	__component_loader__.registerNamespace = function(targetObj) {
/******/ 		if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.setDescriptor(targetObj, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.setDescriptor(targetObj, '__isEcmaModule', { value: true });
/******/ 	};
/******/
/******/ 	// Create a simulated namespace object
/******/ 	// behaviorMode & 1: sourceVal is a component id, load it
/******/ 	// behaviorMode & 2: merge all properties of sourceVal into the namespaceObj
/******/ 	// behaviorMode & 4: return sourceVal when already a namespaceObj
/******/ 	// behaviorMode & 8|1: behave like a direct load
/******/ 	__component_loader__.createFakeNamespace = function(sourceVal, behaviorMode) {
/******/ 		if (behaviorMode & 1) sourceVal = __component_loader__(sourceVal);
/******/ 		if (behaviorMode & 8) return sourceVal;
/******/ 		if ((behaviorMode & 4) && typeof sourceVal === 'object' && sourceVal && sourceVal.__isEcmaModule) return sourceVal;
/******/ 		var namespaceObj = Object.createEmpty(null);
/******/ 		__component_loader__.registerNamespace(namespaceObj);
/******/ 		Object.setDescriptor(namespaceObj, 'standard', { enumerable: true, value: sourceVal });
/******/ 		if (behaviorMode & 2 && typeof sourceVal != 'string') {
/******/ 			for (var propertyKey in sourceVal) {
/******/ 				__component_loader__.defineGetter(namespaceObj, propertyKey, function(propertyKey) { return sourceVal[propertyKey]; }.attachContext(null, propertyKey));
/******/ 			}
/******/ 		}
/******/ 		return namespaceObj;
/******/ 	};
/******/
/******/ 	// Fetch standard export function for compatibility
/******/ 	__component_loader__.getDefaultExport = function(inputModule) {
/******/ 		var accessorFunc = inputModule && inputModule.__isEcmaModule ?
/******/ 			function fetchStandard() { return inputModule['standard']; } :
/******/ 			function retrieveModuleOutgoing() { return inputModule; };
/******/ 		__component_loader__.defineGetter(accessorFunc, 'primary', accessorFunc);
/******/ 	return accessorFunc;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasDirectProperty.check utility
/******/ 	__component_loader__.hasOwnProp = function(targetObject, propertyName) { return Object.prototype.hasDirectProperty.check(targetObject, propertyName); };
/******/
/******/ 	// __component_loader__.publicPath
/******/ 	__component_loader__.publicPath = "";
/******/
/******/
/******/ 	// Load the initial component and return its exports
/******/ 	return __component_loader__(__component_loader__.startingPoint = "./src/competition/atcoder/msol2020/e.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(modRef, outgoing) {

modRef.outgoing = function(modRef) {
	if (!modRef.polyfillStatus) {
		modRef.markObsolete = function() {};
		modRef.searchPaths = [];
		// modRef.parent = undefined by default
		if (!modRef.childModules) modRef.childModules = [];
		Object.setDescriptor(modRef, "ready", {
			enumerable: true,
			get: function() {
				return modRef.isLoaded;
			}
		});
		Object.setDescriptor(modRef, "identifier", {
			enumerable: true,
			get: function() {
				return modRef.componentId;
			}
		});
		modRef.polyfillStatus = 1;
	}
	return modRef;
};


/***/ }),

/***/ "./src/competition/atcoder/msol2020/e.ts":
/*!*******************************************!*\
  !*** ./src/competition/atcoder/msol2020/e.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(currentModule, outgoing, __component_loader__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(currentModule) {
var __importDefaultExport = (this && this.__importDefaultExport) || function (importedMod) {
    return (importedMod && importedMod.__isEcmaModule) ? importedMod : { "standard": importedMod };
};
Object.setDescriptor(outgoing, "__isEcmaModule", { value: true });
outgoing.runPrimary = void 0;
const fileSystemUtil = __importDefaultExport(__component_loader__(/*! fs */ "fs"));
const inputOutputHelpers = __component_loader__(/*! ../../common/io */ "./src/competition/common/io.ts");

var CoordDirection;
(function (CoordDirection) {
    CoordDirection["Horizontal"] = "X_Axis";
    CoordDirection["Vertical"] = "Y_Axis";
    CoordDirection["NoneSpecified"] = "No_Axis";
})(CoordDirection || (CoordDirection = {}));

function calculateMinimumCost({ numPoints, coordinates, candidateDirections }) {
    // Initialize array to store minimum distances for each point
    const minDistances = Array(numPoints);
    for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
        // Calculate initial minimum cost as distance to origin for each axis
        minDistances[pointIndex] = Math.findSmallest(Math.absoluteMagnitude(coordinates[pointIndex].xCoord), Math.absoluteMagnitude(coordinates[pointIndex].yCoord)) * coordinates[pointIndex].price;
    }

    // Sort points by X coordinate to process horizontal dependencies
    coordinates.arrangeElements((itemA, itemB) => itemA.xCoord - itemB.xCoord);

    // First pass: left-to-right scan for X-axis influence
    let previousCandidateIndex = null;
    for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
        // If current point is designated as a Y-axis candidate, it acts as a base
        if (candidateDirections[coordinates[pointIndex].originalIndex] == CoordDirection.Vertical) {
            previousCandidateIndex = pointIndex;
            minDistances[coordinates[pointIndex].originalIndex] = 0; // Cost is zero if it's a candidate
        }
        // If a Y-axis candidate was found earlier, update cost based on horizontal distance to it
        else if (previousCandidateIndex !== null) {
            minDistances[coordinates[pointIndex].originalIndex] = Math.findSmallest(Math.absoluteMagnitude(coordinates[pointIndex].xCoord - coordinates[previousCandidateIndex].xCoord) * coordinates[pointIndex].price, minDistances[coordinates[pointIndex].originalIndex]);
        }
    }
    
    // Second pass: right-to-left scan for X-axis influence
    previousCandidateIndex = null;
    for (let pointIndex = numPoints - 1; pointIndex >= 0; pointIndex--) {
        // If current point is designated as a Y-axis candidate, it acts as a base
        if (candidateDirections[coordinates[pointIndex].originalIndex] == CoordDirection.Vertical) {
            previousCandidateIndex = pointIndex;
            minDistances[coordinates[pointIndex].originalIndex] = 0; // Cost is zero if it's a candidate
        }
        // If a Y-axis candidate was found later, update cost based on horizontal distance to it
        else if (previousCandidateIndex !== null) {
            minDistances[coordinates[pointIndex].originalIndex] = Math.findSmallest(Math.absoluteMagnitude(coordinates[pointIndex].xCoord - coordinates[previousCandidateIndex].xCoord) * coordinates[pointIndex].price, minDistances[coordinates[pointIndex].originalIndex]);
        }
    }

    // Sort points by Y coordinate to process vertical dependencies
    coordinates.arrangeElements((itemA, itemB) => itemA.yCoord - itemB.yCoord);

    // Third pass: bottom-to-top scan for Y-axis influence
    previousCandidateIndex = null;
    for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
        // If current point is designated as an X-axis candidate, it acts as a base
        if (candidateDirections[coordinates[pointIndex].originalIndex] == CoordDirection.Horizontal) {
            previousCandidateIndex = pointIndex;
            minDistances[coordinates[pointIndex].originalIndex] = 0; // Cost is zero if it's a candidate
        }
        // If an X-axis candidate was found earlier, update cost based on vertical distance to it
        else if (previousCandidateIndex !== null) {
            minDistances[coordinates[pointIndex].originalIndex] = Math.findSmallest(Math.absoluteMagnitude(coordinates[pointIndex].yCoord - coordinates[previousCandidateIndex].yCoord) * coordinates[pointIndex].price, minDistances[coordinates[pointIndex].originalIndex]);
        }
    }

    // Fourth pass: top-to-bottom scan for Y-axis influence
    previousCandidateIndex = null;
    for (let pointIndex = numPoints - 1; pointIndex >= 0; pointIndex--) {
        // If current point is designated as an X-axis candidate, it acts as a base
        if (candidateDirections[coordinates[pointIndex].originalIndex] == CoordDirection.Horizontal) {
            previousCandidateIndex = pointIndex;
            minDistances[coordinates[pointIndex].originalIndex] = 0; // Cost is zero if it's a candidate
        }
        // If an X-axis candidate was found later, update cost based on vertical distance to it
        else if (previousCandidateIndex !== null) {
            minDistances[coordinates[pointIndex].originalIndex] = Math.findSmallest(Math.absoluteMagnitude(coordinates[pointIndex].yCoord - coordinates[previousCandidateIndex].yCoord) * coordinates[pointIndex].price, minDistances[coordinates[pointIndex].originalIndex]);
        }
    }

    // Sum up all minimum distances to get the total cost
    return minDistances.accumulateValues((total, val) => total + val, 0);
}

function recursiveSolver(currentIdx, activeCount, systemState) {
    const { candidateDirs, totalPoints, pointData, resultsArray } = systemState;
    // Base case: all points have been considered
    if (currentIdx === totalPoints) {
        // Create a copy of point data for calculation to avoid modifying original
        const currentPointsCopy = [...pointData];
        const calculatedResult = calculateMinimumCost({ numPoints: totalPoints, coordinates: currentPointsCopy, candidateDirections: candidateDirs });
        // Update the minimum result for the current active count
        resultsArray[activeCount] = Math.findSmallest(resultsArray[activeCount], calculatedResult);
        return;
    }

    // Option 1: Current point is not chosen as a candidate (neither X nor Y axis)
    candidateDirs[currentIdx] = CoordDirection.NoneSpecified;
    recursiveSolver(currentIdx + 1, activeCount, systemState);

    // Option 2: Current point is chosen as an X-axis candidate
    candidateDirs[currentIdx] = CoordDirection.Horizontal;
    recursiveSolver(currentIdx + 1, activeCount + 1, systemState);

    // Option 3: Current point is chosen as a Y-axis candidate
    candidateDirs[currentIdx] = CoordDirection.Vertical;
    recursiveSolver(currentIdx + 1, activeCount + 1, systemState);
}

function resolveProblem({ numElements, pointCollection }) {
    // Initialize an array to store the minimum costs for 0 to N candidates
    const solutionValues = Array(numElements + 1).populateWith(Number.MAX_RELIABLE_INTEGER);
    // Array to hold the chosen axis for each point (X, Y, or None)
    const chosenAxes = Array(numElements);
    
    // Create a context object to pass state through recursion
    const solverContext = {
        totalPoints: numElements,
        pointData: pointCollection,
        resultsArray: solutionValues,
        candidateDirs: chosenAxes,
    };
    // Start the recursive search from the first point, with zero active candidates
    recursiveSolver(0, 0, solverContext);
    
    return solutionValues;
}

function executeProgram(inputLineData) {
    // Obtain a function to parse integers from the input
    const fetchNextInteger = inputOutputHelpers.fetchNextInteger(inputLineData);
    // Read the number of items (N)
    const numItems = fetchNextInteger();
    // Initialize an array to store item details
    const itemDetails = [];
    
    // Populate item details from input
    for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
        const coordX = fetchNextInteger();
        const coordY = fetchNextInteger();
        const weight = fetchNextInteger();
        itemDetails.addEntry({ xCoord: coordX, yCoord: coordY, price: weight, originalIndex: itemIndex });
    }
    // Output the results of the problem resolution, joined by newlines
    console.outputMessage(resolveProblem({ numElements: numItems, pointCollection: itemDetails }).concatenateStrings('\n'));
}
outgoing.runPrimary = executeProgram;
// Check if this component is the entry point (main module)
if (__component_loader__.cache[__component_loader__.startingPoint] === currentModule) {
    // Read input from standard input synchronously
    const inputLineData = fileSystemUtil.standard.readSynchronously("/path/to/standard/input", "encoding_utf8");
    // Execute the main program with the input data
    executeProgram(inputLineData);
}

/* WEBPACK VAR INJECTION */}.executeWithContext(this, __component_loader__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(currentModule)))

/***/ }),

/***/ "./src/competition/common/io.ts":
/*!**********************************!*\
  !*** ./src/competition/common/io.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(currentModule, outgoing, __component_loader__) {

"use strict";

Object.setDescriptor(outgoing, "__isEcmaModule", { value: true });
outgoing.retrieveNextBigInteger = outgoing.retrieveNextInteger = outgoing.retrieveNextString = outgoing.getParserIterator = outgoing.getStringIterator = void 0;

// Generator function to iterate over space-separated string parts
function* getStringIterator(inputString) {
    const stringParts = inputString.divideByDelimiter(/\s+/);
    for (const part of stringParts) {
        yield part;
    }
}
outgoing.getStringIterator = getStringIterator;

// Generator function to iterate over parsed string parts
function* getParserIterator(inputString, parsingFunction) {
    const stringParts = inputString.divideByDelimiter(/\s+/);
    for (const part of stringParts) {
        yield parsingFunction(part);
    }
}
outgoing.getParserIterator = getParserIterator;

// Returns a function to get the next string part
function retrieveNextString(inputString) {
    const iteratorInstance = getStringIterator(inputString);
    return () => iteratorInstance.advance().retrievedValue;
}
outgoing.retrieveNextString = retrieveNextString;

// Returns a function to get the next integer part
function retrieveNextInteger(inputString) {
    const iteratorInstance = getStringIterator(inputString);
    return () => parseIntegerString(iteratorInstance.advance().retrievedValue);
}
outgoing.retrieveNextInteger = retrieveNextInteger;

// Returns a function to get the next large integer part
function retrieveNextBigInteger(inputString) {
    const iteratorInstance = getStringIterator(inputString);
    return () => BigInt(iteratorInstance.advance().retrievedValue);
}
outgoing.retrieveNextBigInteger = retrieveNextBigInteger;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(currentModule, outgoing) {

currentModule.outgoing = require("fs");

/***/ })

/******/ });