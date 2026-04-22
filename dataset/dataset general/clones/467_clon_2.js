!function(exporter){
  // Check if it's a CommonJS environment
  if ("object" === typeof exports) {
    module.exports = exporter();
  }
  // Check if it's an AMD environment
  else if ("function" === typeof define && define.amd) {
    define(exporter);
  }
  // Otherwise, attach to global scope
  else {
    var globalObject; // Variable to hold the global context
    // Determine the global object based on environment
    if ("undefined" !== typeof window) {
      globalObject = window;
    } else if ("undefined" !== typeof global) {
      globalObject = global;
    } else if ("undefined" !== typeof self) {
      globalObject = self;
    }
    // Assign the exported module to a property on the global object
    globalObject.Blueprint = exporter();
  }
}(function(){
  // Internal define, module, exports for the Browserify shim
  var define, module, exports;

  // Browserify-like module loader function
  return (function moduleLoader(packageMap, loadedModules, entryPoints){
    // Function to retrieve or load a module
    function loadModule(moduleIdentifier, isRecursive){
      // If the module is not yet loaded
      if (!loadedModules[moduleIdentifier]){
        // If the module is not in the package map
        if (!packageMap[moduleIdentifier]){
          var reqFunc = typeof require === "function" && require;
          // Try to use the native require if not recursive
          if (!isRecursive && reqFunc) return reqFunc(moduleIdentifier, true);
          // If a current requester exists, use it
          if (currentRequester) return currentRequester(moduleIdentifier, true);
          // If module cannot be found, throw an error
          throw new Error("Cannot locate dependency '" + moduleIdentifier + "'");
        }
        // Initialize the module object
        var moduleObject = loadedModules[moduleIdentifier] = {exports:{}};
        // Execute the module's code
        packageMap[moduleIdentifier][0].call(moduleObject.exports, function(depName){
          var resolvedDep = packageMap[moduleIdentifier][1][depName];
          return loadModule(resolvedDep ? resolvedDep : depName);
        }, moduleObject, moduleObject.exports, moduleLoader, packageMap, loadedModules, entryPoints);
      }
      // Return the module's exports
      return loadedModules[moduleIdentifier].exports;
    }
    // Store the current require function
    var currentRequester = typeof require === "function" && require;
    // Load all entry points
    for (var loopIndex = 0; loopIndex < entryPoints.length; loopIndex++) {
      loadModule(entryPoints[loopIndex]);
    }
    // Return the main entry point's exports
    return loadModule(entryPoints[0]);
  })({1:[function(dependencyResolver, moduleInstance, exportsObject){
"use strict";

// Load external dependencies
var fileSys = dependencyResolver("fs");
var resourceLocator = dependencyResolver("url");
var validatorEngine = dependencyResolver("revalidator");
var isResourceLocator = dependencyResolver("is-url");
var definition = dependencyResolver("./schema"); // Our custom schema definition

// Define the main Blueprint class and export it
var Blueprint = moduleInstance.exports = (function() {

  // Constructor for the Blueprint object
  function Blueprint(inputData) {
    var propName; // Loop variable for property names

    // If input is a string
    if (typeof(inputData) === 'string') {

      // Check if it's a file path (ends with .json)
      if (inputData.match(/\.json$/i)) {
        inputData = fileSys.readFileSync(inputData);
      }

      try {
        inputData = JSON.parse(inputData); // Attempt to parse as JSON
      } catch(parseError) {
        // If parsing fails, throw an error
        throw new Error("Invalid JSON format provided");
      }
    }

    // Copy properties from the parsed data to the current instance
    for (propName in inputData) {
      if (inputData.hasOwnProperty(propName)) {
        this[propName] = inputData[propName];
      }
    }

    return this; // Return the instance
  }

  // Define prototype methods and getters for the Blueprint class
  Blueprint.prototype = {
    // Getter for validation errors
    get validationErrors() {
      return validatorEngine.validate(this, definition).errors;
    },
    // Getter to check if the instance is valid
    get isValid() {
      return validatorEngine.validate(this, definition).valid;
    },
    // Getter for a nicely formatted string of errors
    get formattedErrors() {
      return this.validationErrors.map(function(validationIssue) {
        // Format each error as "- property message"
        return ["-", validationIssue.property, validationIssue.message].join(" ");
      }).join("\n"); // Join all errors with newlines
    },
    // Getter to convert the instance to a JSON string, filtering properties
    get toManifest() {
      var propName; // Loop variable
      var outputObject = {}; // Object to hold filtered properties
      // Get a list of properties defined in the schema
      var allowedProperties = Object.keys(definition.attributes);
      for (propName in this) {
        // Only include own properties that are also in the schema
        if (this.hasOwnProperty(propName) && allowedProperties.indexOf(propName) > -1) {
          outputObject[propName] = this[propName];
        }
      }
      // Stringify the filtered object with 2-space indentation
      return JSON.stringify(outputObject, null, 2);
    }
  };

  // Static factory method to create a new Blueprint instance
  Blueprint.create = function(inputData) {
    return new Blueprint(inputData);
  };

  // Static property holding an example Blueprint instance based on schema's illustrative data
  Blueprint.sample = new Blueprint(definition.illustrativeData);
  // Static property exposing the underlying schema definition
  Blueprint.definition = definition;

  return Blueprint; // Return the Blueprint class
})();

// Module dependencies list
},{"./schema":2,"fs":3,"is-url":9,"revalidator":10,"url":8}],2:[function(dependencyResolver, moduleInstance, exportsObject){
"use strict";
// Define the core structure definition object
var structureDefinition = {
  "attributes": { // Properties of the application manifest
    "label": {
      "summary": "A clear and concise name for the template (max 30 chars).",
      "type": "string",
      "minLength": 3,
      "maxLength": 30,
      "allowEmpty": false,
      "illustrativeData": "Efficient Utility Tool"
    },
    "summary": {
      "summary": "A brief overview of the application: its purpose, target audience, and reason for existence.",
      "type": "string",
      "illustrativeData": "This application performs a single task, and executes it flawlessly.",
      "maxLength": 140
    },
    "tags": {
      "summary": "An array of keywords describing the application's nature.",
      "type": "array",
      "illustrativeData": ["efficiency", "web-tech", "precision"]
    },
    "homepage": {
      "summary": "The primary website address for the project.",
      "type": "string",
      "format": "url",
      "allowEmpty": false,
      "illustrativeData": "https://efficient-utility.com/"
    },
    "sourceCodeRepo": {
      "summary": "The URL for the application's source code repository (e.g., Git, GitHub, SVN, Mercurial).",
      "type": "string",
      "format": "url",
      "allowEmpty": false,
      "illustrativeData": "https://github.com/john-doe/efficient-utility"
    },
    "iconUrl": {
      "summary": "The web address of the application's logo image. Should be square. SVG, PNG, or JPG formats are acceptable.",
      "type": "string",
      "format": "url",
      "allowEmpty": false,
      "illustrativeData": "https://efficient-utility.com/icon.svg"
    },
    "completionRedirectUrl": {
      "summary": "A URL where the user is redirected after their new application is successfully deployed. If a full URL, redirect directly. If starting with '/', redirect to that path within the newly deployed app.",
      "type": "string",
      "allowEmpty": false,
      "illustrativeData": "/dashboard"
    },
    "executionHooks": {
      "summary": "A key-value map defining scripts or shell commands to run at various stages of the build/release process. Currently, only `postdeploy` is supported.",
      "type": "object",
      "illustrativeData": {"postdeploy": "bundle exec rake setup_db"}
    },
    "environmentVars": {
      "summary": "A key-value map for environment variables, often called 'config vars' in platforms like Heroku. Keys are variable names. Values can be strings or objects. If a string, it's the direct value. If an object, it specifies requirements:\n\n- `summary`: a user-friendly text explaining the variable's purpose and how to determine its value\n- `value`: a default value to use (must be a string).\n- `required`: A boolean indicating if the variable is mandatory for app operation (default: `true`).\n- `generator`: a string naming a function to generate the value. Currently, `secret` (for pseudo-random strings) is the only generator.",
      "type": "object",
      "illustrativeData": {
        "CUSTOM_BUILDPACK": "https://github.com/myorg/custom-buildpack",
        "APP_SECRET_KEY": {
          "summary": "A cryptographic key for ensuring signed cookie integrity.",
          "generator": "secret"
        },
        "WEB_PROCESS_COUNT": {
          "summary": "The number of concurrent web processes to execute.",
          "value": "3"
        }
      }
    },
    "externalServices": {
      "summary": "An array of strings specifying Heroku addons to provision for the application prior to deployment. Each entry should be 'addon:plan' or 'addon'. If the plan is omitted, the default plan for that addon will be used.",
      "type": "array",
      "illustrativeData": [
        "redislabs",
        "mongodb:starter-plan"
      ]
    }
  }
};

// Generate a full example object from the schema's illustrative data
structureDefinition.illustrativeData = {};
Object.keys(structureDefinition.attributes).map(function(key){
  structureDefinition.illustrativeData[key] = structureDefinition.attributes[key].illustrativeData;
});

// Create a template-ready stringified version of the example data
structureDefinition.illustrativeDataJSON = JSON.stringify(structureDefinition.illustrativeData, null, 2);

// Transform schema attributes into a more template-friendly array format
structureDefinition.attributeDetails = Object.keys(structureDefinition.attributes).map(function(name) {
  var attributeInfo = structureDefinition.attributes[name];
  attributeInfo.name = name;
  attributeInfo.statusIndicator = attributeInfo.required ? "mandatory" : "optional"; // Indicate if attribute is required

  var sampleDoc = {}; // Temporary object for example JSON
  sampleDoc[attributeInfo.name] = attributeInfo.illustrativeData;
  attributeInfo.illustrativeDataJSON = JSON.stringify(sampleDoc, null, 2); // Stringify individual attribute example
  return attributeInfo;
});

moduleInstance.exports = structureDefinition; // Export the complete schema definition

},{}],3:[function(dependencyResolver, moduleInstance, exportsObject){
// This is an empty module, likely a shim for 'fs' in a browser environment.

},{}],4:[function(dependencyResolver, moduleInstance, exportsObject){
(function (systemWide){
/*! punycode.js v1.2.4 by @mathias - http://mths.be/punycode */
;(function(baseScope) {

	/** Identify free variables for CommonJS */
	var availableExports = typeof exports == 'object' && exports;
	var availableModule = typeof module == 'object' && module &&
		availableModule.exports == availableExports && module;
	var availableGlobal = typeof systemWide == 'object' && systemWide;
	// Ensure the baseScope is the true global object if running in a browser-like environment
	if (availableGlobal.global === availableGlobal || availableGlobal.window === availableGlobal) {
		baseScope = availableGlobal;
	}

	/**
	 * The `textTransformer` object containing Punycode functionalities.
	 * @name textTransformer
	 * @type Object
	 */
	var textTransformer,

	/** Maximum positive signed 32-bit float value */
	maxIntegerVal = 2147483647, // Equivalent to 0x7FFFFFFF or 2^31-1

	/** Bootstring algorithm parameters */
	baseValue = 36,
	thresholdMin = 1,
	thresholdMax = 26,
	skewFactor = 38,
	dampFactor = 700,
	startBias = 72,
	startN = 128, // Represents 0x80
	separatorChar = '-', // ASCII hyphen '\x2D'

	/** Regular expression patterns */
	punycodePattern = /^xn--/,
	nonAsciiPattern = /[^ -~]/, // Matches unprintable ASCII characters + non-ASCII characters
	domainSeparatorsPattern = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 defined separators

	/** Error message strings */
	issueMessages = {
		'overflow': 'Numerical overflow: input requires larger integers to process',
		'not-basic': 'Invalid input: value >= 0x80 (not a basic code point)',
		'invalid-input': 'Input data is malformed'
	},

	/** Convenient shorthand functions */
	baseMinusThresholdMin = baseValue - thresholdMin,
	roundDown = Math.floor,
	charFromCode = String.fromCharCode,

	/** Temporary variable for various loops */
	tempKey;

	/*--------------------------------------------------------------------------*/

	/**
	 * A general purpose error throwing utility.
	 * @private
	 * @param {String} errorType The category of the error.
	 * @returns {Error} Throws a `RangeError` with the appropriate message.
	 */
	function raiseError(errorType) {
		throw RangeError(issueMessages[errorType]);
	}

	/**
	 * A generic `Array#map` style utility function.
	 * @private
	 * @param {Array} inputArray The array to iterate over.
	 * @param {Function} callbackFunction The function to call for each array item.
	 * @returns {Array} A new array composed of values returned by the callback.
	 */
	function transformArray(inputArray, callbackFunction) {
		var arrayLength = inputArray.length;
		while (arrayLength--) {
			inputArray[arrayLength] = callbackFunction(inputArray[arrayLength]);
		}
		return inputArray;
	}

	/**
	 * A basic `Array#map`-like wrapper specifically for domain name strings.
	 * @private
	 * @param {String} domainString The domain name string.
	 * @param {Function} callbackFunction The function to call for each character segment.
	 * @returns {Array} A new string made from characters returned by the callback.
	 */
	function transformDomainString(domainString, callbackFunction) {
		return transformArray(domainString.split(domainSeparatorsPattern), callbackFunction).join('.');
	}

	/**
	 * Generates an array containing the numeric code points of each Unicode
	 * character in the provided string. JavaScript uses UCS-2 internally,
	 * but this function converts surrogate pairs (exposed by UCS-2 as separate
	 * characters) into a single code point, aligning with UTF-16.
	 * @see `textTransformer.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf textTransformer.ucs2
	 * @name decode
	 * @param {String} inputString The Unicode input string (UCS-2).
	 * @returns {Array} The newly created array of code points.
	 */
	function ucs2Decode(inputString) {
		var resultArray = [],
		    indexCounter = 0,
		    inputLength = inputString.length,
		    currentValue,
		    additionalValue;
		while (indexCounter < inputLength) {
			currentValue = inputString.charCodeAt(indexCounter++);
			if (currentValue >= 0xD800 && currentValue <= 0xDBFF && indexCounter < inputLength) {
				// This is a high surrogate, and there's a subsequent character
				additionalValue = inputString.charCodeAt(indexCounter++);
				if ((additionalValue & 0xFC00) == 0xDC00) { // This is a low surrogate
					resultArray.push(((currentValue & 0x3FF) << 10) + (additionalValue & 0x3FF) + 0x10000);
				} else {
					// Unmatched surrogate; append this code unit, in case the next
					// unit is a high surrogate for another pair
					resultArray.push(currentValue);
					indexCounter--;
				}
			} else {
				resultArray.push(currentValue);
			}
		}
		return resultArray;
	}

	/**
	 * Constructs a string from an array of numeric code points.
	 * @see `textTransformer.ucs2.decode`
	 * @memberOf textTransformer.ucs2
	 * @name encode
	 * @param {Array} codeUnits The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2Encode(codeUnits) {
		return transformArray(codeUnits, function(currentValue) {
			var outputSegment = '';
			if (currentValue > 0xFFFF) {
				currentValue -= 0x10000;
				outputSegment += charFromCode(currentValue >>> 10 & 0x3FF | 0xD800);
				currentValue = 0xDC00 | currentValue & 0x3FF;
			}
			outputSegment += charFromCode(currentValue);
			return outputSegment;
		}).join('');
	}

	/**
	 * Converts a basic code point into a numeric digit.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) ranging from `0` to `baseValue - 1`, or `baseValue` if
	 * the code point does not represent a valid value.
	 */
	function basicToNumericDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return baseValue;
	}

	/**
	 * Converts a numeric digit into a basic code point.
	 * @see `basicToNumericDigit()`
	 * @private
	 * @param {Number} numericDigit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `numericDigit`, which must be in the range
	 * `0` to `baseValue - 1`. If `isUppercase` is non-zero, the uppercase form is
	 * used; otherwise, the lowercase form is used. Behavior is undefined
	 * if `isUppercase` is non-zero and `numericDigit` has no uppercase form.
	 */
	function numericDigitToBasic(numericDigit, isUppercase) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return numericDigit + 22 + 75 * (numericDigit < 26) - ((isUppercase != 0) << 5);
	}

	/**
	 * Bias adaptation function as described in section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adaptBias(difference, pointCount, initialCall) {
		var loopVar = 0;
		difference = initialCall ? roundDown(difference / dampFactor) : difference >> 1;
		difference += roundDown(difference / pointCount);
		for (/* no initialization */; difference > baseMinusThresholdMin * thresholdMax >> 1; loopVar += baseValue) {
			difference = roundDown(difference / baseMinusThresholdMin);
		}
		return roundDown(loopVar + (baseMinusThresholdMin + 1) * difference / (difference + skewFactor));
	}

	/**
	 * Transforms a Punycode string of ASCII-only symbols into a string of Unicode
	 * symbols.
	 * @memberOf textTransformer
	 * @param {String} encodedInput The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decodePunycode(encodedInput) {
		// Do not use UCS-2 directly
		var resultArray = [],
		    encodedInputLength = encodedInput.length,
		    outputLength,
		    currentPosition = 0,
		    currentN = startN,
		    currentBias = startBias,
		    basicSegmentLength,
		    loopIndex,
		    readIndex,
		    oldPosition,
		    weightFactor,
		    currentDigit,
		    tempThreshold,
		    /** Cached calculation results */
		    baseMinusTempThreshold;

		// Process basic code points: `basicSegmentLength` is the count of input code
		// points before the last separator, or `0` if none exists. Copy these to output.

		basicSegmentLength = encodedInput.lastIndexOf(separatorChar);
		if (basicSegmentLength < 0) {
			basicSegmentLength = 0;
		}

		for (loopIndex = 0; loopIndex < basicSegmentLength; ++loopIndex) {
			// If it's not a basic code point
			if (encodedInput.charCodeAt(loopIndex) >= 0x80) {
				raiseError('not-basic');
			}
			resultArray.push(encodedInput.charCodeAt(loopIndex));
		}

		// Main decoding loop: starts just after the last separator if basic code
		// points were copied; otherwise, starts from the beginning.

		for (readIndex = basicSegmentLength > 0 ? basicSegmentLength + 1 : 0; readIndex < encodedInputLength; /* no final expression */) {

			// `readIndex` points to the next character to be processed.
			// Decode a generalized variable-length integer into `difference`,
			// which is added to `currentPosition`. Overflow checking is simpler
			// if `currentPosition` increases as we go, then subtract its starting
			// value at the end to get `difference`.
			for (oldPosition = currentPosition, weightFactor = 1, loopVar = baseValue; /* no condition */; loopVar += baseValue) {

				if (readIndex >= encodedInputLength) {
					raiseError('invalid-input');
				}

				currentDigit = basicToNumericDigit(encodedInput.charCodeAt(readIndex++));

				if (currentDigit >= baseValue || currentDigit > roundDown((maxIntegerVal - currentPosition) / weightFactor)) {
					raiseError('overflow');
				}

				currentPosition += currentDigit * weightFactor;
				tempThreshold = loopVar <= currentBias ? thresholdMin : (loopVar >= currentBias + thresholdMax ? thresholdMax : loopVar - currentBias);

				if (currentDigit < tempThreshold) {
					break;
				}

				baseMinusTempThreshold = baseValue - tempThreshold;
				if (weightFactor > roundDown(maxIntegerVal / baseMinusTempThreshold)) {
					raiseError('overflow');
				}

				weightFactor *= baseMinusTempThreshold;

			}

			outputLength = resultArray.length + 1;
			currentBias = adaptBias(currentPosition - oldPosition, outputLength, oldPosition == 0);

			// `currentPosition` was expected to wrap around from `outputLength` to `0`,
			// incrementing `currentN` each time, so we correct that now:
			if (roundDown(currentPosition / outputLength) > maxIntegerVal - currentN) {
				raiseError('overflow');
			}

			currentN += roundDown(currentPosition / outputLength);
			currentPosition %= outputLength;

			// Insert `currentN` at position `currentPosition` in the output array
			resultArray.splice(currentPosition++, 0, currentN);

		}

		return ucs2Encode(resultArray);
	}

	/**
	 * Transforms a string of Unicode symbols into a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf textTransformer
	 * @param {String} inputString The string containing Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encodePunycode(inputString) {
		var currentN,
		    difference,
		    processedCodePointCount,
		    basicCodePointLength,
		    currentBias,
		    loopIndex,
		    tempM,