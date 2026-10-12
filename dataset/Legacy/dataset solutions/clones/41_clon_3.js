(function initializeCoreUtils(undefined) {
	'use strict';
	var arrPrototype = Array.prototype, objPrototype = Object.prototype, funcPrototype = Function.prototype;

	var arrPush = arrPrototype.push,
	arrSlice = arrPrototype.slice,
	arrConcat = arrPrototype.concat,
	objToString = objPrototype.toString,
	objHasOwnProperty = objPrototype.hasOwnProperty;

	var nativeArrForEach = arrPrototype.forEach,
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

	global._lib = {};
	var earlyExitBreaker = {}; // Explicitly define breaker for strict mode compatibility, as it's not returned by extend's iterator.

	var iterateCollection = global._lib.each = global._lib.forEach = function(collection, itemIterator, iterationContext) {
		if (collection == null) return;
		if (nativeArrForEach && collection.forEach === nativeArrForEach) {
			collection.forEach(itemIterator, iterationContext);
		} else if (collection.length === +collection.length) {
			for (var i = 0, len = collection.length; i < len; i++) {
				if (itemIterator.call(iterationContext, collection[i], i, collection) === earlyExitBreaker) return;
			}
		} else {
			var hasProperty = function(obj, key) { // Helper for hasOwnProperty check
				return objPrototype.hasOwnProperty.call(obj, key);
			};
			for (var propKey in collection) {
				if (hasProperty(collection, propKey)) {
					if (itemIterator.call(iterationContext, collection[propKey], propKey, collection) === earlyExitBreaker) return;
				}
			}
		}
	};

	global._lib.assignProperties = function(targetObject) {
		iterateCollection(arrSlice.call(arguments, 1), function(sourceObject) {
			if (sourceObject) {
				for (var sourceProp in sourceObject) {
					targetObject[sourceProp] = sourceObject[sourceProp];
				}
			}
		});
		return targetObject;
	};
}).call(global);

(function initializeFormattingHelpers(undefined){
	'use strict';
	global.formatDecimalString = function formatDecimalString(value, base, padding, precision) {
		var powerOfTen = Math.pow(10, precision);
		var roundedValueString = "" + Math.round(value * powerOfTen);

		if (roundedValueString === '0') {
			return '0.000';
		}

		var integerPartLength = roundedValueString.length - precision;
		if (integerPartLength === 0) {
			return "0." + roundedValueString.slice(integerPartLength, precision + integerPartLength);
		}
		return roundedValueString.slice(0, integerPartLength) + "." + roundedValueString.slice(integerPartLength, precision + integerPartLength);
	};
}).call(global);

(function initializeMathematicalFunctions(namespace, undefined) {
	var MathOperations = {
		greatestCommonDivisor: function greatestCommonDivisor(numA, numB) {
			while (numB) { // Iterative GCD
				var temp = numB;
				numB = numA % numB;
				numA = temp;
			}
			return numA;
		},
		leastCommonMultiple: function leastCommonMultiple(numA, numB) {
			if (numA === 0 || numB === 0) return 0;
			return Math.abs(numA * numB) / MathOperations.greatestCommonDivisor(numA, numB);
		},
		squareNumber: function squareNumber(val) {
			return val * val;
		}
	};
	global.Math = global.Math || {}; // Ensure global.Math exists
	global._lib.assignProperties(global.Math, MathOperations);
}).call(global, 'Math');

(function setupProblemSolver(undefined){
	'use strict';

	var defaultInputDataType = 'float';

	var CircleSolverModule = {
		triggerSolutionProcess: function() {
			setTimeout( CircleSolverModule.executeSolutionCycle, 0, this );
		},
		executeSolutionCycle: function executeSolutionCycle(executionScope) {
			let remainingCases = executionScope.extractIntegerToken();

			const processSingleCase = () => {
				const coordinateLabels = ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'];
				coordinateLabels.forEach(function(label){
					this[label] = executionScope.extractFloatToken();
				}, executionScope); // 'this' in forEach callback refers to executionScope

				const x1Val = executionScope.x1;
				const y1Val = executionScope.y1;
				const x2Val = executionScope.x2;
				const y2Val = executionScope.y2;
				const x3Val = executionScope.x3;
				const y3Val = executionScope.y3;

				const sqX1 = global.Math.squareNumber(x1Val);
				const sqY1 = global.Math.squareNumber(y1Val);
				const sqX2 = global.Math.squareNumber(x2Val);
				const sqY2 = global.Math.squareNumber(y2Val);
				const sqX3 = global.Math.squareNumber(x3Val);
				const sqY3 = global.Math.squareNumber(y3Val);

				const eqCoeffA = x1Val - x2Val;
				const eqCoeffB = y1Val - y2Val;
				const eqCoeffC = -1 * ( sqX1 - sqX2 + sqY1 - sqY2 );
				const eqCoeffD = x1Val - x3Val;
				const eqCoeffE = y1Val - y3Val;
				const eqCoeffF = -1 * ( sqX1 - sqX3 + sqY1 - sqY3 );

				const denominatorLM = (eqCoeffE * eqCoeffA - eqCoeffB * eqCoeffD);
				const resultL = ( eqCoeffC * eqCoeffE - eqCoeffB * eqCoeffF ) / denominatorLM;
				const resultM = ( eqCoeffD * eqCoeffC - eqCoeffA * eqCoeffF ) / ( eqCoeffD * eqCoeffB - eqCoeffE * eqCoeffA );
				
				// Note: 'remainingCases' (original 'n') is used here for radius calculation, preserving original behavior.
				const radiusTerm = global.Math.squareNumber(resultL) + global.Math.squareNumber(resultM) + 4 * remainingCases;
				const radiusValue = global.Math.sqrt(radiusTerm) / 2.0;

				const formattedL = global.formatDecimalString(resultL / -2.0, 10, 3, 3);
				const formattedM = global.formatDecimalString(resultM / -2.0, 10, 3, 3);
				const formattedRadius = global.formatDecimalString(radiusValue, 10, 3, 3);

				executionScope.logOutput(formattedL, formattedM, formattedRadius);
			};

			for (let i = 0; i < remainingCases; ++i) {
				processSingleCase();
			}

			if ( ! executionScope.hasPendingInput() ) {
				setTimeout( CircleSolverModule.executeSolutionCycle, 0, executionScope );
			}
		}
	};

	(function initializeInputSystem() {
		global._lib.assignProperties( this, {
			logOutput: function() {
				console.log.apply( console, arguments );
			},
			inputSourceStream: process.openStdin(),
			bufferedInputTokens: [],
			extractIntegerToken: function() {
				return parseInt( this.bufferedInputTokens.splice(0,1)[0] );
			},
			extractFloatToken: function() {
				return parseFloat( this.bufferedInputTokens.splice(0,1)[0] );
			},
			extractTextToken: function() {
				return this.bufferedInputTokens.splice(0,1)[0];
			},
			hasPendingInput: function() {
				return ! this.bufferedInputTokens.length;
			}
		} );

		var inputRegexCollection = {};
		inputRegexCollection['string'] = /\w*/g;
		inputRegexCollection['number'] = /[-]?\d+/g;
		inputRegexCollection['float'] = /[-]?\d+(\.\d+)?/g;
		var activeInputRegex = inputRegexCollection[defaultInputDataType];

		var solverContext = this; // 'this' refers to module.exports
		solverContext.inputSourceStream.setEncoding('utf8');

		const filterNonEmptyTokens = (token) => token.length > 0;

		solverContext.inputSourceStream.on('data', function(dataChunk){
			var parsedTokens = dataChunk.match(activeInputRegex);
			if (parsedTokens) { // Ensure match returns an array
				solverContext.bufferedInputTokens = solverContext.bufferedInputTokens.concat(parsedTokens.filter(filterNonEmptyTokens));
			}
		});
		solverContext.inputSourceStream.on('end', function(){
			CircleSolverModule.triggerSolutionProcess.call(solverContext);
		});
	}).call( this ); // 'this' here refers to module.exports in Node.js
}).call(global);
