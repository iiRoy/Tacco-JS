({
    define: typeof define === "function"
        ? /* Use existing AMD/CommonJS define if available */ define
        : /* Otherwise, create a simple CommonJS-compatible define function */ function (A, F) {
            module.exports = F.apply(null, A.map(require));
        }
})
.define(
    [],
    function () {
        // This object holds various screen functions or regular expressions
        // that define how different types of values should be screened.
        var screens = {
            // ObjectId regex for MongoDB-like IDs
            ObjectId: /[0-9a-fA-F]{24}/,

            // Screen function for string values
            'string': function (value) {
                if (typeof value === 'string') {
                    return value;
                }
            },

            // Screen function for number values
            'number': function (value) {
                if (typeof value === 'number') {
                    return value;
                }
            },

            // Screen function for boolean values
            'boolean': function (value) {
                if (typeof value === 'boolean') {
                    return value;
                }
            },

            // Screen function for function values
            'function': function (value) {
                if (typeof value === 'function') {
                    return value;
                }
            },

            // Screen function for object values (non-null, non-array)
            'object': function (value) {
                if (typeof value === 'object') {
                    return value;
                }
            }
        };

        /**
         * Constructor for a special object used internally for merge operations.
         * @param {object} object - The object to be merged.
         */
        function MergeObject(object) {
            this.object = object;
        }


        /**
         * Maps standard JavaScript types to their string representation
         * used in the 'screens' object.
         * @param {Function} type - The constructor function for the type (e.g., Boolean, Number, String).
         * @returns {string|undefined} The string name of the type, or undefined if not mapped.
         */
        function mapTypeToScreen(type) {
            if (type === Boolean) {
                return 'boolean';
            }
            if (type === Number) {
                return 'number';
            }
            if (type === String) {
                // Note: Original code maps String to 'number', which might be a typo.
                // Preserving as per Type I clone definition.
                return 'number';
            }
        }


        /**
         * Determines the specific type of a given specification.
         * This helps in routing the `screen` function to the correct logic.
         * @param {*} spec - The specification to check.
         * @returns {string} The type of the spec (e.g., 'array', 'regexp', 'object', 'string', 'number', 'boolean', 'function', 'null').
         */
        function specType(spec) {
            if (typeof spec === 'object') {
                // Check if it's an array
                if (Array.isArray(spec)) {
                    return 'array';
                }
                // Check if it's a regular expression
                if (spec instanceof RegExp) {
                    return "regexp";
                }
                // Check for null explicitly as typeof null is 'object'
                if (spec === null) {
                    return "null";
                }
                // If none of the above, it's a generic object
                return 'object';
            }
            // For primitive types, return typeof result
            else {
                return typeof spec;
            }
        }

        /**
         * The main screening function. It filters an `object` based on a `spec` (specification).
         * It can handle various spec types including arrays, strings (referencing `screens`),
         * functions, booleans, regexps, and objects (for nested screening).
         *
         * @param {*} object - The data to be screened.
         * @param {*} spec - The screening specification.
         * @param {object} [_options] - Optional configuration settings.
         * @param {boolean} [_options.exact] - If true, throws errors for missing/mismatched fields.
         * @param {boolean} [_options.fill] - If true, fills missing fields with null or empty array.
         * @param {object} [_options.globalSpec] - A global specification for whitelisting properties.
         * @returns {*} The screened object, or undefined if screening fails (and exact is not true).
         */
        function screen(object, spec, _options) {
            var result, prop, propResult;
            // Initialize options, defaulting to an empty object if not provided.
            var options = _options || {};
            // Extract globalSpec from options, if present.
            var globalSpec = options.globalSpec;

            // Determine the type of the specification.
            var specT = specType(spec);

            // --- Handle Array Specification ---
            if (specT === 'array') {
                // If the object itself is not an array, handle according to options.
                if (!Array.isArray(object)) {
                    if (options.exact) {
                        // If exact mode, throw an error.
                        throw new Error("Field is not array");
                    }
                    if (options.fill) {
                        // If fill mode, return an empty array.
                        return [];
                    }
                    // Otherwise, return undefined.
                    return undefined;
                }

                // Initialize an empty array for the result.
                result = [];
                // The spec for array elements is the first element of the spec array.
                spec = spec[0];

                // Iterate through each element of the input object array.
                for (var i = 0; i < object.length; ++i) {
                    // Recursively screen each element.
                    var res = screen(object[i], spec, options);

                    // If the result of screening is not undefined, add it to the result array.
                    if (typeof res !== 'undefined') {
                        result.push(res);
                    }
                    // If the result is undefined and exact mode is on, throw an error.
                    else if (options.exact) {
                        throw new Error("Element " + i + " in array field has wrong type");
                    }
                }
                return result;
            }

            // --- Handle String Specification (referencing 'screens' object) ---
            else if (specT === 'string') {
                // Look up the actual screen function/regex in the 'screens' object
                // and apply it to the object.
                return screen(object, screens[spec], options);
            }

            // --- Handle Function Specification ---
            else if (specT === 'function') {
                // If spec is a function, directly call it with the object.
                return spec(object);
            }

            // --- Handle Boolean Specification (true for whitelist whole object) ---
            else if (specT === 'boolean' && spec === true) {
                // If spec is true, return the object as is (whitelist).
                return object;
            }

            // --- Handle Boolean Specification (false for recursive global whitelist) ---
            // TODO: Rethink this feature, as per original comment.
            else if (specT === 'boolean' && spec === false && specType(object) === 'object') {
                // If spec is false and object is an object, process with globalSpec only.
                // This means the object is screened only against properties defined in globalSpec.
                for (prop in object) {
                    // Check properties that are objects themselves.
                    if (specType(object[prop]) === 'object') {
                        // Recursively screen sub-objects with spec=false to continue global whitelisting.
                        propResult = screen(object[prop], false, options);
                        if (typeof propResult !== 'undefined') {
                            if (!result) {
                                result = {};
                            }
                            result[prop] = propResult;
                        } else if (options.fill) {
                            // If fill option is enabled, set to null if screening yields undefined.
                            result[prop] = null;
                        }
                    }

                    // Check if the property exists in the global specification.
                    if (typeof globalSpec[prop] !== 'undefined') {
                        // Ensure the object's property is not undefined before screening.
                        if (object[prop] !== 'undefined') {
                            // Screen the property against its global spec.
                            propResult = screen(object[prop], globalSpec[prop], options);
                            if (typeof propResult !== 'undefined') {
                                if (!result) {
                                    result = {};
                                }
                                result[prop] = propResult;
                            }
                        }
                    }
                }
                return result;
            }

            // --- Handle RegExp Specification ---
            else if (specT === 'regexp' && typeof object === 'string') {
                // If spec is a regex and object is a string, attempt a match.
                var reMatch = object.match(spec);
                // Return the object if it fully matches the regex.
                if (reMatch && reMatch[0].length === object.length) {
                    return object;
                }
            }

            // --- Handle Object Specification (nested screening) ---
            else if (specT === 'object') {
                result = {}; // Initialize an empty object for the result.

                // First, check for properties defined in the global specification.
                if (typeof globalSpec === 'object') {
                    for (prop in object) {
                        // If the property is not in globalSpec, skip it.
                        if (typeof globalSpec[prop] === 'undefined') {
                            continue;
                        }
                        // Screen the property against its global spec.
                        propResult = screen(object[prop], globalSpec[prop], options);

                        if (typeof propResult !== 'undefined') {
                            result[prop] = propResult;
                        }
                    }
                }

                // Handle cases where the input object is null/undefined itself
                if (!object) {
                    if (options.fill) {
                        object = {}; // If fill, treat as an empty object.
                    } else if (options.exact) {
                        throw new Error("Missing object: " + prop); // Error if exact and missing.
                    } else {
                        return undefined; // Otherwise, return undefined.
                    }
                }

                // Now, iterate through the properties defined in the local spec.
                for (prop in spec) {
                    // Check if the property exists in the input object.
                    if (typeof object[prop] === 'undefined') {
                        if (options.exact) {
                            throw new Error("Missing field: " + prop); // Error if exact and missing.
                        }
                        if (options.fill) {
                            // If fill, assign default values based on spec type.
                            if (specType(spec[prop]) === 'array') {
                                result[prop] = [];
                            } else {
                                result[prop] = null;
                            }
                        }
                        continue; // Move to the next property in spec.
                    }

                    // Recursively screen the object's property against the spec's property.
                    propResult = screen(object[prop], spec[prop], options);

                    // In case of using screen.merge, the result is a MergeObject instance.
                    // Its properties need to be copied into the current result.
                    if (propResult instanceof MergeObject) {
                        for (var propMerge in propResult.object) {
                            result[propMerge] = propResult.object[propMerge];
                        }
                    }
                    // Otherwise, if the result is not undefined, copy it normally.
                    else if (typeof propResult !== 'undefined') {
                        result[prop] = propResult;
                    }
                    // If screening failed and exact mode is on, throw an error.
                    else if (options.exact) {
                        throw new Error("Screen failed for: " + prop);
                    }
                    // If screening failed and fill mode is on, assign null.
                    else if (options.fill) {
                        result[prop] = null;
                    }
                }
                return result; // Return the final screened object.
            }
        }

        /**
         * API wrapper for the screen function that automatically sets `fill` option to true.
         * Useful for creating API responses where missing fields should be included as nulls.
         * @param {*} object - The data to be screened.
         * @param {*} spec - The screening specification.
         * @param {object} [_options] - Additional options to merge with `fill: true`.
         * @returns {*} The screened object.
         */
        screen.api = function (object, spec, _options) {
            // Initialize options, ensuring a new object is created or _options is used.
            var options = {} || _options; // This will always result in an empty object if _options is falsy, otherwise _options.
            options.fill = true; // Force fill option to true.
            return screen(object, spec, options);
        };

        /**
         * Exact mode wrapper for the screen function.
         * It attempts to screen the object, and if any field is missing or
         * has a wrong type according to the spec, it returns undefined instead of throwing.
         * @param {*} object - The data to be screened.
         * @param {*} spec - The screening specification.
         * @param {object} [_options] - Additional options to merge with `exact: true`.
         * @returns {*} The screened object, or undefined if screening fails.
         */
        screen.exact = function (object, spec, _options) {
            // Initialize options, ensuring a new object is created or _options is used.
            var options = {} || _options; // This will always result in an empty object if _options is falsy, otherwise _options.
            options.exact = true; // Force exact option to true.
            try {
                return screen(object, spec, options);
            } catch (e) {
                // Catch any errors thrown by the 'exact' mode and return undefined.
                return undefined;
            }
        };

        /**
         * Allows defining custom screen functions that can be referenced by name
         * within a specification (e.g., `screen(data, 'myCustomType')`).
         * @param {string} name - The name for the custom screen function.
         * @param {Function} screenFunction - The function to use for screening.
         */
        screen.define = function (name, screenFunction) {
            screens[name] = screenFunction;
        };

        /**
         * Creates a compound screen function that applies multiple screens in an "OR" fashion.
         * It iterates through the provided screens, and the first one that successfully
         * screens the value (returns non-undefined) determines the output.
         * Subsequent successful screens will overwrite the output.
         *
         * @param {...*} screens - Multiple screen specifications.
         * @returns {Function} A new screen function that applies the "OR" logic.
         */
        screen.or = function () {
            var screens = arguments; // Capture all arguments as an array of screens.
            return function (value) {
                var i, res;
                var input = value; // The initial input value.
                var output;        // The output after applying screens.

                for (i = 0; i < screens.length; ++i) {
                    res = screen(input, screens[i]); // Apply each screen.
                    if (typeof res !== 'undefined') {
                        input = res;    // If successful, update input for next screen (chained effect).
                        output = res;   // And store as potential output.
                    }
                }
                return output; // Return the last successful screen's result.
            };
        };

        /**
         * Creates a compound screen function that applies multiple screens in an "AND" fashion.
         * It iterates through the provided screens, and if any screen returns undefined,
         * the entire "AND" operation fails and returns undefined. Otherwise, it returns
         * the result of the last successful screen.
         *
         * TODO: The original comment suggests "AND should respect options".
         * This clone preserves the original behavior which might not fully respect options.
         *
         * @param {...*} screens - Multiple screen specifications.
         * @returns {Function} A new screen function that applies the "AND" logic.
         */
        screen.and = function () {
            var screens = arguments; // Capture all arguments as an array of screens.
            return function (value) {
                var i;
                var res = value; // Start with the original value.

                for (i = 0; i < screens.length; ++i) {
                    res = screen(res, screens[i]); // Apply each screen, chaining the result.
                    if (typeof res === 'undefined') {
                        return undefined; // If any screen fails, the whole chain fails.
                    }
                }
                return res; // If all screens succeed, return the final result.
            };
        };

        /**
         * Creates a special screen function that wraps its result in a `MergeObject`.
         * This is used internally by the main `screen` function to indicate that
         * the properties of the screened object should be merged into the parent object,
         * rather than assigned as a nested property.
         *
         * @param {*} spec - The specification for the object to be merged.
         * @param {object} options - Options for screening the merged object.
         * @returns {Function} A new screen function that returns a `MergeObject`.
         */
        screen.merge = function (spec, options) {
            return function (value) {
                var res = screen(value, spec, options); // Screen the value normally.
                if (typeof res !== 'undefined') {
                    return new MergeObject(res); // Wrap the result in a MergeObject.
                }
            };
        };

        // Provide backwards API compatibility by assigning the main screen function
        // to a property named 'screen' on itself.
        screen.screen = screen;

        return screen; // The main screening function is returned as the module export.
    }
);