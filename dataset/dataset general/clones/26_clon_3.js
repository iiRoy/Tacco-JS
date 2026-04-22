/* navigate-js 1.0.0 - A flexible path matching utility for client-side applications */

!function(a){
  if(typeof exports === "object" && typeof module !== "undefined") {
    // CommonJS-like environments
    module.exports = a();
  } else if(typeof define === "function" && define.amd) {
    // AMD environments
    define([], a);
  } else {
    // Browser or other global environment
    let globalScope;
    if(typeof window !== "undefined") {
      globalScope = window;
    } else if(typeof global !== "undefined") {
      globalScope = global;
    } else if(typeof self !== "undefined") {
      globalScope = self;
    }
    // Assign the library to a global variable
    globalScope.NavigateJS = a();
  }
}(function(){
  // Internal define, module, exports for the bundled module
  let define, module, exports;

  // Simulate a CommonJS-like module loader for internal modules
  return (function moduleLoader(modules, cache, entryPoints){
    function requireModule(moduleId, isUserCall){
      if(!cache[moduleId]){
        if(!modules[moduleId]){
          const dynamicRequire = typeof require === "function" && require;
          if(!isUserCall && dynamicRequire) return dynamicRequire(moduleId, true);
          if(localRequire) return localRequire(moduleId, true);
          throw new Error("Could not locate module '" + moduleId + "'");
        }
        const moduleContainer = cache[moduleId] = { exports: {} };
        modules[moduleId][0].call(
          moduleContainer.exports,
          function(dependencyId){
            const dependencyPath = modules[moduleId][1][dependencyId];
            return requireModule(dependencyPath ? dependencyPath : dependencyId);
          },
          moduleContainer,
          moduleContainer.exports,
          moduleLoader,
          modules,
          cache,
          entryPoints
        );
      }
      return cache[moduleId].exports;
    }
    const localRequire = typeof require === "function" && require;
    for(let i = 0; i < entryPoints.length; i++) requireModule(entryPoints[i]);
    return requireModule(entryPoints[0]);
  })({1:[function(localReq, moduleInstance, exportsObject){
    /**
     * @license
     * PathMatcher <https://github.com/yourusername/pathmatcher/>
     * Author: Your Name | License: MIT
     * v1.0.0 (2023/10/27)
     */

    (function () {
      const initPathMatcher = function (signalsLib) {
        if (!signalsLib) {
          console.error("PathMatcher requires a signals library (e.g., 'js-signals'). Please provide it.");
          return; // Exit if signals library is missing
        }

        let pathMatcherCore,
          _legacyOptionalGroupHandling, // Variable for IE bug workaround
          UNDEFINED_VALUE; // Sentinel for undefined

        // Helper Utilities -----------
        //=============================

        // Detects IE 7-8 capture bug for optional regex groups
        _legacyOptionalGroupHandling = (/g(.+)?/).exec('g')[1] === '';

        /**
         * Finds the index of a value in an array.
         * @param {Array} arr - The array to search.
         * @param {*} val - The value to find.
         * @returns {number} The index of the value, or -1 if not found.
         */
        function findElementIndex(arr, val) {
          if (!arr || typeof arr.indexOf === 'function') {
            return arr.indexOf(val); // Use native method if available and not null
          } else {
            // Fallback for older browsers (e.g., IE < 9)
            let currentIdx = arr.length;
            while (currentIdx--) {
              if (arr[currentIdx] === val) {
                return currentIdx;
              }
            }
            return -1;
          }
        }

        /**
         * Removes a specific item from an array.
         * @param {Array} collection - The array to modify.
         * @param {*} itemToRemove - The item to remove.
         */
        function removeArrayItem(collection, itemToRemove) {
          const index = findElementIndex(collection, itemToRemove);
          if (index !== -1) {
            collection.splice(index, 1);
          }
        }

        /**
         * Checks if a value is of a specific object kind.
         * @param {*} value - The value to check.
         * @param {string} kindName - The expected kind (e.g., 'RegExp', 'Array').
         * @returns {boolean} True if the value matches the kind, false otherwise.
         */
        function isObjectType(value, kindName) {
          return `[object ${kindName}]` === Object.prototype.toString.call(value);
        }

        /**
         * Checks if a value is a RegExp object.
         * @param {*} value - The value to check.
         * @returns {boolean} True if it's a RegExp, false otherwise.
         */
        function isRegex(value) {
          return isObjectType(value, 'RegExp');
        }

        /**
         * Checks if a value is an Array object.
         * @param {*} value - The value to check.
         * @returns {boolean} True if it's an Array, false otherwise.
         */
        function isArrayCollection(value) {
          return isObjectType(value, 'Array');
        }

        /**
         * Checks if a value is a function.
         * @param {*} value - The value to check.
         * @returns {boolean} True if it's a function, false otherwise.
         */
        function isFunctionCallable(value) {
          return typeof value === 'function';
        }

        /**
         * Attempts to typecast a string value to its primitive type.
         * @param {string} inputVal - The input string value.
         * @returns {*} The typecasted value.
         */
        function convertToPrimitive(inputVal) {
          if (inputVal === null || inputVal === 'null') {
            return null;
          } else if (inputVal === 'true') {
            return true;
          } else if (inputVal === 'false') {
            return false;
          } else if (inputVal === UNDEFINED_VALUE || inputVal === 'undefined') {
            return UNDEFINED_VALUE;
          } else if (inputVal === '' || isNaN(inputVal)) {
            // isNaN('') is false, so this handles empty string and actual non-numbers
            return inputVal;
          } else {
            // parseFloat(null || '') returns NaN, so this is safe after initial checks
            return parseFloat(inputVal);
          }
        }

        /**
         * Typecasts all string values in an array.
         * @param {Array<string>} stringValues - Array of string values.
         * @returns {Array<*>} Array with typecasted values.
         */
        function convertArrayPrimitives(stringValues) {
          const processed = [];
          for (let i = 0; i < stringValues.length; i++) {
            processed[i] = convertToPrimitive(stringValues[i]);
          }
          return processed;
        }

        /**
         * Decodes a query string into an object.
         * @param {string} queryStr - The query string (e.g., "?key=val&foo=bar").
         * @param {boolean} shouldTypeConvert - Whether to typecast values.
         * @returns {Object} An object representing the query parameters.
         */
        function parseUrlQuery(queryStr, shouldTypeConvert) {
          const params = (queryStr || '').replace(/^\?/, '').split('&');
          const resultObj = {};
          let currentParam;
          let paramParts;
          let valueToAssign;

          for (let i = 0; i < params.length; i++) {
            currentParam = params[i];
            if (!currentParam) continue; // Skip empty parts from trailing & or multiple &&

            paramParts = currentParam.split('=');
            valueToAssign = shouldTypeConvert ? convertToPrimitive(paramParts[1]) : paramParts[1];
            resultObj[paramParts[0]] = (typeof valueToAssign === 'string') ? decodeURIComponent(valueToAssign) : valueToAssign;
          }
          return resultObj;
        }


        // PathMatcher Main Class --------
        //================================

        /**
         * @constructor
         * Manages and dispatches navigation rules.
         */
        function NavigationManager() {
          this.pathBypassed = new signalsLib.Signal(); // Dispatched if no route matches
          this.pathRouted = new signalsLib.Signal();   // Dispatched when a route successfully matches and executes
          this._registeredRules = [];               // All active routing rules
          this._previousMatches = [];               // Rules that matched the last request
          this._chainedManagers = [];               // Other NavigationManager instances to pipe requests to

          // Configuration flags
          this.eagerMatch = false;         // If true, will try to match all routes, not just the first valid one
          this.eagerMatchActive = true;    // Controls if 'eagerMatch' is enabled globally
          this.caseInsensitive = true;     // Ignore case when matching paths
          this.ignoreChange = false;       // If true, will process same request multiple times
          this.autoTypeConvert = false;    // Automatically convert parameter values to primitives
          this.transformArgsFunc = null;   // Custom function to normalize dispatched arguments

          // Internal state for tracking
          this._lastProcessedRequest = null;
          this._lastBypassedRequest = null;

          // Initialize state
          this.resetManagerHistory();
        }

        NavigationManager.prototype = {

          /**
           * Resets the internal state and history of the manager.
           */
          resetManagerHistory: function() {
            this._previousMatches.length = 0;
            this._lastProcessedRequest = null;
            this._lastBypassedRequest = null;
          },

          /**
           * Creates a new instance of NavigationManager.
           * @returns {NavigationManager} A new NavigationManager instance.
           */
          createInstance: function () {
            return new NavigationManager();
          },

          /**
           * Adds a new navigation rule (route) to the manager.
           * @param {string|RegExp} expression - The path pattern or regular expression.
           * @param {Function} [handler] - The callback function to execute on match.
           * @param {number} [precedence] - Priority for this rule (higher number = higher priority).
           * @returns {NavigationRule} The created navigation rule object.
           */
          registerPath: function (expression, handler, precedence) {
            const newRule = new NavigationRule(expression, handler, precedence, this);
            this._insertOrdered(newRule); // Insert based on precedence
            return newRule;
          },

          /**
           * Removes a specific navigation rule from the manager.
           * @param {NavigationRule} ruleToRemove - The rule object to remove.
           */
          unregisterPath: function (ruleToRemove) {
            removeArrayItem(this._registeredRules, ruleToRemove);
            ruleToRemove._disposeRule(); // Clean up rule's internal resources
          },

          /**
           * Removes all registered navigation rules.
           */
          clearAllPaths: function () {
            let numRules = this.getRuleCount();
            while (numRules--) {
              this._registeredRules[numRules]._disposeRule();
            }
            this._registeredRules.length = 0;
            this.resetManagerHistory(); // Also clear history when all paths are gone
          },

          /**
           * Parses a given request string against all registered rules.
           * @param {string} [requestPath=''] - The request string (e.g., URL path).
           * @param {Array} [baseArguments=[]] - Additional arguments to pass to handlers.
           */
          processRequest: function (requestPath, baseArguments) {
            requestPath = requestPath || '';
            baseArguments = baseArguments || [];

            // Skip processing if request hasn't changed and ignoreChange is active
            if (!this.ignoreChange &&
                (requestPath === this._lastProcessedRequest ||
                 requestPath === this._lastBypassedRequest)) {
              return;
            }

            const matchingRules = this._findMatchingRules(requestPath);
            let currentMatchItem;
            let ruleExecIndex = 0;

            if (matchingRules.length > 0) {
              this._lastProcessedRequest = requestPath;
              this._lastBypassedRequest = null; // Clear bypassed state if a match occurred

              this._notifyPrevRulesOfSwitch(matchingRules, requestPath);
              this._previousMatches = matchingRules;

              // Execute rules in their determined order
              while (ruleExecIndex < matchingRules.length) {
                currentMatchItem = matchingRules[ruleExecIndex];
                // Dispatch 'matched' signal with base args and extracted params
                currentMatchItem.ruleRef.pathMatched.dispatch.apply(
                  currentMatchItem.ruleRef.pathMatched,
                  baseArguments.concat(currentMatchItem.parameters)
                );
                currentMatchItem.isFirstMatch = !ruleExecIndex; // Flag for the first executed rule
                // Dispatch global 'routed' signal
                this.pathRouted.dispatch.apply(
                  this.pathRouted,
                  baseArguments.concat([requestPath, currentMatchItem])
                );
                ruleExecIndex += 1;
              }
            } else {
              this._lastBypassedRequest = requestPath;
              this._lastProcessedRequest = null; // Clear processed state if no match
              this.pathBypassed.dispatch.apply(this.pathBypassed, baseArguments.concat([requestPath]));
            }

            this._propagateRequest(requestPath, baseArguments); // Pipe to other managers
          },

          /**
           * Notifies previously matched rules if a switch has occurred.
           * @param {Array<Object>} newMatchedRules - The currently matched rules.
           * @param {string} currentRequest - The current request string.
           * @private
           */
          _notifyPrevRulesOfSwitch: function(newMatchedRules, currentRequest) {
            for (let i = 0; i < this._previousMatches.length; i++) {
              const prevMatch = this._previousMatches[i];
              // Check if the rule still exists and if it's no longer among the current matches
              if (prevMatch.ruleRef.pathSwitched && this._didRuleSwitch(prevMatch.ruleRef, newMatchedRules)) {
                prevMatch.ruleRef.pathSwitched.dispatch(currentRequest);
              }
            }
          },

          /**
           * Checks if a given rule is no longer present in the new set of matched rules.
           * @param {NavigationRule} ruleToCheck - The rule to verify.
           * @param {Array<Object>} currentMatchedRules - The rules matched in the current request.
           * @returns {boolean} True if the rule switched, false if it's still matched.
           * @private
           */
          _didRuleSwitch: function (ruleToCheck, currentMatchedRules){
            for (let i = 0; i < currentMatchedRules.length; i++) {
              if (currentMatchedRules[i].ruleRef === ruleToCheck) {
                return false; // Rule is still matched
              }
            }
            return true; // Rule is no longer matched
          },

          /**
           * Passes the current request to all chained managers.
           * @param {string} currentRequest - The current request string.
           * @param {Array} baseArguments - Arguments to pass along.
           * @private
           */
          _propagateRequest: function(currentRequest, baseArguments) {
            for (let i = 0; i < this._chainedManagers.length; i++) {
              this._chainedManagers[i].processRequest(currentRequest, baseArguments);
            }
          },

          /**
           * Returns the total number of registered rules.
           * @returns {number} Count of rules.
           */
          getRuleCount: function () {
            return this._registeredRules.length;
          },

          /**
           * Inserts a new rule into the `_registeredRules` array, maintaining sorted order by precedence.
           * @param {NavigationRule} newRule - The rule to insert.
           * @private
           */
          _insertOrdered: function (newRule) {
            const rulesArray = this._registeredRules;
            let insertIndex = rulesArray.length;
            // Simplified insertion sort: find the first element with lower or equal precedence
            while (insertIndex > 0 && newRule._precedence <= rulesArray[insertIndex - 1]._precedence) {
              insertIndex--;
            }
            rulesArray.splice(insertIndex, 0, newRule);
          },

          /**
           * Finds all rules that match the given request.
           * @param {string} requestPath - The request string to match.
           * @returns {Array<Object>} An array of objects containing matched rules and their parameters.
           * @private
           */
          _findMatchingRules: function (requestPath) {
            const matchedResults = [];
            const allRules = this._registeredRules;
            // Iterate from higher priority (end of array) to lower priority
            for (let i = allRules.length - 1; i >= 0; i--) {
              const currentRule = allRules[i];
              const shouldContinueSearching = !matchedResults.length || this.eagerMatch || currentRule.eagerMatch;

              if (shouldContinueSearching && currentRule.testPath(requestPath)) {
                matchedResults.push({
                  ruleRef: currentRule,
                  parameters: currentRule._extractParamsAsArray(requestPath)
                });
              }

              // If eagerMatch is disabled and we found at least one match, stop searching
              if (!this.eagerMatchActive && matchedResults.length > 0) {
                break;
              }
            }
            return matchedResults;
          },

          /**
           * Pipes requests processed by this manager to another NavigationManager instance.
           * @param {NavigationManager} anotherManager - The manager to pipe to.
           */
          pipeTo: function (anotherManager) {
            this._chainedManagers.push(anotherManager);
          },

          /**
           * Stops piping requests to a specific NavigationManager instance.
           * @param {NavigationManager} anotherManager - The manager to unpipe.
           */
          unpipeFrom: function (anotherManager) {
            removeArrayItem(this._chainedManagers, anotherManager);
          },

          /**
           * Returns a string representation of the manager.
           * @returns {string} String representation.
           */
          toString: function () {
            return `[NavigationManager rules:${this.getRuleCount()}]`;
          }
        };

        // Initialize a "static" global instance
        pathMatcherCore = new NavigationManager();
        pathMatcherCore.VERSION = '1.0.0'; // Version property

        // Pre-defined argument normalization functions
        pathMatcherCore.NORMALIZE_AS_ARRAY = function (req, vals) {
          return [vals.all_values_];
        };

        pathMatcherCore.NORMALIZE_AS_OBJECT = function (req, vals) {
          return [vals];
        };


        // NavigationRule Class --------------
        //====================================

        /**
         * @constructor
         * Represents a single routing rule (path pattern and associated handlers).
         */
        function NavigationRule(pathExpression, callbackHandler, precedenceValue, managerRef) {
          const isExpressionRegex = isRegex(pathExpression);
          const pathProcessor = managerRef.pathProcessor; // Reference to the shared lexer

          this._managerRef = managerRef;
          this._pathExpression = pathExpression;
          this._capturedIds = isExpressionRegex ? null : pathProcessor.getParamIdentifiers(pathExpression);
          this._optionalCapturedIds = isExpressionRegex ? null : pathProcessor.getOptionalParamIdentifiers(pathExpression);
          this._validationRegex = isExpressionRegex ? pathExpression : pathProcessor.compilePathPattern(pathExpression, managerRef.caseInsensitive);

          this.pathMatched = new signalsLib.Signal(); // Dispatched when this specific rule matches
          this.pathSwitched = new signalsLib.Signal(); // Dispatched if this rule was active and then a new route takes over
          if (callbackHandler) {
            this.pathMatched.add(callbackHandler);
          }
          this._precedence = precedenceValue || 0; // Default precedence is 0
        }

        NavigationRule.prototype = {

          eagerMatch: false, // If true, this rule will always try to match even if a higher priority rule matched
          validationConstraints: undefined, // Object containing validation rules for parameters

          /**
           * Tests if the given request path matches this rule's pattern.
           * @param {string} requestPath - The request string to test.
           * @returns {boolean} True if the path matches and passes validation, false otherwise.
           */
          testPath: function (requestPath) {
            requestPath = requestPath || '';
            // First, basic regex test. Then, parameter-level validation.
            return this._validationRegex.test(requestPath) && this._checkParameters(requestPath);
          },

          /**
           * Validates parameters extracted from the request path against defined rules.
           * @param {string} currentRequest - The full request string.
           * @returns {boolean} True if all parameters are valid, false otherwise.
           * @private
           */
          _checkParameters: function (currentRequest) {
            const constraints = this.validationConstraints;
            if (!constraints) { // No validation constraints defined, so all parameters are valid by default
              return true;
            }

            const paramValues = this._extractParamsAsObject(currentRequest);
            for (const key in constraints) {
              // 'normalize_' is not a validation rule, it's a transformation hook
              if (Object.prototype.hasOwnProperty.call(constraints, key) && key !== 'normalize_') {
                if (!this._isParameterValid(currentRequest, key, paramValues, constraints[key])) {
                  // Optional: console.debug(`Validation failed for param "${key}" in rule "${this._pathExpression}"`);
                  return false;
                }
              }
            }
            return true;
          },

          /**
           * Checks if a single parameter is valid according to its rule.
           * @param {string} fullRequest - The complete request string.
           * @param {string} paramKey - The name of the parameter.
           * @param {Object} allParamValues - All extracted parameter values.
           * @param {*} validationRule - The specific validation rule for this parameter.
           * @returns {boolean} True if the parameter is valid, false otherwise.
           * @private
           */
          _isParameterValid: function (fullRequest, paramKey, allParamValues, validationRule) {
            let paramValue = allParamValues[paramKey];
            let isValid = false;
            const isQueryParam = (paramKey.indexOf('?') === 0);

            // Handle optional parameters that are not provided
            if ((paramValue === null || paramValue === UNDEFINED_VALUE) &&
                this._optionalCapturedIds && findElementIndex(this._optionalCapturedIds, paramKey) !== -1) {
              return true; // Optional parameter not present is considered valid
            }

            if (isRegex(validationRule)) {
              // For query params, validate against the raw string value if available
              if (isQueryParam && allParamValues[`${paramKey}_raw`]) {
                paramValue = allParamValues[`${paramKey}_raw`];
              }
              isValid = validationRule.test(paramValue);
            } else if (isArrayCollection(validationRule)) {
              if (isQueryParam && allParamValues[`${paramKey}_raw`]) {
                paramValue = allParamValues[`${paramKey}_raw`];
              }
              isValid = this._checkArrayConstraint(validationRule, paramValue);
            } else if (isFunctionCallable(validationRule)) {
              isValid = validationRule(paramValue, fullRequest, allParamValues);
            }
            // If validationRule is of an unsupported type, it silently passes (isValid remains false initially, but is then true if no rule applies).
            // This is a design choice from original crossroads.js, effectively making unsupported rules pass.
            return isValid;
          },

          /**
           * Checks if a value is present in a validation array. Handles case-insensitivity.
           * @param {Array} allowedValues - The array of allowed values.
           * @param {*} valueToTest - The value to check.
           * @returns {boolean} True if the value is in the array, false otherwise.
           * @private
           */
          _checkArrayConstraint: function (allowedValues, valueToTest) {
            if (!this._managerRef.caseInsensitive) {
              return findElementIndex(allowedValues, valueToTest) !== -1;
            }

            let lowerCaseTestValue = (typeof valueToTest === 'string') ? valueToTest.toLowerCase() : valueToTest;

            for (let i = 0; i < allowedValues.length; i++) {
              const item = allowedValues[i];
              const compareItem = (typeof item === 'string') ? item.toLowerCase() : item;
              if (compareItem === lowerCaseTestValue) {
                return true;
              }
            }
            return false;
          },

          /**
           * Extracts and typecasts parameters from the request path into an object.
           * @param {string} requestPath - The request string.
           * @returns {Object} An object containing all extracted parameters.
           * @private
           */
          _extractParamsAsObject: function (requestPath) {
            const shouldTypeConvert = this._managerRef.autoTypeConvert;
            const extractedValues = this._managerRef.pathProcessor.getParamValues(requestPath, this._validationRegex, shouldTypeConvert);
            const paramObject = {};
            let currentParamId;
            let processedValue;

            for (let i = 0; i < extractedValues.length; i++) {
              processedValue = extractedValues[i];

              if (this._capturedIds) { // If pattern had named parameters
                currentParamId = this._capturedIds[i];

                // Special handling for query string parameters (prefixed with '?')
                if (currentParamId.indexOf('?') === 0 && processedValue) {
                  // Store raw string for validation, then parse into object
                  paramObject[`${currentParamId}_raw`] = processedValue;
                  processedValue = parseUrlQuery(processedValue, shouldTypeConvert);
                  extractedValues[i] = processedValue; // Update in the original array for later use
                }

                // IE optional group bug workaround: normalize empty strings to undefined
                if (_legacyOptionalGroupHandling && processedValue === '' &&
                    findElementIndex(this._optionalCapturedIds, currentParamId) !== -1) {
                  processedValue = UNDEFINED_VALUE;
                  extractedValues[i] = processedValue;
                }
                paramObject[currentParamId] = processedValue;
              }
              // Also alias parameters by their numerical index
              paramObject[i] = processedValue;
            }
            // Add the full request path and all values array as special properties
            paramObject.full_request_ = shouldTypeConvert ? convertToPrimitive(requestPath) : requestPath;
            paramObject.all_values_ = extractedValues;
            return paramObject;
          },

          /**
           * Extracts parameters from the request path into an array, applying normalization if defined.
           * @param {string} requestPath - The request string.
           * @returns {Array} An array of extracted and potentially normalized parameters.
           * @private
           */
          _extractParamsAsArray: function (requestPath) {
            const ruleSpecificNormalizer = this.validationConstraints ? this.validationConstraints.normalize_ : null;
            const globalNormalizer = this._managerRef.transformArgsFunc;
            let finalParameters;

            // Prioritize rule-specific normalizer, then global, otherwise use raw values
            const activeNormalizer = ruleSpecificNormalizer || globalNormalizer;

            if (activeNormalizer && isFunctionCallable(activeNormalizer)) {
              finalParameters = activeNormalizer(requestPath, this._extractParamsAsObject(requestPath));
            } else {
              finalParameters = this._extractParamsAsObject(requestPath).all_values_;
            }
            return finalParameters;
          },

          /**
           * Generates a path string by interpolating replacements into the rule's pattern.
           * @param {Object} replacements - Key-value pairs for parameter substitution.
           * @returns {string} The generated path string.
           * @throws {Error} If the generated string fails validation against the rule's constraints.
           */
          generatePath: function(replacements) {
            const interpolatedString = this._managerRef.pathProcessor.interpolatePath(this._pathExpression, replacements);
            if (!this.testPath(interpolatedString)) { // Validate the generated string
              throw new Error(`Generated string "${interpolatedString}" failed validation against rule constraints.`);
            }
            return interpolatedString;
          },

          /**
           * Disposes of the rule, removing it from its manager.
           */
          release: function () {
            this._managerRef.unregisterPath(this);
          },

          /**
           * Internal method to clean up resources when the rule is removed.
           * @private
           */
          _disposeRule: function () {
            this.pathMatched.dispose();
            this.pathSwitched.dispose();
            this.pathMatched = this.pathSwitched = this._pathExpression = this._validationRegex = null;
          },

          /**
           * Returns a string representation of the rule.
           * @returns {string} String representation.
           */
          toString: function () {
            return `[NavigationRule pattern:"${this._pathExpression}", listeners:${this.pathMatched.getNumListeners()}]`;
          }
        };


        // Path Pattern Processor ------
        //==============================
        // This is a factory function for the pathProcessor object

        NavigationManager.prototype.pathProcessor = (function () {

          const REGEX_ESCAPE_CHAR_SET = /[\\.+*?\^$\[\](){}\/'#]/g; // Chars that need escaping in regex
          const TRIM_BOUNDING_SLASHES = /^\/|\/$/g; // Leading/trailing slashes
          const TRAILING_SLASH_ONLY = /\/$/g; // Only trailing slashes
          const PARAMETER_PLACEHOLDER_PATTERN = /(?:\{|:)([^{}:]+)(?:\}|:)/g; // Captures {param} or :param

          // Define how different syntax elements are handled
          const SYNTAX_TOKENS = {
            'OPTIONAL_SLASH': {
              // Matches optional slashes: between `::` or `}:` or `\w:` or `:{?` or `}{?` or `\w{?`
              regex: /([:}]|\w(?=\/))\/?(:|(?:\{\?))/g,
              replacement: '$1{{ID_OPT_SLASH}}$2', // Placeholder for internal processing
              resultantRegex: '\\/?' // Generates an optional slash in the final regex
            },
            'REQUIRED_SLASH': {
              // Matches required slashes: between `:{` and `}{` (ensures a slash is present)
              regex: /([:}])\/?(\{)/g,
              replacement: '$1{{ID_REQ_SLASH}}$2',
              resultantRegex: '\\/'
            },
            'REQUIRED_QUERY': {
              // Matches a required query string: `{?param}`
              regex: /\{\?([^{}]+)\}/g,
              resultantRegex: '\\?([^{}]+)' // Matches `?` followed by any chars except `{}`
            },
            'OPTIONAL_QUERY': {
              // Matches an optional query string: `:?param`
              regex: /:\?([^{}]+)/g,
              resultantRegex: '(?:\\?([^{}]+))?' // Makes the entire query part optional
            },
            'OPTIONAL_PARAM': {
              // Matches an optional parameter: `:param:` or `{param?}`
              regex: /(?:\{([^{}]+)\?\}|:([^{}]+):)/g,
              replacement: '{{ID_OPT_PARAM}}', // Generic placeholder
              resultantRegex: '(?:([^{}]+))?' // Captures content optionally
            },
            'NAMED_PARAM': {
              // Matches a named parameter: `{param}` or `:param` (non-optional)
              regex: /(?:\{([^{}]+)\}|:([^{}]+))/g,
              replacement: '{{ID_NAMED_PARAM}}',
              resultantRegex: '([^{}]+)' // Captures content
            },
            'WILDCARD_SPLIT': {
              // Matches a wildcard segment: `*`
              regex: /\*/g,
              replacement: '{{ID_WILDCARD}}',
              resultantRegex: '.*?' // Matches any characters non-greedily
            }
          };

          /**
           * Escapes special characters in a string for use in a regular expression.
           * @param {string} inputString - The string to escape.
           * @returns {string} The escaped string.
           */
          function escapeRegexChars(inputString) {
            return inputString.replace(REGEX_ESCAPE_CHAR_SET, '\\$&');
          }

          /**
           * Retrieves an array of parameter identifiers from a path pattern.
           * @param {string} pathPattern - The path pattern string.
           * @returns {Array<string>} An array of parameter names.
           */
          function getParamIdentifiers(pathPattern) {
            const identifiers = [];
            let match;
            while ((match = PARAMETER_PLACEHOLDER_PATTERN.exec(pathPattern)) !== null) {
              identifiers.push(match[1]);
            }
            return identifiers;
          }

          /**
           * Retrieves an array of optional parameter identifiers from a path pattern.
           * @param {string} pathPattern - The path pattern string.
           * @returns {Array<string>} An array of optional parameter names.
           */
          function getOptionalParamIdentifiers(pathPattern) {
            const optionalIds = [];
            let match;
            // Matches `{param?}` or `:param:`
            const optionalPattern = /(?:\{([^{}]+)\?\}|:([^{}]+):)/g;
            while ((match = optionalPattern.exec(pathPattern)) !== null) {
              optionalIds.push(match[1] || match[2]); // Capture group 1 for {}?, group 2 for ::
            }
            return optionalIds;
          }

          /**
           * Compiles a path pattern string into a regular expression object.
           * @param {string} pathPattern - The pattern string.
           * @param {boolean} ignoreCaseFlag - Whether the regex should be case-insensitive.
           * @returns {RegExp} The compiled regular expression.
           */
          function compilePathPattern(pathPattern, ignoreCaseFlag) {
            let processedPattern = pathPattern;
            let tokenMap = {}; // Maps generated IDs to their original regex snippets

            // Step 1: Normalize slashes and escape regex special chars
            processedPattern = processedPattern.replace(TRIM_BOUNDING_SLASHES, '');
            processedPattern = escapeRegexChars(processedPattern);

            // Step 2: Replace dynamic tokens with unique IDs and store their regex
            for (const tokenKey in SYNTAX_TOKENS) {
              if (Object.prototype.hasOwnProperty.call(SYNTAX_TOKENS, tokenKey)) {
                const token = SYNTAX_TOKENS[tokenKey];
                let match;
                while ((match = token.regex.exec(processedPattern)) !== null) {
                  const uniqueId = `__LEXER_ID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}__`;
                  tokenMap[uniqueId] = token.resultantRegex;
                  processedPattern = processedPattern.replace(match[0], uniqueId);
                }
              }
            }

            // Step 3: Reconstruct the final regex string
            let finalRegexString = processedPattern;
            for (const id in tokenMap) {
              if (Object.prototype.hasOwnProperty.call(tokenMap, id)) {
                finalRegexString = finalRegexString.replace(id, tokenMap[id]);
              }
            }

            // Add start/end anchors and optional trailing slash
            finalRegexString = `^${finalRegexString}(?:\\/)?$`;

            return new RegExp(finalRegexString, ignoreCaseFlag ? 'i' : '');
          }

          /**
           * Extracts parameter values from a request string using a compiled regex.
           * @param {string} requestString - The request path.
           * @param {RegExp} compiledRegex - The compiled regex for the path.
           * @param {boolean} typecastValues - Whether to typecast extracted values.
           * @returns {Array<*>} An array of extracted parameter values.
           */
          function getParamValues(requestString, compiledRegex, typecastValues) {
            const matchResult = compiledRegex.exec(requestString);
            if (!matchResult) return []; // No match, no values

            // Remove the full match (index 0) from the results
            const rawValues = matchResult.slice(1);
            return typecastValues ? convertArrayPrimitives(rawValues) : rawValues;
          }

          /**
           * Interpolates a path pattern with provided replacements to generate a concrete path.
           * @param {string} pathPattern - The original path pattern.
           * @param {Object} replacements - An object mapping parameter names to values.
           * @returns {string} The interpolated path string.
           */
          function interpolatePath(pathPattern, replacements) {
            let resultPath = pathPattern;

            // Replace named parameters {param} or :param
            resultPath = resultPath.replace(PARAMETER_PLACEHOLDER_PATTERN, function(match, paramName) {
              if (replacements && replacements[paramName] !== UNDEFINED_VALUE) {
                return replacements[paramName];
              }
              // If parameter is optional and not provided, remove it or replace with empty string
              if (pathPattern.includes(`{${paramName}?}`) || pathPattern.includes(`:${paramName}:`)) {
                return ''; // Remove optional parameter if not provided
              }
              throw new Error(`Missing replacement for required parameter: ${paramName}`);
            });

            // Handle wildcards (simple replacement for now)
            resultPath = resultPath.replace(SYNTAX_TOKENS.WILDCARD_SPLIT.regex, function() {
              if (replacements && replacements['*'] !== UNDEFINED_VALUE) {
                return replacements['*'];
              }
              return ''; // Default empty string if wildcard not provided
            });

            // Cleanup any remaining optional syntax if replacements left them (e.g., :param: without value)
            resultPath = resultPath.replace(/:([^{}]+):/g, ''); // Remove unmatched :param:
            resultPath = resultPath.replace(/\{([^{}]+)\?\}/g, ''); // Remove unmatched {param?}

            // Ensure correct slash handling after interpolation
            resultPath = resultPath.replace(TRAILING_SLASH_ONLY, ''); // Remove trailing slash if it resulted from a replacement

            return resultPath;
          }

          return {
            getParamIdentifiers: getParamIdentifiers,
            getOptionalParamIdentifiers: getOptionalParamIdentifiers,
            compilePathPattern: compilePathPattern,
            getParamValues: getParamValues,
            interpolatePath: interpolatePath
          };

        })(); // End Path Pattern Processor factory

        return pathMatcherCore; // Return the "static" instance
      };

      // Expose the factory function to the module instance
      moduleInstance.exports = initPathMatcher;

    }).call(this); // Ensure 'this' context is preserved for the IIFE

  },{}]},{1})
});