if (typeof jQuery === 'undefined') {
    throw new Error("Navigation Engine requires jQuery to be present.");
}

(function($) {
    // Internal counter for unnamed navigation paths
    let navigationCounter = 0;

    /**
     * Utility function to left-pad a single digit number with a leading zero.
     * @param {number|string} value - The numerical or string value to pad.
     * @returns {string} The padded string representation.
     */
    const padValue = (value) => {
        const strVal = String(value);
        return strVal.length < 2 ? '0' + strVal : strVal;
    };

    // Predefined date/time format definitions for legacy style (DD-MM-YYYY)
    const legacyDateTimeFormats = {
        'date': {
            pattern: /(\d{1,2})\-(\d{1,2})\-(\d{4})/,
            decode: function(fullMatch, dayVal, monthVal, yearVal) {
                // Note: Month is 0-indexed in JavaScript Date constructor
                return new Date(yearVal, padValue(Number(monthVal) - 1), padValue(dayVal));
            },
            encode: function(dateObj) {
                return `${padValue(dateObj.getDate())}-${padValue(dateObj.getMonth() + 1)}-${dateObj.getFullYear()}`;
            }
        },
        'dateend': {
            pattern: /(\d{1,2})\-(\d{1,2})\-(\d{4})/,
            decode: function(fullMatch, dayVal, monthVal, yearVal) {
                // Creates a date object set to the very last millisecond of the specified day
                return new Date(Number(yearVal), Number(monthVal) - 1, Number(dayVal), 23, 59, 59, 999);
            },
            encode: function(dateObj) {
                return `${padValue(dateObj.getDate())}-${padValue(dateObj.getMonth() + 1)}-${dateObj.getFullYear()}`;
            }
        }
    };

    // Predefined date/time format definitions for ISO 8601 style (YYYY-MM-DD)
    const isoDateTimeFormats = {
        'date': {
            pattern: /(\d{4})\-(\d{1,2})\-(\d{1,2})/,
            decode: function(fullMatch, yearVal, monthVal, dayVal) {
                return new Date(Number(yearVal), Number(monthVal) - 1, Number(dayVal));
            },
            encode: function(dateObj) {
                // Returns the date part of an ISO string (e.g., "YYYY-MM-DD")
                return dateObj.toISOString().split('T')[0];
            }
        },
        'dateend': {
            pattern: /(\d{4})\-(\d{1,2})\-(\d{1,2})/,
            decode: function(fullMatch, yearVal, monthVal, dayVal) {
                return new Date(Number(yearVal), Number(monthVal) - 1, Number(dayVal), 23, 59, 59, 999);
            },
            encode: function(dateObj) {
                return dateObj.toISOString().split('T')[0];
            }
        }
    };

    /**
     * Standardizes a hash fragment string by ensuring it starts with '#' and ends with '/'.
     * @param {string} hashFragment - The hash string to normalize.
     * @returns {string} The normalized hash string.
     */
    const normalizeHashFragment = (hashFragment) => {
        let normalized = hashFragment;
        if (!normalized.startsWith('#')) {
            normalized = '#' + normalized;
        }
        if (!normalized.endsWith('/')) {
            normalized += '/';
        }
        return normalized;
    };

    // Extend jQuery with our sophisticated navigation engine
    $.extend({
        navEngine: {
            // Internal flag to track the current date format preference
            _useIsoDates: true,
            // Optional callback for custom error handling
            _errorHandler: null,

            /**
             * Configures the preferred date format for path parameters.
             * @param {boolean} useIso - If true, ISO (YYYY-MM-DD) is used; otherwise, legacy (DD-MM-YYYY).
             */
            configureIsoDateHandling: function(useIso) {
                this._useIsoDates = !!useIso; // Ensure boolean value
                if (this._useIsoDates) {
                    this.paramTypeDefinitions.date = isoDateTimeFormats.date;
                    this.paramTypeDefinitions.dateend = isoDateTimeFormats.dateend;
                } else {
                    this.paramTypeDefinitions.date = legacyDateTimeFormats.date;
                    this.paramTypeDefinitions.dateend = legacyDateTimeFormats.dateend;
                }
            },

            /**
             * Assigns a custom error handler function for navigation-related issues.
             * @param {function(Error, string)} handler - Function to be called with an Error object and context string.
             */
            setErrorHandler: function(handler) {
                if (typeof handler === 'function') {
                    this._errorHandler = handler;
                } else {
                    console.warn("`setErrorHandler` expects a valid function as an argument.");
                    this._errorHandler = null;
                }
            },

            /**
             * Internal method to invoke the registered error handler or fall back to console logging.
             * @param {Error} errorObject - The error that occurred.
             * @param {string} contextDescription - A brief description of the operational context.
             */
            _handleError: function(errorObject, contextDescription) {
                if (this._errorHandler) {
                    this._errorHandler(errorObject, contextDescription);
                } else {
                    console.error(`Navigation Engine Critical Error in ${contextDescription}:`, errorObject);
                }
            },

            // Definitions for various parameter types (e.g., integer, float, word, date, datetime)
            paramTypeDefinitions: {
                'int': {
                    pattern: /\d+/, // Matches one or more digits
                    decode: function(val) {
                        return parseInt(val, 10);
                    }
                },
                'float': {
                    pattern: /\d+\.\d+/, // Matches digits, a dot, then more digits
                    decode: function(val) {
                        return parseFloat(val);
                    }
                },
                'word': {
                    pattern: /\w+/ // Matches one or more word characters (alphanumeric + underscore)
                },
                'string': {
                    pattern: /[^/]+/ // Matches any character except '/'
                },
                'datetime': {
                    pattern: /(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z/,
                    decode: function(fullMatch, yearVal, monthVal, dayVal, hourVal, minuteVal, secondVal, millisecondVal) {
                        // Month is 0-indexed in JS Date constructor
                        return new Date(Number(yearVal), Number(monthVal) - 1, Number(dayVal), Number(hourVal), Number(minuteVal), Number(secondVal), Number(millisecondVal));
                    },
                    encode: function(dateObj) {
                        return dateObj.toISOString();
                    }
                },
                // Default date types are initially set to ISO format
                'date': isoDateTimeFormats.date,
                'dateend': isoDateTimeFormats.dateend
            },

            // Central registry for all defined navigation paths, indexed by their alias
            registeredNavigations: {},

            // Reference to the navigation object that was last successfully executed
            activeNavigation: null,

            /**
             * Re-triggers the currently active navigation path, optionally with updated arguments.
             * If no active navigation, it attempts a page reload.
             * @param {Object} [newArguments] - Optional object of arguments to merge with current ones.
             */
            retriggerCurrent: function(newArguments) {
                if (!this.activeNavigation) {
                    console.warn("No active navigation to re-trigger; performing a full page reload.");
                    location.reload(); // Fallback to full reload
                    return;
                }

                // Combine existing and new arguments, prioritizing new ones
                const combinedArguments = Object.assign({}, this.activeNavigation.arguments, newArguments);
                const targetUrl = this.activeNavigation.generateUrl(combinedArguments);

                if (targetUrl !== location.hash) {
                    // If the URL changes, update the hash, which will automatically trigger the hashchange event
                    location.hash = targetUrl;
                } else {
                    // If the URL remains the same, manually execute the handler to reflect argument changes
                    this.activeNavigation.execute(combinedArguments);
                }
            },

            /**
             * Defines and registers a new navigation path and its corresponding handler function.
             * Supports flexible parameter signatures for alias, default arguments, and handler.
             *
             * @param {string} pathPattern - The URL pattern, e.g., "#/users/{id:int}/profile/"
             * @param {string|Object|Function} [aliasOrDefaultsOrHandler] - The alias (string), default arguments (object), or handler function.
             * @param {Object|Function} [defaultArgumentsOrHandler] - Default arguments (object) or handler function.
             * @param {Function} [handlerFunction] - The function to execute when this path matches.
             * @returns {Object|null} The newly registered navigation object, or null if registration fails.
             */
            registerNavigation: function(pathPattern, aliasOrDefaultsOrHandler, defaultArgumentsOrHandler, handlerFunction) {
                let navAlias, defaultArgs, actionFn;

                // Robust parameter overloading logic
                if (typeof aliasOrDefaultsOrHandler === 'function') {
                    actionFn = aliasOrDefaultsOrHandler;
                    navAlias = `navPath${++navigationCounter}`; // Generate unique alias
                    defaultArgs = {};
                } else if (typeof aliasOrDefaultsOrHandler === 'object') {
                    defaultArgs = aliasOrDefaultsOrHandler;
                    actionFn = defaultArgumentsOrHandler;
                    navAlias = `navPath${++navigationCounter}`;
                } else if (typeof aliasOrDefaultsOrHandler === 'string') {
                    navAlias = aliasOrDefaultsOrHandler;
                    if (typeof defaultArgumentsOrHandler === 'function') {
                        actionFn = defaultArgumentsOrHandler;
                        defaultArgs = {};
                    } else {
                        defaultArgs = defaultArgumentsOrHandler || {}; // Ensure defaultArgs is an object
                        actionFn = handlerFunction;
                    }
                } else {
                    // Fallback for minimum parameters
                    navAlias = `navPath${++navigationCounter}`;
                    defaultArgs = {};
                    actionFn = handlerFunction;
                }

                // Validate the presence of an action handler
                if (typeof actionFn !== 'function') {
                    this._handleError(new Error("A valid handler function is mandatory for navigation registration."), `registerNavigation(${pathPattern})`);
                    return null;
                }

                // Clean and normalize the path pattern for internal use
                let cleanPathPattern = pathPattern;
                if (!cleanPathPattern.endsWith('/')) {
                    cleanPathPattern += '/';
                }
                if (cleanPathPattern.startsWith('#')) {
                    cleanPathPattern = cleanPathPattern.substring(1); // Remove leading hash for internal regex
                }

                const segmentMatcher = /\{\s*?([a-zA-Z0-9:\|\*\?\.]*?)\s*?\}/g; // Regex to find parameter placeholders
                const urlConstructionSteps = ['let assembledUrl = "#' + cleanPathPattern + '";'];
                let currentPathSegment = cleanPathPattern;
                let pathRegexPattern = '^' + cleanPathPattern; // Start building the full regex pattern
                const parameterDefinitions = []; // Stores details of each parameter

                let matchResult;
                // Loop through the path pattern to identify and process all parameters
                while ((matchResult = segmentMatcher.exec(currentPathSegment)) !== null) {
                    const fullPlaceholder = matchResult[0]; // e.g., "{id:int}"
                    const paramInfo = matchResult[1];      // e.g., "id:int"
                    const partArray = paramInfo.split(':');
                    const paramName = partArray[0];
                    let typeConstraint = partArray[1]; // The specified data type (e.g., "int")

                    // Add a step to the URL construction function to replace this placeholder
                    urlConstructionSteps.push(`assembledUrl = assembledUrl.replace("${fullPlaceholder}", String(params['${paramName}']));`);
                    currentPathSegment = currentPathSegment.replace(fullPlaceholder, ''); // Remove the placeholder from the working segment

                    // Determine the regular expression for this parameter's type constraint
                    if (typeConstraint) {
                        const paramTypeDef = $.navEngine.paramTypeDefinitions[typeConstraint];
                        if (paramTypeDef && paramTypeDef.pattern instanceof RegExp) {
                            // Extract the source of the regex, remove flags, and ensure it's non-capturing if we don't want it to be
                            let constraintRegexString = paramTypeDef.pattern.source;
                            // Remove any existing start/end anchors or flags
                            constraintRegexString = constraintRegexString.replace(/^\^|\$$|[gim]+$/g, '');
                            // Wrap in a non-capturing group, unless it's already a group
                            typeConstraint = `(${constraintRegexString})`;
                        } else {
                            // Default to matching any non-slash characters if type is unknown or pattern is invalid
                            typeConstraint = '([^/]+)';
                            this._handleError(new Error(`Undefined or invalid parameter type '${typeConstraint}' for parameter '${paramName}'. Defaulting to string match.`), `registerNavigation(${pathPattern})`);
                        }
                    } else {
                        // If no type is specified, default to matching any characters until the next slash
                        typeConstraint = '([^/]+)';
                    }

                    // If a default value is provided, make the parameter optional in the regex
                    if (defaultArgs && Object.prototype.hasOwnProperty.call(defaultArgs, paramName)) {
                        typeConstraint += '?';
                    }
                    pathRegexPattern = pathRegexPattern.replace(fullPlaceholder, typeConstraint);
                    parameterDefinitions.push([paramName, partArray[1]]); // Store parameter name and its original type string
                    segmentMatcher.lastIndex = matchResult.index; // Reset regex lastIndex for correct subsequent matches
                }
                urlConstructionSteps.push('return assembledUrl;');

                /**
                 * Internal helper to find the type definition object for a given parameter name.
                 * @param {string} paramName - The name of the parameter.
                 * @returns {Object|null} The parameter type definition or null if not found.
                 */
                const resolveParameterType = (paramName) => {
                    const definition = parameterDefinitions.find(def => def[0] === paramName);
                    return definition ? $.navEngine.paramTypeDefinitions[definition[1]] : null;
                };

                /**
                 * Prepares arguments for URL generation by applying parameter type encoders.
                 * @param {Object} inputArgs - The arguments provided by the user.
                 * @returns {Object} Arguments with values encoded for URL.
                 */
                const prepareArgumentsForUrl = (inputArgs) => {
                    const combinedArgs = Object.assign({}, defaultArgs, inputArgs);
                    for (const key in combinedArgs) {
                        if (Object.prototype.hasOwnProperty.call(combinedArgs, key)) {
                            const paramTypeDef = resolveParameterType(key);
                            if (paramTypeDef && typeof paramTypeDef.encode === 'function') {
                                try {
                                    combinedArgs[key] = paramTypeDef.encode(combinedArgs[key]);
                                } catch (e) {
                                    $.navEngine._handleError(e, `encoding parameter '${key}' for navigation '${navAlias}'`);
                                    // Optionally, handle specific encoding errors, e.g., by setting to null or a default
                                    combinedArgs[key] = String(combinedArgs[key]); // Fallback
                                }
                            } else if (combinedArgs[key] instanceof Date) {
                                // Fallback for Date objects if no specific encoder is available
                                combinedArgs[key] = combinedArgs[key].toISOString().split('T')[0];
                            } else if (typeof combinedArgs[key] !== 'string' && combinedArgs[key] !== null && combinedArgs[key] !== undefined) {
                                // Convert other non-string values to string
                                combinedArgs[key] = String(combinedArgs[key]);
                            }
                        }
                    }
                    return combinedArgs;
                };

                // Dynamically compile a function to construct the URL string from prepared parameters
                const constructUrlFromArgs = new Function('params', urlConstructionSteps.join('\n'));

                /**
                 * Generates the complete URL hash string for this navigation path using provided arguments.
                 * @param {Object} args - The arguments for the path parameters.
                 * @returns {string} The full URL hash.
                 */
                const generateUrl = (args) => {
                    return constructUrlFromArgs(prepareArgumentsForUrl(args));
                };

                /**
                 * Extracts and parses parameters from a matched hash fragment using the path's regex match segments.
                 * @param {Array<string>} hashMatchSegments - The array of matches returned by RegExp.exec().
                 * @returns {Object} An object containing the extracted and parsed parameters.
                 */
                const extractArgumentsFromHash = (hashMatchSegments) => {
                    const extractedParameters = Object.assign({}, defaultArgs); // Start with default arguments
                    parameterDefinitions.forEach((def, index) => {
                        const paramName = def[0];
                        const paramType = def[1];
                        const paramTypeDef = $.navEngine.paramTypeDefinitions[paramType];
                        let extractedValue = hashMatchSegments[index + 1]; // +1 because index 0 is the full match

                        // Only process if a non-empty value was actually matched for the parameter
                        if (extractedValue !== undefined && extractedValue !== '') {
                            if (paramTypeDef && typeof paramTypeDef.decode === 'function') {
                                let decoderArgs = [extractedValue];
                                // If the datatype has its own regex, re-execute it to get groups for its decoder function
                                if (paramTypeDef.pattern) {
                                    const tempMatch = paramTypeDef.pattern.exec(extractedValue);
                                    if (tempMatch) {
                                        decoderArgs = decoderArgs.concat(Array.from(tempMatch).slice(1));
                                    }
                                }
                                try {
                                    extractedValue = paramTypeDef.decode.apply(paramTypeDef, decoderArgs);
                                } catch (e) {
                                    $.navEngine._handleError(e, `decoding parameter '${paramName}' of type '${paramType}' from hash value '${extractedValue}'`);
                                    extractedValue = undefined; // Mark as undefined on parsing error
                                }
                            }
                            extractedParameters[paramName] = extractedValue;
                        }
                    });
                    return extractedParameters;
                };

                // Construct and store the new navigation object
                const newNavigation = {
                    alias: navAlias,
                    pathRegex: new RegExp(pathRegexPattern, 'i'), // Case-insensitive matching
                    originalPath: pathPattern,
                    actionHandler: actionFn,
                    generateUrl: generateUrl,
                    navigateTo: function(data) {
                        // Updates the browser's location hash, triggering the hashchange event if the URL differs
                        location.hash = this.generateUrl(data);
                    },
                    execute: function(data) {
                        // Executes the registered handler function with the combined arguments
                        try {
                             this.actionHandler.apply(Object.assign({}, defaultArgs, data));
                        } catch (e) {
                            $.navEngine._handleError(e, `executing handler for navigation alias '${navAlias}'`);
                        }
                    },
                    paramDefs: parameterDefinitions,
                    defaultArgs: defaultArgs,
                    // Calculate specificity: longer paths with more static segments are more specific
                    specificityLevel: cleanPathPattern.split('/').filter(segment => segment && !segment.includes('{')).length,
                    extract: extractArgumentsFromHash
                };

                return this.registeredNavigations[navAlias] = newNavigation;
            },

            /**
             * Adds a new custom parameter type definition to the engine.
             * @param {string} typeName - The unique name for the new parameter type (e.g., 'uuid').
             * @param {Object} typeDefinition - An object containing 'pattern' (RegExp), 'decode' (function), and optionally 'encode' (function).
             */
            addParameterType: function(typeName, typeDefinition) {
                if (!typeName || !typeDefinition || !(typeDefinition.pattern instanceof RegExp) || typeof typeDefinition.decode !== 'function') {
                    this._handleError(new Error("Invalid parameter type definition. Requires a name, a 'pattern' (RegExp), and a 'decode' (function)."), `addParameterType(${typeName})`);
                    return;
                }
                this.paramTypeDefinitions[typeName] = typeDefinition;
                // Automatically generate an array version for this new type
                generateArrayParamType(typeName);
            },

            /**
             * Retrieves a previously registered navigation path object by its alias.
             * @param {string} alias - The alias of the navigation path to retrieve.
             * @returns {Object|undefined} The navigation object, or undefined if not found.
             */
            retrieveNavigation: function(alias) {
                return this.registeredNavigations[alias];
            },

            /**
             * Determines the most specific matching navigation path for a given hash fragment.
             * @param {string} hashFragment - The hash fragment to match against (can include '#').
             * @returns {Object|undefined} The best matching navigation object, or undefined if no match.
             */
            matchNavigation: function(hashFragment) {
                let bestMatchNav = null;
                let matchedSegments = null;
                // Normalize the hash and remove the leading '#' for regex matching
                const normalizedHashWithoutPrefix = normalizeHashFragment(hashFragment).substring(1);

                // Iterate through all registered navigations to find the best match
                for (const alias in this.registeredNavigations) {
                    if (Object.prototype.hasOwnProperty.call(this.registeredNavigations, alias)) {
                        const currentNav = this.registeredNavigations[alias];
                        const matchExpression = currentNav.pathRegex.exec(normalizedHashWithoutPrefix);

                        if (matchExpression) {
                            // If it's the first match, or a more specific match (based on specificityLevel)
                            if (!bestMatchNav || currentNav.specificityLevel > bestMatchNav.specificityLevel) {
                                bestMatchNav = currentNav;
                                matchedSegments = matchExpression;
                            }
                        }
                    }
                }

                if (bestMatchNav) {
                    // Temporarily attach the raw regex match segments for parameter extraction
                    bestMatchNav.rawMatchSegments = matchedSegments;
                }
                return bestMatchNav;
            },

            /**
             * Processes a given location hash, finds the corresponding navigation path,
             * extracts its parameters, and executes the associated handler.
             * @param {string} currentHashFragment - The full hash fragment (e.g., "#/path/to/resource/").
             */
            processLocationHash: function(currentHashFragment) {
                const cleanHash = normalizeHashFragment(currentHashFragment);
                const matchedNav = $.navEngine.matchNavigation(cleanHash);

                // If no navigation path is found, log an info message and clear active navigation
                if (!matchedNav) {
                    console.info(`No matching navigation path discovered for the hash: ${cleanHash}`);
                    this.activeNavigation = null; // Ensure no stale active navigation
                    return;
                }

                // Extract and parse parameters from the hash using the matched regex segments
                const extractedParameters = matchedNav.extract(matchedNav.rawMatchSegments);

                // Set the currently active navigation and its resolved arguments
                this.activeNavigation = matchedNav;
                this.activeNavigation.arguments = extractedParameters;

                // Execute the handler function for the matched navigation
                matchedNav.execute(extractedParameters);
            }
        }
    });

    // Custom jQuery selector to identify elements that link to the currently active navigation path
    $.expr[':'].hasActiveNav = function(element) {
        // Checks if the element contains an anchor tag whose href attribute matches the current location hash
        return $(element).has(`a[href$="${location.hash}"]`).length > 0;
    };

    /**
     * jQuery plugin to dynamically adjust the 'href' attributes of navigation links
     * within the selected elements, based on provided new parameters.
     * Useful for updating filtering or state in navigation menus.
     * @param {Object} newParams - An object containing parameters to apply to the links.
     * @returns {jQuery} The jQuery object for method chaining.
     */
    $.fn.adjustNavigationLinks = function(newParams) {
        // Iterate over all anchor tags found within the current jQuery selection
        $(this).find('a').each(function() {
            const linkElement = $(this);
            let linkHref = linkElement.attr('href');

            // Skip links that are not hash-based or have empty hrefs
            if (!linkHref || !linkHref.startsWith('#')) {
                return;
            }

            const normalizedLinkHash = normalizeHashFragment(linkHref); // Standardize the link's hash
            const matchedNav = $.navEngine.matchNavigation(normalizedLinkHash);

            if (!matchedNav) {
                // Optionally, log or handle links that don't match any registered navigation
                // console.warn(`No navigation path found for link: ${linkHref}`);
                return;
            }

            // Extract existing parameters from the link's href
            const existingLinkParams = matchedNav.extract(matchedNav.rawMatchSegments);
            // Merge existing and new parameters, with newParams taking precedence
            const combinedParams = Object.assign({}, existingLinkParams, newParams);
            // Generate the updated hash string and apply it to the link's href
            const updatedLinkHash = matchedNav.generateUrl(combinedParams);
            linkElement.attr('href', updatedLinkHash);
        });
        return this; // Allow jQuery method chaining
    };

    /**
     * Dynamically generates and registers an array-based parameter type
     * (e.g., 'intarray' from 'int') for handling lists of values in a path segment.
     * @param {string} baseTypeName - The name of the foundational parameter type (e.g., 'int', 'string').
     */
    function generateArrayParamType(baseTypeName) {
        const baseTypeDefinition = $.navEngine.paramTypeDefinitions[baseTypeName];
        if (!baseTypeDefinition) {
            $.navEngine._handleError(new Error(`Base parameter type '${baseTypeName}' not found for array type generation.`), "generateArrayParamType");
            return;
        }

        const arrayTypeName = `${baseTypeName}array`;
        // Create a regex pattern for the array type: sequence of base type values separated by '/'
        let basePatternSource = baseTypeDefinition.pattern.source;
        // Clean the base pattern source: remove start/end anchors, flags, and existing capturing groups
        basePatternSource = basePatternSource.replace(/^\^|\$|[gim]+$/g, '');
        basePatternSource = basePatternSource.replace(/[\(\)]/g, '');

        // The array pattern matches one or more base type segments, optionally separated by '/'
        const arrayPattern = new RegExp(`(?:${basePatternSource}(?:\\/|$))*`, 'i');

        $.navEngine.paramTypeDefinitions[arrayTypeName] = {
            baseType: baseTypeName,
            pattern: arrayPattern,
            decode: function(fullArrayString) {
                if (!fullArrayString) return [];
                // Split by '/' and filter out any empty segments
                const segments = fullArrayString.split('/').filter(s => s !== '');
                const resultArray = [];
                const typeDef = $.navEngine.paramTypeDefinitions[this.baseType];

                for (const segment of segments) {
                    let decoderArgs = [segment];
                    // If the base type has a pattern, re-execute it on the segment to get groups for its decoder
                    if (typeDef.pattern) {
                        const segmentMatch = typeDef.pattern.exec(segment);
                        if (segmentMatch) {
                            decoderArgs = decoderArgs.concat(Array.from(segmentMatch).slice(1));
                        }
                    }
                    try {
                        resultArray.push(typeDef.decode.apply(typeDef, decoderArgs));
                    } catch (e) {
                        $.navEngine._handleError(e, `decoding segment '${segment}' for array type '${arrayTypeName}'`);
                        resultArray.push(undefined); // Indicate a parsing failure for this specific segment
                    }
                }
                return resultArray;
            },
            encode: function(valueArray) {
                if (!Array.isArray(valueArray)) {
                    $.navEngine._handleError(new TypeError("Array parameter must be an array for encoding."), `encode array type '${arrayTypeName}'`);
                    return "";
                }
                const encodedSegments = [];
                const typeDef = $.navEngine.paramTypeDefinitions[this.baseType];

                for (const item of valueArray) {
                    if (typeDef && typeof typeDef.encode === 'function') {
                        encodedSegments.push(typeDef.encode(item));
                    } else if (item !== null && item !== undefined) {
                        encodedSegments.push(String(item)); // Fallback to string conversion
                    }
                }
                return encodedSegments.join('/');
            }
        };
    }

    // Initialize array-based parameter types for all initially defined types
    const existingParamTypeNames = Object.keys($.navEngine.paramTypeDefinitions);
    for (const typeName of existingParamTypeNames) {
        generateArrayParamType(typeName);
    }

    // Attach an event listener to the window's hashchange event
    $(window).on('hashchange', function() {
        $.navEngine.processLocationHash(location.hash);
    });

    // On document readiness, check for an initial hash and process it if present
    $(document).ready(function() {
        let initialHash = location.hash;
        if (initialHash) {
            $.navEngine.processLocationHash(initialHash);
        }
    });

    // Configure the navigation engine to use ISO date handling by default upon load
    $.navEngine.configureIsoDateHandling(true);

}(jQuery));