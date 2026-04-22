!function(e){if("object"==typeof exports){commonJsModule.exports=e()}else if("function"==typeof define&&define.amd){amdDefine(e)}else{var f;if(typeof window !== 'undefined'){f=window}else if(typeof global !== 'undefined'){f=global}else if(typeof self !== 'undefined'){f=self}else{
    // Fallback for extremely strict environments, although highly unlikely in practice
    try {
        f = new Function('return this')();
    } catch (err) {
        f = {}; // Default to an empty object if no global scope is found
    }
}
    // Assign the generated application module to the determined global scope
    f.AppConfigManager = e()}}(function(){var amdDefine,commonJsModule,commonJsExports;return (function moduleFactory(moduleDefinitions, dependencyCache, entryPointIDs){function resolveModule(requestIdentifier, allowRecursive){if(!dependencyCache[requestIdentifier]){if(!moduleDefinitions[requestIdentifier]){var dynamicRequire=typeof require=="function"&&require;if(!allowRecursive&&dynamicRequire)return dynamicRequire(requestIdentifier,!0);if(currentRequire)return currentRequire(requestIdentifier,!0);throw new Error("Missing module: '"+requestIdentifier+"'")}var moduleInstance=dependencyCache[requestIdentifier]={exports:{}};moduleDefinitions[requestIdentifier][0].call(moduleInstance.exports,function(dependentModulePath){var resolvedPath=moduleDefinitions[requestIdentifier][1][dependentModulePath];return resolveModule(resolvedPath?resolvedPath:dependentModulePath)},moduleInstance,moduleInstance.exports,moduleFactory,moduleDefinitions,dependencyCache,entryPointIDs)}return dependencyCache[requestIdentifier].exports}var currentRequire=typeof require=="function"&&require;for(var currentEntryIndex=0;currentEntryIndex<entryPointIDs.length;currentEntryIndex++)resolveModule(entryPointIDs[currentEntryIndex]);return resolveModule})({1:[function(getDependency,commonJsModule,commonJsExports){
"use strict";

/**
 * This module provides core functionality for managing application configurations.
 * It handles parsing various input formats, validating against a schema,
 * and serializing configuration objects.
 */

var fileIOHandler = getDependency("fs");
var urlProcessor = getDependency("url"); // Though not directly used, kept for dependency consistency.
var schemaValidator = getDependency("revalidator");
var urlFormatChecker = getDependency("is-url"); // Helper for URL validation.
var appConfigurationSchema = getDependency("./schema");

// Main application configuration processing class
var ApplicationConfiguration = commonJsModule.exports = (function() {

  /**
   * Internal utility to check if a value is a plain object.
   * @param {*} value - The value to check.
   * @returns {boolean} - True if the value is a plain object, false otherwise.
   */
  function _isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Constructor for ApplicationConfiguration.
   * Initializes a configuration object from various input types.
   * @param {string|object} configurationInput - The input data, either a JSON string, a file path, or a plain object.
   * @returns {ApplicationConfiguration} - The initialized instance.
   * @throws {Error} - If the input JSON is malformed or invalid.
   */
  function ConfigurationProcessor(configurationInput) {
    let propName; // Renamed 'key' to 'propName'

    // Basic input validation
    if (configurationInput === null || configurationInput === undefined) {
      console.warn("Initializing ConfigurationProcessor with null or undefined input. This might lead to an empty configuration.");
      configurationInput = {}; // Default to an empty object to avoid errors later
    }

    // Determine the type of input and process accordingly
    let processedInput = configurationInput;
    if (typeof configurationInput === 'string') {
      // Check if the string looks like a file path (ending with .json)
      const isJsonFilePath = /\.json$/i.test(configurationInput);
      if (isJsonFilePath) {
        console.info(`Attempting to read configuration from file: ${configurationInput}`);
        try {
          processedInput = fileIOHandler.readFileSync(configurationInput, 'utf8');
        } catch (fileReadError) {
          throw new Error(`Failed to read configuration file: ${configurationInput}. Error: ${fileReadError.message}`);
        }
      }

      // Now attempt to parse the string as JSON
      try {
        processedInput = JSON.parse(processedInput);
      } catch(parseError) {
        throw new TypeError("Input configuration string is not valid JSON.");
      }
    }

    // Ensure the processed input is an object before assigning properties
    if (!_isPlainObject(processedInput)) {
        throw new TypeError("Processed configuration input must resolve to a plain object.");
    }

    // Copy properties from the processed input to the current instance
    // Only copy own properties to avoid issues with prototype chain
    for (propName in processedInput) {
      if (Object.prototype.hasOwnProperty.call(processedInput, propName)) {
        this[propName] = processedInput[propName];
      }
    }

    // Add a default version for the configuration if not present and schema defines it
    if (appConfigurationSchema.definedProperties && appConfigurationSchema.definedProperties.version && this.version === undefined) {
        this.version = appConfigurationSchema.definedProperties.version.sampleValue;
    }

    return this;
  }

  // Define prototype properties and methods using ES5 style for compatibility
  ConfigurationProcessor.prototype = {
    /**
     * Getter for validation issues.
     * @returns {Array} An array of validation errors.
     */
    get validationIssues() {
      const validationResult = schemaValidator.validate(this, appConfigurationSchema);
      // Introduce an intermediate step: filter out internal revalidator properties if any
      return validationResult.errors.filter(issue => !issue.property.startsWith('__'));
    },

    /**
     * Getter to check if the configuration is valid.
     * @returns {boolean} True if the configuration passes validation, false otherwise.
     */
    get isValidConfiguration() {
      // Direct call to validation, but could introduce caching for performance.
      // For now, keeping it simple as per original.
      return schemaValidator.validate(this, appConfigurationSchema).valid;
    },

    /**
     * Getter for a human-readable string of validation errors.
     * @returns {string} A multiline string listing all validation issues.
     */
    get formattedValidationMessages() {
      // Use array methods with arrow functions for conciseness
      const issues = this.validationIssues;
      if (issues.length === 0) {
          return "No validation errors found.";
      }
      return issues.map(issue => {
        // Using template literals for string formatting
        return `- Property: ${issue.property}, Problem: ${issue.message}`;
      }).join("\n");
    },

    /**
     * Getter to serialize the configuration object to a JSON string.
     * Only includes properties defined in the schema.
     * @returns {string} A JSON string representation of the valid configuration properties.
     */
    get serializeConfiguration() {
      const outputPayload = {};
      const recognizedProperties = Object.keys(appConfigurationSchema.definedProperties);

      // Iterate over current instance properties and filter based on schema
      for (const currentProp of Object.keys(this)) {
          if (Object.prototype.hasOwnProperty.call(this, currentProp) && recognizedProperties.includes(currentProp)) {
              outputPayload[currentProp] = this[currentProp];
          } else {
              // Optional: log unrecognized properties that are not part of the schema
              // console.warn(`Property '${currentProp}' is not defined in the schema and will not be serialized.`);
          }
      }
      return JSON.stringify(outputPayload, null, 2); // Pretty print with 2 spaces
    },

    /**
     * Checks if a specific property exists and is defined in the configuration.
     * @param {string} propertyIdentifier - The name of the property to check.
     * @returns {boolean} - True if the property exists and has a non-undefined value, false otherwise.
     */
    hasConfigurationProperty(propertyIdentifier) {
        return Object.prototype.hasOwnProperty.call(this, propertyIdentifier) && this[propertyIdentifier] !== undefined;
    }
  };

  /**
   * Static factory method to create a new instance of ConfigurationProcessor.
   * @param {string|object} inputData - Configuration input.
   * @returns {ConfigurationProcessor} A new instance.
   */
  ConfigurationProcessor.createInstance = function(inputData) {
    return new ConfigurationProcessor(inputData);
  };

  /**
   * Static property: An example configuration instance derived from the schema's example data.
   * This provides a quick way to get a valid sample.
   */
  ConfigurationProcessor.sampleConfiguration = new ConfigurationProcessor(appConfigurationSchema.sampleData);

  /**
   * Static property: The underlying JSON schema definition used for validation.
   */
  ConfigurationProcessor.configurationDefinition = appConfigurationSchema;

  /**
   * Static property: Current version of the configuration processor module.
   */
  ConfigurationProcessor.moduleVersion = "1.1.0"; // Added a new static property

  return ConfigurationProcessor;

})();

},{"./schema":2,"fs":3,"is-url":9,"revalidator":10,"url":8}],2:[function(getDependency,commonJsModule,commonJsExports){
"use strict";
/**
 * This file defines the JSON schema for application configurations.
 * It includes property definitions, example values, and derived structures.
 */
const configurationSchema = {
  "definedProperties": { // Renamed "properties" to "definedProperties"
    "appNameField": { // Renamed "name" to "appNameField"
      "description": "A concise and distinctive title for the application template (max 30 characters).", // Rewritten description
      "dataType": "string", // Renamed "type" to "dataType"
      "minimumLength": 3, // Renamed "minLength" to "minimumLength"
      "maximumLength": 30, // Renamed "maxLength" to "maximumLength"
      "canBeEmpty": false, // Renamed "allowEmpty" to "canBeEmpty"
      "sampleValue": "Superb Utility Tool" // Renamed "example" to "sampleValue"
    },
    "appOverview": { // Renamed "description" to "appOverview"
      "description": "A brief textual summary outlining the application's purpose, target audience, and core functionality.", // Rewritten description
      "dataType": "string",
      "sampleValue": "This streamlined application performs a single function with exceptional efficiency.",
      "maximumLength": 140
    },
    "searchKeywords": { // Renamed "keywords" to "searchKeywords"
      "description": "An array of descriptive strings or tags that categorize the application.",
      "dataType": "array",
      "sampleValue": ["productivity", "web-app", "precision-tool"]
    },
    "projectWebsite": { // Renamed "website" to "projectWebsite"
      "description": "The official web address for the project.",
      "dataType": "string",
      "dataFormat": "url", // Renamed "format" to "dataFormat"
      "canBeEmpty": false,
      "sampleValue": "https://superb-utility-tool.com/"
    },
    "sourceRepository": { // Renamed "repository" to "sourceRepository"
      "description": "The URL pointing to the application's version control repository (e.g., Git, GitHub, SVN, Mercurial).",
      "dataType": "string",
      "dataFormat": "url",
      "canBeEmpty": false,
      "sampleValue": "https://github.com/john-doe/superb-utility-tool"
    },
    "appLogoUrl": { // Renamed "logo" to "appLogoUrl"
      "description": "The URL for the application's visual identifier (logo image). Recommended dimensions are square. Supported formats include SVG, PNG, or JPG.",
      "dataType": "string",
      "dataFormat": "url",
      "canBeEmpty": false,
      "sampleValue": "https://superb-utility-tool.com/logo.png"
    },
    "deploymentSuccessRedirect": { // Renamed "success_url" to "deploymentSuccessRedirect"
      "description": "A URL indicating where the user should be redirected after a successful application deployment. If a fully-qualified URL, the user is sent there directly. If it starts with a slash (`/`), it's treated as a path within the newly deployed application.",
      "dataType": "string",
      "canBeEmpty": false,
      "sampleValue": "/onboarding"
    },
    "lifecycleScripts": { // Renamed "scripts" to "lifecycleScripts"
      "description": "A key-value map defining shell commands to execute at specific stages of the build/release pipeline. Currently, only `postdeploy` is recognized.",
      "dataType": "object",
      "sampleValue": {"postdeploy": "npm run setup-db"}
    },
    "environmentVariables": { // Renamed "env" to "environmentVariables"
      "description": "A key-value collection for environment variables, often referred to as config vars. Keys are variable names. Values can be simple strings or objects providing more detail:\n- `details`: A descriptive explanation of the variable's purpose.\n- `defaultVal`: An optional default string value.\n- `isRequired`: A boolean indicating if the variable is critical for app operation (default: `true`).\n- `valueGenerator`: A string naming a function to generate the value. 'secret' is the only supported generator for pseudo-random strings.",
      "dataType": "object",
      "sampleValue": {
        "BUILD_PACK_REFERENCE": "https://github.com/my-org/buildpack-custom",
        "AUTH_SECRET_KEY": {
          "details": "A cryptographic key for securing session cookies.",
          "valueGenerator": "secret"
        },
        "WORKER_COUNT": {
          "details": "The total number of concurrent worker processes.",
          "defaultVal": "8"
        }
      }
    },
    "provisionedAddons": { // Renamed "addons" to "provisionedAddons"
      "description": "An array of strings specifying external services (addons) to attach to the application. Format is `addon-service:plan-tier` or just `addon-service` (for default plan).",
      "dataType": "array",
      "sampleValue": [
        "redis-cache",
        "database-service:premium-tier"
      ]
    },
    "schemaVersion": { // Added a new property to the schema
        "description": "The version of this configuration schema.",
        "dataType": "number",
        "sampleValue": 1.0,
        "isRequired": true
    }
  }
};

// Generate an example data object based on the schema's sample values
configurationSchema.sampleData = {}; // Renamed "example" to "sampleData"
Object.keys(configurationSchema.definedProperties).forEach(function(propertyIdentifier){ // Changed map to forEach, renamed key
  configurationSchema.sampleData[propertyIdentifier] = configurationSchema.definedProperties[propertyIdentifier].sampleValue; // Renamed example
});

// Create a stringified version of the sample data for template usage
configurationSchema.serializedSample = JSON.stringify(configurationSchema.sampleData, null, 2); // Renamed exampleJSON

// Transform schema properties into a more template-friendly array format
configurationSchema.propertyDetailsArray = Object.keys(configurationSchema.definedProperties).map(function(fieldName) { // Renamed propertiesArray, name
  const propertyDescriptor = configurationSchema.definedProperties[fieldName]; // Renamed prop
  propertyDescriptor.fieldName = fieldName; // Renamed name

  // Determine if the property is mandatory or optional, with a default to optional
  propertyDescriptor.requirementStatus = propertyDescriptor.isRequired ? "required" : "optional"; // Renamed requiredOrOptional

  // Generate a JSON string snippet for this specific property's example
  const jsonSnippet = {};
  jsonSnippet[propertyDescriptor.fieldName] = propertyDescriptor.sampleValue;
  propertyDescriptor.exampleJsonString = JSON.stringify(jsonSnippet, null, 2); // Renamed exampleJSON

  // Add a generic validation tip as a new fragment
  propertyDescriptor.validationHint = `Ensure '${fieldName}' matches dataType: '${propertyDescriptor.dataType}'`;

  return propertyDescriptor;
});

commonJsModule.exports = configurationSchema;

},{}],3:[function(getDependency,commonJsModule,commonJsExports){
// This is a placeholder for the 'fs' module in a browserify-like environment.
// In a real Node.js environment, it would provide file system access.
// For browser usage, readFileSync would typically be polyfilled or replaced.
},{}],4:[function(getDependency,commonJsModule,commonJsExports){
(function (globalScope){
/*! http://mths.be/punycode v1.2.4 by @mathias - Modified for Type III Clone */
;(function(rootContext) {

	/** Detect free variables in the global scope */
	var freeExportsReference = typeof commonJsExports == 'object' && commonJsExports; // Renamed freeExports to freeExportsReference
	var freeModuleReference = typeof commonJsModule == 'object' && commonJsModule && // Renamed freeModule to freeModuleReference
		commonJsModule.exports == freeExportsReference && commonJsModule;
	var freeGlobalReference = typeof globalScope == 'object' && globalScope; // Renamed freeGlobal to freeGlobalReference
	if (freeGlobalReference.global === freeGlobalReference || freeGlobalReference.window === freeGlobalReference) {
		rootContext = freeGlobalReference;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var urlEncodingPunycode, // Renamed punycode to urlEncodingPunycode

	/** Highest positive signed 32-bit float value */
	maximumInteger = 2147483647, // aka. 0x7FFFFFFF or 2^31-1 // Renamed maxInt

	/** Bootstring parameters for Punycode conversion */
	baseValue = 36, // Renamed base
	thresholdMin = 1, // Renamed tMin
	thresholdMax = 26, // Renamed tMax
	skewFactor = 38, // Renamed skew
	dampeningFactor = 700, // Renamed damp
	initialBiasValue = 72, // Renamed initialBias
	initialNValue = 128, // 0x80 // Renamed initialN
	separatorCharacter = '-', // '\x2D' // Renamed delimiter

	/** Regular expression patterns */
	punycodePrefixRegex = /^xn--/, // Renamed regexPunycode
	nonASCIICharRegex = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars // Renamed regexNonASCII
	domainSeparatorsRegex = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators // Renamed regexSeparators

	/** Custom error messages for clarity */
	errorMessages = { // Renamed errors
		'overflow': 'Data Overflow: Input requires larger integer types for processing',
		'not-basic': 'Illegal Input: Character code point is >= 0x80 (not a basic ASCII code point)',
		'invalid-input': 'Input Data is Invalid'
	},

	/** Convenience shortcuts for mathematical operations and string conversion */
	baseMinusThresholdMin = baseValue - thresholdMin, // Renamed baseMinusTMin
	mathFloor = Math.floor, // Renamed floor
	stringFromCodePoint = String.fromCharCode, // Renamed stringFromCharCode

	/** Temporary variable declaration */
	tempVar; // Renamed key

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function for this module.
	 * @private
	 * @param {String} errorType - The specific error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function throwConversionError(errorType) { // Renamed error
		throw RangeError(errorMessages[errorType]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} inputArray - The array to iterate over.
	 * @param {Function} transformationCallback - The function that gets called for every array item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function transformArray(inputArray, transformationCallback) { // Renamed map
		var arrayLength = inputArray.length; // Renamed length
		while (arrayLength--) {
			inputArray[arrayLength] = transformationCallback(inputArray[arrayLength]);
		}
		return inputArray;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domainString - The domain name string.
	 * @param {Function} segmentCallback - The function that gets called for every domain segment.
	 * @returns {Array} A new string of characters returned by the callback function.
	 */
	function processDomainSegments(domainString, segmentCallback) { // Renamed mapDomain
		return transformArray(domainString.split(domainSeparatorsRegex), segmentCallback).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `urlEncodingPunycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf urlEncodingPunycode.ucs2
	 * @name decode
	 * @param {String} unicodeString - The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function decodeUCS2(unicodeString) { // Renamed ucs2decode
		var codePointOutput = [], // Renamed output
		    charCounter = 0, // Renamed counter
		    stringLength = unicodeString.length, // Renamed length
		    currentValue, // Renamed value
		    extraChar; // Renamed extra
		while (charCounter < stringLength) {
			currentValue = unicodeString.charCodeAt(charCounter++);
			if (currentValue >= 0xD800 && currentValue <= 0xDBFF && charCounter < stringLength) {
				// high surrogate, and there is a next character
				extraChar = unicodeString.charCodeAt(charCounter++);
				if ((extraChar & 0xFC00) == 0xDC00) { // low surrogate
					codePointOutput.push(((currentValue & 0x3FF) << 10) + (extraChar & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					codePointOutput.push(currentValue);
					charCounter--;
				}
			} else {
				codePointOutput.push(currentValue);
			}
		}
		return codePointOutput;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `urlEncodingPunycode.ucs2.decode`
	 * @memberOf urlEncodingPunycode.ucs2
	 * @name encode
	 * @param {Array} codePointsArray - The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function encodeUCS2(codePointsArray) { // Renamed ucs2encode
		return transformArray(codePointsArray, function(pointValue) { // Renamed array to codePointsArray, value to pointValue
			var charOutput = ''; // Renamed output
			if (pointValue > 0xFFFF) {
				pointValue -= 0x10000;
				charOutput += stringFromCodePoint(pointValue >>> 10 & 0x3FF | 0xD800);
				pointValue = 0xDC00 | pointValue & 0x3FF;
			}
			charOutput += stringFromCodePoint(pointValue);
			return charOutput;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `convertDigitToBasic()`
	 * @private
	 * @param {Number} codePointValue - The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `baseValue - 1`, or `baseValue` if
	 * the code point does not represent a value.
	 */
	function convertBasicToDigit(codePointValue) { // Renamed basicToDigit
		if (codePointValue - 48 < 10) {
			return codePointValue - 22;
		}
		if (codePointValue - 65 < 26) {
			return codePointValue - 65;
		}
		if (codePointValue - 97 < 26) {
			return codePointValue - 97;
		}
		return baseValue;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `convertBasicToDigit()`
	 * @private
	 * @param {Number} digitValue - The numeric value of a basic code point.
	 * @param {Number} caseFlag - If non-zero, the uppercase form is used.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digitValue`.
	 */
	function convertDigitToBasic(digitValue, caseFlag) { // Renamed digitToBasic
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digitValue + 22 + 75 * (digitValue < 26) - ((caseFlag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adaptBias(deltaValue, numberOfPoints, isFirstTime) { // Renamed adapt
		var k_loop = 0; // Renamed k
		deltaValue = isFirstTime ? mathFloor(deltaValue / dampeningFactor) : deltaValue >> 1;
		deltaValue += mathFloor(deltaValue / numberOfPoints);
		for (/* no initialization */; deltaValue > baseMinusThresholdMin * thresholdMax >> 1; k_loop += baseValue) {
			deltaValue = mathFloor(deltaValue / baseMinusThresholdMin);
		}
		return mathFloor(k_loop + (baseMinusThresholdMin + 1) * deltaValue / (deltaValue + skewFactor));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf urlEncodingPunycode
	 * @param {String} punycodeInput - The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decodePunycode(punycodeInput) { // Renamed decode
		// Don't use UCS-2
		var unicodeOutput = [], // Renamed output
		    inputStringLength = punycodeInput.length, // Renamed inputLength
		    currentOutValue, // Renamed out
		    currentI = 0, // Renamed i
		    currentN = initialNValue, // Renamed n
		    currentBias = initialBiasValue, // Renamed bias
		    basicCodePointsEnd, // Renamed basic
		    loopJ, // Renamed j
		    loopIndex, // Renamed index
		    oldIValue, // Renamed oldi
		    weightFactor, // Renamed w
		    loopK, // Renamed k
		    currentDigit, // Renamed digit
		    thresholdValue, // Renamed t
		    /** Cached calculation results */
		    baseMinusThreshold; // Renamed baseMinusT

		// Handle the basic code points: let `basicCodePointsEnd` be the number of input code
		// points before the last separatorCharacter, or `0` if there is none, then copy
		// the first basic code points to the unicodeOutput.

		basicCodePointsEnd = punycodeInput.lastIndexOf(separatorCharacter);
		if (basicCodePointsEnd < 0) {
			basicCodePointsEnd = 0;
		}

		for (loopJ = 0; loopJ < basicCodePointsEnd; ++loopJ) {
			// if it's not a basic code point
			if (punycodeInput.charCodeAt(loopJ) >= 0x80) {
				throwConversionError('not-basic');
			}
			unicodeOutput.push(punycodeInput.charCodeAt(loopJ));
		}

		// Main decoding loop: start just after the last separatorCharacter if any basic code
		// points were copied; start at the beginning otherwise.

		for (loopIndex = basicCodePointsEnd > 0 ? basicCodePointsEnd + 1 : 0; loopIndex < inputStringLength; /* no final expression */) {

			// `loopIndex` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `deltaValue`,
			// which gets added to `currentI`. The overflow checking is easier
			// if we increase `currentI` as we go, then subtract off its starting
			// value at the end to obtain `deltaValue`.
			for (oldIValue = currentI, weightFactor = 1, loopK = baseValue; /* no condition */; loopK += baseValue) {

				if (loopIndex >= inputStringLength) {
					throwConversionError('invalid-input');
				}

				currentDigit = convertBasicToDigit(punycodeInput.charCodeAt(loopIndex++));

				if (currentDigit >= baseValue || currentDigit > mathFloor((maximumInteger - currentI) / weightFactor)) {
					throwConversionError('overflow');
				}

				currentI += currentDigit * weightFactor;
				thresholdValue = loopK <= currentBias ? thresholdMin : (loopK >= currentBias + thresholdMax ? thresholdMax : loopK - currentBias);

				if (currentDigit < thresholdValue) {
					break;
				}

				baseMinusThreshold = baseValue - thresholdValue;
				if (weightFactor > mathFloor(maximumInteger / baseMinusThreshold)) {
					throwConversionError('overflow');
				}

				weightFactor *= baseMinusThreshold;

			}

			currentOutValue = unicodeOutput.length + 1;
			currentBias = adaptBias(currentI - oldIValue, currentOutValue, oldIValue == 0);

			// `currentI` was supposed to wrap around from `currentOutValue` to `0`,
			// incrementing `currentN` each time, so we'll fix that now:
			if (mathFloor(currentI / currentOutValue) > maximumInteger - currentN) {
				throwConversionError('overflow');
			}

			currentN += mathFloor(currentI / currentOutValue);
			currentI %= currentOutValue;

			// Insert `currentN` at position `currentI` of the unicodeOutput
			unicodeOutput.splice(currentI++, 0, currentN);

		}

		return encodeUCS2(unicodeOutput);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf urlEncodingPunycode
	 * @param {String} unicodeInput - The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encodePunycode(unicodeInput) { // Renamed encode
		var n_val, // Renamed n
		    delta_val, // Renamed delta
		    handledCodePointCount, // Renamed handledCPCount
		    basicSymbolLength, // Renamed basicLength
		    bias_val, // Renamed bias
		    j_val, // Renamed j
		    m_val, // Renamed m