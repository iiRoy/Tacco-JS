(function (rootScope) {

    //
    // Core Utility Functions
    // This section provides fundamental helpers for collection manipulation,
    // type checking, and object merging.
    //

    var toolkit = {
        /**
         * Iterates through elements of a collection (array or object).
         * @param {Object|Array} collection The collection to traverse.
         * @param {Function} operation The function to call for each element.
         *                              It receives (key, value) for objects or (index, value) for arrays.
         *                              Returning `false` from `operation` stops iteration.
         * @throws {Error} If `collection` or `operation` are invalid.
         * @returns {Object|Array} The original collection.
         */
        iterateOver: function (collection, operation) {
            if (!collection || typeof operation !== 'function') {
                throw new Error("Both a valid 'collection' and 'operation' callback are mandatory for iteration.");
            }

            var itemKey,
                itemIndex = 0,
                collectionSize = collection.length,
                currentValue;

            // Check if it's an array-like object or a regular object
            if (typeof collectionSize === 'number' && collectionSize >= 0 && collection.constructor === Array) {
                // Array-like iteration
                for (; itemIndex < collectionSize; itemIndex++) {
                    currentValue = collection[itemIndex];
                    if (operation.call(currentValue, itemIndex, currentValue) === false) {
                        break;
                    }
                }
            } else if (typeof collection === 'object') {
                // Object iteration
                for (itemKey in collection) {
                    if (Object.prototype.hasOwnProperty.call(collection, itemKey)) {
                        if (operation.call(collection[itemKey], itemKey, collection[itemKey]) === false) {
                            break;
                        }
                    }
                }
            } else {
                // Handle non-iterable types gracefully or throw
                // For Type III, let's just return, as it's non-essential to iterate primitive.
                return collection;
            }

            return collection;
        },

        /**
         * Converts an array-like structure into a true Array.
         * @param {Object} arrLike An object resembling an array (e.g., `arguments`).
         * @returns {Array} A new array containing the elements.
         */
        convertToArray: function (arrLike) {
            if (!arrLike || typeof arrLike.length !== 'number') {
                return []; // Return empty array for non-array-like inputs
            }
            return Array.prototype.slice.call(arrLike);
        },

        /**
         * Determines if the given candidate is an Array.
         * @param {Object} candidate The object to test.
         * @returns {boolean} True if the candidate is an Array, false otherwise.
         */
        isAnArray: function (candidate) {
            return Object.prototype.toString.call(candidate) === "[object Array]";
        },

        /**
         * Merges properties from a source object into a target object.
         * This performs a shallow copy.
         * @param {Object} targetObj The object to receive properties.
         * @param {Object} sourceObj The object providing properties to merge.
         * @throws {Error} If `targetObj` or `sourceObj` are invalid.
         */
        mergeProperties: function (targetObj, sourceObj) {
            if (!targetObj || typeof targetObj !== 'object' || !sourceObj || typeof sourceObj !== 'object') {
                throw new Error("Both 'targetObj' and 'sourceObj' must be valid objects for merging.");
            }
            for (var member in sourceObj) {
                if (Object.prototype.hasOwnProperty.call(sourceObj, member)) {
                    targetObj[member] = sourceObj[member];
                }
            }
        },

        /**
         * Provides a concise string representation of a value for display purposes.
         * Not intended for full JSON serialization.
         * @param {any} valToRepresent The value to serialize.
         * @returns {string} A display-friendly string.
         */
        representValue: function (valToRepresent) {
            if (typeof valToRepresent === 'undefined') {
                return "[Undefined]";
            } else if (valToRepresent === null) {
                return "[Null]";
            } else if (toolkit.isAnArray(valToRepresent)) {
                return '[' + valToRepresent.map(toolkit.representValue).join(', ') + ']';
            } else if (typeof valToRepresent === "string") {
                return '"' + valToRepresent + '"';
            } else if (typeof valToRepresent === "function") {
                return "Function()";
            } else if (typeof valToRepresent === "object" && valToRepresent.toString !== Object.prototype.toString) {
                return valToRepresent.toString(); // Use custom toString if available
            } else {
                return String(valToRepresent); // Fallback for other primitives/objects
            }
        },

        /**
         * Converts a camelCase or PascalCase string into a lower-case, space-separated phrase.
         * @param {string} textInput The string to convert.
         * @returns {string} The formatted phrase.
         */
        toPhrase: function (textInput) {
            if (typeof textInput !== 'string') {
                return String(textInput); // Ensure it's a string
            }
            return textInput.replace(/([A-Z])/g, ' $1').toLowerCase();
        }
    };


    //
    // Test Suite Management
    // Manages the hierarchy of test descriptions and their associated
    // setup/teardown functions and individual test cases.
    //

    var allTestSuites = [], // Stores all root-level test suites
        activeSuite,        // The currently active test suite being defined
        nextSuiteId = 0;    // Simple counter for unique suite IDs

    /**
     * Traverses up the test suite hierarchy, collecting properties from ancestors.
     * @param {TestSuite} currentSuite The starting suite.
     * @param {string} propertyName The name of the property to collect.
     * @returns {Array} An array of collected property values.
     */
    var collectAncestors = function (currentSuite, propertyName) {
        var collectedItems = [];
        var tempSuite = currentSuite;
        while (tempSuite !== null) {
            var propVal = tempSuite[propertyName];
            // If the property is an array (like hooks), flatten it
            if (toolkit.isAnArray(propVal)) {
                collectedItems = propVal.concat(collectedItems);
            } else if (propVal) {
                collectedItems.push(propVal);
            }
            tempSuite = tempSuite.parentSuite;
        }
        return collectedItems;
    };

    /**
     * TestSuite Class
     * Represents a block of test descriptions (a 'describe' block).
     * Manages parent-child relationships, nested suites, and test cases.
     * @constructor
     * @param {TestSuite} parentSuite The parent suite (optional).
     */
    function TestSuite(parentSuite) {
        this.suiteId = 'suite_' + (nextSuiteId++);
        this.parentSuite = null;
        this.suiteDescription = '';
        this.nestedSuites = [];
        this.testCases = [];
        this._preHooks = [];  // Array to hold multiple 'before' functions
        this._postHooks = []; // Array to hold multiple 'after' functions

        if (parentSuite) {
            this.parentSuite = parentSuite;
            this.parentSuite.nestedSuites.push(this);
        } else {
            allTestSuites.push(this); // This is a root suite
        }
    }

    toolkit.mergeProperties(TestSuite.prototype, {
        /**
         * Retrieves all 'before' functions from this suite and its ancestors, in execution order.
         * @returns {Array<Function>} An array of functions to execute before tests.
         */
        getPreHooks: function () {
            // Collects from ancestors first, then this suite's own hooks
            return collectAncestors(this, '_preHooks').reverse();
        },
        /**
         * Retrieves all 'after' functions from this suite and its ancestors, in execution order.
         * @returns {Array<Function>} An array of functions to execute after tests.
         */
        getPostHooks: function () {
            // Collects from this suite first, then its ancestors' hooks
            return collectAncestors(this, '_postHooks');
        },
        /**
         * Combines the descriptions of this suite and its ancestors.
         * @returns {string} The full descriptive path of the suite.
         */
        getFullDescription: function () {
            var descriptions = [];
            var tempSuite = this;
            while (tempSuite !== null) {
                if (tempSuite.suiteDescription) {
                    descriptions.push(tempSuite.suiteDescription);
                }
                tempSuite = tempSuite.parentSuite;
            }
            return descriptions.reverse().join(' :: ');
        }
    });


    //
    // Assertion Handling
    // Provides a fluent API for making test assertions.
    //

    /**
     * ValueAsserter
     * Wraps a value to provide assertion methods against it.
     * @constructor
     * @param {any} subjectValue The value to be asserted.
     */
    function ValueAsserter(subjectValue) {
        this.subjectValue = subjectValue;
    }

    /**
     * Populates the ValueAsserter prototype with assertion methods.
     * @param {Object} assertionImplementations An object mapping assertion names to their logic.
     */
    var registerAssertions = function (assertionImplementations) {
        toolkit.iterateOver(assertionImplementations, function (assertionName, assertionFn) {
            ValueAsserter.prototype[assertionName] = function () {
                var invocationArgs = toolkit.convertToArray(arguments);
                invocationArgs.unshift(this.subjectValue); // Prepend the subject value

                // Dynamically generate a default message if none is provided
                var messageIndex;
                if (assertionFn.length === 2) { // (actual, message)
                    messageIndex = 1;
                } else if (assertionFn.length === 3) { // (actual, expected, message)
                    messageIndex = 2;
                }

                if (messageIndex !== undefined && !invocationArgs[messageIndex]) {
                    var baseMessage = 'Assertion failed: ' + toolkit.representValue(invocationArgs[0]) + ' ' + toolkit.toPhrase(assertionName);
                    if (assertionFn.length === 3) {
                        baseMessage += ' ' + toolkit.representValue(invocationArgs[1]);
                    }
                    invocationArgs[messageIndex] = baseMessage;
                }

                assertionFn.apply(this, invocationArgs);
            };
        });
    };

    /**
     * Register standard assertion methods.
     */
    registerAssertions({
        isEquivalentTo: function (received, anticipated, feedback) {
            adapter.assert(received == anticipated, feedback);
        },
        isNotEquivalentTo: function (received, anticipated, feedback) {
            adapter.assert(received != anticipated, feedback);
        },
        isIdenticalTo: function (received, anticipated, feedback) {
            adapter.assert(received === anticipated, feedback);
        },
        isNotIdenticalTo: function (received, anticipated, feedback) {
            adapter.assert(received !== anticipated, feedback);
        },
        isTrueValue: function (received, feedback) {
            adapter.assert(!!received, feedback); // Checks for truthiness
        },
        isFalseValue: function (received, feedback) {
            adapter.assert(!received, feedback); // Checks for falsiness
        },
        isDefinitelyNull: function (received, feedback) {
            adapter.assert(received === null, feedback);
        },
        isDefinitelyNotNull: function (received, feedback) {
            adapter.assert(received !== null, feedback);
        },
        isDefinedValue: function (received, feedback) {
            adapter.assert(typeof received !== 'undefined', feedback);
        },
        isUndefinedValue: function (received, feedback) {
            adapter.assert(typeof received === 'undefined', feedback);
        },
        isAFunction: function (received, feedback) {
            adapter.assert(typeof received === "function", feedback);
        },
        isNotAFunction: function (received, feedback) {
            adapter.assert(typeof received !== "function", feedback);
        },
        alwaysPass: function (received, feedback) {
            adapter.assert(true, feedback);
        },
        alwaysFail: function (received, feedback) {
            adapter.assert(false, feedback);
        },
        expectsException: function (receivedFn, expectedErrorMatch, feedback) {
            if (typeof receivedFn !== 'function') {
                adapter.assert(false, 'Expected a function to be thrown, but received: ' + typeof receivedFn);
                return;
            }
            try {
                receivedFn();
                adapter.assert(false, feedback || 'Expected an exception but none was thrown.');
            } catch (err) {
                // If a specific error description (e.g., string message or error type) is expected
                if (expectedErrorMatch) {
                    var matchFound = false;
                    if (typeof expectedErrorMatch === 'string') {
                        matchFound = (err.message && err.message.indexOf(expectedErrorMatch) > -1) || (String(err).indexOf(expectedErrorMatch) > -1);
                    } else if (expectedErrorMatch instanceof RegExp) {
                        matchFound = expectedErrorMatch.test(err.message || String(err));
                    } else if (typeof expectedErrorMatch === 'function' && expectedErrorMatch.prototype instanceof Error) {
                        matchFound = (err instanceof expectedErrorMatch);
                    } else {
                        // Fallback, simple equality for objects/primitives if not string/regex/Error constructor
                        matchFound = (err === expectedErrorMatch);
                    }
                    adapter.assert(matchFound, feedback || 'Expected exception did not match criteria.');
                } else {
                    adapter.assert(true, feedback); // Any exception is fine
                }
            }
        }
    });


    //
    // Public Behavioral Testing API
    // This object exposes the main functions for defining tests.
    //

    var testAPI = {
        /**
         * Defines a new test suite (a 'describe' block).
         * @param {string} suiteDescription The name/description of the suite.
         * @param {Function} suiteFunction The function containing nested suites, hooks, and test cases.
         * @throws {Error} If arguments are missing or invalid.
         */
        describe: function (suiteDescription, suiteFunction) {
            if (typeof suiteDescription !== 'string' || typeof suiteFunction !== 'function') {
                throw new Error("Both 'suiteDescription' (string) and 'suiteFunction' (function) are required for 'describe'.");
            }

            var previousSuite = activeSuite; // Save context
            try {
                activeSuite = new TestSuite(previousSuite);
                activeSuite.suiteDescription = suiteDescription;
                suiteFunction.call(activeSuite); // Execute the suite's definition function
            } finally {
                activeSuite = previousSuite; // Restore context
            }
        },

        /**
         * Registers a setup function to run before all test cases in the current suite and its children.
         * Multiple `before` calls will be executed in order.
         * @param {Function} setupFunction The function to execute.
         * @throws {Error} If `setupFunction` is not a function.
         */
        beforeEachTest: function (setupFunction) {
            if (typeof setupFunction !== 'function') {
                throw new Error("'setupFunction' must be a function for 'beforeEachTest'.");
            }
            if (!activeSuite) {
                throw new Error("Cannot call 'beforeEachTest' outside of a 'describe' block.");
            }
            activeSuite._preHooks.push(setupFunction);
        },

        /**
         * Registers a teardown function to run after all test cases in the current suite and its children.
         * Multiple `after` calls will be executed in order.
         * @param {Function} teardownFunction The function to execute.
         * @throws {Error} If `teardownFunction` is not a function.
         */
        afterEachTest: function (teardownFunction) {
            if (typeof teardownFunction !== 'function') {
                throw new Error("'teardownFunction' must be a function for 'afterEachTest'.");
            }
            if (!activeSuite) {
                throw new Error("Cannot call 'afterEachTest' outside of a 'describe' block.");
            }
            activeSuite._postHooks.push(teardownFunction);
        },

        /**
         * Defines an individual test case (an 'it' block).
         * If no `caseFunction` is provided, a "Not Implemented" failing test is created.
         * @param {string} caseDescription The description of the test case.
         * @param {Function} [caseFunction] The actual test logic.
         * @throws {Error} If `caseDescription` is missing.
         */
        testCase: function (caseDescription, caseFunction) {
            if (typeof caseDescription !== 'string') {
                throw new Error("'caseDescription' (string) is required for 'testCase'.");
            }
            if (!activeSuite) {
                throw new Error("Cannot call 'testCase' outside of a 'describe' block.");
            }

            var actualCaseFunction = caseFunction || function () {
                testAPI.assert().alwaysFail('Test case not yet implemented: ' + caseDescription);
            };

            if (actualCaseFunction.isAsync) {
                caseDescription += " (asynchronous)";
            }
            activeSuite.testCases.push([caseDescription, actualCaseFunction]);
        },

        /**
         * Marks a test function as asynchronous, requiring `adapter.pause()` and `adapter.resume()`.
         * @param {Function} originalFunction The function to wrap for asynchronous execution.
         * @returns {Function} A wrapped function with an `isAsync` flag.
         */
        makeAsync: function (originalFunction) {
            if (typeof originalFunction !== 'function') {
                throw new Error("Only functions can be marked as asynchronous.");
            }
            var asyncWrapper = function () {
                adapter.pause();
                originalFunction.apply(this, arguments);
            };
            asyncWrapper.isAsync = true;
            return asyncWrapper;
        },

        /**
         * Provides a data-driven testing mechanism, running a test case for each provided input.
         * @returns {Object} An object with an `executeWithContext` method.
         * @param {Array|...any} inputArguments A list of values or arrays of values.
         */
        dataDriven: function () {
            if (arguments.length === 0) {
                throw new Error("At least one argument is required for 'dataDriven'.");
            }
            var inputs = toolkit.convertToArray(arguments);
            // If the first argument is an array and it's the only argument, use it directly.
            if (inputs.length === 1 && toolkit.isAnArray(inputs[0])) {
                inputs = inputs[0];
            }

            return {
                /**
                 * Defines a test case that will be executed for each of the `dataDriven` inputs.
                 * @param {string} baseDescription The base description for the test case.
                 * @param {Function} contextFunction The function to run for each input.
                 */
                executeWithContext: function (baseDescription, contextFunction) {
                    toolkit.iterateOver(inputs, function (idx, currentInput) {
                        var specificDescription = "given " + toolkit.representValue(currentInput) + ", " + baseDescription;
                        testAPI.testCase(specificDescription, function () {
                            // If the input itself is an array, spread it as arguments
                            contextFunction.apply(this, toolkit.isAnArray(currentInput) ? currentInput : [currentInput]);
                        });
                    });
                }
            };
        },

        /**
         * Starts an assertion chain on a given value.
         * @param {any} valueToAssert The value to assert against.
         * @returns {ValueAsserter} An instance of ValueAsserter for fluent assertions.
         */
        assert: function (valueToAssert) {
            return new ValueAsserter(valueToAssert);
        },

        /**
         * Instructs the test runner to wait for a specified duration before resuming.
         * @param {number} delayMs The delay in milliseconds.
         * @param {Function} continuationFn The function to execute after the delay, before resuming.
         * @throws {Error} If arguments are missing or invalid.
         */
        waitFor: function (delayMs, continuationFn) {
            if (typeof delayMs !== 'number' || typeof continuationFn !== 'function') {
                throw new Error("Both 'delayMs' (number) and 'continuationFn' (function) are required for 'waitFor'.");
            }
            adapter.pause();
            rootScope.setTimeout(function () {
                continuationFn();
                adapter.resume();
            }, delayMs);
        },

        /**
         * Explicitly pauses the test runner.
         */
        halt: function () {
            adapter.pause();
        },

        /**
         * Explicitly resumes the test runner.
         */
        proceed: function () {
            adapter.resume();
        }
    };

    // Extend `testAPI.assert` for direct calls to `pass` and `fail` without a subject value.
    toolkit.iterateOver(['alwaysPass', 'alwaysFail'], function (i, assertMethod) {
        testAPI.assert[assertMethod] = function (feedbackMsg) {
            testAPI.assert()[assertMethod](feedbackMsg);
        };
    });

    /**
     * Augments a function's execution scope with additional variables.
     * This allows a function to access variables as if they were defined in its own scope.
     * @param {Function} originalFn The function to modify.
     * @param {Object} contextObj The `this` context for the modified function.
     * @param {Object} additionalScope An object whose properties will be injected into the function's scope.
     * @returns {Function} A new function with the augmented scope.
     */
    var augmentFunctionScope = function (originalFn, contextObj, additionalScope) {
        // Extract parameter names from the function signature
        var paramNamesMatch = originalFn.toString().match(/\(([^)]*)\)/);
        var functionParams = paramNamesMatch && paramNamesMatch[1] ? paramNamesMatch[1].trim() : '';

        // Extract the function body
        var functionBodyMatch = originalFn.toString().match(/^[^\{]*\{((?:.|\r?\n)*)\}/m);
        var functionBody = functionBodyMatch ? functionBodyMatch[1] : '';

        // Create a new Function constructor call that wraps the original body in a 'with' statement.
        // 'with' is generally discouraged but used here for scope augmentation in specific contexts.
        var newFunction = new Function (
            "additionalScope" + (functionParams ? ", " + functionParams : ""),
            "with(additionalScope) {" + functionBody + "}"
        );

        // Return a wrapper that prepends the 'additionalScope' to the arguments
        return function () {
            var actualArguments = [additionalScope].concat(toolkit.convertToArray(arguments));
            return newFunction.apply(contextObj, actualArguments);
        };
    };

    // Expose the API to the global scope under a different name.
    rootScope.BehavioralSpec = testAPI;

})(this);