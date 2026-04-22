function VerificationError(messageText, details) {
  this.message = messageText;
  if (details) {
    if ("item" in details) this.item = details.item;
    if ("expectation" in details) this.expectation = details.expectation;
    if ("comparable" in details) this.comparable = details.comparable;
  }
  var callerReference = details && details.originator || arguments.callee.caller;
  if (Error.captureStackTrace) Error.captureStackTrace(this, callerReference);
}
VerificationError.prototype = Object.create(Error.prototype, {
  constructor: { value: VerificationError, configurable: true, writable: true }
});
VerificationError.prototype.name = "VerificationError";
VerificationError.prototype.__defineGetter__("showComparison", function() {
  return this.comparable;
});

function getTypeTag(item) {
  if (item === null) return "null";
  if (item === undefined) return "undefined";
  var type = Object.prototype.toString.call(item).slice(8, -1).toLowerCase();
  if (type === 'object' && typeof item === 'function') return 'function';
  return type;
}

function extractPrimitive(val) {
  return val instanceof Boolean ||
         val instanceof String ||
         val instanceof Number ? val.valueOf() : val;
}

function AssertionWrapper(subject) {
  if (!(this instanceof AssertionWrapper)) return new AssertionWrapper(subject);
  this.subject = subject;
  this.inverse = false;
}

function createDualPurposeChainer(wrapperInstance) {
  var chainer = function(expectedCtor) {
    return wrapperInstance.isInstanceOf(expectedCtor);
  };

  for (var prop in AssertionWrapper.prototype) {
    if (typeof AssertionWrapper.prototype[prop] === 'function' &&
        prop !== 'constructor' &&
        prop !== 'checkTruth' &&
        prop !== 'not' &&
        prop !== 'isInstanceOf') { // Exclude specific internal/chaining methods
      chainer[prop] = (function(methodName) {
        return function() {
          return AssertionWrapper.prototype[methodName].apply(wrapperInstance, arguments);
        };
      })(prop);
    }
  }

  Object.defineProperties(chainer, {
    is: { get: function() { return chainer; }, configurable: true },
    has: { get: function() { return chainer; }, configurable: true },
    and: { get: function() { return chainer; }, configurable: true },
    with: { get: function() { return chainer; }, configurable: true },
    for: { get: function() { return chainer; }, configurable: true },
    about: { get: function() { return chainer; }, configurable: true },
    from: { get: function() { return chainer; }, configurable: true },
    not: {
      get: function() {
        var newWrapper = new AssertionWrapper(wrapperInstance.subject);
        newWrapper.inverse = !wrapperInstance.inverse;
        return createDualPurposeChainer(newWrapper);
      },
      configurable: true
    }
  });

  return chainer;
}

AssertionWrapper.prototype = {
  constructor: AssertionWrapper,

  checkTruth: function(condition, expectedDescription, expectedValue, opts) {
    var outcome = this.inverse ? !condition : condition;
    if (!outcome) {
      var description = "Expected " + (this.inverse ? "not " : "") + expectedDescription;
      var detailOptions = {
        item: this.subject,
        expectation: expectedValue,
        comparable: opts && opts.comparable,
        originator: opts && opts.originator
      };
      throw new VerificationError(description, detailOptions);
    }
  },

  get is() { return this; },
  get has() { return this; },
  get and() { return this; },
  get with() { return this; },
  get for() { return this; },
  get about() { return this; },
  get from() { return this; },

  not: function() {
    var newWrapper = new AssertionWrapper(this.subject);
    newWrapper.inverse = !this.inverse;
    return newWrapper;
  },

  get a() { return createDualPurposeChainer(this); },
  get an() { return createDualPurposeChainer(this); },

  isTrue: function() {
    this.checkTruth(this.subject === true, "to be true", true);
  },

  isFalse: function() {
    this.checkTruth(this.subject === false, "to be false", false);
  },

  isNull: function() {
    this.checkTruth(this.subject === null, "to be null", null);
  },

  isUndefined: function() {
    this.checkTruth(this.subject === undefined, "to be undefined", undefined);
  },

  isBoolean: function() {
    this.checkTruth(getTypeTag(this.subject) === "boolean", "to be a boolean");
  },

  isNumber: function() {
    this.checkTruth(getTypeTag(this.subject) === "number", "to be a number");
  },

  isString: function() {
    this.checkTruth(getTypeTag(this.subject) === "string", "to be a string");
  },

  isDate: function() {
    this.checkTruth(getTypeTag(this.subject) === "date" && !isNaN(this.subject), "to be a date");
  },

  isRegExp: function() {
    this.checkTruth(getTypeTag(this.subject) === "regexp", "to be a regular expression");
  },

  isArray: function() {
    this.checkTruth(Array.isArray(this.subject), "to be an array");
  },

  isFunction: function() {
    this.checkTruth(getTypeTag(this.subject) === "function", "to be a function");
  },

  isObject: function() {
    this.checkTruth(getTypeTag(this.subject) === "object" && this.subject !== null, "to be an object");
  },

  isTruthy: function() {
    this.checkTruth(!!this.subject, "to be truthy");
  },

  isFalsy: function() {
    this.checkTruth(!this.subject, "to be falsy");
  },

  isExisting: function() {
    this.checkTruth(this.subject !== null && this.subject !== undefined, "to exist");
  },

  isInstanceOf: function(expectedConstructor) {
    this.checkTruth(this.subject instanceof expectedConstructor, "to be an instance of " + (expectedConstructor ? expectedConstructor.name : "unknown"), expectedConstructor);
  }
};

Object.defineProperty(Object.prototype, "inspect", {
  get: function() { return new AssertionWrapper(extractPrimitive(this)); },
  set: function(val) {
    Object.defineProperty(this, "inspect", {
      value: val,
      configurable: true,
      enumerable: true,
      writable: true
    });
  },
  configurable: true
});

function Validate(item) {
  return new AssertionWrapper(item);
}
Validate.VerificationError = VerificationError;