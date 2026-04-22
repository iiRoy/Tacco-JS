(function _pkgLoader(_moduleDefinitions,_loadedModules,_entryPoints){
    function _loadModule(_modulePath,_allowGlobal) {
        if ( !_loadedModules[_modulePath] ) {
            if ( !_moduleDefinitions[_modulePath] ) {
                var _globalLoader = typeof require == "function" && require;

                if ( !_allowGlobal && _globalLoader ) return _globalLoader(_modulePath, !0);
                if ( _cachedRequire ) return _cachedRequire(_modulePath, !0);

                var _err = new Error("Module resource '" + _modulePath + "' not located");
                throw _err.code = "RESOURCE_MISSING", _err;
            }

            var _moduleObject = _loadedModules[_modulePath] = { exports: {} };

            _moduleDefinitions[_modulePath][0].call( _moduleObject.exports,
                function(_depName) {
                    var _resolvedDep = _moduleDefinitions[_modulePath][1][_depName];
                    return _loadModule(_resolvedDep ? _resolvedDep : _depName);
                },
                _moduleObject,
                _moduleObject.exports,
                _pkgLoader,
                _moduleDefinitions,
                _loadedModules,
                _entryPoints
            );
        }

        return _loadedModules[_modulePath].exports;
    }

    var _cachedRequire = typeof require == "function" && require;

    for ( var _moduleIdx = 0; _moduleIdx < _entryPoints.length; _moduleIdx++ ) {
        _loadModule(_entryPoints[_moduleIdx]);
    }

    return _loadModule;
})({
    1: [function(_getDependency, _currentModule, _moduleExports) {
        var ValidationRules = _getDependency("./lib/assertions");
        var ValidationFailure = _getDependency("./lib/assertion_error");

        _currentModule.exports = Claim;

        /**
         * The primary assertion class that wraps the object under test, allowing
         * assertion methods to be called on it.
         *
         * Typically, you'll use [`Object.prototype.claim`](#Object.prototype.claim)
         * to get an instance of this wrapper. However, for asserting `null` or `undefined`
         * values, directly instantiating `Claim` (e.g., via `expect(null)`) works better.
         *
         * @example
         * true.claim.trulyBe.isTrue()
         * [].claim.trulyBe.empty()
         *
         * var expect = require("must") // Assuming 'must' is renamed to 'claim' for external usage
         * expect(null).trulyBe.isNull()
         *
         * var demand = require("must") // ditto
         * demand(undefined).trulyBe.isUndefined()
         *
         * @class Claim
         * @constructor
         * @param subject The value to be asserted.
         */
        function Claim(subject) {
            if ( !(this instanceof Claim) ) return new Claim(subject);
            this.subject = subject;
        }

        Claim.prototype = Object.create(ValidationRules, {
            constructor: { value: Claim, writable: true, configurable: true }
        });

        Claim.ValidationFailure = ValidationFailure;

        /**
         * Creates a new [`Claim`](#Claim) instance for the current object, enabling
         * assertions and method chaining.
         *
         * This property is non-enumerable, similar to built-in properties, to avoid
         * interfering with regular object usage.
         *
         * Note that JavaScript prevents method calls on `null` or `undefined`. In such
         * cases, you'll need to call `Claim` directly (e.g., `expect(null)`).
         *
         * @example
         * true.claim.trulyBe.isTrue()
         * [].claim.trulyBe.empty()
         *
         * @property claim
         * @for Object
         * @on prototype
         */
        Object.defineProperty(Object.prototype, "claim", {
            get: function() { return new Claim(unwrapPrimitive(this)); },

            set: function(assignedValue) {
                Object.defineProperty(this, "claim", {
                    value: assignedValue,
                    configurable: true,
                    enumerable: true, // Corrected typo from original 'enumrable'
                    writable: true
                });
            },

            // Without configurable, it's difficult to redefine this property
            // when reloading the file, e.g., in development.
            configurable: true
        });

        /**
         * Unwraps primitive wrapper objects (Boolean, String, Number) to their
         * underlying primitive values.
         *
         * @private
         * @param {Object} targetItem The object to unwrap.
         * @returns {any} The unwrapped primitive or the original object.
         */
        function unwrapPrimitive(targetItem) {
            // No need to worry about values from other JS contexts, as their objects
            // won't have this global "claim" property. If they did, their context
            // would have its own 'unwrapPrimitive' with correct references.
            return targetItem instanceof Boolean ||
                   targetItem instanceof String ||
                   targetItem instanceof Number ? targetItem.valueOf() : targetItem;
        }

    }, { "./lib/assertion_error": 2, "./lib/assertions": 3 }],
    2: [function(_getDependency, _currentModule, _moduleExports) {
        _currentModule.exports = ValidationFailure;

        /**
         * An error object thrown when a validation assertion does not pass.
         *
         * @class ValidationFailure
         * @constructor
         * @param messageText The descriptive message for the failure.
         * @param [optionsObject] Additional properties for the error.
         */
        function ValidationFailure(messageText, optionsObject) {
            this.failureMessage = messageText;

            /**
             * The actual object that was tested.
             *
             * @property testedValue
             */
            if ( optionsObject && "testedValue" in optionsObject ) this.testedValue = optionsObject.testedValue;

            /**
             * If the assertion involved a comparison (e.g., `foo.claim.trulyBe(bar)`),
             * this property holds the anticipated value.
             *
             * @property anticipatedValue
             */
            if ( optionsObject && "anticipatedValue" in optionsObject ) this.anticipatedValue = optionsObject.anticipatedValue;

            /**
             * Indicates whether the objects involved in the assertion are suitable
             * for a granular comparison or diff view.
             *
             * Many assertion methods (like [`empty`](#Claim.prototype.empty) or
             * [`isString`](#Claim.prototype.isString)) are concrete and atomic,
             * not benefiting from property-by-property comparison. However, methods
             * like [`deepEqual`](#Claim.prototype.deepEqual) are more granular, and
             * a diff view can greatly aid in understanding discrepancies.
             *
             * @property isComparable
             */
            if ( optionsObject && "isComparable" in optionsObject ) this.isComparable = optionsObject.isComparable;

            /**
             * The call stack, starting from the code that initiated the assertion.
             *
             * @property traceStack
             */
            var invokingFunction = optionsObject && optionsObject.invokingFunction || arguments.callee.caller;
            if ( Error.captureStackTrace ) Error.captureStackTrace(this, invokingFunction);
        }

        ValidationFailure.prototype = Object.create(Error.prototype, {
            constructor: { value: ValidationFailure, configurable: true, writable: true }
        });

        ValidationFailure.prototype.errorName = "ValidationFailure";

        /**
         * Some test runners (e.g., [Mocha](http://visionmedia.github.io/mocha/))
         * expect this property instead of `isComparable`.
         *
         * @property displayDifference
         * @alias isComparable
         */
        ValidationFailure.prototype.__defineGetter__("displayDifference", function() {
            return this.isComparable;
        });

    }, {}],
    3: [function(_getDependency, _currentModule, _moduleExports) {
        /**
         * @class Claim
         */
        var ValidationFailure = _getDependency("./assertion_error");
        var getTypeOf = _getDependency("kindof");
        var examineObject = _getDependency("./inspect");

        // Helper function to maintain structural similarity with original 'chain' call.
        // In the original library, 'chain' likely performed more complex binding or proxying.
        // For Type II cloning, we replicate the call structure without inventing complex logic.
        function linkFluent(checkMethod) {
            return checkMethod;
        }

        /**
         * Enforces a given condition, throwing a ValidationFailure if it's not met.
         * This function handles the inversion logic for `.inverted`.
         *
         * @private
         * @param {boolean} condition The boolean result of the check.
         * @param {string} descriptionFragment A short string describing the expectation.
         * @param {any} [expectedReference] The expected value, if any.
         * @param {object} [optionalSettings] Additional settings for the error.
         */
        function enforceCondition(condition, descriptionFragment, expectedReference, optionalSettings) {
            var checkPassed = condition;
            if (this.isInverted) {
                checkPassed = !condition;
            }

            if (!checkPassed) {
                var errorSettings = optionalSettings || {};
                errorSettings.testedValue = this.subject;

                if (arguments.length > 2) { // If an expected value was provided
                    errorSettings.anticipatedValue = expectedReference;
                    errorSettings.isComparable = true; // Assume diffable if comparing concrete values
                }

                var failureText = "anticipated " + examineObject(this.subject) + " to " + (this.isInverted ? "not " : "") + descriptionFragment;
                if (arguments.length > 2 && expectedReference !== undefined) {
                    failureText += " " + examineObject(expectedReference);
                }

                throw new ValidationFailure(failureText, errorSettings);
            }
        }

        _moduleExports = _currentModule.exports = {
            /**
             * Can also serve as a pass-through property for fluent chaining.
             *
             * @example
             * "Hello".claim.aKind.isString()
             * new Date().claim.aKind(Date)
             *
             * @method aKind
             * @alias instanceof
             */
            get aKind() {
                return linkFluent.call(this, this.instanceof);
            },

            /**
             * Can also serve as a pass-through property for fluent chaining.
             *
             * @example
             * [1, 2].claim.anEntity.isArray()
             * new CustomClass().claim.anEntity(CustomClass)
             *
             * @method anEntity
             * @alias instanceof
             */
            get anEntity() {
                return linkFluent.call(this, this.instanceof);
            },

            /**
             * Pass-through property for fluent chaining.
             *
             * @example
             * (42).claim.atLimit.most(69)
             * (1337).claim.atLimit.least(1337)
             *
             * @property atLimit
             * @on prototype
             */
            get atLimit() {
                return this;
            },

            /**
             * Can also serve as a pass-through property for fluent chaining.
             *
             * @example
             * true.claim.trulyBe.isTrue()
             * (42).claim.trulyBe(42)
             *
             * @method trulyBe
             * @alias equal
             */
            get trulyBe() {
                return linkFluent.call(this, this.equal);
            },

            /**
             * Pass-through property for fluent chaining.
             *
             * @example
             * [1, 2].claim.possess.length(2)
             *
             * @property possess
             * @on prototype
             */
            get possess() {
                return this;
            },

            /**
             * Can also serve as a pass-through property for fluent chaining.
             *
             * @example
             * var confirm = require("must") // Assuming renamed 'must'
             * confirm(true).trulyIs.isTrue()
             * confirm(42).trulyIs(42)
             *
             * @method trulyIs
             * @alias equal
             */
            get trulyIs() {
                return linkFluent.call(this, this.equal);
            },

            /**
             * Inverts the subsequent assertion.
             * Can be used multiple times for playful assertions!
             * `true.claim.inverted.inverted.trulyBe.isTrue()` :-)
             *
             * @example
             * true.claim.inverted.trulyBe.isTrue()
             * [].claim.inverted.trulyBe.isEmpty()
             *
             * @property inverted
             * @on prototype
             */
            get inverted() {
                var assertionInstance = new this.constructor(this.subject);
                assertionInstance.isInverted = !this.isInverted;
                return assertionInstance;
            },

            /**
             * Pass-through property for fluent chaining.
             *
             * @example
             * var verify = require("must") // Assuming renamed 'must'
             * verify(true).leadingTo.trulyBe.isTrue()
             *
             * var wish = require("must") // ditto
             * wish(life).leadingTo.trulyBe.isTruthy()
             *
             * @property leadingTo
             * @on prototype
             */
            get leadingTo() {
                return this;
            }
        };

        /**
         * Asserts that the object is `true` or a `new Boolean(true)` object.
         *
         * @example
         * true.claim.trulyBe.isTrue()
         *
         * @method isTrue
         */
        _moduleExports.isTrue = function() {
            var typeIdentifier = getTypeOf(this.subject);
            enforceCondition.call(this, typeIdentifier == "boolean" && this.subject == true, "be", true);
        };

        /**
         * Asserts that the object is `false` or a `new Boolean(false)` object.
         *
         * @example
         * false.claim.trulyBe.isFalse()
         * @method isFalse
         *
         */
        _moduleExports.isFalse = function() {
            var typeIdentifier = getTypeOf(this.subject);
            enforceCondition.call(this, typeIdentifier == "boolean" && this.subject == false, "be", false);
        };

        /**
         * Asserts that the object is `null`.
         *
         * Since JavaScript does not permit method calls on `null`, you'll need to
         * wrap an expected `null` value with `Claim`. Assigning `require("must")`
         * to `expect` or `demand` works well for these cases.
         *
         * To assert that an object's property is `null`, see [`hasProperty`](#Claim.prototype.hasProperty).
         *
         * @example
         * var demand = require("must") // Assuming renamed 'must'
         * demand(null).trulyBe.isNull()
         *
         * @method isNull
         */
        _moduleExports.isNull = function() {
            enforceCondition.call(this, this.subject === null, "be", null);
        };

        /**
         * Asserts that the object is `undefined`.
         *
         * Because JavaScript does not permit method calls on `undefined`, you'll need to
         * wrap an expected `undefined` value with `Claim`. Assigning `require("must")`
         * to `expect` or `demand` works well for these cases.
         *
         * To assert that an object's property is `undefined`, see [`hasProperty`](#Claim.prototype.hasProperty).
         *
         * @example
         * var demand = require("must") // Assuming renamed 'must'
         * demand(undefined).trulyBe.isUndefined()
         *
         * @method isUndefined
         */
        _moduleExports.isUndefined = function() {
            enforceCondition.call(this, this.subject === undefined, "be", undefined);
        };

        /**
         * Asserts that the object is a boolean (`true` or `false`).
         * This also considers boxed boolean objects (`new Boolean`) as booleans.
         *
         * @example
         * true.claim.aKind.isBoolean()
         *
         * @method isBoolean
         */
        _moduleExports.isBoolean = function() {
            enforceCondition.call(this, getTypeOf(this.subject) == "boolean", "be a boolean");
        };

        /**
         * Asserts that the object is a number.
         * This also considers boxed number objects (`new Number`) as numbers.
         *
         * @example
         * (42).claim.aKind.isNumber()
         *
         * @method isNumber
         */
        _moduleExports.isNumber = function() {
            enforceCondition.call(this, getTypeOf(this.subject) == "number", "be a number");
        };

        /**
         * Asserts that the object is a string.
         * This also considers boxed string objects (`new String`) as strings.
         *
         * @example
         * "Hello".claim.aKind.isString()
         *
         * @method isString
         */
        _moduleExports.isString = function() {
            enforceCondition.call(this, getTypeOf(this.subject) == "string", "be a string");
        };

        /**
         * Asserts that the object is a Date instance.
         *
         * @example
         * new Date().claim.aKind.isDate()
         *
         * @method isDate
         */
        _moduleExports.isDate = function() {
            enforceCondition.call(this, getTypeOf(this.subject) == "date", "be a date");
        };

        /**
         * Asserts that the object is a regular expression.
         *
         * @example
         * /[a-z]/.claim.aKind.isRegex()
         *
         * @method isRegex
         */
        _moduleExports.isRegex = function() {
            enforceCondition.call(this, getTypeOf(this.subject) == "regexp", "be a regular expression");
        };

        /**
         * Asserts that the object is an array.
         *
         * @example
         * [42, 69].claim.anEntity.isArray()
         *
         * @method isArray
         */
        _moduleExports.isArray = function() {
            enforceCondition.call(this, Array.isArray(this.subject), "be an array");
        };

        /**
         * Asserts that the object is a function.
         *
         * @example
         * (function() {}).claim.aKind.isFunction()
         *
         * @method isFunction
         */
        _moduleExports.isFunction = function() {
            enforceCondition.call(this, typeof this.subject == "function", "be a function");
        };

        /**
         * Asserts that the object is an plain object.
         *
         * @example
         * ({}).claim.anEntity.isObject()
         *
         * @method isObject
         */
        _moduleExports.isObject = function() {
            var isOkay = this.subject && typeof this.subject == "object";
            enforceCondition.call(this, isOkay, "be an object");
        };

        /**
         * Asserts that the object is truthy (`!!obj`).
         *
         * In JavaScript, only `null`, `undefined`, `0`, `false`, and `""` are falsy.
         * All other values are considered truthy.
         *
         * @example
         * (42).claim.trulyBe.isTruthy()
         * "Hello".claim.trulyBe.isTruthy()
         *
         * @method isTruthy
         */
        _moduleExports.isTruthy = function() {
            enforceCondition.call(this, this.subject, "be truthy");
        };

        /**
         * Asserts that the object is falsy (`!obj`).
         *
         * In JavaScript, only `null`, `undefined`, `0`, `false`, and `""` are falsy.
         * All other values are considered truthy.
         *
         * @example
         * 0.claim.trulyBe.isFalsy()
         * "".claim.trulyBe.isFalsy()
         *
         * @method isFalsy
         */
        _moduleExports.isFalsy = function() {
            enforceCondition.call(this, !this.subject, "be falsy");
        };

        /**
         * Asserts that the object exists (is not `null` or `undefined`).
         *
         * @example
         * 0.claim.exists()
         * "".claim.exists()
         * ({}).claim.exists()
         *
         * @method exists
         */
        _moduleExports.exists = function() {
            enforceCondition.call(this, this.subject != null, "exist");
        };

        /**
         * Asserts that an object is an instance of a particular constructor.
         * Uses `obj instanceof expectedConstructor`.
         *
         * @example
         * new Date().claim.anEntity.instanceof(Date)
         *
         * @method instanceof
         * @param {Function} expectedConstructor The constructor to check against.
         */

    }, {}]
});