(function (rootScope) {

    // --- Core Utility Set ---
    var toolkit = {
        /**
         * Traverses elements within a collection (array or object)
         * @param {Object|Array} collection The collection to iterate
         * @param {Function} operation Callback for each element
         */
        traverseItems: function (collection, operation) {
            if (collection === undefined || operation === undefined || collection === null || operation === null) {
                throw "Both 'collection' and 'operation' parameters are mandatory";
            }

            if (toolkit.isList(collection)) {
                for (var index = 0; index < collection.length; index++) {
                    if (operation.call(collection[index], index, collection[index]) === false) {
                        break;
                    }
                }
            } else {
                var objectKeys = Object.keys(collection);
                for (var i = 0; i < objectKeys.length; i++) {
                    var key = objectKeys[i];
                    if (operation.call(collection[key], key, collection[key]) === false) {
                        break;
                    }
                }
            }
            return collection;
        },
        /**
         * Transforms an array-like structure into a proper array
         * @param {Object} arrayLike An array-like object
         * @returns {Array}
         */
        toArray: function (arrayLike) {
            return Array.prototype.slice.call(arrayLike);
        },
        /**
         * Determines if an object is an array
         * @param {Object} item The object to check
         * @returns {boolean} True if it's an array, false otherwise
         */
        isList: function (item) {
            return Array.isArray(item);
        },
        /**
         * Merges properties from a source object into a destination object
         * @param {Object} target The object to receive properties
         * @param {Object} source The object providing properties
         */
        mergeObjects: function (target, source) {
            if (target === undefined || source === undefined || target === null || source === null) {
                throw "Both 'target' and 'source' parameters are mandatory";
            }
            Object.assign(target, source);
        },
        /**
         * Provides a basic string representation of an item for display
         * @param {Object} item The item to represent
         * @returns {string} Display string
         */
        displayValue: function (item) {
            if (item === undefined) {
                return "";
            }

            var typeRepresentations = new Map([
                ["[object Array]", function (arr) { return '[' + arr.toString() + ']'; }],
                ["[object Function]", function () { return "function()"; }],
                ["[object String]", function (str) { return '"' + str + '"'; }],
                ["[object Null]", function () { return "null"; }],
                ["[object Undefined]", function () { return "undefined"; }]
            ]);

            var objectType = Object.prototype.toString.call(item);
            var formatter = typeRepresentations.get(objectType);

            return formatter ? formatter(item) : String(item);
        },
        /**
         * Converts a camelCase or PascalCase string into a lower-case, space-separated phrase
         * @param {string} sourceText The string to convert
         * @returns {string} The humanized phrase
         */
        humanizeText: function (sourceText) {
            var transformedText = '';
            for (var i = 0; i < sourceText.length; i++) {
                var character = sourceText[i];
                if (character >= 'A' && character <= 'Z' && i > 0) {
                    transformedText += ' ';
                }
                transformedText += character;
            }
            return transformedText.toLowerCase();
        }
    };

    // --- Test Node Structure ---
    var testNodes = [],
        activeNode,
        accumulateAncestors = function (startNode, propertyIdentifier) {
            var collectedItems = [];
            var currentNode = startNode;
            while (currentNode !== null) {
                collectedItems.push(currentNode[propertyIdentifier]);
                currentNode = currentNode.ancestor;
            }
            return collectedItems;
        };

    /**
     * TestNode Class
     * Represents a conceptual grouping of tests (like a 'describe' block)
     * @constructor
     * @param {TestNode} ancestorReference Parent node (optional)
     */
    function TestNode(ancestorReference) {
        if (ancestorReference) {
            this.ancestor = ancestorReference;
            this.ancestor.offspring.push(this);
        } else {
            testNodes.push(this);
        }

        this.offspring = [];
        this.specifications = [];
    }
    toolkit.mergeObjects(TestNode.prototype, {
        descriptor: '',
        ancestor: null,
        offspring: [],
        specifications: [],
        onPrepare: function () {},
        onCleanup: function () {},
        /**
         * Gathers all 'onPrepare' functions from this node and its ancestors
         * @returns {Array<Function>}
         */
        allPreparations: function () {
            return accumulateAncestors(this, 'onPrepare').reverse();
        },
        /**
         * Gathers all 'onCleanup' functions from this node and its ancestors
         * @returns {Array<Function>}
         */
        allCleanups: function () {
            return accumulateAncestors(this, 'onCleanup');
        },
        /**
         * Constructs a full descriptive path from ancestor names
         * @returns {string}
         */
        fullPath: function () {
            return accumulateAncestors(this, 'descriptor').reverse().join(' :: ');
        }
    });


    // --- Verification System ---

    /**
     * ValueVerifier
     * Provides an API for performing verifications against a specific value.
     * @constructor
     * @param {Object} testedValue The value to be verified
     */
    function ValueVerifier(testedValue) {
        this.subject = testedValue;
    }

    /**
     * Populates the ValueVerifier prototype with verification methods.
     * @param {Object} verificationImplementations An object containing method names and their functions
     */
    var registerVerifiers = function (verificationImplementations) {
        toolkit.traverseItems(verificationImplementations, function (methodName, methodFunction) {
            ValueVerifier.prototype[methodName] = function () {
                var operationArguments = toolkit.toArray(arguments);
                operationArguments.unshift(this.subject);

                // Dynamically generate a verification message if not provided
                var finalMessage = '';
                if (methodFunction.length === 2) { // (actual, message)
                    finalMessage = operationArguments[1] || 'verifying ' + toolkit.displayValue(operationArguments[0]) + ' ' + toolkit.humanizeText(methodName);
                } else if (methodFunction.length === 3) { // (actual, expected, message)
                    var expectedRepresentation = toolkit.displayValue(operationArguments[1]);
                    finalMessage = operationArguments[2] || 'verifying ' + toolkit.displayValue(operationArguments[0]) + ' ' + toolkit.humanizeText(methodName) + (expectedRepresentation ? ' ' + expectedRepresentation : '');
                }
                operationArguments[operationArguments.length - 1] = finalMessage; // Replace the message argument

                methodFunction.apply(this, operationArguments);
            };
        });
    };

    // Assume testReporter is provided by the environment or provide a basic stub
    var testReporter = rootScope.testReporter || {
        assert: function (condition, message) {
            if (!condition) {
                throw new Error("Verification Failed: " + message);
            }
        },
        holdExecution: function () { /* no-op for standalone */ },
        proceedExecution: function () { /* no-op for standalone */ }
    };

    /**
     * Register standard verification methods
     */
    registerVerifiers({
        matches: function (actual, expected, msg) {
            testReporter.assert(actual == expected, msg);
        },
        isEquivalentTo: function (actual, expected, msg) {
            testReporter.assert(actual == expected, msg);
        },
        isNotEquivalentTo: function (actual, expected, msg) {
            testReporter.assert(actual != expected, msg);
        },
        isIdenticalTo: function (actual, expected, msg) {
            testReporter.assert(actual === expected, msg);
        },
        isNotIdenticalTo: function (actual, expected, msg) {
            testReporter.assert(actual !== expected, msg);
        },
        isTruthful: function (actual, msg) {
            testReporter.assert(actual, msg);
        },
        isFalsey: function (actual, msg) {
            testReporter.assert(!actual, msg);
        },
        isEmpty: function (actual, msg) {
            testReporter.assert(actual === null, msg);
        },
        isNotEmpty: function (actual, msg) {
            testReporter.assert(actual !== null, msg);
        },
        isEstablished: function (actual, msg) {
            testReporter.assert(typeof actual !== 'undefined', msg);
        },
        isUnestablished: function (actual, msg) {
            testReporter.assert(typeof actual === 'undefined', msg);
        },
        succeed: function (actual, msg) {
            testReporter.assert(true, msg);
        },
        fail: function (actual, msg) {
            testReporter.assert(false, msg);
        },
        isExecutable: function(actual, msg) {
            return testReporter.assert(typeof actual === "function", msg);
        },
        isNotExecutable: function (actual, msg) {
            return testReporter.assert(typeof actual !== "function", msg);
        },
        throwsError: function (action, expectedErrorPattern, msg) {
            try {
                action();
                testReporter.assert(false, msg); // Should have thrown an error
            } catch (err) {
                // Allows for checking specific error patterns or any error
                testReporter.assert(err === (expectedErrorPattern || err), msg);
            }
        }
    });


    // --- Behavioral Script Interface ---

    /**
     * Object containing methods to be made available as the public API
     */
    var scriptInterface = {
        /**
         * Establishes a new test group context
         * @param {String} title Description of the group
         * @param {Function} definitionFunc Function containing group definitions
         */
        group: function (title, definitionFunc) {
            if (arguments.length < 2) {
                throw "Both 'title' and 'definitionFunc' parameters are mandatory";
            }

            var previousNode = activeNode;
            try {
                activeNode = new TestNode(activeNode);
                activeNode.descriptor = title;
                // Pass the API functions as a context object to the definition function
                definitionFunc({
                    prepare: scriptInterface.prepare,
                    cleanup: scriptInterface.cleanup,
                    check: scriptInterface.check,
                    asyncCheck: scriptInterface.asyncCheck,
                    forData: scriptInterface.forData,
                    verify: scriptInterface.verify,
                    delay: scriptInterface.delay,
                    hold: scriptInterface.hold,
                    proceed: scriptInterface.proceed,
                    group: scriptInterface.group // Allow nested groups
                });
            } finally {
                activeNode = previousNode;
            }
        },

        /**
         * Sets a function to run before all checks and nested groups within the current context
         * @param {Function} callback Function to execute
         */
        prepare: function (callback) {
            if (arguments.length === 0) {
                throw "'callback' parameter is mandatory";
            }
            activeNode.onPrepare = callback;
        },

        /**
         * Sets a function to run after all checks and nested groups within the current context
         * @param {Function} callback Function to execute
         */
        cleanup: function (callback) {
            if (arguments.length === 0) {
                throw "'callback' parameter is mandatory";
            }
            activeNode.onCleanup = callback;
        },

        /**
         * Creates a specific test (check) within a group
         * If no implementation is provided, it creates a failing stub.
         * @param {String} condition Description of what "it" "should achieve"
         * @param {Function} implementation Function containing the test logic (optional)
         */
        check: function (condition, implementation) {
            if (arguments.length === 0) {
                throw "'condition' parameter is mandatory";
            }
            if (implementation) {
                if (implementation.isAsync) {
                    condition += " via asynchronous process";
                }
                activeNode.specifications.push([condition, implementation]);
            } else {
                // If no implementation, create a stub that simply fails
                scriptInterface.check(condition, function () { scriptInterface.verify.fail('Not yet implemented'); });
            }
        },

        /**
         * Wraps a test implementation for asynchronous execution.
         * The wrapped function must call `proceed()` when finished.
         * @param {Function} action The asynchronous test function
         */
        asyncCheck: function (action) {
            var wrappedAction = function () {
                testReporter.holdExecution();
                action.apply(this, arguments);
            };
            wrappedAction.isAsync = true;
            return wrappedAction;
        },

        /**
         * Generates multiple checks based on provided data sets.
         * @returns An object with a `case` function for defining the test scenario.
         * @param {Array<any>|any} data Arguments, either a list of values or a list of arrays of values.
         */
        forData: function () {
            if (arguments.length === 0) {
                throw "At least one data set is required";
            }
            var dataSets = toolkit.toArray(arguments);
            if (arguments.length === 1 && toolkit.isList(arguments[0])) {
                dataSets = dataSets[0];
            }

            return {
                /**
                 * Defines a test scenario that will be executed for each data set.
                 */
                case: function (scenarioDescription, scenarioFunction) {
                    toolkit.traverseItems(dataSets, function (index, dataItem) {
                        var descriptionWithData = "with data " + toolkit.displayValue(dataItem) + ", " + scenarioDescription;
                        scriptInterface.check(descriptionWithData, function () {
                            scenarioFunction.apply(this, toolkit.isList(dataItem) ? dataItem : [dataItem]);
                        });
                    });
                }
            };
        },

        /**
         * Initiates a verification chain for a given value.
         * @param {Object} subject The value to be verified
         * @returns {ValueVerifier} An instance to fluently perform verifications.
         */
        verify: function (subject) {
            return new ValueVerifier(subject);
        },

        /**
         * Instructs the test framework to pause execution for a specified duration.
         * @param {Number} milliseconds The time to wait in milliseconds
         * @param {Function} continuation The function to execute after the delay
         */
        delay: function (milliseconds, continuation) {
            if (arguments.length < 2) {
                throw "Both 'milliseconds' and 'continuation' parameters are mandatory";
            }
            testReporter.holdExecution();
            rootScope.setTimeout(function () {
                continuation();
                testReporter.proceedExecution();
            }, milliseconds);
        },

        /**
         * Directs the test framework to halt execution.
         */
        hold: function () {
            testReporter.holdExecution();
        },

        /**
         * Directs the test framework to resume execution.
         */
        proceed: function () {
            testReporter.proceedExecution();
        }
    };

    // Augment the 'verify' function for direct 'succeed' and 'fail' calls without a subject
    toolkit.traverseItems(['succeed', 'fail'], function (i, method) {
        scriptInterface.verify[method] = function (message) {
            scriptInterface.verify()[method](message);
        };
    });

    // Expose the behavioral script interface globally
    rootScope.behavioralScript = scriptInterface;

})(this);