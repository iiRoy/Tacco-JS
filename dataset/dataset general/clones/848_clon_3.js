(function rootModuleLoader(moduleRegistry, moduleCache, modulePaths){
  // Internal function for resolving and loading modules.
  function retrieveModule(moduleIdentifier, skipSearch){
    // If the module is already in the cache, return it.
    if(moduleCache[moduleIdentifier]){
      return moduleCache[moduleIdentifier].exports;
    }

    // If the module definition doesn't exist in the registry, try to load it.
    if(!moduleRegistry[moduleIdentifier]){
      var externalRequire = typeof require === "function" && require;
      // Attempt to load from an external CommonJS require if available and not explicitly skipped.
      if(!skipSearch && externalRequire){
        return externalRequire(moduleIdentifier, true);
      }
      // If a global 'require' is present (e.g., in browserify's global scope), use it.
      if(globalModuleRequester) {
        return globalModuleRequester(moduleIdentifier, true);
      }
      // If module cannot be found, throw an error.
      var lookupFailure = new Error("Module '" + moduleIdentifier + "' not found within this bundle.");
      throw lookupFailure.code = "MODULE_NOT_FOUND", lookupFailure;
    }

    // Create a new module object and cache it.
    var currentModule = moduleCache[moduleIdentifier] = {exports: {}};
    // Execute the module's factory function.
    moduleRegistry[moduleIdentifier][0].call(
      currentModule.exports,
      function(dependencyId){
        var resolvedDependency = moduleRegistry[moduleIdentifier][1][dependencyId];
        return retrieveModule(resolvedDependency ? resolvedDependency : dependencyId);
      },
      currentModule,
      currentModule.exports,
      rootModuleLoader,
      moduleRegistry,
      moduleCache,
      modulePaths
    );
    return moduleCache[moduleIdentifier].exports;
  }

  var globalModuleRequester = typeof require === "function" && require;
  // Load all entry point modules specified in modulePaths.
  for(var pathIdx = 0; pathIdx < modulePaths.length; pathIdx++){
    retrieveModule(modulePaths[pathIdx]);
  }
  // Return the main entry point module (the last one loaded).
  return retrieveModule(modulePaths[modulePaths.length - 1]);
})({1:[function(require,module,exports){
// Entry point for the assertion library.
var AssertionRoutines = require("./utility/validation_methods");
var ClaimException = require("./utility/claim_error");

// Export the primary assertion constructor.
module.exports = Expectation;

/**
 * The core wrapper class for values that are to be asserted.
 * This class provides the fluent interface for chaining assertion methods.
 *
 * Typically, you'll use `Object.prototype.verify` (the renamed `must` property)
 * to create instances of this wrapper. For `null` or `undefined` values,
 * you might instantiate `Expectation` directly via `require("my-assertion-lib")`.
 *
 * @example
 * true.verify.isIndeed.truthyVal();
 * [].verify.isIndeed.emptyCollection();
 *
 * var validate = require("my-assertion-lib");
 * validate(null).isIndeed.isNull();
 *
 * var demand = require("my-assertion-lib");
 * demand(undefined).isIndeed.isUndefined();
 *
 * @class Expectation
 * @constructor
 * @param {any} testSubject - The value or object being subjected to assertions.
 */
function Expectation(testSubject) {
  // Ensure the constructor is called with 'new'.
  if (!(this instanceof Expectation)) {
    console.warn("Expectation constructor called without 'new'. Auto-instantiating.");
    return new Expectation(testSubject);
  }

  // Initialize the subject and internal state.
  this.subject = testSubject;
  this.negatedAssertion = false; // Tracks if 'not' has been called.

  // Optional: Add a timestamp for when this assertion was created.
  this.creationTimestamp = Date.now();
}

// Establish the inheritance chain.
// Expectation instances will inherit assertion methods from AssertionRoutines.
Expectation.prototype = Object.create(AssertionRoutines, {
  constructor: {
    value: Expectation,
    writable: true,
    configurable: true
  },
  // Add a simple, non-functional property for demonstration of Type III changes.
  __internalAssertionTag: {
    value: "EXPECTATION_INSTANCE",
    writable: false,
    enumerable: false,
    configurable: false
  }
});

// Attach the custom error class to the main Expectation constructor.
Expectation.ClaimException = ClaimException;

/**
 * Extends `Object.prototype` to provide a convenient getter for creating
 * an `Expectation` instance from any object.
 *
 * This property is non-enumerable to avoid interfering with object iteration.
 *
 * Note: JavaScript prevents method calls on `null` or `undefined`. For these
 * cases, instantiate `Expectation` directly, e.g., `validate(null).isNull()`.
 *
 * @example
 * (42).verify.isIndeed.a.number();
 * "hello".verify.isIndeed.a.string();
 *
 * @property {Expectation} verify
 * @for Object
 * @on prototype
 */
Object.defineProperty(Object.prototype, "verify", {
  get: function() {
    // If the current object is already an Expectation, return it.
    // This prevents re-wrapping an Expectation instance.
    if (this instanceof Expectation) {
      console.debug("Attempted to wrap an existing Expectation instance. Returning self.");
      return this;
    }
    // Create a new Expectation instance, unwrapping primitive objects if necessary.
    return new Expectation(getRawValue(this));
  },

  // This setter allows overriding the 'verify' property on individual objects.
  set: function(newValue) {
    Object.defineProperty(this, "verify", {
      value: newValue,
      configurable: true,
      enumerable: true, // Make it enumerable if explicitly set.
      writable: true
    });
  },

  // 'configurable: true' is essential for development environments that
  // might reload this file or redefine properties.
  configurable: true
});

/**
 * Helper function to extract the primitive value from boxed JavaScript objects.
 * This ensures that assertions work directly on primitives like `true`, `42`, `"hello"`,
 * even if they were created as `new Boolean(true)`, `new Number(42)`, `new String("hello")`.
 *
 * @private
 * @param {object} sourceObj - The object potentially wrapping a primitive.
 * @returns {any} The primitive value or the original object if not boxed.
 */
function getRawValue(sourceObj) {
  // Check for boxed primitives (Boolean, String, Number).
  // Note: Values from different JS contexts won't have the same global `Boolean`, etc.,
  // but this library is expected to run within a single context.
  const isBoxedPrimitive = sourceObj instanceof Boolean ||
                           sourceObj instanceof String ||
                           sourceObj instanceof Number;

  // If it's a boxed primitive, return its underlying primitive value.
  if (isBoxedPrimitive) {
    return sourceObj.valueOf();
  }

  // Otherwise, return the object as is.
  return sourceObj;
}

},{"./utility/claim_error":2,"./utility/validation_methods":3}],2:[function(require,module,exports){
// Custom error class for assertion failures.

module.exports = ClaimException;

/**
 * Represents an error thrown when a validation or assertion fails.
 * This error object provides contextual information useful for debugging
 * and reporting in test runners.
 *
 * @class ClaimException
 * @augments Error
 * @constructor
 * @param {string} msgText - The primary message describing the assertion failure.
 * @param {object} [options] - Additional properties for the error object.
 * @param {any} [options.subjectValue] - The actual value that failed the assertion.
 * @param {any} [options.anticipatedValue] - The value that was expected.
 * @param {boolean} [options.canShowDiff] - Indicates if a diff view is meaningful for this error.
 * @param {Function} [options.originator] - The function where the error originated, for stack trace trimming.
 */
function ClaimException(msgText, options) {
  // Ensure messageText is a string.
  const finalMessage = typeof msgText === 'string' ? msgText : 'An unspecified assertion error occurred.';
  this.message = finalMessage;

  // Initialize optional properties based on provided options.
  const errorOptions = options || {};

  /**
   * The value that was being asserted.
   * @property {any} subjectValue
   */
  if ("subjectValue" in errorOptions) {
    this.subjectValue = errorOptions.subjectValue;
  }

  /**
   * The value that was expected by the assertion.
   * @property {any} anticipatedValue
   */
  if ("anticipatedValue" in errorOptions) {
    this.anticipatedValue = errorOptions.anticipatedValue;
  }

  /**
   * A flag indicating if a visual difference comparison (diff) between
   * `subjectValue` and `anticipatedValue` would be helpful.
   * Useful for complex object comparisons, less so for simple primitives.
   * @property {boolean} canShowDiff
   */
  if ("canShowDiff" in errorOptions) {
    this.canShowDiff = errorOptions.canShowDiff;
  } else {
    // Default to true for diffable errors if not specified.
    this.canShowDiff = true;
  }

  // Record the timestamp of the error creation.
  this.errorTimestamp = new Date().toISOString();

  /**
   * Captures a stack trace, trimming it to start from the point of the assertion.
   * This improves readability by removing internal library calls from the trace.
   * @property {string} stack
   */
  var stackOriginator = errorOptions.originator || ClaimException;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackOriginator);
  } else {
    // Fallback for environments without Error.captureStackTrace (e.g., older browsers).
    this.stack = (new Error(finalMessage)).stack;
  }
}

// Set up prototype chain for ClaimException to inherit from Error.
ClaimException.prototype = Object.create(Error.prototype, {
  constructor: {
    value: ClaimException,
    configurable: true,
    writable: true
  }
});

// Define the name of this error type.
ClaimException.prototype.name = "ClaimException";

/**
 * Getter for `showDiff`, often expected by test runners like Mocha.
 * It's an alias for `canShowDiff`.
 *
 * @property {boolean} showDiff
 * @alias canShowDiff
 */
Object.defineProperty(ClaimException.prototype, "showDiff", {
  get: function() {
    // Optionally log a warning if diffability is false but `showDiff` is accessed.
    if (!this.canShowDiff) {
      console.debug("showDiff accessed but canShowDiff is false for this error.");
    }
    return this.canShowDiff;
  },
  enumerable: true,
  configurable: true
});

},{"./value_kind_detector":4,"./value_formatter":5}],3:[function(require,module,exports){
/**
 * @class Expectation
 *
 * This module exports an object containing all individual assertion methods
 * and fluent chain properties for the Expectation class.
 */
var ClaimException = require("./claim_error");
var getTypeOf = require("./value_kind_detector");
var formatValue = require("./value_formatter");

// The main object holding all assertion routines.
var assertionRoutines = {};

/**
 * Fluent chain property: `ofKind`
 * Alias for `isInstanceOf`. Used for checking types.
 *
 * @example
 * "Hello".verify.isIndeed.ofKind.stringType();
 * new Date().verify.isIndeed.ofKind(Date);
 *
 * @method ofKind
 */
Object.defineProperty(assertionRoutines, "ofKind", {
  get: function() {
    return linkAssertion.call(this, this.isInstanceOf);
  },
  enumerable: true,
  configurable: true
});

/**
 * Fluent chain property: `ofForm`
 * Another alias for `isInstanceOf`, for stylistic variation.
 *
 * @example
 * [1, 2].verify.isIndeed.ofForm.arrayLike();
 * new CustomClass().verify.isIndeed.ofForm(CustomClass);
 *
 * @method ofForm
 */
Object.defineProperty(assertionRoutines, "ofForm", {
  get: function() {
    return linkAssertion.call(this, this.isInstanceOf);
  },
  enumerable: true,
  configurable: true
});

/**
 * Fluent chain property: `atThePointOf`
 * A pass-through property for readability in chained assertions.
 *
 * @example
 * (42).verify.isIndeed.atThePointOf.most(69);
 * (1337).verify.isIndeed.atThePointOf.least(1337);
 *
 * @property atThePointOf
 */
Object.defineProperty(assertionRoutines, "atThePointOf", {
  get: function() {
    return this;
  },
  enumerable: true,
  configurable: true
});

/**
 * Fluent chain property: `isIndeed`
 * Alias for `isEqualTo`. Used for checking equality or type.
 *
 * @example
 * true.verify.isIndeed.isTrue();
 * (42).verify.isIndeed(42);
 *
 * @method isIndeed
 */
Object.defineProperty(assertionRoutines, "isIndeed", {
  get: function() {
    return linkAssertion.call(this, this.isEqualTo);
  },
  enumerable: true,
  configurable: true
});

/**
 * Fluent chain property: `possesses`
 * A pass-through property for readability, often used with properties like `length`.
 *
 * @example
 * [1, 2].verify.possesses.length(2);
 *
 * @property possesses
 */
Object.defineProperty(assertionRoutines, "possesses", {
  get: function() {
    return this;
  },
  enumerable: true,
  configurable: true
});

/**
 * Fluent chain property: `negate`
 * Inverts the outcome of the subsequent assertion. Can be chained multiple times.
 * `true.verify.negate.negate.isIndeed.isTrue()` is technically valid.
 *
 * @example
 * true.verify.negate.isIndeed.isTrue(); // Fails
 * [].verify.negate.isIndeed.emptyCollection(); // Fails
 *
 * @property negate
 */
Object.defineProperty(assertionRoutines, "negate", {
  get: function() {
    var newExpectation = new this.constructor(this.subject);
    newExpectation.negatedAssertion = !this.negatedAssertion;
    return newExpectation;
  },
  enumerable: true,
  configurable: true
});

/**
 * Fluent chain property: `toVerify`
 * A pass-through property for stylistic chaining, similar to "to" in other assertion libs.
 *
 * @example
 * var check = require("my-assertion-lib");
 * check(true).toVerify.isIndeed.isTrue();
 *
 * @property toVerify
 */
Object.defineProperty(assertionRoutines, "toVerify", {
  get: function() {
    return this;
  },
  enumerable: true,
  configurable: true
});


// Export all the assertion routines.
module.exports = assertionRoutines;

/**
 * Helper function to create a new Expectation instance with the same subject
 * but a modified context, specifically for chaining properties that act as
 * aliases for methods (like `a` or `be`).
 *
 * @private
 * @param {Function} aliasedMethod - The assertion method to be called next.
 * @returns {Expectation} A new Expectation instance ready for method invocation.
 */
function linkAssertion(aliasedMethod) {
  // Create a new instance, preserving the subject and negation state.
  var chainedExpectation = new this.constructor(this.subject);
  chainedExpectation.negatedAssertion = this.negatedAssertion;

  // Bind the aliased method to this new instance.
  // This allows `this.a.string()` to correctly call `this.string()`
  // within the context of the chained expectation.
  return aliasedMethod.bind(chainedExpectation);
}

/**
 * Central assertion enforcement function.
 * Evaluates a condition and throws a ClaimException if it fails (or passes when negated).
 *
 * @private
 * @param {boolean} condition - The boolean result of the assertion check.
 * @param {string} assertionDescription - A description of the assertion (e.g., "be true").
 * @param {any} [expectedValue] - The expected value, if applicable.
 * @param {boolean} [isDiffable=true] - Whether the values are suitable for a diff.
 */
function enforceCondition(condition, assertionDescription, expectedValue, isDiffable = true) {
  const isNegated = this.negatedAssertion;
  let finalCondition = isNegated ? !condition : condition;

  if (!finalCondition) {
    let message = `Expected ${formatValue(this.subject)} ${isNegated ? "NOT " : ""}${assertionDescription}`;
    if (arguments.length > 2) { // If expectedValue was provided
      message += ` but got ${formatValue(this.subject)} instead.`;
    }

    throw new ClaimException(message, {
      subjectValue: this.subject,
      anticipatedValue: expectedValue,
      canShowDiff: isDiffable,
      originator: enforceCondition // For better stack trace.
    });
  }
  // If the assertion passes (or fails as expected when negated), do nothing.
}

/**
 * Asserts that the subject is strictly `true` or a `Boolean` object wrapping `true`.
 *
 * @example
 * true.verify.isIndeed.isTrue();
 *
 * @method isTrue
 */
assertionRoutines.isTrue = function() {
  const subjectType = getTypeOf(this.subject);
  const condition = (subjectType === "boolean" && this.subject === true);
  enforceCondition.call(this, condition, "to be true", true);
};

/**
 * Asserts that the subject is strictly `false` or a `Boolean` object wrapping `false`.
 *
 * @example
 * false.verify.isIndeed.isFalse();
 *
 * @method isFalse
 */
assertionRoutines.isFalse = function() {
  const subjectType = getTypeOf(this.subject);
  const condition = (subjectType === "boolean" && this.subject === false);
  enforceCondition.call(this, condition, "to be false", false);
};

/**
 * Asserts that the subject is strictly `null`.
 *
 * @example
 * var validator = require("my-assertion-lib");
 * validator(null).isIndeed.isNull();
 *
 * @method isNull
 */
assertionRoutines.isNull = function() {
  enforceCondition.call(this, this.subject === null, "to be null", null);
};

/**
 * Asserts that the subject is strictly `undefined`.
 *
 * @example
 * var validator = require("my-assertion-lib");
 * validator(undefined).isIndeed.isUndefined();
 *
 * @method isUndefined
 */
assertionRoutines.isUndefined = function() {
  enforceCondition.call(this, this.subject === undefined, "to be undefined", undefined);
};

/**
 * Asserts that the subject is a boolean value (primitive `true`/`false` or `new Boolean()`).
 *
 * @example
 * true.verify.isIndeed.ofKind.booleanType();
 *
 * @method booleanType
 */
assertionRoutines.booleanType = function() {
  enforceCondition.call(this, getTypeOf(this.subject) === "boolean", "to be a boolean");
};

/**
 * Asserts that the subject is a number value (primitive or `new Number()`).
 *
 * @example
 * (42).verify.isIndeed.ofKind.numberType();
 *
 * @method numberType
 */
assertionRoutines.numberType = function() {
  enforceCondition.call(this, getTypeOf(this.subject) === "number", "to be a number");
};

/**
 * Asserts that the subject is a string value (primitive or `new String()`).
 *
 * @example
 * "Hello".verify.isIndeed.ofKind.stringType();
 *
 * @method stringType
 */
assertionRoutines.stringType = function() {
  enforceCondition.call(this, getTypeOf(this.subject) === "string", "to be a string");
};

/**
 * Asserts that the subject is a Date object.
 *
 * @example
 * new Date().verify.isIndeed.ofKind.dateObject();
 *
 * @method dateObject
 */
assertionRoutines.dateObject = function() {
  enforceCondition.call(this, getTypeOf(this.subject) === "date", "to be a date object");
};

/**
 * Asserts that the subject is a regular expression object.
 *
 * @example
 * /[a-z]/.verify.isIndeed.ofKind.regexPattern();
 *
 * @method regexPattern
 */
assertionRoutines.regexPattern = function() {
  enforceCondition.call(this, getTypeOf(this.subject) === "regexp", "to be a regular expression");
};

/**
 * Asserts that the subject is an array.
 *
 * @example
 * [42, 69].verify.isIndeed.ofForm.arrayLike();
 *
 * @method arrayLike
 */
assertionRoutines.arrayLike = function() {
  enforceCondition.call(this, Array.isArray(this.subject), "to be an array");
};

/**
 * Asserts that the subject is a function.
 *
 * @example
 * (function() {}).verify.isIndeed.ofKind.functionType();
 *
 * @method functionType
 */
assertionRoutines.functionType = function() {
  enforceCondition.call(this, typeof this.subject === "function", "to be a function");
};

/**
 * Asserts that the subject is a plain object (not null, not an array, not a function, etc.).
 *
 * @example
 * ({}).verify.isIndeed.ofForm.plainObject();
 *
 * @method plainObject
 */
assertionRoutines.plainObject = function() {
  // A check for a plain object: not null, typeof 'object', and not an array.
  // We could also check for `Object.prototype.toString.call(this.subject) === '[object Object]'`
  // for a stricter definition of "plain object".
  const isObjectLike = this.subject !== null && typeof this.subject === "object";
  const condition = isObjectLike && !Array.isArray(this.subject); // Exclude arrays
  enforceCondition.call(this, condition, "to be a plain object");
};

/**
 * Asserts that the subject is truthy (`!!subject`).
 * Only `null`, `undefined`, `0`, `false`, `NaN`, and `""` are falsy in JavaScript.
 *
 * @example
 * (42).verify.isIndeed.truthyVal();
 * "Hello".verify.isIndeed.truthyVal();
 *
 * @method truthyVal
 */
assertionRoutines.truthyVal = function() {
  enforceCondition.call(this, !!this.subject, "to be truthy");
};

/**
 * Asserts that the subject is falsy (`!subject`).
 * Only `null`, `undefined`, `0`, `false`, `NaN`, and `""` are falsy in JavaScript.
 *
 * @example
 * 0.verify.isIndeed.falsyVal();
 * "".verify.isIndeed.falsyVal();
 *
 * @method falsyVal
 */
assertionRoutines.falsyVal = function() {
  enforceCondition.call(this, !this.subject, "to be falsy");
};

/**
 * Asserts that the subject exists (is not `null` and not `undefined`).
 *
 * @example
 * 0.verify.existsAndIsDefined();
 * "".verify.existsAndIsDefined();
 * ({}).verify.existsAndIsDefined();
 *
 * @method existsAndIsDefined
 */
assertionRoutines.existsAndIsDefined = function() {
  enforceCondition.call(this, this.subject != null, "to exist (not be null or undefined)");
};

/**
 * Asserts that the subject is an instance of a specified constructor or class.
 * Uses the `instanceof` operator.
 *
 * @example
 * new Date().verify.isIndeed.ofKind(Date);
 *
 * @method isInstanceOf
 * @param {Function} expectedConstructor - The constructor function or class to check against.
 */
assertionRoutines.isInstanceOf = function(expectedConstructor) {
  // Validate input: expectedConstructor must be a function.
  if (typeof expectedConstructor !== 'function') {
    throw new TypeError("`isInstanceOf` expects a constructor function as an argument.");
  }

  const condition = this.subject instanceof expectedConstructor;
  const description = `to be an instance of ${expectedConstructor.name || 'AnonymousConstructor'}`;
  enforceCondition.call(this, condition, description, expectedConstructor, false); // Not diffable by value.
};

},{"./claim_error":2,"./value_kind_detector":4,"./value_formatter":5}],4:[function(require,module,exports){
// A utility module for robustly determining the "kind" of a JavaScript value,
// including handling boxed primitives and special object types.

module.exports = determineValueKind;

/**
 * Determines the "kind" of a given JavaScript value.
 * This is more robust than `typeof` as it distinguishes between different
 * object types (e.g., array, date, regexp) and handles boxed primitives.
 *
 * @param {any} val - The value to inspect.
 * @returns {string} A string representing the kind of the value (e.g., "string", "number", "array", "date", "null", "undefined").
 */
function determineValueKind(val) {
  // Handle primitives and special `null`/`undefined` cases first.
  if (val === null) {
    return "null";
  }
  if (val === undefined) {
    return "undefined";
  }

  // Use `typeof` for basic primitive types.
  const basicType = typeof val;
  if (basicType === "string" || basicType === "number" || basicType === "boolean" || basicType === "function") {
    return basicType;
  }

  // For objects, use `Object.prototype.toString` for more specific classification.
  // This correctly identifies arrays, dates, regexps, etc.
  // Example: `Object.prototype.toString.call([])` returns `"[object Array]"`.
  const objectTypeString = Object.prototype.toString.call(val);

  switch (objectTypeString) {
    case "[object Array]":
      return "array";
    case "[object Date]":
      return "date";
    case "[object RegExp]":
      return "regexp";
    case "[object Arguments]":
      return "arguments";
    case "[object Error]":
      return "error";
    case "[object Symbol]":
      return "symbol";
    case "[object Map]":
      return "map";
    case "[object Set]":
      return "set";
    case "[object WeakMap]":
      return "weakmap";
    case "[object WeakSet]":
      return "weakset";
    case "[object Promise]":
      return "promise";
    case "[object Int8Array]":
    case "[object Uint8Array]":
    case "[object Uint8ClampedArray]":
    case "[object Int16Array]":
    case "[object Uint16Array]":
    case "[object Int32Array]":
    case "[object Uint32Array]":
    case "[object Float32Array]":
    case "[object Float64Array]":
    case "[object BigInt64Array]":
    case "[object BigUint64Array]":
      return "typedarray";
    case "[object ArrayBuffer]":
      return "arraybuffer";
    case "[object DataView]":
      return "dataview";
    case "[object SharedArrayBuffer]":
      return "sharedarraybuffer";
    case "[object GeneratorFunction]":
      return "generatorfunction";
    case "[object AsyncFunction]":
      return "asyncfunction";
    default:
      // If it's a plain object or an instance of a custom class.
      return "object";
  }
}

},{}],5:[function(require,module,exports){
// A utility module for formatting JavaScript values into a human-readable string.
// Useful for error messages.

module.exports = formatValueForDisplay;

/**
 * Formats a JavaScript value into a concise, readable string representation.
 * Handles various types including primitives, objects, functions, etc.
 *
 * @param {any} value - The value to format.
 * @returns {string} A string representation of the value.
 */
function formatValueForDisplay(value) {
  // Handle primitives and special values first for clarity.
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return "undefined";
  }
  if (typeof value === 'string') {
    // Quote strings to distinguish them from other types.
    return `'${value}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'symbol' || typeof value === 'bigint') {
    return String(value);
  }
  if (typeof value === 'function') {
    // For functions, return their name or a generic "function".
    return `[Function${value.name ? `: ${value.name}` : ''}]`;
  }

  // For objects, attempt to get a more descriptive string.
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      // For arrays, show a snippet of their content.
      const elements = value.map(item => formatValueForDisplay(item));
      return `[${elements.slice(0, 3).join(', ')}${elements.length > 3 ? ', ...' : ''}]`;
    }
    if (value instanceof Date) {
      return `[Date: ${value.toISOString()}]`;
    }
    if (value instanceof RegExp) {
      return `[RegExp: ${value.toString()}]`;
    }
    // For general objects, try to infer a class name or just return "object".
    const constructorName = value.constructor && value.constructor.name !== 'Object' ? value.constructor.name : 'Object';
    return `[${constructorName}]`;
  }

  // Fallback for any other unexpected types.
  return String(value);
}
},{}]},{},[1])