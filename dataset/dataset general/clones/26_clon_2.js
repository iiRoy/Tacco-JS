!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;if("undefined"!=typeof window)b=window;else if("undefined"!=typeof global)b=global;else if("undefined"!=typeof self)b=self;b.Abyssa=a()}}(function(){var f_def, f_mod, f_exp;return (function mainFunc(pkgMap, modCache, reqList){function getModule(modName, fromRequire){if(!modCache[modName]){if(!pkgMap[modName]){var reqFunc=typeof require=="function"&&require;if(!fromRequire&&reqFunc)return reqFunc(modName,!0);if(f_def)return f_def(modName,!0);throw new Error("Cannot locate package '"+modName+"'")}var newMod=modCache[modName]={exports:{}};pkgMap[modName][0].call(newMod.exports,function(depName){var depPath=pkgMap[modName][1][depName];return getModule(depPath?depPath:depName)},newMod,newMod.exports,mainFunc,pkgMap,modCache,reqList)}return modCache[modName].exports}var f_def=typeof require=="function"&&require;for(var i=0;i<reqList.length;i++)getModule(reqList[i]);return getModule})({1:[function(req_dep, mod_obj, exp_obj){
// Third-party code: crossroads.js v0.12.0
// Author: Miller Medeiros | MIT License

(function () {
var moduleFactory = function (sigLib) {

    var pathNavi,
        _optGroupIssue,
        VOID_VAL; // Undefined placeholder

    // Utility Functions
    //--------------------

    // IE 7-8 treat optional regex groups as empty strings, others as `undefined`
    _optGroupIssue = (/t(.+)?/).exec('t')[1] === '';

    function listFindIndex(arrList, targetVal) {
        if (arrList.indexOf) {
            return arrList.indexOf(targetVal);
        } else {
            // Older browsers (like IE 6-7) lack Array.indexOf
            var count = arrList.length;
            while (count--) {
                if (arrList[count] === targetVal) {
                    return count;
                }
            }
            return -1;
        }
    }

    function listDeleteItem(arrList, itemToRemove) {
        var idx = listFindIndex(arrList, itemToRemove);
        if (idx !== -1) {
            arrList.splice(idx, 1);
        }
    }

    function checkType(inputVal, expectedKind) {
        return '[object '+ expectedKind +']' === Object.prototype.toString.call(inputVal);
    }

    function isRegexObject(inputVal) {
        return checkType(inputVal, 'RegExp');
    }

    function isListObject(inputVal) {
        return checkType(inputVal, 'Array');
    }

    function isCallable(inputVal) {
        return typeof inputVal === 'function';
    }

    // From AMD-Utils library
    function coerceValue(inputValue) {
        var result;
        if (inputValue === null || inputValue === 'null') {
            result = null;
        } else if (inputValue === 'true') {
            result = true;
        } else if (inputValue === 'false') {
            result = false;
        } else if (inputValue === VOID_VAL || inputValue === 'undefined') {
            result = VOID_VAL;
        } else if (inputValue === '' || isNaN(inputValue)) {
            // isNaN('') is false
            result = inputValue;
        } else {
            // parseFloat(null || '') is NaN
            result = parseFloat(inputValue);
        }
        return result;
    }

    function coerceListValues(inputValues) {
        var listLen = inputValues.length,
            outputList = [];
        while (listLen--) {
            outputList[listLen] = coerceValue(inputValues[listLen]);
        }
        return outputList;
    }

    // From AMD-Utils library
    function parseQueryString(queryString, shouldCoerce) {
        var queryParts = (queryString || '').replace('?', '').split('&'),
            partCount = queryParts.length,
            resultObject = {},
            currentPart, partValue;
        while (partCount--) {
            currentPart = queryParts[partCount].split('=');
            partValue = shouldCoerce ? coerceValue(currentPart[1]) : currentPart[1];
            resultObject[currentPart[0]] = (typeof partValue === 'string')? decodeURIComponent(partValue) : partValue;
        }
        return resultObject;
    }


    // PathNavigator --------
    //--------------------

    /**
     * @constructor
     */
    function PathNavigator() {
        this.bypassedSignal = new sigLib.Signal();
        this.routedSignal = new sigLib.Signal();
        this._segmentRules = [];
        this._previousSegments = [];
        this._chainedProcessors = [];
        this.clearActivity();
    }

    PathNavigator.prototype = {

        isGreedy : false,

        greedyEnabledFlag : true,

        caseInsensitive : true,

        ignoreCurrentState : false,

        shouldCoerceTypes : false,

        normalizerFunction : null,

        clearActivity : function(){
            this._previousSegments.length = 0;
            this._lastMatchedRequest = null;
            this._lastBypassedRequest = null;
        },

        makeNew : function () {
            return new PathNavigator();
        },

        registerSegment : function (pathPattern, actionCallback, precedence) {
            var segment = new SegmentRule(pathPattern, actionCallback, precedence, this);
            this._insertSorted(segment);
            return segment;
        },

        deregisterSegment : function (segmentToRemove) {
            listDeleteItem(this._segmentRules, segmentToRemove);
            segmentToRemove._cleanup();
        },

        clearAllSegments : function () {
            var totalSegments = this.getSegmentCount();
            while (totalSegments--) {
                this._segmentRules[totalSegments]._cleanup();
            }
            this._segmentRules.length = 0;
        },

        processPath : function (requestPath, defaultArguments) {
            requestPath = requestPath || '';
            defaultArguments = defaultArguments || [];

            // Only process if the request is different and not ignoring state
            if ( !this.ignoreCurrentState &&
                (requestPath === this._lastMatchedRequest ||
                 requestPath === this._lastBypassedRequest) ) {
                return;
            }

            var matchedSegmentData = this._fetchMatchingSegments(requestPath),
                idx = 0,
                numMatches = matchedSegmentData.length,
                currentMatch;

            if (numMatches) {
                this._lastMatchedRequest = requestPath;

                this._informPreviousSegments(matchedSegmentData, requestPath);
                this._previousSegments = matchedSegmentData;
                // Process segments in order of definition (incremental loop)
                while (idx < numMatches) {
                    currentMatch = matchedSegmentData[idx];
                    currentMatch.segment.activated.dispatch.apply(currentMatch.segment.activated, defaultArguments.concat(currentMatch.parameters));
                    currentMatch.isFirst = !idx;
                    this.routedSignal.dispatch.apply(this.routedSignal, defaultArguments.concat([requestPath, currentMatch]));
                    idx += 1;
                }
            } else {
                this._lastBypassedRequest = requestPath;
                this.bypassedSignal.dispatch.apply(this.bypassedSignal, defaultArguments.concat([requestPath]));
            }

            this._flowProcess(requestPath, defaultArguments);
        },

        _informPreviousSegments : function(currentMatchedSegments, currentRequest) {
            var i_val = 0, prevSegment;
            while (prevSegment = this._previousSegments[i_val++]) {
                // Check if 'changed' signal exists, as segment might have been disposed
                if(prevSegment.segment.changed && this._segmentChanged(prevSegment.segment, currentMatchedSegments)) {
                    prevSegment.segment.changed.dispatch(currentRequest);
                }
            }
        },

        _segmentChanged : function (aSegment, currentMatchedSegments){
            var matchedEntry,
                j_val = 0;
            while (matchedEntry = currentMatchedSegments[j_val++]) {
                // Dispatch 'changed' only if it's a different segment
                if (matchedEntry.segment === aSegment) {
                    return false;
                }
            }
            return true;
        },

        _flowProcess : function(pathInput, initialArgs) {
            var k_val = 0, chainedProcessor;
            while (chainedProcessor = this._chainedProcessors[k_val++]) {
                chainedProcessor.processPath(pathInput, initialArgs);
            }
        },

        getSegmentCount : function () {
            return this._segmentRules.length;
        },

        _insertSorted : function (newSegment) {
            // Simplified insertion sort
            var existingSegments = this._segmentRules,
                numExisting = existingSegments.length;
            do { --numExisting; } while (existingSegments[numExisting] && newSegment._precedence <= existingSegments[numExisting]._precedence);
            existingSegments.splice(numExisting+1, 0, newSegment);
        },

        _fetchMatchingSegments : function (pathInput) {
            var resultingMatches = [],
                allSegments = this._segmentRules,
                segmentCount = allSegments.length,
                currentSegment;
            // Iterate backwards, as higher precedence segments are at the end
            while (currentSegment = allSegments[--segmentCount]) {
                if ((!resultingMatches.length || this.isGreedy || currentSegment.isGreedy) && currentSegment.testSegment(pathInput)) {
                    resultingMatches.push({
                        segment : currentSegment,
                        parameters : currentSegment._extractParameterArray(pathInput)
                    });
                }
                if (!this.greedyEnabledFlag && resultingMatches.length) {
                    break;
                }
            }
            return resultingMatches;
        },

        chainTo : function (anotherProcessor) {
            this._chainedProcessors.push(anotherProcessor);
        },

        unchainFrom : function (anotherProcessor) {
            listDeleteItem(this._chainedProcessors, anotherProcessor);
        },

        toDescription : function () {
            return '[PathNavigator numSegments:'+ this.getSegmentCount() +']';
        }
    };

    // "Static" instance
    pathNavi = new PathNavigator();
    pathNavi.VERSION_NUMBER = '0.12.0';

    pathNavi.NORM_AS_ARRAY_VAL = function (reqData, valuesObj) {
        return [valuesObj.vals_];
    };

    pathNavi.NORM_AS_OBJECT_VAL = function (reqData, valuesObj) {
        return [valuesObj];
    };


    // SegmentRule --------------
    //---------------------

    /**
     * @constructor
     */
    function SegmentRule(pathPattern, actionCallback, precedence, segmentProcessor) {
        var isPatternRegex = isRegexObject(pathPattern),
            patternParser = segmentProcessor.patternAnalyzer;
        this._segmentProcessor = segmentProcessor;
        this._segmentPattern = pathPattern;
        this._parameterIdentifiers = isPatternRegex? null : patternParser.getParamIds(pathPattern);
        this._optionalParameterIdentifiers = isPatternRegex? null : patternParser.getOptionalParamsIds(pathPattern);
        this._matchExpression = isPatternRegex? pathPattern : patternParser.compilePattern(pathPattern, segmentProcessor.caseInsensitive);
        this.activated = new sigLib.Signal();
        this.changed = new sigLib.Signal();
        if (actionCallback) {
            this.activated.add(actionCallback);
        }
        this._precedence = precedence || 0;
    }

    SegmentRule.prototype = {

        isGreedy : false,

        validationRules : void(0),

        testSegment : function (requestInput) {
            requestInput = requestInput || '';
            return this._matchExpression.test(requestInput) && this._verifyParameters(requestInput); // Validate params even if regex, due to `request_` rule.
        },

        _verifyParameters : function (requestInput) {
            var ruleset = this.validationRules,
                paramValues = this._extractParameterObject(requestInput),
                propKey;
            for (propKey in ruleset) {
                // 'normalize_' is not a validation rule
                if(propKey !== 'normalize_' && ruleset.hasOwnProperty(propKey) && ! this._isParameterValid(requestInput, propKey, paramValues)){
                    return false;
                }
            }
            return true;
        },

        _isParameterValid : function (requestInput, propertyName, currentValues) {
            var validationLogic = this.validationRules[propertyName],
                currentVal = currentValues[propertyName],
                validStatus = false,
                isQueryParam = (propertyName.indexOf('?') === 0);

            if (currentVal == null && this._optionalParameterIdentifiers && listFindIndex(this._optionalParameterIdentifiers, propertyName) !== -1) {
                validStatus = true;
            }
            else if (isRegexObject(validationLogic)) {
                if (isQueryParam) {
                    currentVal = currentValues[propertyName +'_']; // Use raw string for query
                }
                validStatus = validationLogic.test(currentVal);
            }
            else if (isListObject(validationLogic)) {
                if (isQueryParam) {
                    currentVal = currentValues[propertyName +'_']; // Use raw string for query
                }
                validStatus = this._isListRuleValid(validationLogic, currentVal);
            }
            else if (isCallable(validationLogic)) {
                validStatus = validationLogic(currentVal, requestInput, currentValues);
            }

            return validStatus; // Fail silently if validationLogic is of an unsupported type
        },

        _isListRuleValid : function (ruleList, testValue) {
            if (! this._segmentProcessor.caseInsensitive) {
                return listFindIndex(ruleList, testValue) !== -1;
            }

            if (typeof testValue === 'string') {
                testValue = testValue.toLowerCase();
            }

            var listLength = ruleList.length,
                listItem,
                comparisonValue;

            while (listLength--) {
                listItem = ruleList[listLength];
                comparisonValue = (typeof listItem === 'string')? listItem.toLowerCase() : listItem;
                if (comparisonValue === testValue) {
                    return true;
                }
            }
            return false;
        },

        _extractParameterObject : function (requestInput) {
            var shouldCoerce = this._segmentProcessor.shouldCoerceTypes,
                extractedValues = this._segmentProcessor.patternAnalyzer.getParamValues(requestInput, this._matchExpression, shouldCoerce),
                paramObject = {},
                valCount = extractedValues.length,
                currentParam, paramValue;
            while (valCount--) {
                paramValue = extractedValues[valCount];
                if (this._parameterIdentifiers) {
                    currentParam = this._parameterIdentifiers[valCount];
                    if (currentParam.indexOf('?') === 0 && paramValue) {
                        // Keep a copy of the original string for array/RegExp validation
                        paramObject[currentParam +'_'] = paramValue;
                        // Update the 'vals_' array for dispatch
                        paramValue = parseQueryString(paramValue, shouldCoerce);
                        extractedValues[valCount] = paramValue;
                    }
                    // Normalize behavior for IE's optional group capture (empty string vs. undefined)
                    // See: #gh-58, #gh-59, #gh-60
                    if ( _optGroupIssue && paramValue === '' && listFindIndex(this._optionalParameterIdentifiers, currentParam) !== -1 ) {
                        paramValue = void(0);
                        extractedValues[valCount] = paramValue;
                    }
                    paramObject[currentParam] = paramValue;
                }
                // Also alias by index for RegExp patterns
                paramObject[valCount] = paramValue;
            }
            paramObject.request_ = shouldCoerce? coerceValue(requestInput) : requestInput;
            paramObject.vals_ = extractedValues;
            return paramObject;
        },

        _extractParameterArray : function (requestInput) {
            var normalizer = this.validationRules? this.validationRules.normalize_ : null,
                resultParams;
            normalizer = normalizer || this._segmentProcessor.normalizerFunction; // Default normalizer
            if (normalizer && isCallable(normalizer)) {
                resultParams = normalizer(requestInput, this._extractParameterObject(requestInput));
            } else {
                resultParams = this._extractParameterObject(requestInput).vals_;
            }
            return resultParams;
        },

        buildPath : function(replacementsMap) {
            var generatedString = this._segmentProcessor.patternAnalyzer.interpolate(this._segmentPattern, replacementsMap);
            if (! this._verifyParameters(generatedString) ) {
                throw new Error('Constructed path string fails `SegmentRule.validationRules`.');
            }
            return generatedString;
        },

        discard : function () {
            this._segmentProcessor.deregisterSegment(this);
        },

        _cleanup : function () {
            this.activated.dispose();
            this.changed.dispose();
            this.activated = this.changed = this._segmentPattern = this._matchExpression = null;
        },

        describeSegment : function () {
            return '[SegmentRule pattern:"'+ this._segmentPattern +'", numListeners:'+ this.activated.getNumListeners() +']';
        }

    };



    // Pattern Analyzer ------
    //---------------------

    PathNavigator.prototype.patternAnalyzer = (function () {

        var
            // Characters that need escaping in RegExp strings
            ESCAPE_CHAR_REGEX = /[\\.+*?\^$\[\](){}\/'#]/g,

            // Trailing slashes at string start/end
            LOOSE_SLANT_REGEX = /^\/|\/$/g,
            OLD_SLANT_REGEX = /\/$/g,

            // Parameters - anything between `{ }` or `: :`
            PARAM_ELEMENTS_REGEX = /(?:\{|:)([^}:]+)(?:\}|:)/g,

            // Used to store parameter tokens during compilation (to avoid escaping them)
            SYMBOL_MAP = {
                'OPTIONAL_SLANT' : {
                    // Optional slashes
                    // Slash between `::` or `}:` or `\w:` or `:{?` or `}{?` or `\w{?`
                    rgx : /([:}]|\w(?=\/))\/?(:|(?:\{\?))/g,
                    save : '$1{{id}}$2',
                    res : '\\/?'
                },
                'REQUIRED_SLANT' : {
                    // Required slashes
                    // Used to insert slash between `:{` and `}{`
                    rgx : /([:}])\/?(\{)/g,
                    save : '$1{{id}}$2',
                    res : '\\/'
                },
                'REQUIRED_QUERY' : {
                    // Required query string - everything within `{? }`
                    rgx : /\{\?([^}]+)\}/g,
                    // Everything from `?` until `#` or end of string
                    res : '\\?([^#]+)'
                },
                'OPTIONAL_QUERY' : {
                    // Optional query string - everything within `:? :`