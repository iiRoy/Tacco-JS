// UMD wrapper
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Abyssa=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// --- Start of Type IV Clone ---

// Helper functions (renamed and re-implemented)
var _globallyUndefined; // To avoid reusing UNDEF

function _findItemInArray(collection, soughtItem) {
    if (collection.indexOf) {
        return collection.indexOf(soughtItem);
    } else {
        var len = collection.length;
        while (len--) {
            if (collection[len] === soughtItem) {
                return len;
            }
        }
        return -1;
    }
}

function _removeItemFromArray(collection, itemToRemove) {
    var idx = _findItemInArray(collection, itemToRemove);
    if (idx !== -1) {
        collection.splice(idx, 1);
    }
}

function _isAnObjectOfType(value, typeName) {
    return '[object ' + typeName + ']' === Object.prototype.toString.call(value);
}

function _isRegexInstance(value) {
    return _isAnObjectOfType(value, 'RegExp');
}

function _isAnArray(value) {
    return _isAnObjectOfType(value, 'Array');
}

function _isAFunction(value) {
    return typeof value === 'function';
}

function _transformValue(val) {
    var result;
    if (val === null || val === 'null') {
        result = null;
    } else if (val === 'true') {
        result = true;
    } else if (val === 'false') {
        result = false;
    } else if (val === _globallyUndefined || val === 'undefined') {
        result = _globallyUndefined;
    } else if (val === '' || isNaN(val)) {
        result = val;
    } else {
        result = parseFloat(val);
    }
    return result;
}

function _transformArrayValues(values) {
    var len = values.length,
        output = [];
    while (len--) {
        output[len] = _transformValue(values[len]);
    }
    return output;
}

function _parseUrlParameters(urlFragment, shouldTransform) {
    var paramList = (urlFragment || '').replace('?', '').split('&'),
        len = paramList.length,
        paramMap = {},
        pair, value;
    while (len--) {
        pair = paramList[len].split('=');
        value = shouldTransform ? _transformValue(pair[1]) : pair[1];
        paramMap[pair[0]] = (typeof value === 'string') ? decodeURIComponent(value) : value;
    }
    return paramMap;
}

// Custom Event Emitter (replacement for signals.js)
function EventHub() {
    this._observers = [];
}
EventHub.prototype = {
    add: function(handler) {
        if (_isAFunction(handler)) {
            this._observers.push(handler);
        }
    },
    dispatch: function() {
        var args = Array.prototype.slice.call(arguments);
        var observers = this._observers.slice(); // Dispatching might remove observers, so iterate a copy
        for (var i = 0; i < observers.length; i++) {
            observers[i].apply(null, args);
        }
    },
    dispose: function() {
        this._observers.length = 0;
    },
    getListenerCount: function() {
        return this._observers.length;
    }
};

// Schema Interpreter (replacement for PatternLexer)
var _schemaInterpreter = (function() {

    function _extractTokenName(tokenStr) {
        return tokenStr.replace(/[\{\}:?]/g, '');
    }

    // Refined _parseSchema to handle original crossroads pattern syntax
    function _parseSchemaIntoSegments(schemaText) {
        var segments = [];
        var workingText = schemaText;
        var lastIndex = 0;

        // Regex to find all special tokens: {param}, :{param}:, {?query}, :?query:
        // This regex is used for *parsing the pattern string itself*, not for matching the URL.
        var tokenRegex = /(\{[^}]+\})|(:\{[^}]+\}:)|(\{\?[^}]+\})|(:\{\?[^}]+\}:)/g;
        var match;

        while ((match = tokenRegex.exec(workingText)) !== null) {
            // Add literal part before the token
            if (match.index > lastIndex) {
                segments.push({ type: 'literal', value: workingText.substring(lastIndex, match.index) });
            }

            var token = match[0];
            var name = _extractTokenName(token); // Extract name

            if (match[1]) { // {param}
                segments.push({ type: 'param', name: name, optional: false });
            } else if (match[2]) { // :{param}:
                segments.push({ type: 'param', name: name, optional: true });
            } else if (match[3]) { // {?query}
                segments.push({ type: 'query', name: name, optional: false });
            } else if (match[4]) { // :?query:
                segments.push({ type: 'query', name: name, optional: true });
            }
            lastIndex = tokenRegex.lastIndex;
        }

        // Add any remaining literal part
        if (lastIndex < workingText.length) {
            segments.push({ type: 'literal', value: workingText.substring(lastIndex) });
        }
        return segments;
    }

    function _getSegmentParamNames(segmentDescriptors) {
        var names = [];
        for (var i = 0; i < segmentDescriptors.length; i++) {
            if (segmentDescriptors[i].type === 'param' || segmentDescriptors[i].type === 'query') {
                names.push(segmentDescriptors[i].name);
            }
        }
        return names;
    }

    function _getOptionalSegmentParamNames(segmentDescriptors) {
        var names = [];
        for (var i = 0; i < segmentDescriptors.length; i++) {
            if ((segmentDescriptors[i].type === 'param' || segmentDescriptors[i].type === 'query') && segmentDescriptors[i].optional) {
                names.push(segmentDescriptors[i].name);
            }
        }
        return names;
    }

    function _interpolateSchema(schemaText, replacements) {
        var interpolated = schemaText;
        var queryParams = {};

        // Process path parameters first
        interpolated = interpolated.replace(/(\{[^}]+\})|(:\{[^}]+\}:)/g, function(match, requiredParamToken, optionalParamToken) {
            var name = _extractTokenName(match);
            var value = replacements[name];
            delete replacements[name]; // Consume path param from replacements

            if (value === _globallyUndefined || value === null) {
                if (optionalParamToken) {
                    return ''; // Optional param, no value, remove it
                } else {
                    throw new Error('Missing required parameter for interpolation: ' + name);
                }
            }
            return String(value);
        });

        // Collect remaining replacements as query parameters
        for (var key in replacements) {
            if (replacements.hasOwnProperty(key)) {
                queryParams[key] = replacements[key];
            }
        }

        var queryString = '';
        var firstQuery = true;
        for (var key in queryParams) {
            if (queryParams.hasOwnProperty(key)) {
                if (firstQuery) {
                    queryString += '?';
                    firstQuery = false;
                } else {
                    queryString += '&';
                }
                queryString += encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]);
            }
        }

        // Replace query segments
        interpolated = interpolated.replace(/(\{\?[^}]+\})|(:\{\?[^}]+\}:)/g, function(match, requiredQueryToken, optionalQueryToken) {
            if (queryString) {
                var currentQueryString = queryString;
                queryString = ''; // Ensure only one query segment gets the full string
                return currentQueryString;
            } else if (optionalQueryToken) {
                return ''; // Optional query segment, no value, remove it
            } else {
                throw new Error('Missing required query string for interpolation.');
            }
        });

        return interpolated;
    }


    return {
        parse: _parseSchemaIntoSegments,
        getParamNames: _getSegmentParamNames,
        getOptionalParamNames: _getOptionalSegmentParamNames,
        interpolate: _interpolateSchema
    };
})();

// Passage (replacement for Route)
function Passage(schemaText, actionHandler, rankValue, parentNavigator) {
    this._navigator = parentNavigator;
    this._schema = schemaText;
    this._segmentList = _schemaInterpreter.parse(schemaText);
    this._paramNames = _schemaInterpreter.getParamNames(this._segmentList);
    this._optionalParamNames = _schemaInterpreter.getOptionalParamNames(this._segmentList);
    this.activated = new EventHub(); // Replacement for 'matched' signal
    this.transitioned = new EventHub(); // Replacement for 'switched' signal
    if (actionHandler) {
        this.activated.add(actionHandler);
    }
    this._rank = rankValue || 0;
}

Passage.prototype = {
    isGreedy: false,
    validationRules: _globallyUndefined,

    testNavigation: function(requestPath) {
        requestPath = requestPath || '';
        var extractedParams = this._attemptMatch(requestPath);
        return extractedParams !== null && this._validateExtractedParams(requestPath, extractedParams);
    },

    _validateExtractedParams: function(fullRequest, paramValues) {
        var rules = this.validationRules,
            key;
        if (!rules) return true;

        for (key in rules) {
            if (key !== 'normalize_' && rules.hasOwnProperty(key) && !this._isValidParamValue(fullRequest, key, paramValues)) {
                return false;
            }
        }
        return true;
    },

    _isValidParamValue: function(fullRequest, propName, currentValues) {
        var rule = this.validationRules[propName],
            value = currentValues[propName],
            isValid = false,
            isQueryKey = (propName.indexOf('?') === 0);

        if (value === _globallyUndefined && _findItemInArray(this._optionalParamNames, propName) !== -1) {
            isValid = true;
        } else if (_isRegexInstance(rule)) {
            if (isQueryKey) {
                value = currentValues[propName + '_']; // Use raw string for query
            }
            isValid = rule.test(value);
        } else if (_isAnArray(rule)) {
            if (isQueryKey) {
                value = currentValues[propName + '_']; // Use raw string for query
            }
            isValid = this._isValidListRule(rule, value);
        } else if (_isAFunction(rule)) {
            isValid = rule(value, fullRequest, currentValues);
        }
        return isValid;
    },

    _isValidListRule: function(list, value) {
        if (this._navigator.caseSensitive) { // crossroads.ignoreCase = true means case-insensitive
            return _findItemInArray(list, value) !== -1;
        }

        if (typeof value === 'string') {
            value = value.toLowerCase();
        }

        var len = list.length,
            item, compareVal;

        while (len--) {
            item = list[len];
            compareVal = (typeof item === 'string') ? item.toLowerCase() : item;
            if (compareVal === value) {
                return true;
            }
        }
        return false;
    },

    // This is the core divergent matching algorithm
    _attemptMatch: function(requestPath) {
        var currentPath = requestPath;
        var paramMap = {};
        var currentPathIndex = 0;
        var paramsArray = [];
        var shouldTransform = this._navigator.applyTypecasting;
        var pathLen = currentPath.length;

        for (var i = 0; i < this._segmentList.length; i++) {
            var segment = this._segmentList[i];
            var segmentMatched = false;

            if (segment.type === 'literal') {
                var literalLen = segment.value.length;
                if (currentPath.substring(currentPathIndex, currentPathIndex + literalLen) === segment.value) {
                    currentPathIndex += literalLen;
                    segmentMatched = true;
                } else {
                    return null; // Literal mismatch
                }
            } else if (segment.type === 'param') {
                var nextSegment = this._segmentList[i + 1];
                var paramValue = '';

                if (nextSegment) {
                    // Try to find the delimiter for the parameter
                    var nextLiteralValue = (nextSegment.type === 'literal') ? nextSegment.value : '';
                    var delimiterIndex = -1;
                    if (nextLiteralValue) {
                        delimiterIndex = currentPath.indexOf(nextLiteralValue, currentPathIndex);
                    }

                    if (delimiterIndex !== -1 && delimiterIndex > currentPathIndex) {
                        paramValue = currentPath.substring(currentPathIndex, delimiterIndex);
                        currentPathIndex = delimiterIndex;
                    } else if (delimiterIndex === currentPathIndex) {
                        // Delimiter immediately follows, means parameter is empty
                        paramValue = '';
                    } else if (!nextLiteralValue && i === this._segmentList.length - 1) {
                        // Last segment, consume the rest
                        paramValue = currentPath.substring(currentPathIndex);
                        currentPathIndex = pathLen;
                    } else {
                        // No clear delimiter found for a non-last segment
                        if (segment.optional) {
                            paramValue = _globallyUndefined; // Optional param can be empty
                        } else {
                            return null; // Required param cannot determine its end
                        }
                    }
                } else { // Last segment is a parameter
                    paramValue = currentPath.substring(currentPathIndex);
                    currentPathIndex = pathLen;
                }

                // Handle crossroads' IE optional group bug (empty string vs undefined)
                if (paramValue === '' && segment.optional) {
                    paramValue = _globallyUndefined;
                }

                if (paramValue !== _globallyUndefined) {
                    if (paramValue === '' && !segment.optional) { // A required param consumed nothing
                        return null;
                    }
                    paramMap[segment.name] = shouldTransform ? _transformValue(paramValue) : paramValue;
                    paramsArray.push(paramMap[segment.name]);
                    segmentMatched = true;
                } else if (segment.optional) {
                    paramMap[segment.name] = _globallyUndefined;
                    paramsArray.push(_globallyUndefined);
                    segmentMatched = true;
                } else {
                    return null; // Required param is undefined
                }

            } else if (segment.type === 'query') {
                var queryPart = currentPath.substring(currentPathIndex);
                if (queryPart.indexOf('?') === 0) {
                    paramMap[segment.name + '_'] = queryPart; // Raw string for validation
                    var decodedParams = _parseUrlParameters(queryPart, shouldTransform);
                    paramMap[segment.name] = decodedParams;
                    paramsArray.push(decodedParams);
                    currentPathIndex = pathLen; // Consumed rest of path
                    segmentMatched = true;
                } else if (segment.optional) {
                    paramMap[segment.name] = _globallyUndefined;
                    paramsArray.push(_globallyUndefined);
                    segmentMatched = true;
                } else {
                    return null; // Required query not found
                }
            }

            if (!segmentMatched && !segment.optional) {
                return null; // A required segment failed to match
            }
        }

        // Check if there's any unconsumed part of the path, unless the last segment was a query
        if (currentPathIndex < pathLen && (this._segmentList.length === 0 || this._segmentList[this._segmentList.length - 1].type !== 'query')) {
            return null; // Path has extra parts that were not consumed
        }

        paramMap.request_ = shouldTransform ? _transformValue(requestPath) : requestPath;
        paramMap.vals_ = paramsArray; // Keep original vals_ for compatibility with crossroads.NORM_AS_ARRAY/OBJECT
        return paramMap;
    },

    _getFormattedArguments: function(requestPath) {
        var normalizer = this.validationRules ? this.validationRules.normalize_ : null;
        normalizer = normalizer || this._navigator.argumentNormalizer; // Default normalizer

        var extractedParams = this._attemptMatch(requestPath);
        if (!extractedParams) {
            return null;
        }

        if (normalizer && _isAFunction(normalizer)) {
            return normalizer(requestPath, extractedParams);
        } else {
            return extractedParams.vals_;
        }
    },

    composePath: function(replacements) {
        var str = _schemaInterpreter.interpolate(this._schema, replacements);
        if (!this.testNavigation(str)) { // Use testNavigation to validate against rules
            throw new Error('Generated string doesn\'t validate against `Passage.validationRules`.');
        }
        return str;
    },

    removePassage: function() {
        this._navigator.removePassage(this);
    },

    _cleanup: function() {
        this.activated.dispose();
        this.transitioned.dispose();
        this.activated = this.transitioned = this._schema = this._segmentList = null;
    },

    toString: function() {
        return '[Passage schema:"' + this._schema + '", listenerCount:' + this.activated.getListenerCount() + ']';
    }
};

// Navigator (replacement for Crossroads)
function Navigator() {
    this.navigationBypassed = new EventHub(); // replacement for bypassed signal
    this.navigationRouted = new EventHub(); // replacement for routed signal
    this._paths = [];
    this._previousPaths = [];
    this._downstreamNavigators = [];
    this.resetNavigationState();
}

Navigator.prototype = {
    permitGreedyMatching: false, // replacement for greedy
    enableGreedyMatching: true, // replacement for greedyEnabled
    caseSensitive: true, // replacement for ignoreCase (false in crossroads means case-insensitive)
    ignoreNavigationState: false, // replacement for ignoreState
    applyTypecasting: false, // replacement for shouldTypecast
    argumentNormalizer: null, // replacement for normalizeFn

    resetNavigationState: function() {
        this._previousPaths.length = 0;
        this._lastMatchedRequest = null;
        this._lastBypassedRequest = null;
    },

    createNavigator: function() {
        return new Navigator();
    },

    registerPassage: function(schemaText, actionHandler, rankValue) {
        var path = new Passage(schemaText, actionHandler, rankValue, this);
        this._insertSorted(path);
        return path;
    },

    removePassage: function(pathToRemove) {
        _removeItemFromArray(this._paths, pathToRemove);
        pathToRemove._cleanup();
    },

    clearAllPassages: function() {
        var count = this.getPassageCount();
        while (count--) {
            this._paths[count]._cleanup();
        }
        this._paths.length = 0;
    },

    navigate: function(requestPath, initialArgs) {
        requestPath = requestPath || '';
        initialArgs = initialArgs || [];

        if (!this.ignoreNavigationState &&
            (requestPath === this._lastMatchedRequest || requestPath === this._lastBypassedRequest)) {
            return;
        }

        var matchedPathDetails = this._findMatchingPaths(requestPath),
            idx = 0,
            len = matchedPathDetails.length,
            currentDetail;

        if (len) {
            this._lastMatchedRequest = requestPath;

            this._notifyPreviousPaths(matchedPathDetails, requestPath);
            this._previousPaths = matchedPathDetails;

            while (idx < len) {
                currentDetail = matchedPathDetails[idx];
                currentDetail.path.activated.dispatch.apply(currentDetail.path.activated, initialArgs.concat(currentDetail.params));
                currentDetail.isFirst = !idx;
                this.navigationRouted.dispatch.apply(this.navigationRouted, initialArgs.concat([requestPath, currentDetail]));
                idx += 1;
            }
        } else {
            this._lastBypassedRequest = requestPath;
            this.navigationBypassed.dispatch.apply(this.navigationBypassed, initialArgs.concat([requestPath]));
        }

        this._relayNavigation(requestPath, initialArgs);
    },

    _notifyPreviousPaths: function(currentMatchedPaths, request) {
        var idx = 0,
            previousDetail;
        while (previousDetail = this._previousPaths[idx++]) {
            if (previousDetail.path.transitioned && this._didPathTransition(previousDetail.path, currentMatchedPaths)) {
                previousDetail.path.transitioned.dispatch(request);
            }
        }
    },

    _didPathTransition: function(path, currentMatchedPaths) {
        var currentDetail,
            idx = 0;
        while (currentDetail = currentMatchedPaths[idx++]) {
            if (currentDetail.path === path) {
                return false; // Still matched to the same path
            }
        }
        return true; // Path is no longer matched
    },

    _relayNavigation: function(request, args) {
        var idx = 0,
            downstreamNavigator;
        while (downstreamNavigator = this._downstreamNavigators[idx++]) {
            downstreamNavigator.navigate(request, args);
        }
    },

    getPassageCount: function() {
        return this._paths.length;
    },

    _insertSorted: function(path) {
        var paths = this._paths,
            len = paths.length;
        do {
            --len;
        } while (paths[len] && path._rank <= paths[len]._rank);
        paths.splice(len + 1, 0, path);
    },

    _findMatchingPaths: function(requestPath) {
        var results = [],
            paths = this._paths,
            len = paths.length,
            path;
        // Iterate backwards because higher priorities are added at the end
        while (path = paths[--len]) {
            if ((!results.length || this.permitGreedyMatching || path.isGreedy) && path.testNavigation(requestPath)) {
                results.push({
                    path: path,
                    params: path._getFormattedArguments(requestPath)
                });
            }
            if (!this.enableGreedyMatching && results.length) {
                break;
            }
        }
        return results;
    },

    pipeTo: function(otherNavigator) {
        this._downstreamNavigators.push(otherNavigator);
    },

    unpipeFrom: function(otherNavigator) {
        _removeItemFromArray(this._downstreamNavigators, otherNavigator);
    },

    toString: function() {
        return '[Navigator passageCount:' + this.getPassageCount() + ']';
    }
};

// "Static" instance for the module export
var globalNavigator = new Navigator();
globalNavigator.VERSION_INFO = '0.0.1'; // Divergent version info

globalNavigator.NORMALIZER_AS_LIST = function(req, vals) {
    return vals.vals_;
};

globalNavigator.NORMALIZER_AS_OBJECT = function(req, vals) {
    return [vals];
};

// Expose the main entry point
module.exports = globalNavigator;

// --- End of Type IV Clone ---
},{"signals":2}]},{},[1])
(1)
});