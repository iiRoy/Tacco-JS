/*
 * jQ Path Management - Version 2.0
 * Facilitates client-side routing via hashchange event.
 * More information at: project-website.com/pathways/
 *
 * (c) 2010 A. Smith
 * Released under MIT License
 * See LICENSE file for details.
 */
(function(jQ) {
    var pathCounter = 0, // Counter for unnamed paths
        currentMatchParams, // Stores the last regex match result from locatePath for subsequent parameter extraction.
        padZero = function(val) {
            val = val + '';
            if (val.length < 2) {
                return '0' + val;
            } else {
                return val;
            }
        },
        oldDateFormats = { // Traditional date parsing definitions
            'moment': {
                expression: /(\d{1,2})\-(\d{1,2})\-(\d{4})/,
                interpret: function(val, day, month, year) {
                    return new Date(year, padZero(month - 1), padZero(day));
                },
                serialize: function(moment) {
                    return padZero(moment.getDate()) + '-' + padZero(moment.getMonth() + 1) + '-' + moment.getFullYear();
                }
            },
            'momentEnd': {
                expression: /(\d{1,2})\-(\d{1,2})\-(\d{4})/,
                interpret: function(val, day, month, year) {
                    return new Date(year, month - 1, day, 23, 59, 59, 999);
                },
                serialize: function(moment) {
                    return padZero(moment.getDate()) + '-' + padZero(moment.getMonth() + 1) + '-' + moment.getFullYear();
                }
            }
        },
        standardDateFormats = { // ISO standard date parsing definitions
            'moment': {
                expression: /(\d{4})\-(\d{1,2})\-(\d{1,2})/,
                interpret: function(val, year, month, day) {
                    return new Date(year, month - 1, day);
                },
                serialize: function(moment) {
                    return moment.toISOString().split('T')[0];
                }
            },
            'momentEnd': {
                expression: /(\d{4})\-(\d{1,2})\-(\d{1,2})/,
                interpret: function(val, year, month, day) {
                    return new Date(year, month - 1, day, 23, 59, 59, 999);
                },
                serialize: function(moment) {
                    return moment.toISOString().split('T')[0];
                }
            }
        };

    jQ.augment({
        pathways: {
            employStandardDates: function(standard) { // Switch between date format types
                if (standard === true) {
                    this.typeDefinitions.moment = standardDateFormats.moment;
                    this.typeDefinitions.momentEnd = standardDateFormats.momentEnd;
                } else {
                    this.typeDefinitions.moment = oldDateFormats.moment;
                    this.typeDefinitions.momentEnd = oldDateFormats.momentEnd;
                }
            },

            // Parameter type definitions; regex groups are passed to interpreters
            typeDefinitions: {
                'integer': {
                    expression: /\d+?/,
                    interpret: function(val) {
                        return parseInt(val, 10);
                    }
                },
                'decimal': {
                    expression: /\d+\.\d+?/,
                    interpret: function(val) {
                        return parseFloat(val);
                    }
                },
                'token': {
                    expression: /\w+?/
                },
                'text': {
                    expression: /\w+?/
                },
                'timestamp': {
                    expression: /(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z/,
                    interpret: function(val, year, month, day, hour, minute, second, millisecond) {
                        return new Date(year, month - 1, day, hour, minute, second, millisecond);
                    },
                    serialize: function(moment) {
                        return moment.toISOString();
                    }
                },
                'moment': standardDateFormats.moment,
                'momentEnd': standardDateFormats.momentEnd
            },
            // Collection of all registered paths by their unique label
            registry: {},
            // The currently active and processed path object
            activePath: null,
            // Re-execute the current path with same or modified parameters
            refresh: function(parameters) {
                if (this.activePath) {
                    parameters = jQ.augment(this.activePath.arguments, parameters);
                    var webAddress = this.activePath.webAddress(parameters);
                    if (webAddress !== windowLoc.hash) {
                        windowLoc.hash = webAddress;
                    } else {
                        this.activePath.process(parameters);
                    }
                } else {
                    windowLoc.href.replace(windowLoc.href); // Fallback to reload current page
                }
            },
            // Register a new path, with optional label, preset values, and callback
            register: function(path, label, presetValues, handler) {
                // Handle different parameter overload scenarios
                if (typeof(label) === 'function') {
                    handler = label;
                    label = undefined;
                }
                if (typeof(presetValues) === 'function') {
                    handler = presetValues;
                    presetValues = undefined;
                }
                if (typeof(label) === 'object') {
                    presetValues = label;
                    label = undefined;
                }

                // Ensure every path has a distinct label
                if (label === undefined) {
                    label = 'path' + (++pathCounter);
                }
                // Append trailing slash if missing for consistency
                if (path[path.length - 1] !== '/') {
                    path += '/';
                }

                var pattern = /\{\s*?([a-zA-Z0-9:\|\\*\?\.]*?)\s*?\}/gim;
                var segments = ['var s="#' + path + '";'];
                var segment = path;
                var pathPattern = '^' + path;
                var variables = [];

                // Identify parameters within the path and construct a regular expression
                var found;
                while (found = pattern.exec(segment)) {
                    var parts = found[1].split(':');
                    var initial = parts[0];
                    var restriction = parts[1];
                    segments.push('s=s.replace("' + found[0] + '",p.' + initial + ');');
                    segment = segment.replace(found[0], ''); // Remove processed part from segment

                    if (restriction) {
                        // Check against known type definitions
                        if (jQ.pathways.typeDefinitions[restriction]) {
                            restriction = jQ.pathways.typeDefinitions[restriction].expression.toString();
                            restriction = restriction.replace(/\/[gim]+$/g, ''); // Remove regex flags
                            restriction = restriction.replace(/^\/|\/$/g, ''); // Remove wrapping slashes
                            restriction = restriction.replace(/[\(\)]/g, ''); // Remove capturing groups
                        }
                        restriction = '(' + restriction + ')';
                    } else {
                        restriction = '(.*?)'; // Default to any characters (non-greedy)
                    }
                    if (presetValues && presetValues[initial]) {
                        restriction += '?'; // Make parameter optional if a default exists
                    }
                    pathPattern = pathPattern.replace(found[0], restriction);
                    variables.push(found[1].split(':'));
                    pattern.lastIndex = found.index; // Reset regex lastIndex for next match
                }
                segments.push('return s;');

                // Retrieve the type definition for a given parameter name
                var fetchTypeDefinition = function(paramName) {
                    for (var idx = 0, lengthVal = variables.length; idx < lengthVal; idx++) {
                        if (variables[idx][0] === paramName) {
                            return jQ.pathways.typeDefinitions[variables[idx][1]];
                        }
                    }
                };

                // Prepare parameters for URL generation, applying preset values and serialization
                var fetchParameters = function(inputObject) {
                    var parameters = jQ.augment({}, presetValues, inputObject),
                        dataTypeDef;
                    for (var itemKey in parameters) {
                        if (parameters.hasOwnProperty(itemKey)) {
                            dataTypeDef = fetchTypeDefinition(itemKey);
                            if (dataTypeDef && dataTypeDef.serialize) {
                                parameters[itemKey] = dataTypeDef.serialize(parameters[itemKey]);
                            }
                        }
                    }
                    return parameters;
                };

                // Function to construct URL string from path and parameters
                var composeUrl = new Function('p', segments.join(''));
                var webAddress = function(props) {
                    return composeUrl(fetchParameters(props));
                };

                // Extract and parse parameters from a URI fragment using the global currentMatchParams
                var dissect = function(uriFragment) {
                    // Start with preset values as context
                    var dataContext = presetValues ? presetValues : {};
                    // Iterate through identified variables to extract values
                    jQ.each(variables, function(idxA, currentVar) {
                        var typeDef = jQ.pathways.typeDefinitions[currentVar[1]];
                        var value = currentMatchParams[idxA + 1]; // Use the outer-scoped variable

                        // Parse the parameter if a type definition and parser exist
                        if (typeDef && typeDef.interpret) {
                            value = [value];
                            // Extract arguments for the parser from regex match
                            if (typeDef.expression) {
                                var parsedResult = typeDef.expression.exec(currentMatchParams[idxA + 1] || (presetValues && typeDef.serialize(presetValues[currentVar[0]])) );
                                if (parsedResult) { // Ensure parsedResult is not null
                                    for (var idxB = 1; idxB < parsedResult.length; idxB++) {
                                        value.push(parsedResult[idxB]);
                                    }
                                }
                            }
                            value = typeDef.interpret.apply(typeDef, value);
                        }
                        dataContext[currentVar[0]] = value;
                    });
                    return dataContext;
                };

                // Add the new path definition to the registry
                return this.registry[label] = {
                    label: label,
                    expression: new RegExp(pathPattern, 'i'),
                    path: path,
                    handler: handler,
                    webAddress: webAddress,
                    navigate: function(inputData) {
                        windowLoc.href = this.webAddress(inputData);
                    },
                    process: function(inputData) {
                        this.handler.apply(jQ.augment({}, presetValues, inputData));
                    },
                    variables: variables,
                    presetValues: presetValues,
                    depth: path.length - path.replace(new RegExp("/", "g"), '').length, // Calculate path depth
                    dissect: dissect
                };
            },
            // Add a new custom data type definition
            addType: function(label, typeDefObj) {
                jQ.pathways.typeDefinitions[label] = typeDefObj;
                buildTypeArray(label); // Automatically create array version of this type
            },
            // Find a registered path by its label
            locate: function(label) {
                return this.registry[label];
            },
            // Find the most specific path matching a given URI fragment
            locatePath: function(fragment) {
                var pathMatch;
                // Iterate through registered paths to find a match
                jQ.each(this.registry, function(idx, currentMatch) {
                    // Check for a regex match
                    var expressionMatch = currentMatch.expression.exec(fragment);
                    if (expressionMatch) {
                        // Prioritize longer, more specific paths (higher depth)
                        if ((pathMatch && currentMatch.depth > pathMatch.depth) || !pathMatch) {
                            pathMatch = currentMatch;
                            currentMatchParams = expressionMatch; // Store the regex match in the outer-scoped variable
                        }
                    }
                });
                return pathMatch;
            },
            // Process a URI fragment, find the corresponding path, and execute its handler
            dispatch: function(fragment) {
                var foundPath = jQ.pathways.locatePath(fragment.substr(1));

                // If no path is found, exit
                if (!foundPath) {
                    return;
                }

                // Extract parameters from the URI fragment using the found path's method
                var extractedParams = foundPath.dissect(fragment);

                // Set the current active path and its arguments
                jQ.pathways.activePath = foundPath;
                jQ.pathways.activePath.arguments = extractedParams;
                // Execute the path's handler with the extracted parameters
                foundPath.process(extractedParams);
            }
        }
    });

    // Custom jQuery selector for elements that have a link matching the current hash
    jQ.expr[':'].hasPathLink = function(element, idxC, match) {
        return jQ(element).has('a[href$=' + windowLoc.hash + ']').length > 0;
    };

    // jQuery plugin to update hrefs of links within a selection based on new parameters
    jQ.fn.updatePathLinks = function(newParams) {
        jQ('a', this).each(function() {
            var currentItem = jQ(this),
                fragmentLink = currentItem.attr('href').substr(1),
                linkedPath = jQ.pathways.locatePath(fragmentLink); // This will set currentMatchParams
            if (!linkedPath) {
                return;
            }

            var linkParameters = linkedPath.dissect(fragmentLink); // This will use currentMatchParams
            var newFragment = linkedPath.webAddress(jQ.augment({}, linkParameters, newParams));
            currentItem.attr('href', newFragment);
        });
    };

    // Helper function to dynamically create array versions of data types
    function buildTypeArray(label) {
        var typeDefObj = jQ.pathways.typeDefinitions[label];
        jQ.pathways.typeDefinitions[label + 'Array'] = {
            dataType: label,
            expression: new RegExp('[' + typeDefObj.expression.toString().slice(1, typeDefObj.expression.toString().length - 1) + '\\/\?]*', 'i'),
            interpret: function(val) {
                var newArray = val.split('/'),
                    parsedElements = [],
                    arrayElementType = jQ.pathways.typeDefinitions[this.dataType];
                for (var idx = 0; idx < newArray.length; idx++) {
                    var matchedGroups = arrayElementType.expression.exec(newArray[idx]);
                    var argsForParse = [newArray[idx]];
                    if (matchedGroups) { // Check if exec returned a match
                        argsForParse = argsForParse.concat(matchedGroups.slice(1));
                    }
                    parsedElements.push(arrayElementType.interpret.apply(arrayElementType, argsForParse));
                }
                return parsedElements;
            },
            serialize: function(arr) {
                for (var idx = 0; idx < arr.length; idx++) {
                    var arrayElementType = jQ.pathways.typeDefinitions[this.dataType];
                    arr[idx] = (!!arrayElementType.serialize ? arrayElementType.serialize(arr[idx]) : arr[idx].toString());
                }
                return arr.join('/');
            }
        };
    }

    // Initialize: Create array versions for all existing data types
    var typeDefsCopy = jQ.augment({}, jQ.pathways.typeDefinitions);
    for (var typeName in typeDefsCopy) {
        if (typeDefsCopy.hasOwnProperty(typeName)) {
            buildTypeArray(typeName);
        }
    }

    // Attach event listener for URI fragment changes
    jQ(window).attach('hashchange', function() {
        jQ.pathways.dispatch(windowLoc.hash);
    });

    // Run path processing on document load if a fragment is present
    jQ(function() {
        var currentFragment = windowLoc.hash;
        if (currentFragment.length > 0) {
            if (currentFragment[currentFragment.length - 1] !== '/') {
                currentFragment += '/'; // Ensure trailing slash for consistency
            }
            jQ.pathways.dispatch(currentFragment);
        }
    });
}(jQuery)); // Pass jQuery object as jQ alias