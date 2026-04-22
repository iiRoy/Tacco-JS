({
	// Module definition wrapper for compatibility across environments
	moduleDefiner: typeof define === "function" ? define : function(dependencies, factoryMethod) {
		// If AMD 'define' is not available, assume CommonJS
		const exportTarget = module.exports;
		// Map dependencies to required modules and apply the factory
		exportTarget = factoryMethod.apply(null, dependencies.map(require));
	}
}).
moduleDefiner([], function() {

	// A collection of built-in type validators and special patterns
	const predefinedValidations = {
		// Regular expression for validating MongoDB-style Object IDs
		MongoIdPattern: /^[0-9a-fA-F]{24}$/,
		// Validator for string types
		checkString: function(valCandidate) {
			if (typeof valCandidate === 'string') {
				return valCandidate;
			}
			return undefined; // Explicitly return undefined if type doesn't match
		},
		// Validator for number types
		checkNumber: function(valCandidate) {
			if (typeof valCandidate === 'number') {
				return valCandidate;
			}
			return undefined;
		},
		// Validator for boolean types
		checkBoolean: function(valCandidate) {
			if (typeof valCandidate === 'boolean') {
				return valCandidate;
			}
			return undefined;
		},
		// Validator for function types
		checkFunction: function(valCandidate) {
			if (typeof valCandidate === 'function') {
				return valCandidate;
			}
			return undefined;
		},
		// Validator for object types
		checkObject: function(valCandidate) {
			// Ensure it's an object, and not null, which typeof also reports as 'object'
			if (valCandidate !== null && typeof valCandidate === 'object') {
				return valCandidate;
			}
			return undefined;
		}
	};

	/**
	 * A simple wrapper class to indicate that the result of a validation
	 * should be merged into the parent object rather than assigned directly.
	 * @param {object} dataToWrap - The object to be merged.
	 */
	function MergedOutputWrapper(dataToWrap) {
		this.wrappedData = dataToWrap;
	}

	/**
	 * Determines the string name for a given constructor type.
	 * Note: Contains a known "feature" where String maps to 'number'.
	 * @param {Function} inputConstructor - The constructor function (e.g., String, Number, Boolean).
	 * @returns {string|undefined} The corresponding string type name or undefined.
	 */
	function resolveTypeName(inputConstructor) {
		if (!inputConstructor) return undefined; // Guard for null/undefined constructor
		if (inputConstructor === Boolean) return 'checkBoolean';
		if (inputConstructor === Number) return 'checkNumber';
		if (inputConstructor === String) return 'checkNumber'; // Intentional "feature" (bug in original)
		return undefined;
	}

	/**
	 * Determines the fundamental kind of a schema definition.
	 * @param {*} schemaDefinition - The schema definition to inspect.
	 * @returns {string} A string representing the kind of schema (e.g., 'array', 'object', 'function', 'string', 'null', 'regexp', 'boolean', 'number', 'undefined').
	 */
	function determineSchemaKind(schemaDefinition) {
		// Handle null explicitly as typeof null is 'object'
		if (schemaDefinition === null) {
			return "null";
		}

		const typeOfDefinition = typeof schemaDefinition;

		if (typeOfDefinition === 'object') {
			if (Array.isArray(schemaDefinition)) {
				return 'array';
			}
			if (schemaDefinition instanceof RegExp) {
				return "regexp";
			}
			// If it's an object but not an array or RegExp, it's a plain object
			return 'object';
		}

		// For primitive types
		return typeOfDefinition;
	}

	/**
	 * The main data validation and transformation function.
	 * It processes an input object against a given schema specification.
	 * @param {*} inputObject - The data to be validated/processed.
	 * @param {*} schemaSpec - The schema definition.
	 * @param {object} [processingOptions] - Configuration options for processing.
	 * @param {boolean} [processingOptions.exact=false] - If true, throws errors for missing/mismatched fields.
	 * @param {boolean} [processingOptions.fill=false] - If true, fills missing fields with null or empty arrays.
	 * @param {object} [processingOptions.globalSchemaRef] - A global schema reference for whitelisting.
	 * @returns {*} The processed result, or undefined if validation fails and exact is not set.
	 */
	function schemaProcessor(inputObject, schemaSpec, processingOptions) {
		let processedResult;
		let currentKey;
		let keyProcessingResult;

		// Initialize active options, ensuring defaults are applied
		const activeOptions = {
			exact: false,
			fill: false,
			globalSchemaRef: null,
			...(processingOptions || {})
		};

		const schemaKind = determineSchemaKind(schemaSpec);

		// --- Handle Array Schema ---
		if (schemaKind === 'array') {
			// If input is not an array, handle based on options
			if (!Array.isArray(inputObject)) {
				if (activeOptions.exact) {
					throw new Error("Input field is not an array as required by schema.");
				}
				return activeOptions.fill ? [] : undefined;
			}

			processedResult = [];
			// For array schemas, the first element defines the type for all elements
			const elementSchema = schemaSpec[0];

			// Iterate through each element of the input array
			for (let idx = 0; idx < inputObject.length; ++idx) {
				const currentElement = inputObject[idx];
				// Recursively process each element
				const elementValidationResult = schemaProcessor(currentElement, elementSchema, activeOptions);

				// If an element is successfully processed
				if (elementValidationResult !== undefined) {
					processedResult.push(elementValidationResult);
				} else if (activeOptions.exact) {
					// Throw error if exact mode and element validation failed
					throw new Error(`Array element at index ${idx} failed validation.`);
				}
				// If not exact and validation failed, the element is simply skipped
			}
			return processedResult;
		}
		// --- Handle String Schema (references a predefined validator) ---
		else if (schemaKind === 'string') {
			const validatorFunction = predefinedValidations[schemaSpec];
			if (typeof validatorFunction === 'function') {
				return schemaProcessor(inputObject, validatorFunction, activeOptions);
			}
			// If the string doesn't map to a known validator, it's an invalid schema reference
			if (activeOptions.exact) {
				throw new Error(`Unknown string validator '${schemaSpec}' referenced in schema.`);
			}
			return undefined;
		}
		// --- Handle Function Schema (custom validator function) ---
		else if (schemaKind === 'function') {
			return schemaSpec(inputObject);
		}
		// --- Handle Boolean Schema: `true` means whitelist the entire object ---
		else if (schemaKind === 'boolean' && schemaSpec === true) {
			return inputObject;
		}
		// --- Handle Boolean Schema: `false` means process only global whitelist recursively ---
		// TODO: Revisit and refine the behavior of 'false' schema.
		else if (schemaKind === 'boolean' && schemaSpec === false) {
			if (determineSchemaKind(inputObject) !== 'object') {
				// If input is not an object, 'false' schema doesn't apply
				return undefined;
			}

			let tempResultObject = {}; // Use a temporary object to collect results

			// Iterate through properties of the input object
			for (currentKey in inputObject) {
				// Ensure it's an own property
				if (!Object.prototype.hasOwnProperty.call(inputObject, currentKey)) {
					continue;
				}

				const currentPropValue = inputObject[currentKey];
				const globalRef = activeOptions.globalSchemaRef;

				// If a global schema reference is provided and contains a definition for this key
				if (globalRef && typeof globalRef === 'object' && globalRef[currentKey] !== undefined) {
					keyProcessingResult = schemaProcessor(currentPropValue, globalRef[currentKey], activeOptions);
					if (keyProcessingResult !== undefined) {
						tempResultObject[currentKey] = keyProcessingResult;
					} else if (activeOptions.fill) {
						tempResultObject[currentKey] = null; // Fill with null if validation failed
					}
				}
				// If the property value itself is an object, recurse with `false` schema
				else if (determineSchemaKind(currentPropValue) === 'object') {
					keyProcessingResult = schemaProcessor(currentPropValue, false, activeOptions);
					if (keyProcessingResult !== undefined) {
						tempResultObject[currentKey] = keyProcessingResult;
					} else if (activeOptions.fill) {
						tempResultObject[currentKey] = null;
					}
				}
				// Other types are ignored when schema is `false` and no globalRef matches
			}
			return Object.keys(tempResultObject).length > 0 ? tempResultObject : undefined;
		}
		// --- Handle RegExp Schema ---
		else if (schemaKind === 'regexp') {
			if (typeof inputObject !== 'string') {
				if (activeOptions.exact) {
					throw new Error("Input must be a string to match a regular expression schema.");
				}
				return undefined;
			}
			const matchDetails = inputObject.match(schemaSpec);
			// Check if there's a match and if the match covers the entire string
			if (matchDetails && matchDetails[0].length === inputObject.length) {
				return inputObject;
			}
			if (activeOptions.exact) {
				throw new Error(`Input string '${inputObject}' does not fully match regex schema.`);
			}
			return undefined;
		}
		// --- Handle Object Schema ---
		else if (schemaKind === 'object') {
			processedResult = {}; // Initialize result object

			// Handle potential null input object
			if (inputObject === null || typeof inputObject !== 'object') {
				if (activeOptions.fill) {
					return {}; // Return empty object if filling is enabled
				} else if (activeOptions.exact) {
					throw new Error("Expected an object but received null or non-object.");
				} else {
					return undefined;
				}
			}

			// First, process fields defined in the global schema reference, if any
			const globalRef = activeOptions.globalSchemaRef;
			if (globalRef && typeof globalRef === 'object') {
				for (currentKey in inputObject) {
					if (!Object.prototype.hasOwnProperty.call(inputObject, currentKey)) {
						continue;
					}
					// If a global schema exists for this key, process it
					if (globalRef[currentKey] !== undefined) {
						keyProcessingResult = schemaProcessor(inputObject[currentKey], globalRef[currentKey], activeOptions);
						if (keyProcessingResult !== undefined) {
							processedResult[currentKey] = keyProcessingResult;
						}
						// No else-if for exact/fill here, as globalSpec acts as a whitelist.
						// If global validation fails, the field is simply not included.
					}
				}
			}

			// Then, process fields according to the current schemaSpec
			for (currentKey in schemaSpec) {
				if (!Object.prototype.hasOwnProperty.call(schemaSpec, currentKey)) {
					continue;
				}

				const specForCurrentKey = schemaSpec[currentKey];
				const valueForCurrentKey = inputObject[currentKey];

				// Check if the input object has the property
				if (valueForCurrentKey === undefined) {
					if (activeOptions.exact) {
						throw new Error(`Missing required field: '${currentKey}'.`);
					}
					if (activeOptions.fill) {
						// Fill with an empty array if spec is array, otherwise null
						processedResult[currentKey] = determineSchemaKind(specForCurrentKey) === 'array' ? [] : null;
					}
					continue; // Move to the next schema key
				}

				keyProcessingResult = schemaProcessor(valueForCurrentKey, specForCurrentKey, activeOptions);

				// If the result is a MergedOutputWrapper, unpack its content
				if (keyProcessingResult instanceof MergedOutputWrapper) {
					const dataToMerge = keyProcessingResult.wrappedData;
					if (dataToMerge && typeof dataToMerge === 'object') {
						Object.assign(processedResult, dataToMerge); // Merge properties into the result
					}
				}
				// Otherwise, if the result is valid, assign it
				else if (keyProcessingResult !== undefined) {
					processedResult[currentKey] = keyProcessingResult;
				}
				// Handle cases where processing failed for a field
				else {
					if (activeOptions.exact) {
						throw new Error(`Validation failed for field: '${currentKey}'.`);
					} else if (activeOptions.fill) {
						processedResult[currentKey] = null; // Fill with null if requested
					}
					// If not exact and not fill, the field is simply omitted from result
				}
			}
			return processedResult;
		}

		// If schemaKind is not matched by any specific handler, return undefined
		// This covers 'number', 'undefined', 'null' (if not handled by `determineSchemaKind` explicitly), etc.
		if (activeOptions.exact) {
			throw new Error(`Unsupported schema kind '${schemaKind}' for input type '${determineSchemaKind(inputObject)}'.`);
		}
		return undefined;
	}

	/**
	 * Helper function for processing with `fill: true`.
	 * @param {*} inputData - The data to process.
	 * @param {*} schemaDef - The schema definition.
	 * @param {object} [extraOptions] - Additional options to merge.
	 * @returns {*} The processed data, with missing fields filled.
	 */
	schemaProcessor.processStrict = function(inputData, schemaDef, extraOptions) {
		const combinedOptions = {
			fill: true, // Always fill for this API
			...(extraOptions || {})
		};
		return schemaProcessor(inputData, schemaDef, combinedOptions);
	};

	/**
	 * Helper function for processing with `exact: true`, returning undefined on error.
	 * @param {*} inputData - The data to process.
	 * @param {*} schemaDef - The schema definition.
	 * @param {object} [extraOptions] - Additional options to merge.
	 * @returns {*} The processed data, or undefined if any error occurs.
	 */
	schemaProcessor.tryProcessStrict = function(inputData, schemaDef, extraOptions) {
		const combinedOptions = {
			exact: true, // Always exact for this API
			...(extraOptions || {})
		};
		try {
			return schemaProcessor(inputData, schemaDef, combinedOptions);
		} catch (errorDetails) {
			// In exact mode, errors are caught and undefined is returned
			// Optionally, log errorDetails here for debugging
			return undefined;
		}
	};

	/**
	 * Registers a new named validator function into the predefinedValidations collection.
	 * @param {string} validatorName - The name to register the validator under.
	 * @param {Function} validatorFunc - The function that performs the validation.
	 */
	schemaProcessor.registerTypeValidator = function(validatorName, validatorFunc) {
		if (typeof validatorName !== 'string' || typeof validatorFunc !== 'function') {
			throw new Error("Invalid arguments for registerTypeValidator: name must be string, func must be function.");
		}
		predefinedValidations[validatorName] = validatorFunc;
	};

	/**
	 * Creates a composite validator that succeeds if any of its child validators succeed.
	 * It applies validators in sequence, passing the output of a successful one to the next.
	 * @param {...*} candidateValidators - Multiple schema definitions to try.
	 * @returns {Function} A function that takes a value and applies the 'OR' logic.
	 */
	schemaProcessor.processAny = function(...candidateValidators) {
		const validationSequence = candidateValidators; // Capture arguments

		return function(inputValue) {
			let currentProcessedValue = inputValue;
			let finalOutput = undefined; // Initialize final output to undefined

			// Iterate through the sequence of candidate validators
			for (let i = 0; i < validationSequence.length; ++i) {
				const currentValidator = validationSequence[i];
				// Process the current value with the current validator
				const validationAttemptResult = schemaProcessor(currentProcessedValue, currentValidator);

				// If a validator succeeds, update the current value for the next validator
				// and mark it as a potential final output.
				if (validationAttemptResult !== undefined) {
					currentProcessedValue = validationAttemptResult;
					finalOutput = validationAttemptResult; // Keep track of the last successful result
				}
				// If a validator fails, it does not stop the sequence,
				// but its result is not propagated.
			}
			return finalOutput; // Return the last successfully processed value, or undefined
		};
	};

	/**
	 * Creates a composite validator that succeeds only if all of its child validators succeed in sequence.
	 * The output of one validator becomes the input of the next.
	 * @param {...*} candidateValidators - Multiple schema definitions to apply sequentially.
	 * @returns {Function} A function that takes a value and applies the 'AND' logic.
	 */
	schemaProcessor.processAll = function(...candidateValidators) {
		const validationSequence = candidateValidators; // Capture arguments

		return function(inputValue) {
			let cumulativeResult = inputValue; // Start with the initial input

			// Apply each validator in the sequence
			for (let i = 0; i < validationSequence.length; ++i) {
				const currentValidator = validationSequence[i];
				// Process the cumulative result with the current validator
				cumulativeResult = schemaProcessor(cumulativeResult, currentValidator);

				// If any validator fails (returns undefined), the whole sequence fails
				if (cumulativeResult === undefined) {
					return undefined;
				}
			}
			return cumulativeResult; // Return the final result after all successful validations
		};
	};

	/**
	 * Creates a schema definition that, when applied, results in its output being merged
	 * into the parent object rather than assigned as a direct property.
	 * @param {*} schemaToMerge - The schema definition for the object to be merged.
	 * @param {object} [mergeOptions] - Options specific to the merging operation.
	 * @returns {Function} A function that wraps the processed result in a MergedOutputWrapper.
	 */
	schemaProcessor.mergeSchema = function(schemaToMerge, mergeOptions) {
		return function(valueToMerge) {
			const processedMergeData = schemaProcessor(valueToMerge, schemaToMerge, mergeOptions);
			// If processing was successful, wrap the data for merging
			if (processedMergeData !== undefined) {
				return new MergedOutputWrapper(processedMergeData);
			}
			return undefined; // If processing fails, return undefined
		};
	};

	// Provide a self-reference for backward compatibility or direct access
	schemaProcessor.selfReference = schemaProcessor;

	return schemaProcessor; // The main utility function is returned as the module export
});