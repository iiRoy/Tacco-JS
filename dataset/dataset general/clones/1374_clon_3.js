/*
 *  Duration Formatting Module - Version 2.0.0
 *  https://github.com/jsmreese/moment-duration-format
 *  Release Date: 2023-11-20
 *
 *  Enhanced duration display utility for the Moment.js library.
 *  http://momentjs.com/
 *
 *  Copyright 2014-2023 John Madhavan-Reese
 *  Distributed under the MIT License
 */

(function (globalScope, void 0) {

	// Creates a string composed of '0' characters, repeated 'count' times.
	function generateZeroString(count) {
		var zeroAccumulator = "";

		// Ensure count is an integer and non-negative.
		count = parseInt(count, 10);
		if (isNaN(count) || count < 0) {
			return zeroAccumulator; // Return empty for invalid input
		}

		// Efficiently build the string.
		if (count > 0) {
			zeroAccumulator = new Array(count + 1).join("0");
		}

		return zeroAccumulator;
	}

	// Adds leading or trailing zeros to a string to reach a specified length.
	// `inputStr`: The string to pad.
	// `targetLen`: The desired final length.
	// `padRight`: If true, pads on the right; otherwise, pads on the left.
	function zeroPadString(inputStr, targetLen, padRight) {
		if (inputStr === null || inputStr === void 0) {
			inputStr = "";
		}
		var currentStr = String(inputStr); // Ensure it's a string

		var neededZeros = targetLen - currentStr.length;
		if (neededZeros <= 0) {
			return currentStr; // No padding needed or string is already longer
		}

		var zeroPad = generateZeroString(neededZeros);
		return padRight ? (currentStr + zeroPad) : (zeroPad + currentStr);
	}

	// Determines if a given value is an array.
	function checkIfArray(testValue) {
		return Object.prototype.toString.call(testValue) === "[object Array]";
	}

	// Determines if a given value is a plain object.
	function checkIfPlainObject(testValue) {
		return Object.prototype.toString.call(testValue) === "[object Object]";
	}

	// Finds the last element in an array that satisfies a testing function.
	function locateLastElement(collection, testFunction) {
		var currentIdx = collection.length;
		while (currentIdx--) { // Iterate backwards
			if (testFunction(collection[currentIdx])) {
				return collection[currentIdx];
			}
		}
		return void 0; // Return undefined if no element is found
	}

	// Finds the first element in an array that satisfies a testing function or matches a value.
	function locateElement(collection, testMatcher) {
		var currentIdx = 0,
			maxCount = collection.length,
			actualTestFunction;

		if (!collection || maxCount === 0) {
			return void 0; // No collection or empty
		}

		// If testMatcher is not a function, create a comparison function.
		if (typeof testMatcher !== "function") {
			var comparisonValue = testMatcher;
			actualTestFunction = function (item) {
				return item === comparisonValue;
			};
		} else {
			actualTestFunction = testMatcher;
		}

		while (currentIdx < maxCount) {
			if (actualTestFunction(collection[currentIdx])) {
				return collection[currentIdx];
			}
			currentIdx += 1;
		}
		return void 0; // Not found
	}

	// Iterates over each element in an array, executing a callback.
	// The iteration stops if the callback returns `false`.
	function iterateCollection(collection, operationCallback) {
		if (!collection || collection.length === 0) {
			return;
		}

		for (var i = 0; i < collection.length; i++) {
			if (operationCallback(collection[i], i) === false) {
				break; // Stop iteration
			}
		}
	}

	// Transforms each element in an array using a callback, returning a new array.
	function transformCollection(collection, transformationCallback) {
		var resultAccumulator = [];

		if (!collection || collection.length === 0) {
			return resultAccumulator;
		}

		for (var i = 0; i < collection.length; i++) {
			resultAccumulator[i] = transformationCallback(collection[i], i);
		}

		return resultAccumulator;
	}

	// Extracts a specific property from each object in a collection.
	function extractProperty(collection, propName) {
		return transformCollection(collection, function (item) {
			return item[propName];
		});
	}

	// Creates a new array with all falsy values removed.
	function filterFalsy(collection) {
		var truthyElements = [];
		iterateCollection(collection, function (item) {
			if (item) {
				truthyElements.push(item);
			}
		});
		return truthyElements;
	}

	// Returns a new array containing only the unique elements from the input array.
	function getUniqueElements(collection) {
		var distinctElements = [];
		iterateCollection(collection, function (item) {
			if (!locateElement(distinctElements, item)) {
				distinctElements.push(item);
			}
		});
		return distinctElements;
	}

	// Computes the intersection of two arrays (elements common to both).
	function findCommonElements(arrayA, arrayB) {
		var commonItems = [];
		iterateCollection(arrayA, function (itemA) {
			iterateCollection(arrayB, function (itemB) {
				if (itemA === itemB) {
					commonItems.push(itemA);
				}
			});
		});
		return getUniqueElements(commonItems); // Ensure uniqueness
	}

	// Returns a new array containing elements after the first element that satisfies the callback.
	function sliceFromFirstMatch(collection, matchCallback) {
		var remainingItems = [];
		iterateCollection(collection, function (item, index) {
			if (!matchCallback(item)) {
				remainingItems = collection.slice(index);
				return false; // Stop iteration
			}
		});
		return remainingItems;
	}

	// Returns a new array containing elements up to the last element that satisfies the callback.
	function sliceUpToLastMatch(collection, matchCallback) {
		// Reverse the collection, apply 'rest' logic, then reverse back.
		var reversedCollection = collection.slice().reverse();
		return sliceFromFirstMatch(reversedCollection, matchCallback).reverse();
	}

	// Merges properties from a source object into a target object.
	function mergeObjects(targetObj, sourceObj) {
		for (var propertyKey in sourceObj) {
			if (sourceObj.hasOwnProperty(propertyKey)) {
				targetObj[propertyKey] = sourceObj[propertyKey];
			}
		}
		return targetObj;
	}

	// Reference to the Moment.js library.
	var timeKeeperLib;

	// Attempt to load Moment.js via CommonJS (Node.js).
	if (typeof require === "function") {
		try {
			timeKeeperLib = require('moment'); // Use 'moment' as it's the typical package name
		} catch (e) {
			// Ignore if moment is not found via require
		}
	}

	// Fallback to global Moment.js object.
	if (!timeKeeperLib && globalScope.moment) {
		timeKeeperLib = globalScope.moment;
	}

	// Throw an error if Moment.js cannot be located.
	if (!timeKeeperLib) {
		throw new Error("Duration Formatting Module: Moment.js library not found. Please ensure it's loaded.");
	}

	// Extends Moment.js duration prototype with a custom formatting method.
	timeKeeperLib.duration.fn.renderDurationString = function () {

		var templateLexer, parsedSegments, segmentTypes, segmentTypeResolver, relevantTimeUnits,
			firstUnitRendered,
			inputArguments = [].slice.call(arguments), // Convert arguments object to array
			formatOptions = mergeObjects({}, this.renderDurationString.defaultSettings), // Clone default settings
			remainingDuration = timeKeeperLib.duration(this); // Create a mutable copy of the duration

		// Provide a reference to the original duration object within the settings.
		formatOptions.currentDuration = this;

		// Process input arguments to override default format options.
		iterateCollection(inputArguments, function (arg) {
			if (typeof arg === "string" || typeof arg === "function") {
				formatOptions.displayTemplate = arg; // Set display template
			} else if (typeof arg === "number") {
				formatOptions.decimalPrecision = arg; // Set decimal precision
			} else if (checkIfPlainObject(arg)) {
				mergeObjects(formatOptions, arg); // Merge custom options
			}
		});

		// Normalize segment types to an array.
		segmentTypes = formatOptions.unitOrder = (checkIfArray(formatOptions.unitOrder) ? formatOptions.unitOrder : formatOptions.unitOrder.split(" "));

		// Resolve template function if provided.
		if (typeof formatOptions.displayTemplate === "function") {
			formatOptions.displayTemplate = formatOptions.displayTemplate.apply(formatOptions);
		}

		// Construct the regular expression for tokenizing the template string.
		templateLexer = new RegExp(transformCollection(segmentTypes, function (unitType) {
			return formatOptions[unitType].source; // Get regex source for each unit
		}).join("|"), "g");

		// Function to map a matched token string to its corresponding unit type.
		segmentTypeResolver = function (tokenStr) {
			return locateElement(segmentTypes, function (unitType) {
				return formatOptions[unitType].test(tokenStr);
			});
		};

		// Parse the template string into an array of segment objects.
		parsedSegments = transformCollection(formatOptions.displayTemplate.match(templateLexer), function (tokenText, segmentIndex) {
			var unitCategory = segmentTypeResolver(tokenText),
				segmentLength = tokenText.length;

			return {
				segmentIndex: segmentIndex,
				originalLength: segmentLength,
				// Unescape tokens if they are escape sequences.
				segmentText: (unitCategory === "escape" ? tokenText.replace(formatOptions.escapePattern, "$1") : tokenText),
				// Nullify type for non-duration-unit tokens.
				unitType: ((unitCategory === "escape" || unitCategory === "general") ? null : unitCategory)
			};
		});

		// Identify unique duration unit types present in the template, ordered by magnitude.
		relevantTimeUnits = findCommonElements(segmentTypes, getUniqueElements(filterFalsy(extractProperty(parsedSegments, "unitType"))));

		// If no duration unit tokens are found, return the template as-is.
		if (!relevantTimeUnits.length) {
			return extractProperty(parsedSegments, "segmentText").join("");
		}

		// Calculate values for each relevant time unit token.
		iterateCollection(relevantTimeUnits, function (timeUnit, unitIndex) {
			var unitValue, integerPart, fractionalPart, isSmallestUnit, isLargestUnit;

			// Calculate integer and decimal portions based on remaining duration.
			unitValue = remainingDuration.as(timeUnit);
			integerPart = (unitValue >= 0 ? Math.floor(unitValue) : Math.ceil(unitValue)); // Handle negative values correctly
			fractionalPart = unitValue - integerPart;

			isSmallestUnit = ((unitIndex + 1) === relevantTimeUnits.length); // Is this the least significant unit?
			isLargestUnit = (unitIndex === 0); // Is this the most significant unit?

			// Update each segment object in `parsedSegments` that matches the current `timeUnit`.
			iterateCollection(parsedSegments, function (segment) {
				if (segment.unitType === timeUnit) {
					mergeObjects(segment, {
						calculatedValue: unitValue,
						integerPart: integerPart,
						fractionalPart: fractionalPart,
						isSmallestUnit: isSmallestUnit,
						isLargestUnit: isLargestUnit
					});

					// Auto-detect `enforcePadding` for the largest unit if it has length > 1.
					if (isLargestUnit) {
						if (formatOptions.enforcePadding === null && segment.originalLength > 1) {
							formatOptions.enforcePadding = true;
						}
					}
				}
			});

			// Subtract the whole part of the current unit from the remaining duration.
			remainingDuration.subtract(integerPart, timeUnit);
		});

		// Apply trimming logic to the parsed segments array.
		if (formatOptions.trimMode) {
			parsedSegments = (formatOptions.trimMode === "start" ? sliceFromFirstMatch : sliceUpToLastMatch)(parsedSegments, function (segment) {
				// Trim if:
				// 1. It's not the smallest unit (we always keep the smallest).
				// 2. It's a duration unit token that has no non-zero integer value.
				return !(segment.isSmallestUnit || (segment.unitType !== null && segment.integerPart !== 0));
			});
		}

		// Handle empty segments after trimming.
		if (!parsedSegments.length) {
			return "";
		}

		// Prepare to build the final output string.
		firstUnitRendered = false;

		// Reverse segments if trimming from the end to simplify logic.
		if (formatOptions.trimMode === "end") {
			parsedSegments.reverse();
		}

		// Transform segments into their final string representations.
		parsedSegments = transformCollection(parsedSegments, function (currentSegment) {
			var segmentOutput,
				decimalParts;

			// Non-duration tokens are used as-is.
			if (!currentSegment.unitType) {
				return currentSegment.segmentText;
			}

			// Apply negative precision formatting to the smallest unit.
			if (currentSegment.isSmallestUnit && (formatOptions.decimalPrecision < 0)) {
				// Example: precision -1 on 123.45 -> 120
				var scaleFactor = Math.pow(10, formatOptions.decimalPrecision);
				segmentOutput = String(Math.floor(currentSegment.integerPart * scaleFactor) / scaleFactor);
			} else {
				segmentOutput = String(Math.abs(currentSegment.integerPart)); // Always start with absolute value
			}

			// Apply padding based on token length and options.
			if (currentSegment.originalLength > 1 && (firstUnitRendered || currentSegment.isLargestUnit || formatOptions.enforcePadding)) {
				segmentOutput = zeroPadString(segmentOutput, currentSegment.originalLength);
			}

			// Add fractional part if precision > 0 and it's the smallest unit.
			if (currentSegment.isSmallestUnit && (formatOptions.decimalPrecision > 0)) {
				// Use Math.round to handle floating point inaccuracies before slicing
				var decimalMultiplier = Math.pow(10, formatOptions.decimalPrecision);
				var roundedFraction = Math.round(Math.abs(currentSegment.fractionalPart) * decimalMultiplier);
				decimalParts = zeroPadString(String(roundedFraction), formatOptions.decimalPrecision, true);
				segmentOutput += "." + decimalParts.slice(0, formatOptions.decimalPrecision);
			}

			// Prepend negative sign if the original duration value was negative and this is the largest unit.
			if (currentSegment.isLargestUnit && currentSegment.calculatedValue < 0) {
				segmentOutput = "-" + segmentOutput;
			}

			firstUnitRendered = true; // Mark that a duration unit has been rendered.

			return segmentOutput;
		});

		// Undo the reverse if trimming from the end was applied.
		if (formatOptions.trimMode === "end") {
			parsedSegments.reverse();
		}

		return parsedSegments.join("");
	};

	// Default configuration settings for the duration formatter.
	timeKeeperLib.duration.fn.renderDurationString.defaultSettings = {
		// Regular expression patterns for recognizing different time units in a template string.
		escapePattern: /\[(.+?)\]/, // Pattern for escaped text (e.g., '[d]')
		years: /[Yy]+/,
		months: /M+/,
		weeks: /[Ww]+/,
		days: /[Dd]+/,
		hours: /[Hh]+/,
		minutes: /m+/,
		seconds: /s+/,
		milliseconds: /S+/,
		general: /.+?/, // Catches any other characters not matched by specific units

		// The preferred order of time unit types, from largest to smallest magnitude.
		// Can be a space-separated string or an array of unit names.
		unitOrder: "escape years months weeks days hours minutes seconds milliseconds general",

		// Formatting behavior options:

		// `trimMode`: Controls how leading/trailing zero-value units are handled.
		// "start": Removes units from the beginning until a non-zero unit is encountered.
		// "end": Removes units from the end until a non-zero unit is encountered (the last unit is always kept).
		// `false`: No trimming is applied; all units in the template are rendered.
		trimMode: "start",

		// `decimalPrecision`: Number of decimal places for the smallest unit.
		// A positive integer specifies digits after the decimal point.
		// A negative integer truncates digits before the decimal point (e.g., -1 rounds to nearest 10).
		decimalPrecision: 0,

		// `enforcePadding`: If `true`, ensures all duration units are padded to their full length
		// as defined in the template, even if they are the first rendered unit and `trimMode` is active.
		// `null` (default) allows auto-detection based on the largest unit's template length.
		enforcePadding: null,

		// `displayTemplate`: The string or function used to define the output format.
		// If a function, it's executed with `this` bound to the settings object, allowing dynamic templates.
		template: function () {
			var availableUnits = this.unitOrder;
			var currentDurationData = this.currentDuration._data;

			// Determine the most significant unit with a non-zero value.
			var mostSignificantUnit = locateLastElement(availableUnits, function (unit) {
				return currentDurationData[unit];
			});

			// Map common unit types to default template strings.
			var defaultTemplateMap = {
				"seconds": "h:mm:ss",
				"minutes": "d[d] h:mm",
				"hours": "d[d] h[h]",
				"days": "M[m] d[d]",
				"weeks": "y[y] w[w]",
				"months": "y[y] M[m]",
				"years": "y[y]"
			};

			// Return a specific template based on the most significant unit, or a comprehensive default.
			return defaultTemplateMap[mostSignificantUnit] || "y[y] M[m] d[d] h:mm:ss";
		}
	};

})(this);