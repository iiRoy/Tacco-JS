/*
 *  Behavioral Testing Utility - Version 0.4
 *
 *  A framework-agnostic library for defining test behaviors.
 *
 *  Project: https://github.com/mmonteleone/pavlov
 *  Copyright (c) 2009-2011 Michael Monteleone
 *  Licensed under MIT terms (see LICENSE.md)
 */
(function(universe) {


    // ==================
    // = Utility Module =
    // ==================

    var toolkit = {

        /**
         * Iterates through elements of a given collection (array or object).
         * @param {Object|Array} collection The collection to iterate over.
         * @param {Function} action The function to call for each item.
         */
        traverseItems: function(collection, action) {

            if (typeof collection === 'undefined' || typeof action === 'undefined' ||
                collection === null || action === null) {
                throw "Both 'collection' and 'action' arguments are mandatory.";
            }

            var keyName,
                idx = 0,
                itemCount = collection.length,
                currentElement;

            // Handle object iteration
            if (itemCount === undefined) {

                for (keyName in collection) {

                    if (collection.hasOwnProperty(keyName)) {

                        if (action.call(collection[keyName], keyName, collection[keyName]) === false) {
                            break;
                        }
                    }
                }
            }
            // Handle array iteration
            else {

                for (currentElement = collection[0];
                    idx < itemCount && action.call(currentElement, idx, currentElement) !== false;
                    currentElement = collection[++idx]) {
                }
            }

            return collection;
        },

        /**
         * Converts an array-like structure into a true Array.
         * @param {Object} arrayLikeObject The object resembling an array.
         * @returns {Array} A new Array instance.
         */
        convertToArray: function(arrayLikeObject) {
            return Array.prototype.slice.call(arrayLikeObject);
        },

        /**
         * Checks if the provided object is an Array.
         * @param {Object} targetObject The object to inspect.
         * @returns {boolean} True if it's an array, false otherwise.
         */
        isAnArray: function(targetObject) {
            return Object.prototype.toString.call(targetObject) === "[object Array]";
        },

        /**
         * Copies properties from a source object to a destination object.
         * @param {Object} destination The object receiving properties.
         * @param {Object} source The object providing properties.
         */
        mergeProperties: function(destination, source) {

            if (typeof destination === 'undefined' || typeof source === 'undefined' ||
                destination === null || source === null) {
                throw "Both 'destination' and 'source' arguments are mandatory.";
            }

            var propertyKey;
            for (propertyKey in source) {

                if (source.hasOwnProperty(propertyKey)) {
                    destination[propertyKey] = source[propertyKey];
                }
            }
        },

        /**
         * Provides a basic string representation for display purposes.
         * This is not a full JSON serializer, just a simple formatter.
         * @param {Object} targetObject The object to convert to string.
         * @returns {string} The string representation.
         */
        representObject: function(targetObject) {

            if (typeof targetObject === 'undefined') {
                return "";
            } else if (Object.prototype.toString.call(targetObject) === "[object Array]") {
                return '[' + targetObject.toString() + ']';
            } else if (Object.prototype.toString.call(targetObject) === "[object Function]") {
                return "function()";
            } else if (typeof targetObject === "string") {
                return '"' + targetObject + '"';
            } else {
                return targetObject;
            }
        },

        /**
         * Transforms a camelCase or PascalCase string into a lower-case, space-separated phrase.
         * @param {string} inputString The string to transform.
         * @returns {string} The formatted phrase.
         */
        formatPhrase: function(inputString) {
            return inputString.replace(/([A-Z])/g, ' $1').toLowerCase();
        }
    };


    // ===================
    // = Test Case Setup =
    // ===================

    var testCases = [],
        activeTestCase,
        /**
         * Gathers values of a specific property from the current test case and its ancestors.
         * @param {Object} currentCase The starting test case.
         * @param {String} propertyName The name of the property to collect.
         * @returns {Array} An array of collected property values.
         */
        aggregateAncestors = function(currentCase, propertyName) {

            var collectedValues = [];

            while (currentCase !== null) {
                collectedValues.push(currentCase[propertyName]);
                currentCase = currentCase.parentCase;
            }
            return collectedValues;
        };

    /**
     * TestCase Class
     * Represents a single description block in the test structure.
     * Manages parent-child relationships and holds setup/teardown routines.
     * @constructor
     * @param {TestCase} parentCase Optional: The parent test case to which this one belongs.
     */
    function TestCase(parentCase) {

        if (parentCase) {
            // If a parent is provided, register this as a child
            this.parentCase = parentCase;
            this.parentCase.subCases.push(this);
        } else {
            // Otherwise, this is a top-level test case
            testCases.push(this);
        }

        this.subCases = [];
        this.testUnits = [];
    }

    toolkit.mergeProperties(TestCase.prototype, {
        caseName: '',                           // The name or description of this test block
        parentCase: null,                       // Reference to the parent test case
        subCases: [],                           // Array of nested test cases
        testUnits: [],                          // Array of individual 'it' test specifications
        setupRoutine: function() {},            // Function executed before contained tests
        teardownRoutine: function() {},         // Function executed after contained tests

        /**
         * Collects all 'setupRoutine' functions from this case and its ancestors.
         * @returns {Array<Function>} An array of setup functions, in execution order.
         */
        getSetups: function() {
            return aggregateAncestors(this, 'setupRoutine').reverse();
        },

        /**
         * Collects all 'teardownRoutine' functions from this case and its ancestors.
         * @returns {Array<Function>} An array of teardown functions, in execution order.
         */
        getTeardowns: function() {
            return aggregateAncestors(this, 'teardownRoutine');
        },

        /**
         * Generates a full descriptive name by combining this case's name with its ancestors'.
         * @returns {string} The concatenated name string.
         */
        getCaseNames: function() {
            return aggregateAncestors(this, 'caseName').reverse().join(', ');
        }
    });



    // ====================
    // = Verification API =
    // ====================

    /**
     * VerificationManager
     * Provides an interface for asserting against a specific value.
     * @constructor
     * @param {Object} subjectValue The value to be verified.
     */
    function VerificationManager(subjectValue) {
        this.subjectValue = subjectValue;
    }

    /**
     * Integrates verification methods into the VerificationManager prototype.
     * Each verification implementation becomes an accessible method.
     * @param {Object} verificationImpls Object containing verification functions.
     */
    var registerVerifications = function(verificationImpls) {

        toolkit.traverseItems(verificationImpls, function(methodName, logicFunction) {

            VerificationManager.prototype[methodName] = function() {

                // Prepare arguments: prepend the subject value
                var argumentList = toolkit.convertToArray(arguments);
                argumentList.unshift(this.subjectValue);

                // Auto-generate a descriptive message if none was provided
                if (logicFunction.length === 2) {
                    argumentList[1] = argumentList[1] || 'verifying ' + toolkit.representObject(argumentList[0]) + ' ' + toolkit.formatPhrase(methodName);
                } else if (logicFunction.length === 3) {
                    var expectedValueRepr = toolkit.representObject(argumentList[1]);
                    argumentList[2] = argumentList[2] || 'verifying ' + toolkit.representObject(argumentList[0]) + ' ' + toolkit.formatPhrase(methodName) + (expectedValueRepr ? ' ' + expectedValueRepr : expectedValueRepr);
                }

                logicFunction.apply(this, argumentList);
            };
        });
    };

    // Placeholder for the external test runner interface.
    // In a real implementation, this would be provided by the specific test runner (e.g., QUnit, Jasmine).
    var testRunnerInterface = universe.testRunnerInterface || {
        reportVerification: function(condition, message) {
            // Default behavior: log to console or throw if condition is false
            if (!condition) {
                console.error("Verification Failed: " + message);
                // Optionally throw an error to stop the test
                // throw new Error("Verification Failed: " + message);
            } else {
                console.log("Verification Passed: " + message);
            }
        },
        pauseExecution: function() { /* console.log("Test Runner Paused."); */ },
        resumeExecution: function() { /* console.log("Test Runner Resumed."); */ }
    };

    /**
     * Add the standard set of verifications.
     */
    registerVerifications({

        isEquivalentTo: function(actualResult, expectedResult, failureMessage) {
            testRunnerInterface.reportVerification(actualResult == expectedResult, failureMessage);
        },
        isNotEquivalentTo: function(actualResult, expectedResult, failureMessage) {
            testRunnerInterface.reportVerification(actualResult != expectedResult, failureMessage);
        },
        isIdenticalTo: function(actualResult, expectedResult, failureMessage) {
            testRunnerInterface.reportVerification(actualResult === expectedResult, failureMessage);
        },
        isNotIdenticalTo: function(actualResult, expectedResult, failureMessage) {
            testRunnerInterface.reportVerification(actualResult !== expectedResult, failureMessage);
        },
        isTrueValue: function(actualResult, failureMessage) {
            testRunnerInterface.reportVerification(actualResult, failureMessage);
        },
        isFalseValue: function(actualResult, failureMessage) {
            testRunnerInterface.reportVerification(!actualResult, failureMessage);
        },
        isAbsent: function(actualResult, failureMessage) {
            testRunnerInterface.reportVerification(actualResult === null, failureMessage);
        },
        isPresent: function(actualResult, failureMessage) {
            testRunnerInterface.reportVerification(actualResult !== null, failureMessage);
        },
        isDefined: function(actualResult, failureMessage) {
            testRunnerInterface.reportVerification(typeof actualResult !== 'undefined', failureMessage);
        },
        isUndefined: function(actualResult, failureMessage) {
            testRunnerInterface.reportVerification(typeof actualResult === 'undefined', failureMessage);
        },
        succeed: function(actualResult, failureMessage) { // actualResult is ignored here
            testRunnerInterface.reportVerification(true, failureMessage);
        },
        fail: function(actualResult, failureMessage) { // actualResult is ignored here
            testRunnerInterface.reportVerification(false, failureMessage);
        },
        isAFunction: function(actualResult, failureMessage) {
            return testRunnerInterface.reportVerification(typeof actualResult === "function", failureMessage);
        },
        isNotAFunction: function(actualResult, failureMessage) {
            return testRunnerInterface.reportVerification(typeof actualResult !== "function", failureMessage);
        },
        throwsError: function(actionToExecute, expectedErrorMessage, failureMessage) {
            // The `actionToExecute` is expected to be a function that throws.
            try {
                actionToExecute();
                testRunnerInterface.reportVerification(false, failureMessage); // Should have thrown, so this is a failure
            } catch (thrownError) {
                // This allows for checking if *any* error was thrown, or a specific one.
                testRunnerInterface.reportVerification(thrownError === (expectedErrorMessage || thrownError), failureMessage);
            }
        }
    });


    // =======================
    // = Public Test Facade  =
    // =======================

    /**
     * Object encapsulating the public API methods for defining tests.
     */
    var publicInterface = {

        /**
         * Starts a new test case context.
         * @param {String} caseDescription A textual description of the behavior.
         * @param {Function} logicFunction The function containing nested test definitions.
         */
        describe: function(caseDescription, logicFunction) {

            if (arguments.length < 2) {
                throw "Both 'caseDescription' and 'logicFunction' are required arguments.";
            }

            // Store reference to the current test case before creating a new one
            var priorTestCase = activeTestCase;

            try {
                // Establish a new active test case for construction
                activeTestCase = new TestCase(activeTestCase);
                activeTestCase.caseName = caseDescription;
                logicFunction();
            } finally {
                // Restore the original test case context
                activeTestCase = priorTestCase;
            }
        },

        /**
         * Defines a setup function to run before all test units within the current context.
         * @param {Function} setupAction The function to be executed.
         */
        beforeEach: function(setupAction) {

            if (arguments.length === 0) {
                throw "'setupAction' argument is required.";
            }
            activeTestCase.setupRoutine = setupAction;
        },

        /**
         * Defines a teardown function to run after all test units within the current context.
         * @param {Function} teardownAction The function to be executed.
         */
        afterEach: function(teardownAction) {

            if (arguments.length === 0) {
                throw "'teardownAction' argument is required.";
            }
            activeTestCase.teardownRoutine = teardownAction;
        },

        /**
         * Creates an individual test specification (an "it" block).
         * If no implementation is provided, it creates a stub that fails with "Not Implemented".
         * @param {String} unitDescription A description of what "it should do".
         * @param {Function} testImplementation Optional: The actual test function.
         */
        it: function(unitDescription, testImplementation) {

            if (arguments.length === 0) {
                throw "'unitDescription' argument is required.";
            }

            if (testImplementation) {
                if (testImplementation.asynchronous) {
                    unitDescription += " (asynchronous)";
                }
                activeTestCase.testUnits.push([unitDescription, testImplementation]);
            } else {
                // If no implementation, stub it to fail
                publicInterface.it(unitDescription, function() {
                    publicInterface.verify.fail('Not Implemented');
                });
            }
        },

        /**
         * Marks a test implementation as asynchronous.
         * The test runner will pause and expect `resume()` to be called.
         * @param {Function} originalFunction The test function that will perform asynchronous operations.
         * @returns {Function} A wrapped function marked for asynchronous execution.
         */
        asyncTest: function(originalFunction) {

            var routineExecution = function() {
                testRunnerInterface.pauseExecution();
                originalFunction.apply(this, arguments);
            };
            routineExecution.asynchronous = true;
            return routineExecution;
        },

        /**
         * Facilitates data-driven testing by running a spec for each provided input.
         * @returns {Object} An object with an `it` method to define the data-driven test.
         * @param {Array<any>|any...} inputValues Either an array of values, or multiple values as separate arguments.
         */
        forEachInput: function() {

            if (arguments.length === 0) {
                throw "At least one input argument is required.";
            }

            var inputArguments = toolkit.convertToArray(arguments);

            // If a single array was passed, use that array directly
            if (arguments.length === 1 && toolkit.isAnArray(arguments[0])) {
                inputArguments = inputArguments[0];
            }

            return {
                /**
                 * Defines the test specification to be executed for each input value.
                 * @param {string} unitDescription The base description for the test.
                 * @param {Function} testFunction The function to run for each input.
                 */
                it: function(unitDescription, testFunction) {

                    toolkit.traverseItems(inputArguments, function() {
                        var singleInput = this;
                        publicInterface.it("with input '" + toolkit.representObject(singleInput) + "', " + unitDescription, function() {
                            testFunction.apply(this, toolkit.isAnArray(singleInput) ? singleInput : [singleInput]);
                        });
                    });
                }
            };
        },

        /**
         * Initiates a verification chain for a specific value.
         * @param {Object} valueToVerify The value that will be asserted.
         * @returns {VerificationManager} An instance to perform fluent assertions.
         */
        verify: function(valueToVerify) {
            return new VerificationManager(valueToVerify);
        },

        /**
         * Instructs the test runner to wait synchronously for a specified duration.
         * @param {Number} milliseconds The duration to wait in milliseconds.
         * @param {Function} continuationFunction The function to execute after the wait.
         */
        wait: function(milliseconds, continuationFunction) {

            if (arguments.length < 2) {
                throw "Both 'milliseconds' and 'continuationFunction' arguments are required.";
            }

            testRunnerInterface.pauseExecution();
            universe.setTimeout(function() {
                continuationFunction();
                testRunnerInterface.resumeExecution();
            }, milliseconds);
        },

        /**
         * Signals the test runner to pause its execution.
         */
        pause: function() {
            testRunnerInterface.pauseExecution();
        },

        /**
         * Signals the test runner to resume its execution.
         */
        resume: function() {
            testRunnerInterface.resumeExecution();
        }
    };

    // Enhance the publicInterface.verify function with direct access to parameter-less succeed/fail
    toolkit.traverseItems(['succeed', 'fail'], function(idx, assertionMethod) {
        publicInterface.verify[assertionMethod] = function(failureMessage) {
            publicInterface.verify()[assertionMethod](failureMessage);
        };
    });

    /**
     * Augments a function's execution context by injecting additional scope variables.
     * Inspired by Yehuda Katz's metaprogramming techniques.
     * @param {Function} originalFunc The function whose scope is to be extended.
     * @param {Object} contextObject The 'this' value for the augmented function.
     * @param {Object} injectedScope An object whose members become accessible in the function's scope.
     * @returns {Function} A new function with the extended scope, callable with original arguments.
     */
    var augmentFunctionContext = function(originalFunc, contextObject, injectedScope) {

        // Extract the parameter names from the original function's signature
        var functionParameters = originalFunc.toString().match(/\(([^\)]*)\)/)[1],
            // Extract the body content of the original function
            functionBody = originalFunc.toString().match(/^[^\{]*\{((.*\s*)*)\}/m)[1];

        // Create a new function dynamically. It takes the injected scope and original parameters.
        // The 'with' statement makes injectedScope's properties available directly.
        originalFunc = new Function(
            "injectedScope" + (functionParameters ? ", " + functionParameters : ""),
            "with(injectedScope) {" + functionBody + "}"
        );

        // Return a wrapper function that prepares arguments and calls the newly created function.
        return function() {
            var argumentList = [injectedScope];
            toolkit.traverseItems(arguments, function() {
                argumentList.push(this);
            });
            originalFunc.apply(contextObject, argumentList);
        };
    };

    // Expose the public interface to the global object.
    universe.TestFramework = publicInterface;

})(this);