let envCheckForNode = typeof window === "undefined";

/**
 * Core framework object for assertionKit, a compact JavaScript testing utility.
 *
 * @namespace
 */
const assertionKit = {};

// Conditional export for Node.js environments
if (envCheckForNode) {
  module.exports.assertionKit = assertionKit;
}

/**
 * @private
 * Throws an error for methods that are not yet implemented.
 */
assertionKit.notYetImplemented_ = function() {
  throw new Error("Functionality not yet provided");
};

/**
 * Use <code>assertionKit.undefinedToken</code> instead of raw <code>undefined</code>,
 * as the global <code>undefined</code> can potentially be reassigned in older environments.
 *
 * @private
 */
assertionKit.undefinedToken = void 0;

/**
 * Flag to enable detailed diagnostic output in the console.
 */
assertionKit.DIAGNOSTIC_OUTPUT_ENABLED = false;

/**
 * Default delay in milliseconds for yielding control to the event loop.
 * This allows browser UI updates or network operations.
 * A value of 0 means minimal yielding.
 */
assertionKit.DEFAULT_TASK_YIELD_MS = 100;

/**
 * Standard timeout duration in milliseconds for asynchronous operations.
 */
assertionKit.ASYNC_OPERATION_TIMEOUT = 7000; // Increased from 5000

/**
 * Utility to get the global object, which can be `window` or `globalThis`.
 * @returns {object} The global object.
 */
assertionKit.getGlobalObject = function() {
  // More robust way to get the global object across environments
  if (typeof globalThis !== assertionKit.undefinedToken) {
    return globalThis;
  }
  if (typeof window !== assertionKit.undefinedToken) {
    return window;
  }
  if (typeof self !== assertionKit.undefinedToken) {
    return self;
  }
  // Fallback for older Node.js or obscure environments
  return (function() { return this; })();
};

/**
 * Allows binding of functions to a specific context, primarily for built-in globals.
 * Internal utility.
 *
 * @ignore
 * @private
 * @param {object} baseObj - The object to which the function should be bound (e.g., window).
 * @param {string} funcName - The name of the function to bind.
 * @returns {Function} A bound version of the function.
 */
assertionKit.bindNativeMethod_ = function(baseObj, funcName) {
  const originalFunc = baseObj[funcName];
  if (typeof originalFunc === 'function') {
    // Modern approach using Function.prototype.bind
    return originalFunc.bind(baseObj);
  } else {
    // Fallback for non-callable properties or very old environments
    return () => assertionKit.getGlobalObject()[funcName];
  }
};

// Bind common global timing functions to prevent issues with `this` context
assertionKit.setDelay = assertionKit.bindNativeMethod_(assertionKit.getGlobalObject(), 'setTimeout');
assertionKit.clearDelay = assertionKit.bindNativeMethod_(assertionKit.getGlobalObject(), 'clearTimeout');
assertionKit.setRepeater = assertionKit.bindNativeMethod_(assertionKit.getGlobalObject(), 'setInterval');
assertionKit.clearRepeater = assertionKit.bindNativeMethod_(assertionKit.getGlobalObject(), 'clearInterval');

/**
 * Represents a log message or general output entry during test execution.
 * @constructor
 * @param {Array} contentParts - An array of values to be logged.
 */
assertionKit.LogEntry = function(contentParts) {
  this.entryType = 'info_log';
  this.contentData = contentParts;
  this.stackTrace = new Error("Log creation point"); // Capture stack trace for debugging
};

/**
 * Converts the log entry into a readable string format.
 * @returns {string} The formatted log message.
 */
assertionKit.LogEntry.prototype.toString = function() {
  let displayString = "";
  for (let idx = 0; idx < this.contentData.length; idx++) {
    if (idx > 0) {
      displayString += " ";
    }
    const currentItem = this.contentData[idx];
    if (assertionKit.isStringPrimitive(currentItem)) {
      displayString += currentItem;
    } else {
      displayString += assertionKit.formatForDisplay(currentItem);
    }
  }
  return displayString;
};

/**
 * Represents the outcome of an assertion.
 * @constructor
 * @param {object} options - Configuration for the expectation result.
 * @param {string} options.checkName - The name of the matcher used.
 * @param {boolean} options.testPassed - Whether the assertion passed.
 * @param {*} options.expectedValue - The value that was expected.
 * @param {*} options.actualValue - The actual value received.
 * @param {string} [options.failureMessage] - Custom failure message if the assertion failed.
 * @param {Error} [options.captureTrace] - Optional error object for stack trace.
 */
assertionKit.AssertionOutcome = function(options) {
  this.outcomeType = 'assertion_result';
  this.matcherIdentifier = options.checkName;
  this.successful_ = options.testPassed;
  this.expected = options.expectedValue;
  this.actual = options.actualValue;
  this.message = this.successful_ ? 'Assertion Passed.' : (options.failureMessage || 'Assertion Failed.');

  // Capture trace if not provided and assertion failed
  this.errorOrigin = this.successful_ ? '' : (options.captureTrace || new Error(this.message));
};

/**
 * Returns the message associated with this assertion outcome.
 * @returns {string} The assertion message.
 */
assertionKit.AssertionOutcome.prototype.toString = function() {
  return this.message;
};

/**
 * Checks if the assertion was successful.
 * @returns {boolean} True if the assertion passed, false otherwise.
 */
assertionKit.AssertionOutcome.prototype.didPass = function() {
  return this.successful_;
};

/**
 * Retrieves the current testing execution environment.
 * Ensures an environment instance exists, creating one if necessary.
 * @returns {assertionKit.ExecutionEnvironment} The active execution environment.
 */
assertionKit.fetchRuntimeContext = function() {
  // Use nullish coalescing for brevity if supported, otherwise logical OR
  assertionKit.activeRuntimeInstance_ = assertionKit.activeRuntimeInstance_ ?? new assertionKit.ExecutionEnvironment();
  return assertionKit.activeRuntimeInstance_;
};

/**
 * Utility functions for type checking.
 * @private
 */
assertionKit.typeUtils = {
  /**
   * Checks if a value is of a specific JavaScript type.
   * @param {string} targetTypeName - The expected type name (e.g., "Array", "String").
   * @param {*} val - The value to check.
   * @returns {boolean} True if the value matches the type, false otherwise.
   */
  isOfType: (targetTypeName, val) => {
    return Object.prototype.toString.call(val) === `[object ${targetTypeName}]`;
  },

  /**
   * @param {*} val
   * @returns {boolean}
   */
  checkIfArray: (val) => assertionKit.typeUtils.isOfType("Array", val),

  /**
   * @param {*} val
   * @returns {boolean}
   */
  isStringPrimitive: (val) => assertionKit.typeUtils.isOfType("String", val),

  /**
   * @param {*} val
   * @returns {boolean}
   */
  isNumericValue: (val) => assertionKit.typeUtils.isOfType("Number", val) && !isNaN(val)
};

// Expose these helpers directly for convenience
assertionKit.isArray_ = assertionKit.typeUtils.checkIfArray;
assertionKit.isString_ = assertionKit.typeUtils.isStringPrimitive;
assertionKit.isNumber_ = assertionKit.typeUtils.isNumericValue;
assertionKit.isA_ = assertionKit.typeUtils.isOfType; // Keep original name for direct mapping if needed

/**
 * Formats any given value into a human-readable string representation.
 *
 * @param {*} inputVal - The value to be formatted.
 * @returns {string} A string representation of the value.
 */
assertionKit.formatForDisplay = function(inputVal) {
  // Using a simplified internal formatter instead of a separate object instance
  const formatter = {
    output: [],
    visitedObjects: new WeakSet(), // Prevent circular references

    format: function(value, indent = 0) {
      if (this.visitedObjects.has(value)) {
        this.output.push('[Circular]');
        return;
      }

      const type = typeof value;
      const indentation = '  '.repeat(indent);

      if (value === null) {
        this.output.push('null');
      } else if (type === 'undefined') {
        this.output.push('undefined');
      } else if (type === 'string') {
        this.output.push(`'${value}'`);
      } else if (type === 'number' || type === 'boolean') {
        this.output.push(value.toString());
      } else if (type === 'function') {
        this.output.push(`[Function: ${value.name || 'anonymous'}]`);
      } else if (value instanceof RegExp) {
        this.output.push(value.toString());
      } else if (assertionKit.isArray_(value)) {
        if (value.length === 0) {
          this.output.push('[]');
          return;
        }
        this.visitedObjects.add(value);
        this.output.push('[\n');
        for (let i = 0; i < value.length; i++) {
          this.output.push(indentation + '  ');
          this.format(value[i], indent + 1);
          if (i < value.length - 1) this.output.push(',');
          this.output.push('\n');
        }
        this.output.push(indentation + ']');
        this.visitedObjects.delete(value);
      } else if (type === 'object') {
        if (Object.keys(value).length === 0) {
          this.output.push('{}');
          return;
        }
        this.visitedObjects.add(value);
        this.output.push('{\n');
        const keys = Object.keys(value);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          this.output.push(indentation + `  '${key}': `);
          this.format(value[key], indent + 1);
          if (i < keys.length - 1) this.output.push(',');
          this.output.push('\n');
        }
        this.output.push(indentation + '}');
        this.visitedObjects.delete(value);
      } else {
        try {
          this.output.push(String(value));
        } catch (e) {
          this.output.push(`[Object of type ${type}]`);
        }
      }
    }
  };

  formatter.format(inputVal);
  return formatter.output.join('');
};

/**
 * Checks if the given object is an HTML DOM element node.
 *
 * @param {object} targetObj - The object to verify.
 * @returns {boolean} True if the object is a DOM element, false otherwise.
 */
assertionKit.isDomElement = function(targetObj) {
  // More robust check for DOM nodes
  return targetObj && typeof targetObj === 'object' &&
         typeof targetObj.nodeType === 'number' &&
         targetObj.nodeType === 1 && // Node.ELEMENT_NODE
         typeof targetObj.tagName === 'string';
};

/**
 * Provides an object that matches any instance of a given class/constructor.
 * Useful for assertions where the exact value doesn't matter, only its type.
 *
 * @example
 * // Expect any function to have been passed
 * expect(myCallback).toHaveBeenCalledWith(assertionKit.anyInstanceOf(Function));
 *
 * @param {Function} constructorRef - The constructor function to match against.
 * @returns {object} A special matcher object.
 */
assertionKit.anyInstanceOf = function(constructorRef) {
  // Using a simplified internal Matchers object
  assertionKit.Matchers = assertionKit.Matchers || {};
  assertionKit.Matchers.AnyType = assertionKit.Matchers.AnyType || function(ctor) {
    this.constructorRef = ctor;
    this.asymmetricMatch = function(other) {
      if (other === null || other === assertionKit.undefinedToken) return false;
      return other.constructor === this.constructorRef || other instanceof this.constructorRef;
    };
    this.toString = () => `<any ${ctor.name}>`;
  };
  return new assertionKit.Matchers.AnyType(constructorRef);
};

/**
 * Creates a matcher to check if an object contains a specified subset of properties.
 * Useful when you only care about certain attributes of a larger object.
 *
 * @example
 * // Expect an object with 'status' and 'data' properties
 * expect(response).toEqual(assertionKit.partialObject({status: 200, data: 'OK'}));
 *
 * @param {object} subObject - The object containing the properties to match.
 * @returns {object} A special matcher object.
 */
assertionKit.partialObject = function(subObject) {
  assertionKit.Matchers = assertionKit.Matchers || {};
  assertionKit.Matchers.PartialObject = assertionKit.Matchers.PartialObject || function(sample) {
    this.sample = sample;
    this.asymmetricMatch = function(other) {
      if (typeof other !== 'object' || other === null) return false;
      for (let key in this.sample) {
        if (this.sample.hasOwnProperty(key)) {
          if (!other.hasOwnProperty(key)) return false;
          // Recursive check for nested objects or asymmetric matchers
          if (typeof this.sample[key] === 'object' && this.sample[key] !== null && this.sample[key].asymmetricMatch) {
            if (!this.sample[key].asymmetricMatch(other[key])) return false;
          } else if (this.sample[key] !== other[key]) {
            return false;
          }
        }
      }
      return true;
    };
    this.toString = () => `<partial object ${assertionKit.formatForDisplay(sample)}>`;
  };
  return new assertionKit.Matchers.PartialObject(subObject);
};

/**
 * A test double for functions, allowing tracking of calls, arguments, and custom behavior.
 * Can act as a stub, spy, or fake.
 *
 * @constructor
 * @param {string} [label='anonymous mock'] - An optional name for the mock function.
 */
assertionKit.MockFunction = function(label = 'anonymous mock') {
  this.identifier = label;
  this.isTestMock = true; // Indicates this is a mock
  this.originalImplementation = null; // Stores the original function for callThrough
  this.behaviorPlan = () => {}; // Default empty behavior
  this.latestCall = {};
  this.allCallArguments = [];
  this.invocationHistory = [];
  this.callCount = 0;
};

/**
 * Configures the mock to call the original function when invoked.
 * @returns {assertionKit.MockFunction} The mock instance for chaining.
 */
assertionKit.MockFunction.prototype.andCallOriginal = function() {
  if (typeof this.originalImplementation !== 'function') {
    console.warn(`MockFunction '${this.identifier}' has no original implementation to call through.`);
  }
  this.behaviorPlan = this.originalImplementation;
  return this;
};

/**
 * Sets a fixed return value for the mock function.
 * @param {*} returnValue - The value to return on each invocation.
 * @returns {assertionKit.MockFunction} The mock instance for chaining.
 */
assertionKit.MockFunction.prototype.andReturn = function(returnValue) {
  this.behaviorPlan = () => returnValue;
  return this;
};

/**
 * Configures the mock to throw an exception when invoked.
 * @param {string|Error} errorToThrow - The message or Error object to throw.
 * @returns {assertionKit.MockFunction} The mock instance for chaining.
 */
assertionKit.MockFunction.prototype.andThrowError = function(errorToThrow) {
  this.behaviorPlan = () => {
    throw errorToThrow;
  };
  return this;
};

/**
 * Specifies a custom function to execute when the mock is called.
 * @param {Function} customBehaviorFunc - The function to execute. It will receive the mock's arguments.
 * @returns {assertionKit.MockFunction} The mock instance for chaining.
 */
assertionKit.MockFunction.prototype.andExecuteWith = function(customBehaviorFunc) {
  if (typeof customBehaviorFunc !== 'function') {
    throw new Error("Custom behavior must be a function.");
  }
  this.behaviorPlan = customBehaviorFunc;
  return this;
};

/**
 * Resets all tracking data for the mock function (call counts, arguments, etc.).
 */
assertionKit.MockFunction.prototype.resetTracking = function() {
  this.callCount = 0;
  this.latestCall = {};
  this.allCallArguments = [];
  this.invocationHistory = [];
  // Note: behaviorPlan is NOT reset, only tracking.
};

/**
 * Creates a new standalone mock function.
 *
 * @param {string} [nameHint='mock_func'] - A descriptive name for the mock.
 * @returns {Function & assertionKit.MockFunction} A callable mock function with tracking properties.
 */
assertionKit.generateMockFunction = function(nameHint = 'mock_func') {
  const mockTracker = new assertionKit.MockFunction(nameHint);

  const callableMock = function(...args) {
    mockTracker.callCount++;
    mockTracker.latestCall = {
      context: this,
      args: args
    };
    mockTracker.allCallArguments.push(args);
    mockTracker.invocationHistory.push({
      context: this,
      args: args
    });

    try {
      return mockTracker.behaviorPlan.apply(this, args);
    } catch (e) {
      // If the behavior plan throws, re-throw it after tracking
      throw e;
    }
  };

  // Copy properties from the mockTracker instance to the callable function
  // Using Object.assign for cleaner property transfer
  Object.assign(callableMock, mockTracker);

  // Ensure the behaviorPlan is bound to the callable mock if it was set via 'andExecuteWith'
  // and needs to access mockTracker's internal state. However, 'this' inside behaviorPlan
  // should refer to the context of the call, so we apply it directly.
  // The original mockTracker object is now essentially part of the callableMock.

  callableMock.resetTracking(); // Initialize tracking state

  return callableMock;
};

/**
 * Determines if an object is an assertionKit mock function.
 *
 * @param {*} potentialMock - The object to check.
 * @returns {boolean} True if the object is a mock, false otherwise.
 */
assertionKit.isMock = function(potentialMock) {
  return potentialMock && potentialMock.isTestMock === true;
};

/**
 * Creates an object where all specified methods are replaced with mock functions.
 * Useful for stubbing out large interfaces.
 *
 * @param {string} objName - The base name for the mock object.
 * @param {Array<string>} methodNamesList - An array of method names to mock.
 * @returns {object} An object with mock functions.
 */
assertionKit.createMockObject = function(objName, methodNamesList) {
  if (!assertionKit.isArray_(methodNamesList) || methodNamesList.length === 0) {
    throw new Error('createMockObject requires a non-empty array of method names.');
  }

  const mockContainer = {};
  methodNamesList.forEach(methodName => {
    const mockLabel = `${objName}.${methodName}`;
    mockContainer[methodName] = assertionKit.generateMockFunction(mockLabel);
  });
  return mockContainer;
};

/**
 * Outputs messages to the current test spec's log.
 *
 * @param {...*} messages - Messages to be logged.
 */
assertionKit.outputToSpecLog = function(...messages) {
  const currentSpec = assertionKit.fetchRuntimeContext().activeTestSpec;
  if (currentSpec && typeof currentSpec.logMessage === 'function') {
    currentSpec.logMessage(...messages);
  } else if (assertionKit.DIAGNOSTIC_OUTPUT_ENABLED) {
    console.log("assertionKit.outputToSpecLog (no active spec):", ...messages);
  }
};

/**
 * Installs a mock function on a specific method of an object within the current spec context.
 *
 * @param {object} targetObject - The object containing the method to mock.
 * @param {string} methodName - The name of the method to replace with a mock.
 * @returns {Function & assertionKit.MockFunction} The newly created mock function, allowing chaining of mock behaviors.
 */
const interceptAndMock = function(targetObject, methodName) {
  return assertionKit.fetchRuntimeContext().activeTestSpec.createMethodMock(targetObject, methodName);
};

// Export `interceptAndMock` for CommonJS if applicable
if (envCheckForNode) {
  module.exports.interceptAndMock = interceptAndMock;
} else {
  // In browser environments, attach to window or globalThis if not already defined
  if (typeof window !== 'undefined' && typeof window.interceptAndMock === 'undefined') {
    window.interceptAndMock = interceptAndMock;
  }
}

/**
 * Defines a test scenario (spec) to be executed.
 *
 * @param {string} description - A textual description of the scenario.
 * @param {Function} testFunction - The function containing the test logic and assertions.
 */
const defineScenario = function(description, testFunction) {
  return assertionKit.fetchRuntimeContext().defineTestScenario(description, testFunction);
};

// Export `defineScenario` for CommonJS
if (envCheckForNode) {
  module.exports.defineScenario = defineScenario;
} else {
  if (typeof window !== 'undefined' && typeof window.defineScenario === 'undefined') {
    window.defineScenario = defineScenario;
  }
}

/**
 * Defines a disabled test scenario (spec).
 * This test will be listed but not executed.
 *
 * @param {string} description - Description of the disabled scenario.
 * @param {Function} testFunction - The test function (will not be run).
 */
const skipScenario = function(description, testFunction) {
  return assertionKit.fetchRuntimeContext().defineSkippedScenario(description, testFunction);
};

// Export `skipScenario` for CommonJS
if (envCheckForNode) {
  module.exports.skipScenario = skipScenario;
} else {
  if (typeof window !== 'undefined' && typeof window.skipScenario === 'undefined') {
    window.skipScenario = skipScenario;
  }
}