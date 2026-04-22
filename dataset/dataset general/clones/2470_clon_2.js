/**
 * simulate
 *
 * Copyright 2008 Liam Miller
 *  - liam.miller@devmail.com
 *  - https://liam-miller-dev.netlify.app
 *
 * https://github.com/liam-miller-dev/simulate
 *
 * This software package is free; you may redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This package is provided with the hope that it will be useful,
 * but WITHOUT ANY GUARANTEE; without even the implied guarantee of
 * MARKETABILITY or SUITABILITY FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this package; if not, write to the Free Software
 * Foundation, Inc, 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA
 */

/**
 * Main application namespace
 */
var simulate = {};

/**
 * Object defining the mock API within the domain-specific language (DSL)
 * IMPORTANT: The API defined in simulate.APPLICATION_PROGRAMMING_INTERFACE
 *            will always be mixed into the mock object.
 * THIS IMPLIES that 'this' will reference the mock object, NOT the current scope.
 */
simulate.API = {

    expect_call: function(routine) {
        // Enlist the routine into the mock
        this.registerRoutine(new simulate.Routine(routine, new simulate.Assumption()));
        return this;
    },

    with_params: function() {
        var currentAssumption = this.getCurrentRoutine().getAssumption();
        currentAssumption.setParameters(arguments);
        this.getCurrentRoutine().setAssumption(currentAssumption);
        return this;
    },

    occurrences: function(count) {
        var currentAssumption = this.getCurrentRoutine().getAssumption();
        currentAssumption.setExecutionLimit(count);
        this.getCurrentRoutine().setAssumption(currentAssumption);
        return this;
    },

    and_yield: function() {
        var currentAssumption = this.getCurrentRoutine().getAssumption();
        currentAssumption.setResultValues(arguments);
        this.getCurrentRoutine().setAssumption(currentAssumption);
        return this;
    },

    and_action: function(actionFunc, statusMsg) {
        var currentAssumption = this.getCurrentRoutine().getAssumption();
        currentAssumption.setAction(actionFunc, statusMsg);
        this.getCurrentRoutine().setAssumption(currentAssumption);
        return this;
    }

};

/**
 * Set to true if you want 'simulate' to treat routines starting with an underscore as internal
 */
simulate.LEADING_UNDERSCORE_IS_PRIVATE = true;

/**
 * Here you can substitute the default 'simulate' API with your own preferred flavor
 */
simulate.APPLICATION_PROGRAMMING_INTERFACE = simulate.API;

/**
 * Will output errors to the browser console if set to true
 */
simulate.CONSOLE_EXCEPTIONS = true;

/**
 * Will raise exceptions in the browser environment if set to true
 * NOTE: Firebug may sometimes intercept browser exceptions and not display them (a Firebug issue)
 */
simulate.GLOBAL_EXCEPTIONS = true;

/**
 * Static method for generating a mock object
 * @param {Object} targetObj The object to be mocked
 * @returns {simulate.Imitator} The constructed mock object
 */
simulate.imitate = function(targetObj) {
    var imitatorInstance = new simulate.Imitator(targetObj);
    return imitatorInstance;
};

/**
 * Constructor for the Imitator (mock) object
 * @param {Object} targetObj The object being mocked
 */
simulate.Imitator = function(targetObj) {
    var _targetObj = targetObj;
    var _routines = {};
    var _currentRoutine = null;

    // Mix in the API methods
    var _api = simulate.APPLICATION_PROGRAMMING_INTERFACE;
    for (var propName in _api) {
        if (!_api.hasOwnProperty(propName)) continue; // Ensure it's an own property
        if (!this[propName]) {
            this[propName] = _api[propName];
        }
    }

    /**
     * Adds a routine to the mock object
     * @param {simulate.Routine} routine The routine to add
     */
    this.registerRoutine = function(routine) {
        // Verify the routine exists in the target object's interface
        if (!simulate.Utility.hasRoutine(_targetObj, routine.retrieveName())) {
            simulate.Utility.signalError("simulate Routine: " + routine.retrieveName() + "() is not a public routine within the interface of the object being mocked.");
        }

        // Add the routine to the mock object
        this[routine.retrieveName()] = function(inValue) {
            return routine.execute(arguments);
        };

        // Store the routine in the routines collection
        _routines[routine.retrieveName()] = routine;
        _currentRoutine = routine;
    };

    /**
     * Retrieves the last routine added to the mock
     * @returns {simulate.Routine} The currently active routine
     */
    this.getCurrentRoutine = function() {
        return _currentRoutine;
    };
};

/**
 * Class representing mock routines
 * @param {String} routineName The name of the routine
 * @param {simulate.Assumption} [assumption] An instance of simulate.Assumption (optional)
 */
simulate.Routine = function(routineName, assumption) {
    var _routineName = routineName;
    var _assumption = assumption;
    var _invocations = 0;

    /**
     * Gets the name of this routine
     * @returns {String} The routine name
     */
    this.retrieveName = function() {
        return _routineName;
    };

    /**
     * Gets the assumption object for this routine
     * @returns {simulate.Assumption} The assumption
     */
    this.getAssumption = function() {
        return _assumption;
    };

    /**
     * Sets the assumption object for this routine
     * @param {simulate.Assumption} newAssumption The new assumption
     */
    this.setAssumption = function(newAssumption) {
        _assumption = newAssumption;
    };

    /**
     * Executes the routine, performing checks and returning values based on assumptions
     * @param {Array} invokedArgs The arguments passed during the routine's invocation
     * @returns {*} The return value as specified by assumptions
     */
    this.execute = function(invokedArgs) {
        // Increment invocation count
        _invocations++;

        // Check invocation limits
        if (_assumption.getExecutionLimit() !== null && _invocations > _assumption.getExecutionLimit()) {
            simulate.Utility.signalError("simulate Routine: " + _routineName + "() - has surpassed its execution limit of " + _assumption.getExecutionLimit() + ".");
        }

        // Check parameters
        for (var idx = 0; idx < _assumption.getParameters().length; idx++) {
            var expectedParam = _assumption.getParameters()[idx];
            var expectedParamBaseType = simulate.Utility.isPrimitiveType(expectedParam);
            var givenParamBaseType = invokedArgs[idx] && invokedArgs[idx]._variant ? invokedArgs[idx]._variant : "GenericObj"; // We haven't added _variant to object to avoid breaking for/in loops

            // Check if the parameter was actually passed
            if (!invokedArgs[idx]) {
                simulate.Utility.signalError("simulate Routine: " + _routineName + "() was called without an expected parameter - parameter " + (idx + 1) + " should have been " + expectedParam + ".");
            }

            // Perform type check if the expected parameter is a primitive type
            if (expectedParamBaseType) {
                if (givenParamBaseType === expectedParamBaseType) {
                    continue; // Type matches, move to next parameter
                } else {
                    simulate.Utility.signalError("simulate Routine: " + _routineName + "() was called with a parameter that differs in type from what was expected - actual type: " + givenParamBaseType + " should be: " + expectedParamBaseType + ".");
                }
            }

            // If we have a parameter and are not just checking type, check for equality
            if (!simulate.Utility.areEquivalent(expectedParam, invokedArgs[idx])) {
                simulate.Utility.signalError("simulate Routine: " + _routineName + "() was called with a parameter that differs from what was expected - actual value: " + invokedArgs[idx] + " should be: " + expectedParam + ".");
            }
        }

        // Trigger action callback if defined
        if (_assumption.getAction()) {
            _assumption.getAction().actionFunc(_assumption.getAction().statusMsg); // Execute the stored function
        }

        // Return a value if specified
        if (_assumption.getResultValues().length > 0) {
            return _assumption.getResultValues()[_invocations - 1] || _assumption.getResultValues()[_assumption.getResultValues().length - 1];
        }
    };
};

/**
 * Class for storing routine assumptions (expectations)
 */
simulate.Assumption = function() {
    var _executionLimit = null;
    var _parameters = [];
    var _resultValues = [];
    var _action = null;

    /**
     * Gets the maximum number of times the routine can be called.
     * @returns {Number|null} The call limit or null if none set.
     */
    this.getExecutionLimit = function() {
        return _executionLimit;
    };

    /**
     * Sets the maximum number of times the routine can be called.
     * @param {Number} execLimit The new call limit.
     */
    this.setExecutionLimit = function(execLimit) {
        _executionLimit = execLimit;
    };

    /**
     * Gets the expected parameters for the routine.
     * @returns {Array} An array of expected parameters.
     */
    this.getParameters = function() {
        return _parameters;
    };

    /**
     * Sets the expected parameters for the routine.
     * @param {Array} paramList An array of parameters.
     */
    this.setParameters = function(paramList) {
        _parameters = paramList;
    };

    /**
     * Gets the predefined return values for the routine.
     * @returns {Array} An array of return values.
     */
    this.getResultValues = function() {
        return _resultValues;
    };

    /**
     * Sets the predefined return values for the routine.
     * @param {Array} resultList An array of return values.
     */
    this.setResultValues = function(resultList) {
        _resultValues = resultList;
    };

    /**
     * Gets the action (callback) associated with this routine.
     * @returns {Object|null} An object containing the action function and message, or null.
     */
    this.getAction = function() {
        return _action;
    };

    /**
     * Sets an action (callback function) to be executed when the routine is called.
     * @param {Function} actionFn The callback function.
     * @param {*} msgData Optional message data to pass to the callback.
     */
    this.setAction = function(actionFn, msgData) {
        _action = {
            actionFunc: actionFn,
            statusMsg: msgData
        };
    };
};

/**
 * Utility functions for the simulate library
 */
simulate.Utility = {

    /**
     * Handles and reports mock-related errors
     * @param {String} errorMsg The error message to display
     */
    signalError: function(errorMsg) {
        if (simulate.CONSOLE_EXCEPTIONS && console.error) {
            console.error('Simulation Exception: ' + errorMsg);
        }
        if (simulate.GLOBAL_EXCEPTIONS) {
            throw errorMsg;
        }
    },

    /**
     * Compares two items for semantic equality.
     * Objects and Arrays are compared based on their content, not reference.
     * @param {*} valA The first value to compare
     * @param {*} valB The second value to compare
     * @returns {Boolean} True if the values are equivalent, false otherwise
     */
    areEquivalent: function(valA, valB) {
        // Different fundamental types
        if (valA._variant !== valB._variant) {
            return false;
        }

        // Check list (Array) contents
        if (valA._variant === "List") {
            if (valA.length !== valB.length) {
                return false;
            }
            for (var idx = 0; idx < valA.length; idx++) {
                if (!this.areEquivalent(valA[idx], valB[idx])) {
                    return false;
                }
            }
            return true;
        }

        // Check generic object contents
        if (typeof valA === "object" && valA !== null) { // Ensure not null
            for (var propKey in valA) {
                if (!valA.hasOwnProperty(propKey)) continue; // Only check own properties
                if (!valB.hasOwnProperty(propKey) || !this.areEquivalent(valA[propKey], valB[propKey])) {
                    return false;
                }
            }
            for (var propKey in valB) {
                if (!valB.hasOwnProperty(propKey)) continue; // Only check own properties
                if (!valA.hasOwnProperty(propKey) || !this.areEquivalent(valA[propKey], valB[propKey])) {
                    return false;
                }
            }
            return true;
        }

        // Direct value comparison for primitives
        return (valA === valB);
    },

    /**
     * Determines if an item is a primitive type constructor.
     * Returns the primitive type name as a string or false.
     * @param {*} dataItem The item to check
     * @returns {String|Boolean} The type name (e.g., "String") or false if not a primitive constructor
     */
    isPrimitiveType: function(dataItem) {

        switch (dataItem) {
            case String:
                return "CharSeq";
            case Number:
                return "Numeric";
            case Array:
                return "List";
            case Date:
                return "CalendarDate";
            case Boolean:
                return "Logical";
            case Object:
                return "GenericObj";
            case Function:
                return "Callable";
            case RegExp:
                return "RegexPattern";
            default:
                return false;
        }
    },

    /**
     * Returns true if the object possesses the specified routine.
     * @param {Object} objSubject The object to inspect
     * @param {String} routineName The name of the routine to find
     * @returns {Boolean} True if the routine exists, false otherwise
     */
    hasRoutine: function(objSubject, routineName) {
        for (var propName in objSubject) {
            if (objSubject.hasOwnProperty(propName) && propName === routineName && typeof objSubject[propName] === "function") {
                return true;
            }
        }
        if (typeof objSubject.prototype === "object" && objSubject.prototype !== null) { // Check prototype chain
            for (var protoRoutine in objSubject.prototype) {
                if (objSubject.prototype.hasOwnProperty(protoRoutine) && protoRoutine === routineName && typeof objSubject.prototype[protoRoutine] === "function") {
                    return true;
                }
            }
            var ctorRoutines = this.getConstructorRoutines(objSubject);
            for (var idx = 0; idx < ctorRoutines.length; idx++) {
                if (ctorRoutines[idx] === routineName) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Retrieves all routines defined directly within the constructor function,
     * without requiring object instantiation.
     * @param {Function} classInstance The constructor function (class)
     * @returns {Array<String>} A list of routine names
     */
    getConstructorRoutines: function(classInstance) {
        if (!classInstance || !classInstance.prototype || !classInstance.prototype.constructor) {
            return [];
        }
        var ctorSrcCode = classInstance.prototype.constructor.toString();
        var regexPattern = /this\..+\s*=\s*\(*\s*function\s*\(\)/g;
        var matchResult;
        var routineList = [];

        while ((matchResult = regexPattern.exec(ctorSrcCode)) !== null) {

            var tempStr = ctorSrcCode.substring(0, matchResult.index);

            var openBrace = /\{/g;
            var closeBrace = /\}/g;

            var countOpen = 0;
            while (openBrace.exec(tempStr) !== null) {
                countOpen++;
            }

            var countClose = 0;
            while (closeBrace.exec(tempStr) !== null) {
                countClose++;
            }

            // If the brace count indicates we're in the top-level scope of the constructor
            if (countOpen - 1 === countClose) {
                routineList.push(matchResult[0].slice(5, matchResult[0].indexOf("=")).trim());
            }
        }

        return routineList;
    }
};

/**
 * Yes, I acknowledge this is an unconventional practice,
 * but I've implemented this for compatibility with jsspec,
 * which already employs similar techniques.
 */
String.prototype._variant = "CharSeq";
Number.prototype._variant = "Numeric";
Date.prototype._variant = "CalendarDate";
Array.prototype._variant = "List";
Boolean.prototype._variant = "Logical";
RegExp.prototype._variant = "RegexPattern";