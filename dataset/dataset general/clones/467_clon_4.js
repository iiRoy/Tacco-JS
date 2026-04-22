!function(globalFactory){if("object"==typeof exports)module.exports=globalFactory();else if("function"==typeof define&&define.amd)define(globalFactory);else{var targetScope;"undefined"!=typeof window?targetScope=window:"undefined"!=typeof global?targetScope=global:"undefined"!=typeof self&&(targetScope=self),targetScope.ApplicationBlueprint=globalFactory()}}(function(){var declareModule,exportedModuleRef,componentExports;return (function moduleLoader(moduleDefinitions,moduleCache,startupModules){function requireModule(moduleIdentifier,isRootCall){if(!moduleCache[moduleIdentifier]){if(!moduleDefinitions[moduleIdentifier]){var localDynamicRequire=typeof require=="function"&&require;if(!isRootCall&&localDynamicRequire)return localDynamicRequire(moduleIdentifier,!0);if(cachedDynamicRequire)return cachedDynamicRequire(moduleIdentifier,!0);throw new Error("Missing component '"+moduleIdentifier+"'")}var currentModuleContainer=moduleCache[moduleIdentifier]={exposedComponents:{}};moduleDefinitions[moduleIdentifier][0].call(currentModuleContainer.exposedComponents,function(dependencyId){var dependencyPath=moduleDefinitions[moduleIdentifier][1][dependencyId];return requireModule(dependencyPath?dependencyPath:dependencyId)},currentModuleContainer,currentModuleContainer.exposedComponents,moduleLoader,moduleDefinitions,moduleCache,startupModules)}return moduleCache[moduleIdentifier].exposedComponents}var cachedDynamicRequire=typeof require=="function"&&require;for(var k=0;k<startupModules.length;k++)requireModule(startupModules[k]);return requireModule(startupModules[0])})({1:[function(obtainDependency,exportedModuleRef,componentExports){
"use strict";

var validationEngine = obtainDependency("validation-tool");
var blueprintSchema = obtainDependency("./blueprint-config");

class Blueprint {
  constructor(initialPayload) {
    let processedPayload = initialPayload;

    if (typeof initialPayload === 'string') {
      try {
        processedPayload = JSON.parse(initialPayload);
      } catch (err) {
        throw new Error("CorruptedDataFormat: Input string is not valid JSON.");
      }
    } else if (typeof initialPayload !== 'object' || initialPayload === null) {
        throw new Error("InvalidBlueprintInput: Expected string or object.");
    }

    Object.assign(this, processedPayload);
  }

  retrieveValidationReport() {
    return validationEngine.validate(this, blueprintSchema);
  }

  isValid() {
    return this.retrieveValidationReport().valid;
  }

  composeIssueSummary() {
    const validationIssues = this.retrieveValidationReport().errors;
    if (validationIssues.length === 0) {
      return "";
    }
    return validationIssues.reduce((accumulator, currentIssue) => {
      return accumulator + `* ${currentIssue.property}: ${currentIssue.message}\n`;
    }, "").trim();
  }

  exportCanonicalForm() {
    const outputObject = {};
    const permittedAttributes = Object.keys(blueprintSchema.attributes);

    Object.entries(this).filter(([key, value]) => {
      return permittedAttributes.includes(key);
    }).forEach(([key, value]) => {
      outputObject[key] = value;
    });

    return JSON.stringify(outputObject, null, 2);
  }
}

Blueprint.createInstance = function(payload) {
  return new Blueprint(payload);
};

Blueprint.sampleInstance = new Blueprint(blueprintSchema.illustrativeData);
Blueprint.associatedSchema = blueprintSchema;

exportedModuleRef.exposedComponents = Blueprint;

},{"./blueprint-config":2,"validation-tool":10}],2:[function(obtainDependency,exportedModuleRef,componentExports){
"use strict"
var blueprintConfig = {
  "attributes": {
    "label": {
      "info": "A distinct and concise label for the template (max 30 characters).",
      "kind": "string",
      "minLen": 3,
      "maxLen": 30,
      "allowEmptyVal": false,
      "illustration": "Prime Utility"
    },
    "summary": {
      "info": "A concise overview of the application: its purpose, target audience, and origin.",
      "kind": "string",
      "illustration": "This utility excels at its singular, defined task.",
      "maxLen": 140
    },
    "tags": {
      "info": "A collection of strings categorizing the application.",
      "kind": "array",
      "illustration": ["efficiency", "webtech", "precision"]
    },
    "webAddress": {
      "info": "The project's primary web presence.",
      "kind": "string",
      "format": "url",
      "allowEmptyVal": false,
      "illustration": "https://prime-utility.com/"
    },
    "sourceRepo": {
      "info": "The location of the application's source code, e.g., Git, GitHub, Subversion, or Mercurial URLs.",
      "kind": "string",
      "format": "url",
      "allowEmptyVal": false,
      "illustration": "https://github.com/john-doe/prime-utility"
    },
    "visualMark": {
      "info": "The URL of the application's identifying image. Should be square; SVG, PNG, or JPG.",
      "kind": "string",
      "format": "url",
      "allowEmptyVal": false,
      "illustration": "https://prime-utility.com/visual.svg"
    },
    "successRedirect": {
      "info": "A URL for user redirection after app deployment. Absolute URL means direct redirect; relative path means redirect within the new app.",
      "kind": "string",
      "allowEmptyVal": false,
      "illustration": "/dashboard"
    },
    "executionScripts": {
      "info": "A mapping of stage names to shell commands for build/release. Currently, only `postdeploy` is supported.",
      "kind": "object",
      "illustration": {"postdeployHook": "npm run setup"}
    },
    "environmentVariables": {
      "info": "A key-value map for environment variables (config vars). Keys are variable names. Values can be strings or objects defining requirements:\n\n- `descriptionText`: describes the variable's purpose and how to determine its value\n- `defaultValue`: a default string value\n- `isRequired`: boolean (default: `true`)\n- `generatorFunction`: string, e.g., `randomSecret` for a pseudo-random string.",
      "kind": "object",
      "illustration": {
        "BUILD_SOURCE_URL": "https://github.com/example/custom-buildpack",
        "AUTH_TOKEN_KEY": {
          "descriptionText": "A confidential key for validating signed cookies.",
          "generatorFunction": "randomSecret"
        },
        "PROCESS_CONCURRENCY": {
          "descriptionText": "The count of concurrent processes.",
          "defaultValue": "8"
        }
      }
    },
    "provisionedAddons": {
      "info": "An array of strings for Heroku addon provisioning, e.g., `addon:plan` or `addon` for default plan.",
      "kind": "array",
      "illustration": [
        "redis-cache",
        "mongodb-atlas:shared-tier-small"
      ]
    }
  }
}

blueprintConfig.illustrativeData = {};
Object.keys(blueprintConfig.attributes).map(function(attributeName){
  blueprintConfig.illustrativeData[attributeName] = blueprintConfig.attributes[attributeName].illustration;
})

blueprintConfig.illustrativeJSON = JSON.stringify(blueprintConfig.illustrativeData, null, 2);

blueprintConfig.attributeDefinitions = Object.keys(blueprintConfig.attributes).map(function(attributeName) {
  var currentAttribute = blueprintConfig.attributes[attributeName];
  currentAttribute.attributeName = attributeName;
  currentAttribute.mandateStatus = currentAttribute.required ? "mandatory" : "optional";

  var specificJsonDoc = {};
  specificJsonDoc[currentAttribute.attributeName] = currentAttribute.illustration;
  currentAttribute.jsonFormatExample = JSON.stringify(specificJsonDoc, null, 2);
  return currentAttribute;
});

exportedModuleRef.exposedComponents = blueprintConfig;

},{}],3:[function(obtainDependency,exportedModuleRef,componentExports){

},{}],4:[function(globalScope,exportedModuleRef,componentExports){
(function (globalScope){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(currentRoot) {

	/** Detect free variables */
	var availableExports = typeof componentExports == 'object' && componentExports;
	var availableModule = typeof exportedModuleRef == 'object' && exportedModuleRef &&
		exportedModuleRef.exposedComponents == availableExports && exportedModuleRef;
	var availableGlobal = typeof globalScope == 'object' && globalScope;
	if (availableGlobal.global === availableGlobal || availableGlobal.window === availableGlobal) {
		currentRoot = availableGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var characterDecoder,

	/** Highest positive signed 32-bit float value */
	maxIntegerLimit = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	numericalBase = 36,
	thresholdMin = 1,
	thresholdMax = 26,
	biasShift = 38,
	dampingFactor = 700,
	startingBias = 72,
	startingN = 128, // 0x80
	separatorChar = '-', // '\x2D'

	/** Regular expressions */
	punycodePattern = /^xn--/,
	nonAsciiPattern = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	segmentSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errorMessages = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusThresholdMin = numericalBase - thresholdMin,
	floorValue = Math.floor,
	charFromCode = String.fromCharCode,

	/** Temporary variable */
	loopVar;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function signalError(type) {
		throw RangeError(errorMessages[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function mapArray(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomainString(string, fn) {
		return mapArray(string.split(segmentSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2ToCodePoints(string) {
		var result = [],
		    counter = 0,
		    length = string.length,
		    val,
		    extraChar;
		while (counter < length) {
			val = string.charCodeAt(counter++);
			if (val >= 0xD800 && val <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extraChar = string.charCodeAt(counter++);
				if ((extraChar & 0xFC00) == 0xDC00) { // low surrogate
					result.push(((val & 0x3FF) << 10) + (extraChar & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					result.push(val);
					counter--;
				}
			} else {
				result.push(val);
			}
		}
		return result;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function codePointsToUcs2(array) {
		return mapArray(array, function(val) {
			var outputString = '';
			if (val > 0xFFFF) {
				val -= 0x10000;
				outputString += charFromCode(val >>> 10 & 0x3FF | 0xD800);
				val = 0xDC00 | val & 0x3FF;
			}
			outputString += charFromCode(val);
			return outputString;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `numericalBase - 1`, or `numericalBase` if
	 * the code point does not represent a value.
	 */
	function basicToDigitValue(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return numericalBase;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigitValue()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `numericalBase - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasicCodePoint(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adaptBias(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floorValue(delta / dampingFactor) : delta >> 1;
		delta += floorValue(delta / numPoints);
		for (/* no initialization */; delta > baseMinusThresholdMin * thresholdMax >> 1; k += numericalBase) {
			delta = floorValue(delta / baseMinusThresholdMin);
		}
		return floorValue(k + (baseMinusThresholdMin + 1) * delta / (delta + biasShift));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decodePunycode(input) {
		// Don't use UCS-2
		var result = [],
		    inputLength = input.length,
		    outChar,
		    current = 0,
		    nVal = startingN,
		    currentBias = startingBias,
		    basicChars,
		    j,
		    idx,
		    oldCurrent,
		    weight,
		    kVal,
		    digitVal,
		    tVal,
		    /** Cached calculation results */
		    baseThresholdDifference;

		// Handle the basic code points: let `basicChars` be the number of input code
		// points before the last separatorChar, or `0` if there is none, then copy
		// the first basic code points to the result.

		basicChars = input.lastIndexOf(separatorChar);
		if (basicChars < 0) {
			basicChars = 0;
		}

		for (j = 0; j < basicChars; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				signalError('not-basic');
			}
			result.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last separatorChar if any basic code
		// points were copied; start at the beginning otherwise.

		for (idx = basicChars > 0 ? basicChars + 1 : 0; idx < inputLength; /* no final expression */) {

			// `idx` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `current`. The overflow checking is easier
			// if we increase `current` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldCurrent = current, weight = 1, kVal = numericalBase; /* no condition */; kVal += numericalBase) {

				if (idx >= inputLength) {
					signalError('invalid-input');
				}

				digitVal = basicToDigitValue(input.charCodeAt(idx++));

				if (digitVal >= numericalBase || digitVal > floorValue((maxIntegerLimit - current) / weight)) {
					signalError('overflow');
				}

				current += digitVal * weight;
				tVal = kVal <= currentBias ? thresholdMin : (kVal >= currentBias + thresholdMax ? thresholdMax : kVal - currentBias);

				if (digitVal < tVal) {
					break;
				}

				baseThresholdDifference = numericalBase - tVal;
				if (weight > floorValue(maxIntegerLimit / baseThresholdDifference)) {
					signalError('overflow');
				}

				weight *= baseThresholdDifference;

			}

			outChar = result.length + 1;
			currentBias = adaptBias(current - oldCurrent, outChar, oldCurrent == 0);

			// `current` was supposed to wrap around from `outChar` to `0`,
			// incrementing `nVal` each time, so we'll fix that now:
			if (floorValue(current / outChar) > maxIntegerLimit - nVal) {
				signalError('overflow');
			}

			nVal += floorValue(current / outChar);
			current %= outChar;

			// Insert `nVal` at position `current` of the result
			result.splice(current++, 0, nVal);

		}

		return codePointsToUcs2(result);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encodeToPunycode(input) {
		var nVal,
		    deltaVal,
		    processedCpCount,
		    basicCharLength,
		    currentBias,
		    jVal,
		    mVal;
		var inputCp = ucs2ToCodePoints(input);
		var result = [];
		var inputLength = inputCp.length;
		var basicCp = [];
		var nonBasicCpCount = 0;

		for (var i = 0; i < inputLength; i++) {
			var cp = inputCp[i];
			if (cp < 0x80) {
				basicCp.push(charFromCode(cp));
			} else {
				nonBasicCpCount++;
			}
		}

		result.push.apply(result, basicCp);
		basicCharLength = result.length;
		if (basicCharLength > 0) {
			result.push(separatorChar);
		}

		nVal = startingN;
		deltaVal = 0;
		currentBias = startingBias;
		processedCpCount = basicCharLength;

		while (processedCpCount < inputLength) {
			mVal = maxIntegerLimit;
			for (var i = 0; i < inputLength; i++) {
				var cp = inputCp[i];
				if (cp >= nVal && cp < mVal) {
					mVal = cp;
				}
			}

			if (mVal - nVal > floorValue((maxIntegerLimit - deltaVal) / (processedCpCount + 1))) {
				signalError('overflow');
			}

			deltaVal += (mVal - nVal) * (processedCpCount + 1);
			nVal = mVal;

			for (var i = 0; i < inputLength; i++) {
				var cp = inputCp[i];
				if (cp < nVal && ++deltaVal > maxIntegerLimit) {
					signalError('overflow');
				}
				if (cp == nVal) {
					for (var kVal = numericalBase; ; kVal += numericalBase) {
						var tVal = kVal <= currentBias ? thresholdMin : (kVal >= currentBias + thresholdMax ? thresholdMax : kVal - currentBias);
						if (cp < tVal) {
							break;
						}
						result.push(charFromCode(digitToBasicCodePoint(deltaVal % numericalBase, 0)));
						deltaVal = floorValue(deltaVal / numericalBase);
					}
					result.push(charFromCode(digitToBasicCodePoint(deltaVal, 0)));
					currentBias = adaptBias(deltaVal, processedCpCount + 1, processedCpCount == basicCharLength);
					deltaVal = 0;
					processedCpCount++;
				}
			}
			nVal++;
		}
		return result.join('');
	}

	characterDecoder = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to parse or format Unicode code points as arrays.
		 * @see `ucs2decode()`
		 * @see `codePointsToUcs2()`
		 * @name punycode.ucs2
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2ToCodePoints,
			'encode': codePointsToUcs2
		},
		'decode': decodePunycode,
		'encode': encodeToPunycode,
		'toASCII': function(input) {
			return mapDomainString(input, function(string) {
				return nonAsciiPattern.test(string)
					? 'xn--' + encodeToPunycode(string)
					: string;
			});
		},
		'toUnicode': function(input) {
			return mapDomainString(input, function(string) {
				return punycodePattern.test(string)
					? decodePunycode(string.slice(4).toLowerCase())
					: string;
			});
		}
	};

	/*--------------------------------------------------------------------------*/

	if (typeof declareModule == 'object' && declareModule && !declareModule.nodeType) {
		if (availableExports && availableModule) {
			exportedModuleRef.exposedComponents = characterDecoder;
		} else {
			componentExports.characterDecoder = characterDecoder;
		}
	} else {
		currentRoot.characterDecoder = characterDecoder;
	}

}(this));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":5}],5:[function(obtainDependency,exportedModuleRef,componentExports){
// shim for using process in browser

var process = exportedModuleRef.exposedComponents = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(obtainDependency,exportedModuleRef,componentExports){
(function (globalScope){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = typeof Uint8Array !== 'undefined'
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var input = elt.replace(/=+$/, '')
		var length = input.length
		var gz = 0
		var out
		var i = 0
		var j = 0

		if (length % 4 === 1) {
			throw new Error('Invalid base64 string')
		}

		out = new Arr(length * 3 >> 2)

		for (; i < length; i++) {
			gz = lookup.indexOf(input.charAt(i))
			switch (i % 4) {
				case 1:
					out[j++] = (gz & 0x0F) << 4 | (prev >> 2)
					break
				case 2:
					out[j++] = (gz & 0x3F) << 2 | (prev >> 4)
					break
				case 3:
					out[j++] = (gz & 0xFF)
					break
			}
			var prev = gz
		}

		return out
	}

	function encode (uint8) {
		var length = uint8.length
		var j = 0
		var base64 = ''
		var prev

		for (; j < length; j++) {
			var mod = j % 3
			var gz = uint8[j]

			switch (mod) {
				case 0:
					base64 += lookup[gz >> 2]
					break
				case 1:
					base64 += lookup[(prev & 0x03) << 4 | (gz >> 4)]
					break
				case 2:
					base64 += lookup[(prev & 0x0f) << 2 | (gz >> 6)]
					base64 += lookup[gz & 0x3f]
					break
			}
			prev = gz
		}

		if (mod === 0) {
			base64 += lookup[(prev & 0x03) << 4] + '=='
		} else if (mod === 1) {
			base64 += lookup[(prev & 0x0f) << 2] + '='
		}

		return base64
	}

	exports.encode = encode
	exports.decode = decode

}(typeof exports === 'object' && exports || typeof globalScope === 'object' && globalScope.Base64 || {}));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(obtainDependency,exportedModuleRef,componentExports){
var atob = obtainDependency('./lib/atob');
var btoa = obtainDependency('./lib/btoa');

exportedModuleRef.exposedComponents = {
  encode: function (str) {
    return btoa(str);
  },
  decode: function (buf) {
    return atob(buf);
  }
};

},{"./lib/atob":6,"./lib/btoa":6}],8:[function(obtainDependency,exportedModuleRef,componentExports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var characterDecoder = obtainDependency('unicode-converter');

function resourcePathParser() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference:
// https://tools.ietf.org/html/rfc3986#section-3.1
// http://en.wikipedia.org/wiki/Uniform_Resource_Identifier
resourcePathParser.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (typeof url !== 'string') {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim or other transformations are not allowed by the URL specification
  // just like parse a=b&c=d an empty string is not a valid key/value
  // this is not the case for the URL as the string may have spaces

  rest = rest.trim();
  if (!slashesDenoteHost && url.indexOf('#') === -1 && url.indexOf('?') === -1) {
    this.path = rest;
    this.href = rest;
    this.pathname = rest;
    return this;
  }

  var start = -1;
  var end = -1;
  var last = 0;
  var lastSlash = -1;
  var i = 0;
  var inAuth = false;
  var atSign = -1;
  var colon = -1;
  var slash = -1;
  var octothorpe = -1;
  var question = -1;
  var percent = -1;
  var hasSlashes = false;
  var host = '';
  var hostname = '';
  var port = '';
  var protocol = '';
  var auth = '';
  var query = '';
  var hash = '';
  var pathname = '';
  var path = '';
  var href = '';
  var len = url.length;

  // find protocol
  start = 0;
  for (i = 0; i < len; i++) {
    if (url.charCodeAt(i) === 58 /* : */ ) {
      start = i;
      break;
    }
  }

  if (start > 0) {
    protocol = url.slice(0, start);
    if (protocol.match(/[^A-Za-z0-9\+\-\.]+/) === null) {
      this.protocol = protocol.toLowerCase() + ':';
      rest = url.slice(start + 1);
    }
  } else {
    // If no protocol, then it must be relative.
    this.protocol = null;
    rest = url;
  }

  // trim off the hash
  octothorpe = rest.indexOf('#');
  if (octothorpe !== -1) {
    hash = rest.slice(octothorpe);
    rest = rest.slice(0, octothorpe);
  } else {
    hash = null;
  }

  // trim off the query string
  question = rest.indexOf('?');
  if (question !== -1) {
    query = rest.slice(question);
    rest = rest.slice(0, question);
  } else {
    query = null;
  }

  // check for slashes
  if (rest.indexOf('//') === 0) {
    hasSlashes = true;
    rest = rest.slice(2);
  } else {
    hasSlashes = false;
  }

  // find hostname
  if (slashesDenoteHost || hasSlashes) {
    // find first slash, question mark, or octothorpe
    slash = rest.indexOf('/');
    question = rest.indexOf('?');
    octothorpe = rest.indexOf('#');

    // find the shortest of the three
    end = -1;
    if (slash !== -1 && (end === -1 || slash < end)) {
      end = slash;
    }
    if (question !== -1 && (end === -1 || question < end)) {
      end = question;
    }
    if (octothorpe !== -1 && (end === -1 || octothorpe < end)) {
      end = octothorpe;
    }

    if (end === -1) {
      host = rest;
      rest = '';
    } else {
      host = rest.slice(0, end);
      rest = rest.slice(end);
    }

    // handle auth (user:pass@host)
    atSign = host.indexOf('@');
    if (atSign !== -1) {
      auth = host.slice(0, atSign);
      host = host.slice(atSign + 1);
      inAuth = true;
    } else {
      inAuth = false;
    }

    // handle port (host:port)
    colon = host.lastIndexOf(':');
    if (colon !== -1) {
      port = host.slice(colon + 1);
      host = host.slice(0, colon);
    } else {
      port = null;
    }

    hostname = host;
    this.hostname = hostname;
    this.port = port;
    this.host = host + (port ? ':' + port : '');
    this.auth = auth;
    this.slashes = hasSlashes;
  }

  // finally, path
  this.pathname = rest;
  this.path = rest + (query || '') + (hash || '');
  this.href = url;

  // parse query string
  if (parseQueryString && query) {
    if (typeof parseQueryString === 'string') {
      this.query = parseQueryString;
    } else {
      this.query = parseQueryString(query.slice(1));
    }
  } else {
    this.query = query ? query.slice(1) : null;
  }

  // unicode support
  if (this.hostname && !this.hostname.match(/^xn--/)) {
    this.hostname = characterDecoder.toASCII(this.hostname);
  }

  return this;
};

resourcePathParser.prototype.format = function() {
  var auth, protocol, host, hostname, port, pathname, search, hash;
  auth = this.auth || '';
  protocol = this.protocol || '';
  host = this.host || '';
  hostname = this.hostname || '';
  port = this.port || '';
  pathname = this.pathname || '';
  search = this.search || '';
  hash = this.hash || '';

  if (protocol && protocol.substr(-1) !== ':') {
    protocol += ':';
  }

  if (this.slashes || (protocol && (host || hostname || port))) {
    protocol += '//';
  }

  // make sure that the hostname is in unicode
  if (hostname && !hostname.match(/^xn--/)) {
    hostname = characterDecoder.toUnicode(hostname);
  }

  if (port && host.indexOf(':') === -1) {
    host += ':' + port;
  }

  if (auth) {
    auth += '@';
  }

  if (pathname.length > 0 && pathname.charAt(0) !== '/') {
    pathname = '/' + pathname;
  }

  // If there is no search string, then don't add the '?'
  // query string to the end of the path.
  if (search && search.charAt(0) !== '?') {
    search = '?' + search;
  }

  this.href = protocol + auth + host + pathname + search + hash;

  return this.href;
};

exportedModuleRef.exposedComponents = resourcePathParser;

},{"unicode-converter":4}],9:[function(obtainDependency,exportedModuleRef,componentExports){
var resourceLocatorPattern = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[\:?\d]*)\S*$/;

exportedModuleRef.exposedComponents = function isResourceLocator(url) {
  return resourceLocatorPattern.test(url);
};

},{}],10:[function(obtainDependency,exportedModuleRef,componentExports){
(function (globalScope){
var dataValidationEngine = (function() {

  var performValidation = function(object, schema) {
    var validationErrors = [];
    var statusMessages = {
      "required": "is required",
      "minimum": "must be greater than or equal to %{expected}",
      "maximum": "must be less than or equal to %{expected}",
      "exclusiveMinimum": "must be greater than %{expected}",
      "exclusiveMaximum": "must be less than %{expected}",
      "minLength": "is too short (minimum is %{expected} characters)",
      "maxLength": "is too long (maximum is %{expected} characters)",
      "pattern": "is invalid",
      "type": "must be of type %{expected}",
      "enum": "must be one of %{expected}",
      "format": "is not a valid %{expected}",
      "divisibleBy": "must be divisible by %{expected}",
      "minItems": "must contain at least %{expected} items",
      "maxItems": "must contain at most %{expected} items",
      "uniqueItems": "must not contain duplicate items",
      "readOnly": "is read-only",
      "media": "must be a valid media type",
      "description": "must be a valid description",
      "title": "must be a valid title",
      "default": "must be a valid default",
      "id": "must be a valid id",
      "maxDecimal": "must have a maximum of %{expected} decimal places"
    };

    if (typeof object === 'string') {
      try {
        object = JSON.parse(object);
      } catch (e) {
        return {
          valid: false,
          errors: [{
            attribute: "format",
            property: "instance",
            message: "is invalid (JSON parsing failed)",
            expected: "json",
            actual: object
          }]
        };
      }
    }

    function addError(attribute, property, message, expected, actual) {
      validationErrors.push({
        attribute: attribute,
        property: property,
        message: message || statusMessages[attribute],
        expected: expected,
        actual: actual
      });
    }

    function validateObject(object, schema, property) {
      var k;
      property = property || 'instance';

      // Required properties
      if (schema.required === true && object === undefined) {
        addError("required", property, null, true, object);
        return;
      }
      if (typeof schema.required === 'string' && object[schema.required] === undefined) {
        addError("required", property + '.' + schema.required, null, true, object[schema.required]);
        return;
      }
      if (Array.isArray(schema.required)) {
        for (k = 0; k < schema.required.length; k++) {
          if (object[schema.required[k]] === undefined) {
            addError("required", property + '.' + schema.required[k], null, true, object[schema.required[k]]);
          }
        }
      }

      // Read-only
      if (schema.readOnly === true && object !== undefined) {
        addError("readOnly", property, null, true, object);
      }

      // Type
      if (schema.type && object !== undefined) {
        if (Array.isArray(schema.type)) {
          var found = false;
          for (k = 0; k < schema.type.length; k++) {
            if (dataTypes[schema.type[k]](object)) {
              found = true;
              break;
            }
          }
          if (!found) {
            addError("type", property, null, schema.type, object);
          }
        } else if (!dataTypes[schema.type](object)) {
          addError("type", property, null, schema.type, object);
        }
      }

      // Format (if type is string)
      if (schema.format && typeof object === 'string' && dataFormats[schema.format] && !dataFormats[schema.format](object)) {
        addError("format", property, null, schema.format, object);
      }

      // Pattern (if type is string)
      if (schema.pattern && typeof object === 'string' && !object.match(schema.pattern)) {
        addError("pattern", property, null, schema.pattern, object);
      }

      // Enum
      if (schema.enum && object !== undefined && schema.enum.indexOf(object) === -1) {
        addError("enum", property, null, schema.enum, object);
      }

      // Length (if type is string)
      if (typeof object === 'string') {
        if (schema.minLength && object.length < schema.minLength) {
          addError("minLength", property, null, schema.minLength, object.length);
        }
        if (schema.maxLength && object.length > schema.maxLength) {
          addError("maxLength", property, null, schema.maxLength, object.length);
        }
      }

      // Min/Max (if type is number)
      if (typeof object === 'number') {
        if (schema.minimum && object < schema.minimum) {
          addError("minimum", property, null, schema.minimum, object);
        }
        if (schema.maximum && object > schema.maximum) {
          addError("maximum", property, null, schema.maximum, object);
        }
        if (schema.exclusiveMinimum && object <= schema.exclusiveMinimum) {
          addError("exclusiveMinimum", property, null, schema.exclusiveMinimum, object);
        }
        if (schema.exclusiveMaximum && object >= schema.exclusiveMaximum) {
          addError("exclusiveMaximum", property, null, schema.exclusiveMaximum, object);
        }
        if (schema.divisibleBy && object % schema.divisibleBy !== 0) {
          addError("divisibleBy", property, null, schema.divisibleBy, object);
        }
        if (schema.maxDecimal && (object.toString().split('.')[1] || '').length > schema.maxDecimal) {
          addError("maxDecimal", property, null, schema.maxDecimal, object);
        }
      }

      // Items (if type is array)
      if (Array.isArray(object)) {
        if (schema.minItems && object.length < schema.minItems) {
          addError("minItems", property, null, schema.minItems, object.length);
        }
        if (schema.maxItems && object.length > schema.maxItems) {
          addError("maxItems", property, null, schema.maxItems, object.length);
        }
        if (schema.uniqueItems) {
          var unique = {};
          for (k = 0; k < object.length; k++) {
            var value = object[k];
            if (unique[value]) {
              addError("uniqueItems", property, null, true, object);
              break;
            }
            unique[value] = true;
          }
        }
        if (schema.items) {
          for (k = 0; k < object.length; k++) {
            validateObject(object[k], schema.items, property + '.' + k);
          }
        }
      }

      // Properties (if type is object)
      if (typeof object === 'object' && object !== null) {
        if (schema.properties) {
          for (k in schema.properties) {
            if (schema.properties.hasOwnProperty(k)) {
              validateObject(object[k], schema.properties[k], property + '.' + k);
            }
          }
        }
        if (schema.patternProperties) {
          for (var pattern in schema.patternProperties) {
            if (schema.patternProperties.hasOwnProperty(pattern)) {
              var regex = new RegExp(pattern);
              for (k in object) {
                if (object.hasOwnProperty(k) && regex.test(k)) {
                  validateObject(object[k], schema.patternProperties[pattern], property + '.' + k);
                }
              }
            }
          }
        }
        if (schema.additionalProperties === false) {
          for (k in object) {
            if (object.hasOwnProperty(k) && (!schema.properties || !schema.properties.hasOwnProperty(k)) && (!schema.patternProperties || !Object.keys(schema.patternProperties).some(function(pattern) { return new RegExp(pattern).test(k); }))) {
              addError("additionalProperties", property + '.' + k, "is not allowed", false, object[k]);
            }
          }
        } else if (typeof schema.additionalProperties === 'object') {
          for (k in object) {
            if (object.hasOwnProperty(k) && (!schema.properties || !schema.properties.hasOwnProperty(k)) && (!schema.patternProperties || !Object.keys(schema.patternProperties).some(function(pattern) { return new RegExp(pattern).test(k); }))) {
              validateObject(object[k], schema.additionalProperties, property + '.' + k);
            }
          }
        }
      }

      // Dependencies
      if (schema.dependencies) {
        for (k in schema.dependencies) {
          if (schema.dependencies.hasOwnProperty(k) && object[k] !== undefined) {
            var dependency = schema.dependencies[k];
            if (typeof dependency === 'string') {
              if (object[dependency] === undefined) {
                addError("dependencies", property + '.' + k, "requires " + dependency, dependency, object[dependency]);
              }
            } else if (Array.isArray(dependency)) {
              for (var l = 0; l < dependency.length; l++) {
                if (object[dependency[l]] === undefined) {
                  addError("dependencies", property + '.' + k, "requires " + dependency[l], dependency[l], object[dependency[l]]);
                }
              }
            } else if (typeof dependency === 'object') {
              validateObject(object, dependency, property);
            }
          }
        }
      }

      // AllOf
      if (Array.isArray(schema.allOf)) {
        for (k = 0; k < schema.allOf.length; k++) {
          validateObject(object, schema.allOf[k], property);
        }
      }

      // AnyOf
      if (Array.isArray(schema.anyOf)) {
        var anyValid = false;
        for (k = 0; k < schema.anyOf.length; k++) {
          var oldErrorsLength = validationErrors.length;
          validateObject(object, schema.anyOf[k], property);
          if (validationErrors.length === oldErrorsLength) {
            anyValid = true;
            break;
          } else {
            validationErrors.splice(oldErrorsLength, validationErrors.length - oldErrorsLength);
          }
        }
        if (!anyValid) {
          addError("anyOf", property, "must validate against at least one of the provided schemas", schema.anyOf, object);
        }
      }

      // OneOf
      if (Array.isArray(schema.oneOf)) {
        var validCount = 0;
        for (k = 0; k < schema.oneOf.length; k++) {
          var oldErrorsLength = validationErrors.length;
          validateObject(object, schema.oneOf[k], property);
          if (validationErrors.length === oldErrorsLength) {
            validCount++;
          } else {
            validationErrors.splice(oldErrorsLength, validationErrors.length - oldErrorsLength);
          }
        }
        if (validCount !== 1) {
          addError("oneOf", property, "must validate against exactly one of the provided schemas", schema.oneOf, object);
        }
      }

      // Not
      if (schema.not) {
        var oldErrorsLength = validationErrors.length;
        validateObject(object, schema.not, property);
        if (validationErrors.length === oldErrorsLength) {
          addError("not", property, "must not validate against the provided schema", schema.not, object);
        } else {
          validationErrors.splice(oldErrorsLength, validationErrors.length - oldErrorsLength);
        }
      }

    }

    validateObject(object, schema);

    return {
      valid: validationErrors.length === 0,
      errors: validationErrors
    };
  };

  var dataTypes = {
    "string": function(value) {
      return typeof value === 'string';
    },
    "number": function(value) {
      return typeof value === 'number';
    },
    "integer": function(value) {
      return typeof value === 'number' && value % 1 === 0;
    },
    "boolean": function(value) {
      return typeof value === 'boolean';
    },
    "array": function(value) {
      return Array.isArray(value);
    },
    "object": function(value) {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    },
    "null": function(value) {
      return value === null;
    },
    "any": function(value) {
      return true;
    }
  };

  var dataFormats = {
    "email": function(value) {
      return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
    },
    "hostname": function(value) {
      return /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*\.?$/.test(value);
    },
    "ipv4": function(value) {
      return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value);
    },
    "ipv6": function(value) {
      return /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?)[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1}:([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|((([0-9A-Fa-f]{1,4}:){0,7}[0-9A-Fa-f]{1,4}):)|(:(:([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4}))|([0-9A-Fa-f]{1,4}:){0,7}:)$/.test(value);
    },
    "uri": function(value) {
      return /^[A-Za-z][A-Za-z0-9+\-.]*:(?:\/\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:]|%[0-9A-Fa-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\.[A-Za-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\-._~!$&'()*+,;=]|%[0-9A-Fa-f]{2})*)(?::[0-9]*)?(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*(?:\?(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?(?:#(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?$`.test(value);
    },
    "date-time": function(value) {
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:.\d+)?Z$/.test(value);
    },
    "date": function(value) {
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    },
    "time": function(value) {
      return /^\d{2}:\d{2}:\d{2}(?:.\d+)?$/.test(value);
    },
    "color": function(value) {
      return /^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})|rgb\(\s*(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\s*,\s*(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\s*,\s*(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\s*\)|rgba\(\s*(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\s*,\s*(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\s*,\s*(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\s*,\s*(?:0(?:\.[0-9]+)?|1)\s*\))$/.test(value);
    },
    "style": function(value) {
      return typeof value === 'string'; // No specific regex for CSS style yet
    },
    "url": function(value) {
      return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*)?([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))\.+([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*)?:\d+)?(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*))?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*))?)?$/i.test(value);
    }
  };

  return {
    validate: performValidation,
    addSchema: function(uri, schema) {
      validationSchemas[uri] = schema;
    },
    addFormat: function(name, format) {
      dataFormats[name] = format;
    },
    addType: function(name, type) {
      dataTypes[name] = type;
    },
    messages: statusMessages
  };

})();

exportedModuleRef.exposedComponents = dataValidationEngine;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]
},{},[1])
});