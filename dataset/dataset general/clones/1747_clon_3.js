QUnit.module("Core Validation Features", function(hooks) {
    // Test case: Verifies the validation method's expected error structure for missing required fields.
    QUnit.test("Validation interface preserves expected error output for missing mandatory fields", function(assert) {
        // Renamed model constructor for clarity
        const ValidationSubject = Backbone.Model.extend({
            // Renamed validation configuration property
            validationRules: {
                // Property 'personName' must be present
                personName: {
                    mandatory: true
                },
                // Property 'numericValue' must be present
                numericValue: {
                    mandatory: true
                }
            }
        });

        // Instantiate the model with validation rules
        const targetInstance = new ValidationSubject();

        // Simulate a validation call with incomplete data
        const validationResult = targetInstance.validationRules({
            "someOtherField": 123
        });

        // Assert that the returned errors match the expected structure
        assert.deepEqual(validationResult, {
            personName: ["mandatory"],
            numericValue: ["mandatory"]
        }, "The validation method should return an object detailing all missing mandatory fields.");
    });
});

QUnit.module("Model Mutability and Validation", function() {
    // Test case: Confirming that 'set' operation fails (returns false) when validation prevents it.
    QUnit.test("Model 'set' operation returns false upon validation failure", function(assert) {
        // Define a model with a single mandatory field
        const ValidationTarget = Backbone.Model.extend({
            validationSchema: {
                itemName: {
                    needsValue: true
                }
            }
        });

        // Create an instance of the model
        const targetEntity = new ValidationTarget();

        // Attempt to set an empty object, triggering validation
        const setResult = targetEntity.set({}, {
            validate: true
        });

        // Assert that the set operation failed
        assert.equal(setResult, false, "Setting attributes without fulfilling validation rules should return false.");
    });

    // Test case: Verifies that an 'invalid' event is fired on the model when validation fails.
    QUnit.test("Model emits a general 'invalid' event on validation failure", function(assert) {
        // Model definition with a mandatory attribute
        const ValidationTarget = Backbone.Model.extend({
            validationSchema: {
                productIdentifier: {
                    needsValue: true
                }
            }
        });

        const targetEntity = new ValidationTarget();
        let errorTriggeredFlag = false;

        // Attach an event listener for the general 'invalid' event using 'on' instead of 'bind'
        targetEntity.on('invalid', () => {
            errorTriggeredFlag = true;
        });

        // Attempt to set invalid data
        targetEntity.set({}, {
            validate: true
        });

        // Assert that the 'invalid' event handler was invoked
        assert.ok(errorTriggeredFlag, "The 'invalid' event should be triggered when validation fails.");
    });

    // Test case: Ensures that an attribute-specific 'invalid:attributeName' event is triggered.
    QUnit.test("Model emits attribute-specific 'invalid' event on validation failure", function(assert) {
        const attributeKey = "itemDescription";
        const validationConfiguration = {};
        validationConfiguration[attributeKey] = {
            needsValue: true
        };

        const ValidationTarget = Backbone.Model.extend({
            validationSchema: validationConfiguration
        });

        const targetEntity = new ValidationTarget();
        let attrInvalidTriggered = false;

        // Listen for the specific attribute's invalid event
        targetEntity.on(`invalid:${attributeKey}`, () => {
            attrInvalidTriggered = true;
        });

        targetEntity.set({}, {
            validate: true
        });

        assert.ok(attrInvalidTriggered, `An 'invalid:${attributeKey}' event should be triggered for specific attribute failures.`);
    });

    // Test case: Verifies that a direct validation override (e.g., via options) prevents default error events.
    QUnit.test("Direct override of validation prevents both general and attribute-specific error events", function(assert) {
        const primaryAttribute = "itemName";
        const attributeRules = {
            [primaryAttribute]: {
                needsValue: true
            }
        };

        const ValidationTarget = Backbone.Model.extend({
            validationSchema: attributeRules
        });

        const targetEntity = new ValidationTarget();

        let specificInvalidTriggered = false;
        targetEntity.on(`invalid:${primaryAttribute}`, () => {
            specificInvalidTriggered = true;
        });

        let generalInvalidTriggered = false;
        targetEntity.on('invalid', () => {
            generalInvalidTriggered = true;
        });

        // Attempt to set invalid data, but provide an override function that handles it,
        // preventing the model's default 'invalid' events.
        const customValidationPassed = targetEntity.set({
            [primaryAttribute]: undefined
        }, {
            validate: function(attrs, options) {
                // This custom validation always passes, regardless of the input.
                // Therefore, the model's internal 'invalid' events should not fire.
                return null; // Return null or undefined for success
            }
        });

        assert.ok(customValidationPassed !== false, "Custom validation override should allow set operation to proceed without internal errors.");
        assert.notOk(generalInvalidTriggered, "General 'invalid' event should NOT be triggered when validation is overridden and passes.");
        assert.notOk(specificInvalidTriggered, "Attribute-specific 'invalid' event should NOT be triggered when validation is overridden and passes.");
    });
});

QUnit.module("Custom Validator Integration (Backbone.Validations.addValidator)", function(hooks) {
    // A small helper for creating models with custom validation schemas
    const createValidationModel = (schema) => Backbone.Model.extend({
        validationSchema: schema
    });

    // Ensure Backbone.Validations exists for these tests; mock if not present.
    hooks.beforeEach(function(assert) {
        if (typeof Backbone.Validations === 'undefined') {
            Backbone.Validations = {};
            Backbone.Validations.addValidator = function(name, func) {
                if (this[name]) throw new Error(`Validator '${name}' already exists.`);
                this[name] = func;
            };
            Backbone.Validations.removeValidator = function(name) {
                delete this[name];
            };
            // Add a mock for the default 'required' validator, as it's used in one test
            if (!Backbone.Validations.mandatory) {
                Backbone.Validations.addValidator("mandatory", (options, attributeName, model, valueToSet) => {
                    if (valueToSet === null || valueToSet === undefined || (typeof valueToSet === 'string' && valueToSet.trim() === '')) {
                        return "is mandatory";
                    }
                });
            }
        }
    });

    // Test case: Custom validators can be registered and executed.
    QUnit.test("Custom validators can be defined, associated with a model, and correctly invoked.", function(assert) {
        let testModelRef, optionsProvided, valueToBeAssigned;
        let modelReferenceMatched = false,
            optionsReferenceMatched = false,
            valueReferenceMatched = false;

        // Define the custom validation logic
        const customValidationFunction = function(opts, attrName, modelObj, assignedValue) {
            modelReferenceMatched = modelObj === testModelRef;
            optionsReferenceMatched = opts === optionsProvided;
            valueReferenceMatched = assignedValue === valueToBeAssigned;
            // No return value means validation passes
        };

        // Register the custom validator with a new name
        Backbone.Validations.addValidator("customLogicCheck", customValidationFunction);

        optionsProvided = {
            someSetting: true
        };
        const ValidationSubject = createValidationModel({
            "targetAttribute": {
                customLogicCheck: optionsProvided
            }
        });

        testModelRef = new ValidationSubject();
        valueToBeAssigned = "dynamicData";
        testModelRef.set({
            targetAttribute: valueToBeAssigned
        }, {
            validate: true
        });

        assert.ok(modelReferenceMatched, "The model instance should be correctly passed to the custom validator.");
        assert.ok(optionsReferenceMatched, "The options object should be correctly passed to the custom validator.");
        assert.ok(valueReferenceMatched, "The value being set should be correctly passed to the custom validator.");

        // Clean up the added validator
        Backbone.Validations.removeValidator("customLogicCheck");
    });

    // Test case: Custom validators returning a value should cause a validation error.
    QUnit.test("Custom validators returning an error message should trigger model invalidation.", function(assert) {
        let modelUnderTest, configObject, dataValueForSet;

        // Custom validator that always returns an error string
        const errorGeneratingValidator = function(opts, attrName, modelObj, assignedVal) {
            return "Validation failed due to custom rule!";
        };

        // Register the new validator
        Backbone.Validations.addValidator("failingCustomRule", errorGeneratingValidator);

        configObject = {};
        const ValidationSubject = createValidationModel({
            "dataField": {
                failingCustomRule: configObject
            }
        });

        modelUnderTest = new ValidationSubject();
        let invalidEventFired = false,
            errorMessageFound = false;

        // Listen for the 'invalid' event, using 'on'
        modelUnderTest.on('invalid', (model, validationErrors) => {
            invalidEventFired = true;
            // Using modern Array.prototype.includes instead of Underscore's `_.include`
            errorMessageFound = validationErrors.dataField && validationErrors.dataField.includes("Validation failed due to custom rule!");
        });

        dataValueForSet = "some data";
        modelUnderTest.set({
            dataField: dataValueForSet
        }, {
            validate: true
        });

        assert.ok(invalidEventFired, "The 'invalid' event must be triggered when a custom validator returns an error.");
        assert.ok(errorMessageFound, "The specific error message from the custom validator should be included in the errors object.");

        // Clean up the added validator
        Backbone.Validations.removeValidator("failingCustomRule");
    });

    // Test case: Ensures existing validators (preset or custom) cannot be overwritten.
    QUnit.test("Attempting to overwrite existing validators (preset or custom) should throw an error.", function(assert) {
        let presetOverrideBlocked = false;
        let customRedefinitionPrevented = false;

        // Try to overwrite a built-in validator (e.g., 'mandatory')
        try {
            Backbone.Validations.addValidator("mandatory", () => {
                /* new logic */
            });
        } catch (err) {
            presetOverrideBlocked = true;
        }

        assert.ok(presetOverrideBlocked, "Overwriting a preset validator like 'mandatory' should throw an error.");

        // Define a unique custom validator name
        const uniqueCustomValidatorName = "uniqueValidationId_87654321";

        // Add a new custom validator
        Backbone.Validations.addValidator(uniqueCustomValidatorName, () => {
            /* initial logic */
        });

        // Attempt to add another validator with the same name
        try {
            Backbone.Validations.addValidator(uniqueCustomValidatorName, () => {
                /* conflicting logic */
            });
        } catch (err) {
            customRedefinitionPrevented = true;
        }

        assert.ok(customRedefinitionPrevented, "Redefining an already registered custom validator should throw an error.");

        // Clean up the temporary custom validator
        Backbone.Validations.removeValidator(uniqueCustomValidatorName);
    });
});

QUnit.module("Built-in Validator: 'mandatory' (formerly 'required')", function() {
    // Test case: Verifies that other attributes are not set if a mandatory attribute is missing.
    QUnit.test("Model 'set' operation fails and prevents other attribute updates if a mandatory field is absent.", function(assert) {
        const ValidationTarget = Backbone.Model.extend({
            validationSchema: {
                mainField: {
                    mandatory: true
                }
            }
        });

        const validationObject = new ValidationTarget();

        // Attempt to set a different attribute while 'mainField' is missing
        const setAttemptResult = validationObject.set({
            auxiliaryField: "someValue"
        }, {
            validate: true
        });

        assert.equal(setAttemptResult, false, "Set operation should return false due to missing mandatory field.");

        // Add a check for the internal attributes, ensuring `auxiliaryField` was not set.
        assert.equal(validationObject.get('auxiliaryField'), undefined, "Auxiliary field should not be set when validation fails for a mandatory field.");
        assert.notOk(Object.prototype.hasOwnProperty.call(validationObject.attributes, 'auxiliaryField'), "Model attributes should not contain the attempted auxiliary field.");
    });

    // Test case: Ensures mandatory fields cannot be set to null, undefined, or empty strings.
    QUnit.test("Mandatory fields cannot be assigned `null`, `undefined`, or empty string values.", function(assert) {
        const ValidationTarget = Backbone.Model.extend({
            validationSchema: {
                requiredProperty: {
                    mandatory: true
                }
            }
        });

        const validationObject = new ValidationTarget();

        // Array of invalid values to test
        const invalidValues = [null, undefined, ""];

        invalidValues.forEach(value => {
            const setResult = validationObject.set({
                requiredProperty: value
            }, {
                validate: true
            });
            assert.equal(setResult, false, `Setting 'requiredProperty' to '${String(value)}' should fail validation.`);
        });

        // Add a check to confirm the attribute was not actually set to any of these invalid values.
        assert.notOk(validationObject.has('requiredProperty'), "The mandatory property should not be present after failed sets.");
        assert.equal(validationObject.get('requiredProperty'), undefined, "The mandatory property should remain undefined.");
    });
});

QUnit.module("Custom Attribute Validator (Model Method)", function() {
    // Test case: Verifies that a custom validation method defined on the model is invoked.
    QUnit.test("Model's custom validation method for an attribute is correctly invoked.", function(assert) {
        let customMethodInvoked = false;
        const ValidationTarget = Backbone.Model.extend({
            validationSchema: {
                dataField: {
                    customRule: "customValidationHandler"
                }
            },

            // The custom validation handler method on the model
            customValidationHandler: function(attrName, attrValue) {
                customMethodInvoked = true;
                // No return means validation passes
            }
        });

        const validationInstance = new ValidationTarget();
        validationInstance.set({
            dataField: "arbitraryValue"
        }, {
            validate: true
        });
        assert.ok(customMethodInvoked, "The custom validation method on the model should be executed.");
    });

    // Test case: A model's custom validation method can return an error message, causing validation to fail.
    QUnit.test("Model's custom validation method can return an error string, leading to set failure.", function(assert) {
        const ValidationTarget = Backbone.Model.extend({
            validationSchema: {
                itemCode: {
                    customRule: "codeValidation"
                }
            },

            codeValidation: function() {
                return "Invalid item code format.";
            }
        });

        const validationInstance = new ValidationTarget();
        const setResult = validationInstance.set({
            itemCode: "XYZ123"
        }, {
            validate: true
        });
        assert.equal(setResult, false, "Setting an attribute should fail if its custom validation method returns an error.");
    });

    // Test case: The error message from a custom validation method should be part of the 'invalid' event's errors object.
    QUnit.test("Error message from a custom model method is propagated to the 'invalid' event's error payload.", function(assert) {
        const customErrorMessage = "Data does not meet custom criteria.";
        const ValidationTarget = Backbone.Model.extend({
            validationSchema: {
                userData: {
                    customRule: "checkUserData"
                }
            },

            checkUserData: function() {
                return customErrorMessage;
            }
        });

        const validationInstance = new ValidationTarget();
        let errorPayloadContainsMessage = false;
        validationInstance.on('invalid', (model, validationErrors) => {
            // Using modern Array.prototype.includes
            errorPayloadContainsMessage = validationErrors.userData && validationErrors.userData.includes(customErrorMessage);
        });

        validationInstance.set({
            userData: "some_value"
        }, {
            validate: true
        });

        assert.ok(errorPayloadContainsMessage, "The 'invalid' event's error object should contain the specific message from the custom validator.");
    });
});

QUnit.module("Built-in Validator: 'minimumStringLength'", function() {
    // Test case: `minimumStringLength` validator rejects strings shorter than the specified minimum.
    QUnit.test("`minimumStringLength` validator correctly rejects strings shorter than the defined minimum.", function(assert) {
        const minimumLengthThreshold = 3;
        const ValidationTarget = Backbone.Model.extend({
            validationSchema: {
                identifier: {
                    minimumStringLength: minimumLengthThreshold
                }
            }
        });

        const validationObject = new ValidationTarget();

        // Valid case: string length meets or exceeds minimum
        const validSetResult = validationObject.set({
            identifier: "validName"
        }, {
            validate: true
        });
        assert.equal(validSetResult, validationObject, "Setting a valid length string should succeed and return the model instance.");

        // Invalid case: string length is below minimum
        const invalidSetResult = validationObject.set({
            identifier: "ab"
        }, {
            validate: true
        });
        assert.equal(invalidSetResult, false, "Setting a string shorter than the minimum length should fail validation.");

        // Edge case: string length is exactly at minimum
        const edgeCaseSetResult = validationObject.set({
            identifier: "abc"
        }, {
            validate: true
        });
        assert.equal(edgeCaseSetResult, validationObject, "Setting a string exactly at the minimum length should succeed.");
    });
});

QUnit.module("Built-in Validator: 'maximumStringLength'", function() {
    // Test case: `maximumStringLength` validator rejects strings longer than the specified maximum.
    QUnit.test("`maximumStringLength` validator correctly rejects strings exceeding the defined maximum.", function(assert) {
        const maximumLengthLimit = 4;
        const ValidationTarget = Backbone.Model.extend({
            validationSchema: {
                codeValue: {
                    maximumStringLength: maximumLengthLimit
                }
            }
        });

        const validationObject = new ValidationTarget();

        // Invalid case: string length exceeds maximum
        const invalidSetResult = validationObject.set({
            codeValue: "toolong"
        }, {
            validate: true
        });
        assert.equal(invalidSetResult, false, "Setting a string longer than the maximum length should fail validation.");

        // Valid case: string length is within limits
        const validSetResult = validationObject.set({
            codeValue: "ok"
        }, {
            validate: true
        });
        assert.equal(validSetResult, validationObject, "Setting a string within the maximum length should succeed.");

        // Edge case: string length is exactly the maximum
        const edgeCaseSetResult = validationObject.set({
            codeValue: "four"
        }, {
            validate: true
        });
        assert.equal(edgeCaseSetResult, validationObject, "Setting a string exactly at the maximum length should succeed.");
    });
});

QUnit.module("Built-in Validator: 'regexMatch'", function() {
    // Test case: `regexMatch` validator enforces a regular expression match.
    QUnit.test("`regexMatch` validator correctly enforces a regular expression match for string values.", function(assert) {
        const PatternValidationSubject = Backbone.Model.extend({
            validationSchema: {
                entryKey: {
                    regexMatch: /^data_/
                }
            }
        });

        const patternTarget = new PatternValidationSubject();

        // Valid case: string matches the pattern
        const validSetResult = patternTarget.set({
            entryKey: "data_123"
        }, {
            validate: true
        });
        assert.ok(validSetResult, "Setting a string that matches the regex pattern should succeed.");

        // Invalid case: string does not match the pattern
        const invalidSetResult = patternTarget.set({
            entryKey: "invalid_data"
        }, {
            validate: true
        });
        assert.equal(invalidSetResult, false, "Setting a string that does not match the regex pattern should fail validation.");

        // Another valid case, slightly different
        const anotherValidSetResult = patternTarget.set({
            entryKey: "data_abc"
        }, {
            validate: true
        });
        assert.ok(anotherValidSetResult, "Another valid pattern match should succeed.");
    });
});

QUnit.module("Built-in Validator: 'minimumValue'", function() {
    // Test case: `minimumValue` validator ensures a numeric value is not below a specified minimum.
    QUnit.test("`minimumValue` validator correctly restricts numeric values to be above or equal to a minimum.", function(assert) {
        const MinimumValueSubject = Backbone.Model.extend({
            validationSchema: {
                quantity: {
                    minimumValue: 3
                }
            }
        });

        const numericTarget = new MinimumValueSubject();

        // Invalid case: value below minimum
        const invalidSetResult = numericTarget.set({
            quantity: 2
        }, {
            validate: true
        });
        assert.equal(invalidSetResult, false, "Setting a value below the minimum should fail validation.");

        // Valid case: value above minimum
        const validSetResult = numericTarget.set({
            quantity: 5
        }, {
            validate: true
        });
        assert.ok(validSetResult, "Setting a value above the minimum should succeed.");

        // Edge case: value exactly at minimum
        const edgeCaseSetResult = numericTarget.set({
            quantity: 3
        }, {
            validate: true
        });
        assert.ok(edgeCaseSetResult, "Setting a value exactly at the minimum should succeed.");
    });
});

QUnit.module("Built-in Validator: 'allowedValues'", function() {
    // Test case: `allowedValues` validator checks if a value is present in a predefined list.
    QUnit.test("`allowedValues` validator correctly checks if a value is part of a predefined inclusion list.", function(assert) {
        const InclusionCheckSubject = Backbone.Model.extend({
            validationSchema: {
                itemCategory: {
                    allowedValues: [
                        10, 20, 30
                    ]
                }
            }
        });

        const numericTarget = new InclusionCheckSubject();

        // Invalid case: value not in list
        const invalidSetResult = numericTarget.set({
            itemCategory: 50
        }, {
            validate: true
        });
        assert.equal(invalidSetResult, false, "Setting a value not in the allowed list should fail validation.");

        // Valid case: value is in list
        const validSetResult = numericTarget.set({
            itemCategory: 10
        }, {
            validate: true
        });
        assert.ok(validSetResult, "Setting a value present in the allowed list should succeed.");

        // Add another valid case
        const anotherValidSetResult = numericTarget.set({
            itemCategory: 30
        }, {
            validate: true
        });
        assert.ok(anotherValidSetResult, "Another valid value from the list should succeed.");
    });
});

QUnit.module("Built-in Validator: 'maximumValue'", function() {
    // Test case: `maximumValue` validator ensures a numeric value is not above a specified maximum.
    QUnit.test("`maximumValue` validator correctly restricts numeric values to be below or equal to a maximum.", function(assert) {
        const MaximumValueSubject = Backbone.Model.extend({
            validationSchema: {
                weight: {
                    maximumValue: 3
                }
            }
        });

        const numericTarget = new MaximumValueSubject();

        // Invalid case: value above maximum
        const invalidSetResult = numericTarget.set({
            weight: 5
        }, {
            validate: true
        });
        assert.equal(invalidSetResult, false, "Setting a value above the maximum should fail validation.");

        // Valid case: value below maximum
        const validSetResult = numericTarget.set({
            weight: 2
        }, {
            validate: true
        });
        assert.ok(validSetResult, "Setting a value below the maximum should succeed.");

        // Edge case: value exactly at maximum
        const edgeCaseSetResult = numericTarget.set({
            weight: 3
        }, {
            validate: true
        });
        assert.ok(edgeCaseSetResult, "Setting a value exactly at the maximum should succeed.");
    });
});

QUnit.module("Whitelist Validation (Implicit 'allowedValues' usage)", function() {
    // Test case: Demonstrates whitelisting of allowed values using the `allowedValues` validator.
    QUnit.test("Whitelisting of allowed string values using 'allowedValues' validator.", function(assert) {
        const ColorConstraintSubject = Backbone.Model.extend({
            validationSchema: {
                selectedColor: {
                    allowedValues: [
                        'crimson',
                        'azure',
                        'emerald'
                    ]
                }
            }
        });

        const colorTarget = new ColorConstraintSubject();

        // Valid case: color is in the whitelist
        const validSetResult = colorTarget.set({
            selectedColor: 'azure'
        }, {
            validate: true
        });
        assert.ok(validSetResult, "Setting an allowed color should succeed.");

        // Invalid case: color is not in the whitelist
        const invalidSetResult = colorTarget.set({
            selectedColor: 'purple'
        }, {
            validate: true
        });
        assert.equal(invalidSetResult, false, "Setting a color not in the whitelist should fail validation.");

        // Add a check that the model's attribute was not updated for the invalid case
        assert.notEqual(colorTarget.get('selectedColor'), 'purple', "Model's color attribute should not be updated with an invalid value.");
    });
});

QUnit.module("Built-in Validator: 'eachElementCheck'", function() {
    // Test case: `eachElementCheck` validator applies a custom function to each element of an array.
    QUnit.test("`eachElementCheck` validator applies a custom validation function to each element in an array.", function(assert) {
        const ArrayElementValidationSubject = Backbone.Model.extend({
            validationSchema: {
                dataArray: {
                    eachElementCheck: function(arrayElement) {
                        // Changed logic to explicitly return an error string if condition fails.
                        if (typeof arrayElement !== 'number' || arrayElement >= 100) {
                            return "Array element must be a number less than 100.";
                        }
                        return; // Validation passes for this element (return undefined)
                    }
                }
            }
        });

        const arrayValidationTarget = new ArrayElementValidationSubject();

        // Valid case: empty array
        assert.ok(arrayValidationTarget.set({
            dataArray: []
        }, {
            validate: true
        }), "Setting an empty array should pass validation.");

        // Invalid case: array contains elements failing the check
        assert.equal(arrayValidationTarget.set({
            dataArray: [101, 89]
        }, {
            validate: true
        }), false, "Setting an array with an element >= 100 should fail validation.");

        // Another invalid case: single element failing
        assert.equal(arrayValidationTarget.set({
            dataArray: [788]
        }, {
            validate: true
        }), false, "Setting an array with a single element >= 100 should fail validation.");

        // Valid case: all elements pass
        assert.ok(arrayValidationTarget.set({
            dataArray: [1, 67]
        }, {
            validate: true
        }), "Setting an array with all elements < 100 should pass validation.");

        // Added an extra test case for Type III: non-numeric element
        assert.equal(arrayValidationTarget.set({
            dataArray: [50, "text"]
        }, {
            validate: true
        }), false, "Setting an array with a non-numeric element should fail validation.");
    });
});

QUnit.module("Type-Specific Validators", function() {
    // Test case: `email` type validator correctly identifies valid and invalid email formats.
    QUnit.test("`email` type validator correctly validates email address formats.", function(assert) {
        const EmailFormatSubject = Backbone.Model.extend({
            validationSchema: {
                userEmail: {
                    fieldType: "email"
                }
            }
        });

        const emailTarget = new EmailFormatSubject();

        // Invalid email format
        assert.equal(emailTarget.set({
            userEmail: "invalid-email"
        }, {
            validate: true
        }), false, "Setting an invalid email string should fail validation.");

        // Valid email format
        assert.ok(emailTarget.set({
            userEmail: "john.doe@example.com"
        }, {
            validate: true
        }), "Setting a valid email string should pass validation.");

        // Add another invalid case
        assert.equal(emailTarget.set({
            userEmail: "user@domain"
        }, {
            validate: true
        }), false, "Setting an email without a TLD should fail validation.");
    });

    // Test case: `url` type validator correctly identifies valid and invalid URL formats.
    QUnit.test("`url` type validator correctly validates URL string formats (http/https/ftp).", function(assert) {
        const UrlFormatSubject = Backbone.Model.extend({
            validationSchema: {
                websiteLink: {
                    fieldType: "url"
                }
            }
        });

        const urlTarget = new UrlFormatSubject();

        // Invalid URL format
        assert.equal(urlTarget.set({
            websiteLink: "just-a-string"
        }, {
            validate: true
        }), false, "Setting an invalid URL string should fail validation.");

        // Valid HTTPS URL
        assert.ok(urlTarget.set({
            websiteLink: "https://www.example.org"
        }, {
            validate: true
        }), "Setting a valid HTTPS URL should pass validation.");

        // Valid FTP URL
        assert.ok(urlTarget.set({
            websiteLink: "ftp://files.example.net"
        }, {
            validate: true
        }), "Setting a valid FTP URL should pass validation.");

        // Add another valid case for HTTP (non-secure)
        assert.ok(urlTarget.set({
            websiteLink: "http://sub.domain.com"
        }, {
            validate: true
        }), "Setting a valid HTTP URL should pass validation.");
    });

    // Test case: `numeric` type validator correctly identifies valid and invalid numeric values (strings or actual numbers).
    QUnit.test("`numeric` type validator correctly validates numeric inputs (integers, floats, string representations).", function(assert) {
        const NumericTypeSubject = Backbone.Model.extend({
            validationSchema: {
                quantityValue: {
                    fieldType: "numeric"
                }
            }
        });

        const numericTarget = new NumericTypeSubject();

        // Valid string representations of numbers
        assert.ok(numericTarget.set({
            quantityValue: "42"
        }, {
            validate: true
        }), "Setting a string '42' should pass as a number.");
        assert.ok(numericTarget.set({
            quantityValue: 42
        }, {
            validate: true
        }), "Setting an actual number 42 should pass.");
        assert.ok(numericTarget.set({
            quantityValue: "123.45"
        }, {
            validate: true
        }), "Setting a string '123.45' (float) should pass as a number.");

        // Invalid numeric formats
        assert.equal(numericTarget.set({
            quantityValue: "123.45x"
        }, {
            validate: true
        }), false, "Setting '123.45x' (non-numeric chars) should fail.");
        assert.equal(numericTarget.set({
            quantityValue: "x123.45"
        }, {
            validate: true
        }), false, "Setting 'x123.45' (leading non-numeric) should fail.");
        assert.equal(numericTarget.set({
            quantityValue: "."
        }, {
            validate: true
        }), false, "Setting just '.' should fail.");

        // Valid leading zero string
        assert.ok(numericTarget.set({
            quantityValue: "0789"
        }, {
            validate: true
        }), "Setting '0789' should pass as a number.");

        // Added more invalid cases for Type III
        assert.equal(numericTarget.set({
            quantityValue: ""
        }, {
            validate: true
        }), false, "Setting an empty string should fail number validation.");
        assert.equal(numericTarget.set({
            quantityValue: null
        }, {
            validate: true
        }), false, "Setting null should fail number validation.");
        assert.equal(numericTarget.set({
            quantityValue: undefined
        }, {
            validate: true
        }), false, "Setting undefined should fail number validation.");
    });

    // Test case: `string` type validator ensures the value is a string.
    QUnit.test("`string` type validator correctly validates that inputs are of string type.", function(assert) {
        const StringTypeSubject = Backbone.Model.extend({
            validationSchema: {
                textContent: {
                    fieldType: "string"
                }
            }
        });

        const stringTarget = new StringTypeSubject();

        // Valid string inputs
        assert.ok(stringTarget.set({
            textContent: "some text value"
        }, {
            validate: true
        }), "Setting a regular string should pass.");
        assert.ok(stringTarget.set({
            textContent: "123.45"
        }, {
            validate: true
        }), "Setting a string that looks like a number should still pass as a string.");
        assert.ok(stringTarget.set({
            textContent: ""
        }, {
            validate: true
        }), "Setting an empty string should pass as a string.");

        // Invalid non-string inputs
        assert.equal(stringTarget.set({
            textContent: 123.45
        }, {
            validate: true
        }), false, "Setting a number should fail string validation.");
        assert.equal(stringTarget.set({
            textContent: []
        }, {
            validate: true
        }), false, "Setting an array should fail string validation.");
        assert.equal(stringTarget.set({
            textContent: {}
        }, {
            validate: true
        }), false, "Setting an object should fail string validation.");
        assert.equal(stringTarget.set({
            textContent: true
        }, {
            validate: true
        }), false, "Setting a boolean should fail string validation.");
        assert.equal(stringTarget.set({
            textContent: null
        }, {
            validate: true
        }), false, "Setting null should fail string validation.");
        assert.equal(stringTarget.set({
            textContent: undefined
        }, {
            validate: true
        }), false, "Setting undefined should fail string validation.");
    });

    // Test case: `array` type validator ensures the value is an array.
    QUnit.test("`array` type validator correctly ensures the input value is an array.", function(assert) {
        const ArrayTypeSubject = Backbone.Model.extend({
            validationSchema: {
                dataCollection: {
                    fieldType: "array"
                }
            }
        });

        const arrayTarget = new ArrayTypeSubject();

        // Valid array inputs
        assert.ok(arrayTarget.set({
            dataCollection: []
        }, {
            validate: true
        }), "Setting an empty array should pass.");
        assert.ok(arrayTarget.set({
            dataCollection: [1, 2, 3]
        }, {
            validate: true
        }), "Setting an array with elements should pass.");
        assert.ok(arrayTarget.set({
            dataCollection: ["a", "b"]
        }, {
            validate: true
        }), "Setting an array of strings should pass.");

        // Invalid non-array inputs
        assert.equal(arrayTarget.set({
            dataCollection: "not an array"
        }, {
            validate: true
        }), false, "Setting a string should fail array validation.");
        assert.equal(arrayTarget.set({
            dataCollection: 123
        }, {
            validate: true
        }), false, "Setting a number should fail array validation.");
        assert.equal(arrayTarget.set({
            dataCollection: {}
        }, {
            validate: true
        }), false, "Setting an object should fail array validation.");
        assert.equal(arrayTarget.set({
            dataCollection: null
        }, {
            validate: true
        }), false, "Setting null should fail array validation.");
        assert.equal(arrayTarget.set({
            dataCollection: undefined
        }, {
            validate: true
        }), false, "Setting undefined should fail array validation.");
    });
});