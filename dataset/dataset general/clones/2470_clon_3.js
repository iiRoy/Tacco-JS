var fauxJS = {};

/*
 * fauxJS: A lightweight JavaScript mocking utility.
 *
 * This software is provided under a permissive open-source license.
 * Feel free to use, modify, and distribute as needed.
 *
 * No warranty is expressed or implied.
 */

/**
 * Defines the fluent API for configuring mock object interactions.
 * This object's methods are mixed into the mock instance.
 * The 'this' context within these methods refers to the mock object itself.
 */
fauxJS.InteractionBuilder = {
    // Specifies a function that the mock object is expected to receive.
    expectFunctionCall: function(funcName) {
        // Ensure a valid function name is provided.
        if (!funcName || typeof funcName !== 'string') {
            fauxJS.Toolkit.signalProblem("Invalid function name provided to expectFunctionCall.");
            return this; // Continue chain, but an error has been reported.
        }
        // Create and associate a new intercepted function with its behavior.
        const newFunc = new fauxJS.InterceptedFunction(funcName, new fauxJS.BehaviorConfig());
        this.registerFunction(newFunc);
        return this; // Allow method chaining.
    },

    // Sets the expected arguments for the currently active function.
    withArguments: function() {
        let currentConfig = this.getActiveFunction().getBehaviorConfig();
        currentConfig.setExpectedArgs(arguments);
        this.getActiveFunction().setBehaviorConfig(currentConfig);
        return this;
    },

    // Defines the number of times the active function is expected to be called.
    forTimes: function(invocationCount) {
        if (typeof invocationCount !== 'number' || invocationCount < 0) {
            fauxJS.Toolkit.signalProblem("Invocation count must be a non-negative number.");
            return this;
        }
        let currentConfig = this.getActiveFunction().getBehaviorConfig();
        currentConfig.setMaxInvocations(invocationCount);
        this.getActiveFunction().setBehaviorConfig(currentConfig);
        return this;
    },

    // Specifies the return value(s) for the active function.
    andReturns: function() {
        let currentConfig = this.getActiveFunction().getBehaviorConfig();
        currentConfig.setResultSequence(arguments);
        this.getActiveFunction().setBehaviorConfig(currentConfig);
        return this;
    },

    // Sets a callback function to be executed when the active function is called.
    onCompletion: function(callbackFunc, messagePayload) {
        if (typeof callbackFunc !== 'function') {
            fauxJS.Toolkit.signalProblem("Callback provided to onCompletion must be a function.");
            return this;
        }
        let currentConfig = this.getActiveFunction().getBehaviorConfig();
        currentConfig.setCompletionHandler(callbackFunc, messagePayload);
        this.getActiveFunction().setBehaviorConfig(currentConfig);
        return this;
    }
};

// Configuration setting: Treat methods starting with an underscore as private.
fauxJS.PRIVATE_PREFIX_ENABLED = true;

// Custom DSL can be injected here.
fauxJS.MOCK_BUILDER_API = fauxJS.InteractionBuilder;

// Control error reporting to browser console.
fauxJS.CONSOLE_LOG_ISSUES = true;

// Control whether exceptions are thrown, halting execution.
fauxJS.THROW_RUNTIME_EXCEPTIONS = true;

// Factory method to create a new mock instance.
fauxJS.createMock = function(originalObject) {
    // A quick validation for the target.
    if (originalObject === null || typeof originalObject === 'undefined') {
        fauxJS.Toolkit.signalProblem("Cannot mock a null or undefined object.");
        return null;
    }
    const newProxy = new fauxJS.ProxyObject(originalObject);
    return newProxy;
};

// Represents a mock object.
fauxJS.ProxyObject = function(originalTarget) {
    const _originalTarget = originalTarget;
    const _functionMap = {};
    let _activeFunction = null; // The last function configured.

    // Mix in the fluent API methods from the configured builder.
    const _apiExtension = fauxJS.MOCK_BUILDER_API;
    for (const key in _apiExtension) {
        if (Object.prototype.hasOwnProperty.call(_apiExtension, key) && !this[key]) {
            this[key] = _apiExtension[key];
        }
    }

    // Adds a simulated function to this mock object.
    this.registerFunction = function(simulatedFunction) {
        const funcName = simulatedFunction.getFunctionName();

        // Check if the target object actually possesses this function.
        if (!fauxJS.Toolkit.objectHasFunction(_originalTarget, funcName)) {
            fauxJS.Toolkit.signalProblem(`Function '${funcName}' is not a public method on the object being mocked.`);
            // Potentially, we might want to return here or throw, depending on strictness.
            // For now, we proceed but log a warning.
        }

        // Overwrite the original function on the mock with our proxy.
        this[funcName] = function() {
            // Execute the intercepted function's logic.
            return simulatedFunction.executeProxy(arguments);
        };

        // Store the simulated function for later reference.
        _functionMap[funcName] = simulatedFunction;
        _activeFunction = simulatedFunction; // Set as the currently active function for chaining.
    };

    // Retrieves the most recently registered/configured function.
    this.getActiveFunction = function() {
        if (!_activeFunction) {
            fauxJS.Toolkit.signalProblem("No function has been registered yet. Call 'expectFunctionCall' first.");
        }
        return _activeFunction;
    };
};

/**
 * Represents a function that has been intercepted and configured on a mock object.
 * @param {string} fnName - The name of the function.
 * @param {fauxJS.BehaviorConfig} behaviorConfig - The configuration for this function's behavior.
 */
fauxJS.InterceptedFunction = function(fnName, behaviorConfig) {
    const _fnName = fnName;
    let _config = behaviorConfig;
    let _invocationCount = 0; // Tracks how many times this function has been called.

    this.getFunctionName = () => _fnName;

    this.getBehaviorConfig = () => _config;

    this.setBehaviorConfig = (newConfig) => {
        if (newConfig instanceof fauxJS.BehaviorConfig) {
            _config = newConfig;
        } else {
            fauxJS.Toolkit.signalProblem("Attempted to set an invalid behavior configuration.");
        }
    };

    // This method is called when the mocked function is invoked.
    this.executeProxy = function(actualArguments) {
        _invocationCount = _invocationCount + 1; // Increment call count.

        // Check against the maximum allowed invocations.
        const maxCalls = _config.getMaxInvocations();
        if (maxCalls !== null && _invocationCount > maxCalls) {
            fauxJS.Toolkit.signalProblem(
                `Function '${_fnName}' exceeded its call limit of ${maxCalls}. This was call number ${_invocationCount}.`
            );
            // Optionally, return a default or throw an error immediately here.
        }

        // Validate provided arguments against expected arguments.
        const expectedArguments = _config.getExpectedArgs();
        for (let i = 0; i < expectedArguments.length; ++i) {
            const expectedArg = expectedArguments[i];
            const actualArg = actualArguments[i];

            // Ensure an argument was actually passed if expected.
            if (typeof actualArg === 'undefined' && typeof expectedArg !== 'undefined') {
                fauxJS.Toolkit.signalProblem(
                    `Function '${_fnName}' called without expected argument at position ${i + 1}. Expected: ${expectedArg}`
                );
                continue; // Move to next argument check.
            }

            const expectedType = fauxJS.Toolkit.identifyPrimitiveType(expectedArg);
            const actualType = actualArg ? (actualArg._kindTag || "Object") : null;

            // If an expected type was specified, perform a type check.
            if (expectedType) {
                if (actualType !== expectedType) {
                    fauxJS.Toolkit.signalProblem(
                        `Function '${_fnName}' argument mismatch: position ${i + 1}. ` +
                        `Expected type: '${expectedType}', Received type: '${actualType}'.`
                    );
                }
            }

            // Perform deep equality check for all arguments.
            if (!fauxJS.Toolkit.deepEqualCheck(expectedArg, actualArg)) {
                fauxJS.Toolkit.signalProblem(
                    `Function '${_fnName}' argument mismatch: position ${i + 1}. ` +
                    `Expected value: '${JSON.stringify(expectedArg)}', Received value: '${JSON.stringify(actualArg)}'.`
                );
            }
        }

        // Execute any registered callback.
        const handler = _config.getCompletionHandler();
        if (handler && typeof handler.callback === 'function') {
            handler.callback(handler.message);
        }

        // Determine the return value.
        const returnValues = _config.getResultSequence();
        if (returnValues.length > 0) {
            // If multiple return values are specified, cycle through them.
            // If call count exceeds array length, return the last one.
            const returnIndex = Math.min(_invocationCount - 1, returnValues.length - 1);
            return returnValues[returnIndex];
        }

        // Default return for no specified return values.
        return undefined;
    };
};

/**
 * Stores the behavior configuration for an intercepted function.
 */
fauxJS.BehaviorConfig = function() {
    let _maxInvocations = null; // null means no limit.
    let _expectedArgs = [];
    let _resultSequence = [];
    let _completionHandler = null; // { callback: Function, message: any }

    this.getMaxInvocations = () => _maxInvocations;
    this.setMaxInvocations = (limit) => {
        _maxInvocations = limit;
    };

    this.getExpectedArgs = () => _expectedArgs;
    this.setExpectedArgs = (args) => {
        _expectedArgs = Array.from(args); // Convert arguments object to array.
    };

    this.getResultSequence = () => _resultSequence;
    this.setResultSequence = (results) => {
        _resultSequence = Array.from(results);
    };

    this.getCompletionHandler = () => _completionHandler;
    this.setCompletionHandler = (handlerFn, msg) => {
        _completionHandler = { callback: handlerFn, message: msg };
    };
};

// Utility and helper functions.
fauxJS.Toolkit = {

    // Reports issues, either to console or by throwing exceptions.
    signalProblem: function(issueMessage) {
        const fullMessage = 'fauxJS Error: ' + issueMessage;
        if (fauxJS.CONSOLE_LOG_ISSUES && typeof console !== 'undefined' && console.warn) {
            console.warn(fullMessage);
        }
        if (fauxJS.THROW_RUNTIME_EXCEPTIONS) {
            throw new Error(fullMessage);
        }
    },

    /**
     * Performs a deep comparison of two JavaScript values.
     * Handles primitives, arrays, and plain objects.
     * @param {*} valA
     * @param {*} valB
     * @returns {boolean} True if values are deeply equal, false otherwise.
     */
    deepEqualCheck: function(valA, valB) {
        // Strict equality for primitives.
        if (valA === valB) return true;

        // If types are different at a fundamental level, they can't be equal.
        if (valA === null || valB === null || typeof valA !== 'object' || typeof valB !== 'object') {
            return false;
        }

        const typeA = valA._kindTag || "Object";
        const typeB = valB._kindTag || "Object";

        // Check array contents.
        if (typeA === "Array" && typeB === "Array") {
            if (valA.length !== valB.length) return false;
            for (let k = 0; k < valA.length; k++) {
                if (!this.deepEqualCheck(valA[k], valB[k])) return false;
            }
            return true;
        }

        // Check plain object contents.
        if (typeA === "Object" && typeB === "Object") {
            const keysA = Object.keys(valA);
            const keysB = Object.keys(valB);

            if (keysA.length !== keysB.length) return false;

            for (const propName of keysA) {
                if (!Object.prototype.hasOwnProperty.call(valB, propName) || !this.deepEqualCheck(valA[propName], valB[propName])) {
                    return false;
                }
            }
            return true;
        }

        // If types are different or unsupported for deep comparison (e.g., Functions, Dates),
        // fallback to strict equality (already handled above if they were primitives).
        // For objects, if they reached here, they are different types of objects or not plain objects.
        return false;
    },

    /**
     * Identifies the "base" type of an item using custom '_kindTag' or constructor name.
     * @param {*} item The item to check.
     * @returns {string|null} The type tag as a string (e.g., "String", "Number", "Array", "Object") or null if not a recognized base type.
     */
    identifyPrimitiveType: function(item) {
        if (item === null || typeof item === 'undefined') {
            return null;
        }
        if (item._kindTag) {
            return item._kindTag;
        }
        // Fallback for types not explicitly tagged, or for constructors like `String`, `Number`.
        if (item === String) return "String";
        if (item === Number) return "Number";
        if (item === Array) return "Array";
        if (item === Date) return "Date";
        if (item === Boolean) return "Boolean";
        if (item === Object) return "Object";
        if (item === Function) return "Function";
        if (item === RegExp) return "RegExp";

        // For instances, try to infer from typeof or constructor name.
        const typeOfResult = typeof item;
        if (typeOfResult === 'string') return "String";
        if (typeOfResult === 'number') return "Number";
        if (typeOfResult === 'boolean') return "Boolean";
        if (item instanceof RegExp) return "RegExp";
        if (item instanceof Date) return "Date";
        if (Array.isArray(item)) return "Array";
        if (typeOfResult === 'function') return "Function";
        if (typeOfResult === 'object') return "Object"; // Generic object

        return null;
    },

    /**
     * Checks if an object (or its prototype chain) has a specific function.
     * This also considers functions defined directly in the constructor.
     * @param {object} targetObj The object or constructor to inspect.
     * @param {string} funcName The name of the function to find.
     * @returns {boolean} True if the function exists, false otherwise.
     */
    objectHasFunction: function(targetObj, funcName) {
        // Check direct properties.
        if (typeof targetObj[funcName] === "function") {
            return true;
        }

        // Check prototype chain.
        let currentProto = Object.getPrototypeOf(targetObj);
        while (currentProto && currentProto !== Object.prototype) {
            if (typeof currentProto[funcName] === "function") {
                return true;
            }
            currentProto = Object.getPrototypeOf(currentProto);
        }

        // If targetObj is a constructor function, inspect its prototype.
        if (typeof targetObj === 'function' && targetObj.prototype) {
            if (typeof targetObj.prototype[funcName] === 'function') {
                return true;
            }
            // Additionally, check for methods defined as `this.method = function() { ... }` in the constructor body.
            const ctorMethods = this.parseConstructorFunctions(targetObj);
            return ctorMethods.includes(funcName);
        }

        return false;
    },

    /**
     * Parses the string representation of a constructor function to find methods
     * defined directly on `this` within its body.
     * This is a heuristic and might not be robust against all code styles.
     * @param {Function} constructorFn The constructor function to analyze.
     * @returns {string[]} An array of method names found.
     */
    parseConstructorFunctions: function(constructorFn) {
        const ctorString = constructorFn.toString();
        // Regex to find patterns like `this.someMethod = function(...)` or `this.anotherFn = () => ...`
        const methodPattern = /this\.([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*(?:function\s*\(|[^=]+\s*=>)/g;
        let match;
        const foundMethods = new Set(); // Use a Set to avoid duplicates.

        while ((match = methodPattern.exec(ctorString)) !== null) {
            // match[1] captures the method name.
            foundMethods.add(match[1]);
        }

        return Array.from(foundMethods);
    }
};

// Extend built-in prototypes to add a custom type tag.
// This helps in consistent type checking across the library.
// Note: Modifying prototypes of built-in objects is generally discouraged,
// but used here to mimic the original library's approach.
// A check is added to prevent re-tagging or overwriting.
if (!String.prototype.hasOwnProperty('_kindTag')) {
    Object.defineProperty(String.prototype, '_kindTag', { value: "String", writable: false, configurable: false });
}
if (!Number.prototype.hasOwnProperty('_kindTag')) {
    Object.defineProperty(Number.prototype, '_kindTag', { value: "Number", writable: false, configurable: false });
}
if (!Date.prototype.hasOwnProperty('_kindTag')) {
    Object.defineProperty(Date.prototype, '_kindTag', { value: "Date", writable: false, configurable: false });
}
if (!Array.prototype.hasOwnProperty('_kindTag')) {
    Object.defineProperty(Array.prototype, '_kindTag', { value: "Array", writable: false, configurable: false });
}
if (!Boolean.prototype.hasOwnProperty('_kindTag')) {
    Object.defineProperty(Boolean.prototype, '_kindTag', { value: "Boolean", writable: false, configurable: false });
}
if (!RegExp.prototype.hasOwnProperty('_kindTag')) {
    Object.defineProperty(RegExp.prototype, '_kindTag', { value: "RegExp", writable: false, configurable: false });
}