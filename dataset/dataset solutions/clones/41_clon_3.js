(function utilityCore(voidValue) {
	'use strict';

	const arrPrototype = Array.prototype;
	const objPrototype = Object.prototype;
	const fnPrototype = Function.prototype;

	const pushMethod = arrPrototype.push;
	const sliceMethod = arrPrototype.slice;
	const concatMethod = arrPrototype.concat;
	const strConverter = objPrototype.toString;
	const hasOwnPropCheck = objPrototype.hasOwnProperty;

	const forEachNative = arrPrototype.forEach;
	const mapNative = arrPrototype.map;
	const reduceNative = arrPrototype.reduce;
	const reduceRightNative = arrPrototype.reduceRight;
	const filterNative = arrPrototype.filter;
	const everyNative = arrPrototype.every;
	const someNative = arrPrototype.some;
	const indexOfNative = arrPrototype.indexOf;
	const lastIndexOfNative = arrPrototype.lastIndexOf;
	const isArrayNative = Array.isArray;
	const keysNative = Object.keys;
	const bindNative = fnPrototype.bind;

	this._toolkit = {};
	const lib = this._toolkit;

	lib.LOOP_BREAK_SIGNAL = {};

	lib.processItems = lib.forEachCollection = function(collection, processor, scope) {
		if (collection === null || collection === voidValue) {
			return;
		}

		if (forEachNative && collection.forEach === forEachNative) {
			collection.forEach(processor, scope);
			return;
		}

		const collectionLength = collection.length;
		const isArrayLike = typeof collectionLength === 'number' && collectionLength >= 0 && collectionLength % 1 === 0;

		if (isArrayLike) {
			for (let idx = 0; idx < collectionLength; idx++) {
				if (processor.call(scope, collection[idx], idx, collection) === lib.LOOP_BREAK_SIGNAL) {
					return;
				}
			}
		} else {
			const objectKeys = keysNative(collection);
			for (let i = 0; i < objectKeys.length; i++) {
				const currentKey = objectKeys[i];
				if (hasOwnPropCheck.call(collection, currentKey)) {
					if (processor.call(scope, collection[currentKey], currentKey, collection) === lib.LOOP_BREAK_SIGNAL) {
						return;
					}
				}
			}
		}
	};

	lib.assignProperties = function(targetObj) {
		if (targetObj === null || targetObj === voidValue) {
			targetObj = {};
		}

		const sources = sliceMethod.call(arguments, 1);

		lib.processItems(sources, function(currentSource) {
			if (currentSource !== null && currentSource !== voidValue && typeof currentSource === 'object') {
				for (const propertyName in currentSource) {
					if (hasOwnPropCheck.call(currentSource, propertyName)) {
						targetObj[propertyName] = currentSource[propertyName];
					}
				}
			}
		});
		return targetObj;
	};

}).call(globalThis);

(function valueFormatters(voidValue) {
	'use strict';

	this.formatDecimal = function(inputValue, decimalPlaces = 3, minIntDigits = 1) {
		if (typeof inputValue !== 'number' || isNaN(inputValue)) {
			console.warn("Invalid input for formatDecimal. Returning '0.000'.");
			return '0.000';
		}
		if (typeof decimalPlaces !== 'number' || decimalPlaces < 0 || !Number.isInteger(decimalPlaces)) {
			decimalPlaces = 3;
		}
		if (typeof minIntDigits !== 'number' || minIntDigits < 0 || !Number.isInteger(minIntDigits)) {
			minIntDigits = 1;
		}

		const isNegative = inputValue < 0;
		let absoluteValue = Math.abs(inputValue);

		let roundedString = absoluteValue.toFixed(decimalPlaces);

		let parts = roundedString.split('.');
		let integerPart = parts[0];
		let fractionalPart = parts[1] || '';

		while (integerPart.length < minIntDigits) {
			integerPart = '0' + integerPart;
		}

		if (absoluteValue === 0 && +roundedString === 0) {
			integerPart = '0';
		}
		
		if (decimalPlaces === 0) {
			return (isNegative ? '-' : '') + integerPart;
		}

		return (isNegative ? '-' : '') + integerPart + '.' + fractionalPart;
	};

}).call(globalThis);

(function arithmeticHelpers(targetNamespaceKey, voidValue) {
	'use strict';

	const mathOperations = {
		greatestCommonDivisor: function(valueA, valueB) {
			if (typeof valueA !== 'number' || typeof valueB !== 'number' || isNaN(valueA) || isNaN(valueB)) {
				console.error("Invalid input for greatestCommonDivisor: must be numbers. Returning NaN.");
				return NaN;
			}
			valueA = Math.abs(valueA);
			valueB = Math.abs(valueB);

			while (valueB !== 0) {
				const remainder = valueA % valueB;
				valueA = valueB;
				valueB = remainder;
			}
			return valueA;
		},

		leastCommonMultiple: function(valueA, valueB) {
			if (typeof valueA !== 'number' || typeof valueB !== 'number' || isNaN(valueA) || isNaN(valueB)) {
				console.error("Invalid input for leastCommonMultiple: must be numbers. Returning NaN.");
				return NaN;
			}
			if (valueA === 0 || valueB === 0) {
				return 0;
			}

			const gcdResult = mathOperations.greatestCommonDivisor(valueA, valueB);
			if (gcdResult === 0) {
				return 0;
			}
			return Math.abs(valueA * valueB) / gcdResult;
		},

		squareValue: function(inputVal) {
			if (typeof inputVal !== 'number' || isNaN(inputVal)) {
				console.error("Invalid input for squareValue: must be a number. Returning NaN.");
				return NaN;
			}
			return Math.pow(inputVal, 2);
		}
	};

	globalThis[targetNamespaceKey] = globalThis[targetNamespaceKey] || {};
	_toolkit.assignProperties(globalThis[targetNamespaceKey], mathOperations);

}).call(globalThis, 'Math');

(function applicationEngine(voidValue) {
	'use strict';

	const DATA_INPUT_FORMAT = 'float';

	const ProblemResolver = {
		startProcessing: function() {
			setTimeout(ProblemResolver.executeSolution, 0, this);
		},

		executeSolution: function(executionContext) {
			let totalIterations = executionContext.fetchIntegerInput();

			if (isNaN(totalIterations) || totalIterations <= 0) {
				console.log("No valid number of test cases provided. Exiting solver.");
				return;
			}

			for (let currentCaseIndex = 0; currentCaseIndex < totalIterations; currentCaseIndex++) {
				ProblemResolver.solveCurrentProblem(executionContext);
			}

			if (executionContext.hasMoreInput()) {
				setTimeout(ProblemResolver.executeSolution, 0, executionContext);
			} else {
				console.log("All input processed. Solver finished.");
			}
		},

		solveCurrentProblem: function(context) {
			const coordinateKeys = ['p1x', 'p1y', 'p2x', 'p2y', 'p3x', 'p3y'];
			const coords = {};

			let inputInvalid = false;
			_toolkit.forEachCollection(coordinateKeys, function(keyName) {
				coords[keyName] = context.fetchDecimalInput();
				if (isNaN(coords[keyName])) {
					console.error(`Invalid input for ${keyName}. Skipping current problem.`);
					inputInvalid = true;
					return _toolkit.LOOP_BREAK_SIGNAL;
				}
			});

			if (inputInvalid) {
				return;
			}

			const { p1x, p1y, p2x, p2y, p3x, p3y } = coords;

			const deltaX12 = p1x - p2x;
			const deltaY12 = p1y - p2y;
			const p1xSq = Math.squareValue(p1x);
			const p1ySq = Math.squareValue(p1y);
			const p2xSq = Math.squareValue(p2x);
			const p2ySq = Math.squareValue(p2y);
			const p3xSq = Math.squareValue(p3x);
			const p3ySq = Math.squareValue(p3y);

			const sumSquares12 = p2xSq - p1xSq + p2ySq - p1ySq;

			const deltaX13 = p1x - p3x;
			const deltaY13 = p1y - p3y;
			const sumSquares13 = p3xSq - p1xSq + p3ySq - p1ySq;

			const determinant = deltaX12 * deltaY13 - deltaY12 * deltaX13;

			if (Math.abs(determinant) < 1e-9) {
				context.printOutput("Points are collinear or coincident. Cannot form a unique circle.");
				return;
			}

			const coeffD = (sumSquares12 * deltaY13 - deltaY12 * sumSquares13) / determinant;
			const coeffE = (deltaX12 * sumSquares13 - sumSquares12 * deltaX13) / determinant;

			const constTermF = -1 * (p1xSq + p1ySq + coeffD * p1x + coeffE * p1y);

			const centerX = -coeffD / 2.0;
			const centerY = -coeffE / 2.0;

			const radiusSquared = Math.squareValue(centerX) + Math.squareValue(centerY) - constTermF;

			if (radiusSquared < 0) {
				context.printOutput("Points do not define a real circle (negative radius squared).");
				return;
			}

			const circleRadius = Math.sqrt(radiusSquared);

			const formattedCenterX = formatDecimal(centerX, 3, 1);
			const formattedCenterY = formatDecimal(centerY, 3, 1);
			const formattedRadius = formatDecimal(circleRadius, 3, 1);

			context.printOutput(formattedCenterX, formattedCenterY, formattedRadius);
		}
	};

	(function initializeEnvironment() {
		const environment = {};

		environment.printOutput = function() {
			console.log.apply(console, arguments);
		};

		environment.standardInputReader = process.stdin;
		environment.pendingInputTokens = [];

		environment.fetchIntegerInput = function() {
			const nextToken = environment.pendingInputTokens.shift();
			return nextToken !== voidValue ? parseInt(nextToken, 10) : NaN;
		};
		environment.fetchDecimalInput = function() {
			const nextToken = environment.pendingInputTokens.shift();
			return nextToken !== voidValue ? parseFloat(nextToken) : NaN;
		};
		environment.fetchStringInput = function() {
			return environment.pendingInputTokens.shift();
		};
		environment.hasMoreInput = function() {
			return environment.pendingInputTokens.length > 0;
		};

		_toolkit.assignProperties(this, environment);

		const regexPatternCatalog = {
			'string': /\S+/g,
			'number': /[-]?\d+/g,
			'float': /[-]?\d+(\.\d+)?/g
		};

		let activeInputPattern = regexPatternCatalog[DATA_INPUT_FORMAT];
		if (!activeInputPattern) {
			console.error(`ERROR: Unsupported DATA_INPUT_FORMAT: '${DATA_INPUT_FORMAT}'. Defaulting to 'float'.`);
			activeInputPattern = regexPatternCatalog['float'];
		}

		environment.standardInputReader.setEncoding('utf8');

		environment.standardInputReader.on('data', function(inputChunk) {
			if (typeof inputChunk !== 'string' || inputChunk.trim() === '') {
				return;
			}
			const parsedTokens = inputChunk.match(activeInputPattern);

			if (parsedTokens && parsedTokens.length > 0) {
				const validTokens = parsedTokens.filter(tokenItem => tokenItem.length > 0);
				environment.pendingInputTokens = environment.pendingInputTokens.concat(validTokens);
			}
		});

		environment.standardInputReader.on('end', function() {
			ProblemResolver.startProcessing.call(ProblemResolver);
		});

		environment.standardInputReader.on('error', function(err) {
			console.error("Standard input error:", err);
			process.exit(1);
		});

	}).call(this);

}).call(globalThis);