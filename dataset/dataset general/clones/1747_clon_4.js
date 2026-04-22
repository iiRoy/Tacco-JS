var globalTestOutput = [];
var currentTestCategory = "";

function reportIssue(issueType, description, expected, actual, condition) {
    globalTestOutput.push({
        category: currentTestCategory,
        type: issueType,
        description: description,
        expected: expected,
        actual: actual,
        condition: condition
    });
}

function verifyScenario(description, scenarioFunction) {
    try {
        scenarioFunction();
        // If no errors, it implicitly passes.
    } catch (e) {
        reportIssue("Error", description + " - Uncaught exception: " + e.message, null, null, false);
    }
}

function performSuite(categoryName, suiteFunction) {
    currentTestCategory = categoryName;
    suiteFunction();
    currentTestCategory = "";
}

function checkValue(actual, expected, description) {
    if (actual !== expected) {
        reportIssue("Failure", description, expected, actual, false);
    } else {
        // reportIssue("Success", description, expected, actual, true); // Uncomment for verbose success logging
    }
}

function checkDeepValue(actual, expected, description) {
    function deepCompare(a, b) {
        if (a === b) return true;
        if (typeof a != 'object' || typeof b != 'object' || a == null || b == null) return a == b;
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length != b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!deepCompare(a[i], b[i])) return false;
            }
            return true;
        }
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length != keysB.length) return false;
        for (let key of keysA) {
            if (!keysB.includes(key) || !deepCompare(a[key], b[key])) return false;
        }
        return true;
    }

    if (!deepCompare(actual, expected)) {
        reportIssue("Failure", description, expected, actual, false);
    } else {
        // reportIssue("Success", description, expected, actual, true); // Uncomment for verbose success logging
    }
}

function assertCondition(condition, description) {
    if (!condition) {
        reportIssue("Failure", description, true, condition, false);
    } else {
        // reportIssue("Success", description, true, condition, true); // Uncomment for verbose success logging
    }
}

// --- Custom Validation Framework ---

var constraintRegistry = (function() {
    var registeredConstraints = {};
    var typeCheckers = {
        "email": /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "url": /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i,
        "number": /^-?\d+(\.\d+)?$/, // More robust number check for strings
        "String": function(val) { return typeof val === 'string'; },
        "Array": function(val) { return Array.isArray(val); }
    };

    var rules = {
        "required": function(val, option, attrName, allAttrs, entity) {
            if (option === true && (val === null || typeof val === 'undefined' || (typeof val === 'string' && val.trim() === ''))) {
                return 'required';
            }
            return undefined;
        },
        "minlength": function(val, option) {
            if (typeof val === 'string' && val.length < option) {
                return 'minlength';
            }
            return undefined;
        },
        "maxlength": function(val, option) {
            if (typeof val === 'string' && val.length > option) {
                return 'maxlength';
            }
            return undefined;
        },
        "pattern": function(val, option) {
            if (typeof val === 'string' && !option.test(val)) {
                return 'pattern';
            }
            return undefined;
        },
        "min": function(val, option) {
            if (typeof val === 'number' && val < option) {
                return 'min';
            }
            return undefined;
        },
        "max": function(val, option) {
            if (typeof val === 'number' && val > option) {
                return 'max';
            }
            return undefined;
        },
        "in": function(val, option) {
            if (Array.isArray(option) && !option.includes(val)) {
                return 'in';
            }
            return undefined;
        },
        "arrayElem": function(val, option, attrName, allAttrs, entity) {
            if (Array.isArray(val)) {
                for (let i = 0; i < val.length; i++) {
                    // Assuming option is a function for arrayElem validation
                    if (typeof option === 'function') {
                        const elemResult = option(val[i], i, val, entity);
                        if (elemResult) return 'arrayElem'; // Return generic error if custom func returns truthy
                    }
                }
            }
            return undefined;
        },
        "type": function(val, option) {
            const checker = typeCheckers[option];
            if (!checker) return undefined; // No known type checker for this option

            if (typeof checker === 'function') {
                if (!checker(val)) return 'type';
            } else if (checker instanceof RegExp) {
                if (typeof val !== 'string' || !checker.test(val)) return 'type';
            } else if (option === 'number') { // Special handling for 'number' type that allows string-numbers
                 if (!typeCheckers.number.test(val) || isNaN(parseFloat(val)) || !isFinite(val) || typeof val === 'boolean') return 'type';
            }
            return undefined;
        }
    };

    // Initialize with built-in rules
    for (const ruleName in rules) {
        registeredConstraints[ruleName] = rules[ruleName];
    }

    return {
        registerConstraint: function(name, validatorFunc) {
            if (registeredConstraints[name]) {
                throw new Error("Constraint '" + name + "' already exists.");
            }
            registeredConstraints[name] = validatorFunc;
        },
        getConstraint: function(name) {
            return registeredConstraints[name];
        }
    };
})();

function RecordEntity(initialValues = {}, schemaDefinition = {}) {
    this._dataStore = { ...initialValues
    };
    this._schema = schemaDefinition.rules || {};
    this._eventSubscribers = {};
    this._customMethodLookup = schemaDefinition.methods || {};

    this.acquireValue = function(key) {
        return this._dataStore[key];
    };

    this.onFailure = function(eventName, callback) {
        if (!this._eventSubscribers[eventName]) {
            this._eventSubscribers[eventName] = [];
        }
        this._eventSubscribers[eventName].push(callback);
    };

    this.publishError = function(eventName, ...args) {
        if (this._eventSubscribers[eventName]) {
            this._eventSubscribers[eventName].forEach(callback => callback(...args));
        }
    };

    this.verifyIntegrity = function(potentialData) {
        const errorsDetected = {};

        for (const attributeName in this._schema) {
            const constraints = this._schema[attributeName];
            const attributeValue = potentialData[attributeName];
            const attributeErrors = [];

            for (const constraintKey in constraints) {
                const constraintOption = constraints[constraintKey];
                let errorResult;

                if (constraintKey === 'custom') {
                    const customMethodName = constraintOption;
                    const customMethod = this._customMethodLookup[customMethodName];
                    if (customMethod && typeof customMethod === 'function') {
                        errorResult = customMethod.call(this, attributeName, attributeValue, potentialData);
                    }
                } else {
                    const validatorFunc = constraintRegistry.getConstraint(constraintKey);
                    if (validatorFunc) {
                        errorResult = validatorFunc(attributeValue, constraintOption, attributeName, potentialData, this);
                    }
                }

                if (errorResult) {
                    attributeErrors.push(errorResult);
                }
            }

            if (attributeErrors.length > 0) {
                errorsDetected[attributeName] = attributeErrors;
            }
        }
        return Object.keys(errorsDetected).length > 0 ? errorsDetected : undefined;
    };

    this.alterData = function(newAttributes, options = {}) {
        const performValidation = options.performValidation;
        const potentialNewData = { ...this._dataStore,
            ...newAttributes
        };

        if (performValidation) {
            const validationResults = this.verifyIntegrity(potentialNewData);
            if (validationResults) {
                this.publishError('dataInvalidated', this, validationResults);
                for (const attrKey in validationResults) {
                    this.publishError('fieldInvalidated:' + attrKey, this, validationResults[attrKey]);
                }
                return false;
            }
        }

        Object.assign(this._dataStore, newAttributes);
        return this;
    };
}

// --- Test Execution ---
(function() {

    performSuite("general tests", function() {
        verifyScenario("it maintains the original validation interface", function() {
            var ValidationConfig = {
                rules: {
                    name: {
                        required: true
                    },
                    number: {
                        required: true
                    }
                }
            };

            var dataInstance = new RecordEntity({}, ValidationConfig);

            checkDeepValue(dataInstance.verifyIntegrity({
                "hahah": 3
            }), {
                name: ["required"],
                number: ["required"]
            });
        });

        verifyScenario("alterData returns false when failing", function() {
            var TestConfig = {
                rules: {
                    name: {
                        required: true
                    }
                }
            };

            var instance = new RecordEntity({}, TestConfig);

            checkValue(instance.alterData({}, {
                performValidation: true
            }), false);
        });

        verifyScenario("alterData triggers a dataInvalidated event on the entity", function() {
            var TestConfig = {
                rules: {
                    name: {
                        required: true
                    }
                }
            };

            var instance = new RecordEntity({}, TestConfig);
            var errorCallbackFired = false;

            instance.onFailure('dataInvalidated', function() {
                errorCallbackFired = true;
            });

            instance.alterData({}, {
                performValidation: true
            });

            assertCondition(errorCallbackFired);
        });

        verifyScenario("alterData triggers a fieldInvalidated event named after the attribute, on the entity", function() {
            var attributeLabel = "name";
            var validationSchema = {};
            validationSchema[attributeLabel] = {
                required: true
            };

            var TestConfig = {
                rules: validationSchema
            };

            var instance = new RecordEntity({}, TestConfig);
            var attributeErrorCallbackFired = false;

            instance.onFailure('fieldInvalidated:' + attributeLabel, function() {
                attributeErrorCallbackFired = true;
            });

            instance.alterData({}, {
                performValidation: true
            });

            assertCondition(attributeErrorCallbackFired);
        });


        verifyScenario("providing a direct override prevents normal and named errors from being triggered", function() {
            // This test in the original code appears to check the state of callbacks *before* set is called.
            // Reproducing the observed behavior of the original test, which passes by asserting false.
            var attributeLabel = "name";
            var validationSchema = {};
            validationSchema[attributeLabel] = {
                required: true
            };

            var TestConfig = {
                rules: validationSchema
            };

            var instance = new RecordEntity({}, TestConfig);

            var attributeCallbackFired = false;
            instance.onFailure('fieldInvalidated:' + attributeLabel, function() {
                attributeCallbackFired = true;
            });

            var generalCallbackFired = false;
            instance.onFailure('dataInvalidated', function() {
                generalCallbackFired = true;
            });

            // The original test does not call 'set' here, so these should remain false.
            checkValue(generalCallbackFired, false, "general callback fired");
            checkValue(attributeCallbackFired, false, "attribute callback fired");
        });
    });

    performSuite("ConstraintRegistry.registerConstraint", function() {
        verifyScenario("Custom validators can be provided, and can be added to an entity, and will be executed.", function() {
            var testEntity, optionsPassed, valueToBeSet;
            var testEntityMatched = false,
                optionsPassedMatched = false,
                valueToBeSetMatched = false,
                attributeNameMatched = false;

            var customValidationFunction = function(value, options, attributeName, allValues, entity) {
                testEntityMatched = entity === testEntity;
                optionsPassedMatched = options === optionsPassed;
                valueToBeSetMatched = value === valueToBeSet;
                attributeNameMatched = attributeName === 'label';
            };


            constraintRegistry.registerConstraint("customConstraint", customValidationFunction);

            optionsPassed = {};
            var TestConfig = {
                rules: {
                    "label": {
                        customConstraint: optionsPassed
                    }
                }
            };

            testEntity = new RecordEntity({}, TestConfig);
            valueToBeSet = "blech";
            testEntity.alterData({
                label: valueToBeSet
            }, {
                performValidation: true
            });

            assertCondition(testEntityMatched);
            assertCondition(optionsPassedMatched);
            assertCondition(valueToBeSetMatched);
            assertCondition(attributeNameMatched); // Added to ensure attributeName is passed
        });

        verifyScenario("Custom validators can be provided, and can be added to an entity, and will trigger error if they return something.", function() {
            var testEntity, optionsPassed, valueToBeSet;

            var customValidationFunction = function(value, options, attributeName, allValues, entity) {
                return "error message from custom rule";
            };

            constraintRegistry.registerConstraint("newCustomConstraint", customValidationFunction);

            optionsPassed = {};
            var TestConfig = {
                rules: {
                    "label": {
                        newCustomConstraint: optionsPassed
                    }
                }
            };

            testEntity = new RecordEntity({}, TestConfig);
            var errorCallbackFired = false,
                errorWasPresent = false;

            testEntity.onFailure('dataInvalidated', function(entity, errors) {
                errorCallbackFired = true;
                errorWasPresent = errors.label && errors.label.includes("error message from custom rule");
            });

            valueToBeSet = "blech";
            testEntity.alterData({
                label: valueToBeSet
            }, {
                performValidation: true
            });

            assertCondition(errorCallbackFired);
            assertCondition(errorWasPresent);
        });

        verifyScenario("It can't override an existing constraint, custom or preset.", function() {
            var presetCollisionError = false,
                doubleCustomCollisionError = false;

            try {
                constraintRegistry.registerConstraint("required", function() {});
            } catch (err) {
                presetCollisionError = true;
            }

            assertCondition(presetCollisionError, 'preset threw error');

            constraintRegistry.registerConstraint("uniqueCustom12345", function() {});
            try {
                constraintRegistry.registerConstraint("uniqueCustom12345", function() {});
            } catch (err) {
                doubleCustomCollisionError = true;
            }

            assertCondition(doubleCustomCollisionError);
        });
    });


    performSuite("required constraint", function() {
        verifyScenario("doesn't alter other values, when there is no current value, and no value is passed", function() {
            var TestConfig = {
                rules: {
                    name: {
                        required: true
                    }
                }
            };

            var entity = new RecordEntity({}, TestConfig);

            checkValue(entity.alterData({
                otherField: "something"
            }, {
                performValidation: true
            }), false);

            checkValue(entity.acquireValue('otherField'), undefined); // Value should not be set on failure
        });


        verifyScenario("won't allow a value to be set to null, or blank", function() {
            var TestConfig = {
                rules: {
                    name: {
                        required: true
                    }
                }
            };

            var entity = new RecordEntity({}, TestConfig);

            checkValue(entity.alterData({
                name: null
            }, {
                performValidation: true
            }), false);
            checkValue(entity.alterData({
                name: undefined
            }, {
                performValidation: true
            }), false);
            checkValue(entity.alterData({
                name: ""
            }, {
                performValidation: true
            }), false);
        });
    });

    performSuite("custom attribute validator", function() {
        verifyScenario("it calls the custom validator method", function() {
            var customValidatorExecuted = false;
            var TestConfig = {
                rules: {
                    name: {
                        custom: "checkNameMethod"
                    }
                },
                methods: {
                    checkNameMethod: function(attributeName, attributeValue) {
                        customValidatorExecuted = true;
                    }
                }
            };

            var entity = new RecordEntity({}, TestConfig);
            entity.alterData({
                name: "whatever"
            }, {
                performValidation: true
            });
            assertCondition(customValidatorExecuted);
        });

        verifyScenario("can cause an error", function() {
            var TestConfig = {
                rules: {
                    name: {
                        custom: "failingMethod"
                    }
                },
                methods: {
                    failingMethod: function() {
                        return "failure";
                    }
                }
            };

            var entity = new RecordEntity({}, TestConfig);
            checkValue(entity.alterData({
                name: "whatever"
            }, {
                performValidation: true
            }), false);
        });

        verifyScenario("it's included in the errors", function() {
            var errorResponseString = "custom failure message";
            var TestConfig = {
                rules: {
                    name: {
                        custom: "failingMethod"
                    }
                },
                methods: {
                    failingMethod: function() {
                        return errorResponseString;
                    }
                }
            };

            var entity = new RecordEntity({}, TestConfig);
            var errorResponseWasPresent = false;
            entity.onFailure('dataInvalidated', function(entity, errors) {
                errorResponseWasPresent = errors.name && errors.name.includes(errorResponseString);
            });

            entity.alterData({
                name: "blech"
            }, {
                performValidation: true
            });

            assertCondition(errorResponseWasPresent);
        });
    });

    performSuite("minlength constraint", function() {
        verifyScenario("given a minimum length, it will error if given a string that is a smaller", function() {
            var minLengthRequired = 3;
            var TestConfig = {
                rules: {
                    name: {
                        minlength: minLengthRequired
                    }
                }
            };

            var entity = new RecordEntity({}, TestConfig);
            checkValue(entity.alterData({
                name: "neal"
            }, {
                performValidation: true
            }), entity);
            checkValue(entity.alterData({
                name: "al"
            }, {
                performValidation: true
            }), false);
        });
    });

    performSuite("maxlength constraint", function() {
        verifyScenario("given a maximum length, it will error if given a string that is a larger", function() {
            var TestConfig = {
                rules: {
                    name: {
                        maxlength: 4
                    }
                }
            };

            var entity = new RecordEntity({}, TestConfig);
            checkValue(entity.alterData({
                name: "neals"
            }, {
                performValidation: true
            }), false);
            checkValue(entity.alterData({
                name: "al"
            }, {
                performValidation: true
            }), entity);
        });
    });

    performSuite("pattern validation", function() {
        verifyScenario("pattern /^test/", function() {
            var PatternTestConfig = {
                rules: {
                    name: {
                        pattern: /^test/
                    }
                }
            };

            var newTestEntity = new RecordEntity({}, PatternTestConfig);
            assertCondition(newTestEntity.alterData({
                name: "test"
            }, {
                performValidation: true
            }));
            checkValue(newTestEntity.alterData({
                name: "broken"
            }, {
                performValidation: true
            }), false);
        });
    });

    performSuite("min validation", function() {
        verifyScenario("works", function() {
            var MinTestConfig = {
                rules: {
                    size: {
                        min: 3
                    }
                }
            };

            var entity = new RecordEntity({}, MinTestConfig);
            checkValue(entity.alterData({
                size: 2
            }, {
                performValidation: true
            }), false);
            assertCondition(entity.alterData({
                size: 5
            }, {
                performValidation: true
            }));
        });
    });

    performSuite("in validation", function() {
        verifyScenario("works", function() {
            var InTestConfig = {
                rules: {
                    size: {
                        in: [
                            1, 2, 3
                        ]
                    }
                }
            };

            var entity = new RecordEntity({}, InTestConfig);
            checkValue(entity.alterData({
                size: 5
            }, {
                performValidation: true
            }), false);
            assertCondition(entity.alterData({
                size: 1
            }, {
                performValidation: true
            }));
        });
    });

    performSuite("max validation", function() {
        verifyScenario("works", function() {
            var MaxTestConfig = {
                rules: {
                    size: {
                        max: 3
                    }
                }
            };

            var entity = new RecordEntity({}, MaxTestConfig);
            checkValue(entity.alterData({
                size: 5
            }, {
                performValidation: true
            }), false);
            assertCondition(entity.alterData({
                size: 2
            }, {
                performValidation: true
            }));
        });
    });


    performSuite("whitelists", function() {
        verifyScenario("valid colors", function() {
            var ColorTestConfig = {
                rules: {
                    name: {
                        in: [
                            'white',
                            'blue',
                            'red'
                        ]
                    }
                }
            };

            var entity = new RecordEntity({}, ColorTestConfig);
            assertCondition(entity.alterData({
                name: 'white'
            }, {
                performValidation: true
            }));
            checkValue(entity.alterData({
                name: 'yellow'
            }, {
                performValidation: true
            }), false);
        });
    });

    performSuite("array elements validation", function() {
        verifyScenario("works", function() {
            var ArrayElemTestConfig = {
                rules: {
                    myArray: {
                        arrayElem: function(elem) {
                            if (elem < 100) return undefined; // undefined for success
                            return "element_too_large"; // error for failure
                        }
                    }
                }
            };

            var entity = new RecordEntity();
            entity._schema = ArrayElemTestConfig.rules; // Direct assignment for simpler test setup

            assertCondition(entity.alterData({
                myArray: []
            }, {
                performValidation: true
            }));
            checkValue(entity.alterData({
                myArray: [101, 89]
            }, {
                performValidation: true
            }), false);
            checkValue(entity.alterData({
                myArray: [788]
            }, {
                performValidation: true
            }), false);
            assertCondition(entity.alterData({
                myArray: [1, 67]
            }, {
                performValidation: true
            }));
        });
    });

    performSuite("type validations", function() {
        verifyScenario("email", function() {
            var EmailTestConfig = {
                rules: {
                    email: {
                        type: "email"
                    }
                }
            };

            var entity = new RecordEntity({}, EmailTestConfig);
            checkValue(entity.alterData({
                email: "boogers"
            }, {
                performValidation: true
            }), false);
            assertCondition(entity.alterData({
                email: "neal@snot.ca"
            }, {
                performValidation: true
            }));
        });


        verifyScenario("url", function() {
            var UrlTestConfig = {
                rules: {
                    link: {
                        type: "url"
                    }
                }
            };

            var entity = new RecordEntity({}, UrlTestConfig);
            checkValue(entity.alterData({
                link: "boogers"
            }, {
                performValidation: true
            }), false);
            assertCondition(entity.alterData({
                link: "http://snot.ca"
            }, {
                performValidation: true
            }));
            assertCondition(entity.alterData({
                link: "ftp://snot.ca"
            }, {
                performValidation: true
            }));
        });


        verifyScenario("number", function() {
            var NumberTestConfig = {
                rules: {
                    address: {
                        type: "number"
                    }
                }
            };

            var entity = new RecordEntity({}, NumberTestConfig);
            assertCondition(entity.alterData({
                address: "33"
            }, {
                performValidation: true
            }));
            assertCondition(entity.alterData({
                address: 33
            }, {
                performValidation: true
            }));
            assertCondition(entity.alterData({
                address: "33.333"
            }, {
                performValidation: true
            }));
            checkValue(entity.alterData({
                address: "33.333f"
            }, {
                performValidation: true
            }), false);
            checkValue(entity.alterData({
                address: "f33.333f"
            }, {
                performValidation: true
            }), false);
            checkValue(entity.alterData({
                address: "."
            }, {
                performValidation: true
            }), false);
            assertCondition(entity.alterData({
                address: "089"
            }, {
                performValidation: true
            }));
        });

        verifyScenario("String", function() {
            var StringTestConfig = {
                rules: {
                    address: {
                        type: "String"
                    }
                }
            };

            var entity = new RecordEntity({}, StringTestConfig);
            assertCondition(entity.alterData({
                address: "bla bla"
            }, {
                performValidation: true
            }));
            assertCondition(entity.alterData({
                address: "33.333"
            }, {
                performValidation: true
            }));
            checkValue(entity.alterData({
                address: 33.333
            }, {
                performValidation: true
            }), false);
            checkValue(entity.alterData({
                address: []
            }, {
                performValidation: true
            }), false);
        });

        verifyScenario("Array", function() {
            var ArrayTestConfig = {
                rules: {
                    elements: {
                        type: "Array"
                    }
                }
            };

            var entity = new RecordEntity({}, ArrayTestConfig);
            assertCondition(entity.alterData({
                elements: []
            }, {
                performValidation: true
            }));
            checkValue(entity.alterData({
                elements: "not an array"
            }, {
                performValidation: true
            }), false);
        });
    });

    // Output results (simplified for raw code output)
    // In a real scenario, you'd iterate globalTestOutput and print to console or DOM.
    // For this clone, the output is just the code, so the results are implicit to the tests' internal state.
})();