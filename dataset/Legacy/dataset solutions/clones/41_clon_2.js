(function utilKit(undefVal) {
	'use strict';
	// Define prototypes for common built-in objects
	var arrPrototype = Array.prototype,
		objPrototype = Object.prototype,
		funcPrototype = Function.prototype;

	// Cache native methods for performance and consistency
	var arrPush = arrPrototype.push,
		arrSlice = arrPrototype.slice,
		arrConcat = arrPrototype.concat,
		objToString = objPrototype.toString,
		objHasOwnProp = objPrototype.hasOwnProperty;

	var nativeArrEach = arrPrototype.forEach,
		nativeArrMap = arrPrototype.map,
		nativeArrReduce = arrPrototype.reduce,
		nativeArrReduceRight = arrPrototype.reduceRight,
		nativeArrFilter = arrPrototype.filter,
		nativeArrEvery = arrPrototype.every,
		nativeArrSome = arrPrototype.some,
		nativeArrIndexOf = arrPrototype.indexOf,
		nativeArrLastIndexOf = arrPrototype.lastIndexOf,
		nativeArrIsArray = Array.isArray,
		nativeObjKeys = Object.keys,
		nativeFuncBind = funcPrototype.bind;

	// Initialize a global utility object
	this._u = {};
	var loopBreaker; // This variable is used for early exit in iterators, if a specific value is returned.

	// The core iteration function, aliased for convenience
	var iterateElements = _u.iterateElements = _u.forEveryElement = function(collection, callbackFn, thisArg) {
		if (collection == null) {
			return; // Exit if collection is null or undefined
		}

		// Use native forEach if available and applicable
		if (nativeArrEach && collection.forEach === nativeArrEach) {
			collection.forEach(callbackFn, thisArg);
		} else if (collection.length === +collection.length) { // Check if it's array-like
			for (var idx = 0, len = collection.length; idx < len; idx++) {
				if (callbackFn.call(thisArg, collection[idx], idx, collection) === loopBreaker) {
					return; // Break early if callback returns the breaker value
				}
			}
		} else { // Iterate over object properties
			for (var propName in collection) {
				if (_u.has(collection, propName)) { // Ensure it's an own property
					if (callbackFn.call(thisArg, collection[propName], propName, collection) === loopBreaker) {
						return; // Break early
					}
				}
			}
		}
	};

	// Helper function to check if an object has an own property
	_u.has = function(obj, key) {
		return objHasOwnProp.call(obj, key);
	};

	// Function to extend an object with properties from other objects
	_u.assignProps = function(targetObj) {
		iterateElements(arrSlice.call(arguments, 1), function(srcObj) {
			if (srcObj) {
				for (var propertyKey in srcObj) {
					targetObj[propertyKey] = srcObj[propertyKey];
				}
			}
		});
		return targetObj;
	};
}).call(global); // Attach to the global object

// Utility functions module
(function helperFuncs(undefVal) {
	'use strict';
	// Function to format a floating-point number to a string with specified precision
	this.formatFloat = function formatFloat(valueToFormat, radixBase, paddingCount, precisionDigits) {
		var powerOfTen = Math.pow(10, precisionDigits);
		var intString = "" + Math.round(valueToFormat * powerOfTen);

		if (intString === '0') {
			return '0.000'; // Special case for zero
		}

		var intLen = intString.length - precisionDigits;
		if (intLen === 0) {
			return "0." + intString.substr(intLen, precisionDigits);
		}
		return intString.substr(0, intLen) + "." + intString.substr(intLen, precisionDigits);
	};
}).call(global); // Attach to the global object

// Mathematical operations module
(function calcModule(nsName, undefVal) {
	// Define a local object for mathematical utilities
	var mathOps = {
		// Calculates the greatest common divisor using Euclidean algorithm
		greatestCommonDivisor: function greatestCommonDivisor(numA, numB) {
			return !numB ? numA : greatestCommonDivisor(numB, numA % numB);
		},
		// Calculates the least common multiple
		leastCommonMultiple: function leastCommonMultiple(numA, numB) {
			return numA / mathOps.greatestCommonDivisor(numA, numB) * numB;
		},
		// Squares a given number
		squareVal: function squareVal(inputVal) {
			return inputVal * inputVal;
		}
	};
	// Extend the global Math object with these new functions
	_u.assignProps(this.Math, mathOps);
}).call(global, 'Math'); // Pass 'Math' as namespace name, though not used in this specific implementation

// Main application logic
(function(undefVal) {
	'use strict';

	// Configuration for input type
	var DATA_INPUT_KIND = 'float';

	// The main solver object containing the problem-solving logic
	var ProblemSolver = {
		// Initiates the solving process asynchronously
		initiateSolution: function() {
			// Schedule the solve method to run after a short delay
			setTimeout(ProblemSolver.processSolution, 0, this);
		},
		// Core logic to solve the geometric problem
		processSolution: function processSolution(execContext) {
			var numCases = retrieveInteger(); // Get the number of test cases

			// Inner function to solve a single case
			function solveCase() {
				var coordNames = ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'];
				// Read coordinates for three points from input
				coordNames.forEach(function(coordName) {
					this[coordName] = retrieveFloat();
				}, execContext); // Use execContext for 'this' binding

				// Extract coordinates for clarity
				var coordX1 = execContext.x1;
				var coordY1 = execContext.y1;
				var coordX2 = execContext.x2;
				var coordY2 = execContext.y2;
				var coordX3 = execContext.x3;
				var coordY3 = execContext.y3;

				// Calculate coefficients for the system of equations
				var coeffA = coordX1 - coordX2;
				var coeffB = coordY1 - coordY2;
				var coeffC = -1 * (Math.squareVal(coordX1) - Math.squareVal(coordX2) + Math.squareVal(coordY1) - Math.squareVal(coordY2));
				var coeffD = coordX1 - coordX3;
				var coeffE = coordY1 - coordY3;
				var coeffF = -1 * (Math.squareVal(coordX1) - Math.squareVal(coordX3) + Math.squareVal(coordY1) - Math.squareVal(coordY3));

				// Solve for parameters L and M (related to the center of the circle)
				var paramL = (coeffC * coeffE - coeffB * coeffF) / (coeffE * coeffA - coeffB * coeffD);
				var paramM = (coeffD * coeffC - coeffA * coeffF) / (coeffD * coeffB - coeffE * coeffA);

				// Calculate a temporary value (unused in output, but part of original logic)
				var tempX = -1 * (Math.squareVal(coordX1) + Math.squareVal(coordY1) + paramL * coordX1 + paramM * coordY1);

				// Output the center coordinates and radius of the circumcircle
				displayResult(
					formatFloat(paramL / -2.0, 10, 3, 3), // X-coordinate of center
					formatFloat(paramM / -2.0, 10, 3, 3), // Y-coordinate of center
					formatFloat(Math.sqrt(Math.squareVal(paramL) + Math.squareVal(paramM) + 4 * numCases) / 2.0, 10, 3, 3) // Radius (note: original used 'n' here, which is numCases)
				);
			}

			// Process each test case
			while (numCases--) {
				solveCase();
			}

			// If there are no more inputs, schedule another solve attempt (for continuous input streams)
			if (!hasMoreInputs()) {
				setTimeout(ProblemSolver.processSolution, 0, execContext);
			}
		}
	};

	// Initialization function for setting up global utilities and input handling
	(function initializeApp() {
		// Extend the global object with input/output utilities
		_u.assignProps(this, {
			// Function to display results to the console
			displayResult: function() {
				console.log.apply(console, arguments);
			},
			// Standard input stream
			inputSource: process.openStdin(),
			// Array to store pending input values
			pendingInputs: [],
			// Retrieves an integer from the input list
			retrieveInteger: function() {
				return parseInt(pendingInputs.splice(0, 1)[0]);
			},
			// Retrieves a float from the input list
			retrieveFloat: function() {
				return parseFloat(pendingInputs.splice(0, 1)[0]);
			},
			// Retrieves a text string from the input list
			retrieveText: function() {
				return pendingInputs.splice(0, 1)[0];
			},
			// Checks if there are more inputs available
			hasMoreInputs: function() {
				return !pendingInputs.length;
			}
		});

		// Define regular expressions for different input types
		var INPUT_PATTERN_MAP = {};
		INPUT_PATTERN_MAP['string'] = /\w*/g;
		INPUT_PATTERN_MAP['number'] = /[-]?\d+/g;
		INPUT_PATTERN_MAP['float'] = /[-]?\d+(\.\d+)?/g;
		var CURRENT_INPUT_PATTERN = INPUT_PATTERN_MAP[DATA_INPUT_KIND];

		var currentContext = this; // Capture 'this' for event handlers
		inputSource.setEncoding('utf8'); // Set encoding for stdin

		// Event listener for incoming data chunks
		inputSource.on('data', function(dataChunk) {
			var parsedResults = dataChunk.match(CURRENT_INPUT_PATTERN);
			// Filter out empty matches and concatenate to pendingInputs
			pendingInputs = pendingInputs.concat(parsedResults.filter(function(inputLine) {
				return inputLine.length;
			}));
		});

		// Event listener for the end of the input stream
		inputSource.on('end', function() {
			ProblemSolver.initiateSolution.call(currentContext); // Start the solver
		});
	}).call(this); // Call init function with the global context

}).call(global); // Attach to the global object
