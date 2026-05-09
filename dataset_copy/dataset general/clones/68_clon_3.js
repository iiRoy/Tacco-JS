const assertionTool = require('node:assert'); // Renamed assertion module import
const typeChecker = require('../validation_module'); // Renamed module import and path

// This test suite rigorously verifies the functionality of the 'validation_module'.
// It covers various scenarios for type checking, including successes, failures,
// configuration options, and global settings.
specificationGroup("validation_module.js Core Functionality", function() {

    // A utility function to simplify assertions where no exception is expected.
    // This helps in reducing boilerplate and making test intentions clearer.
    const expectNoException = (testExecutionFunc, scenarioDescription = 'operation') => {
        try {
            assertionTool.doesNotThrow(testExecutionFunc, `Expected ${scenarioDescription} not to throw any error.`);
        } catch (error) {
            // Log for debugging purposes if 'doesNotThrow' itself fails unexpectedly.
            console.error(`ERROR: Unexpected exception caught during "${scenarioDescription}" - ${error.message}`);
            throw error; // Re-throw to ensure the test fails as intended.
        }
    };

    // --- Test Cases for Successful Type Validations ---
    specificationGroup("Successful Type Validations", function() {
        testBehavior("Recognizing a String Value", function() {
            const dataPoint = 'helloWorld';
            expectNoException(() => {
                typeChecker(dataPoint, String);
            }, `validating string: "${dataPoint}"`);
        });

        testBehavior("Recognizing Various Numeric Values", function() {
            const numericSamples = [100, 0, -50.5, Infinity];
            expectNoException(() => {
                for (const num of numericSamples) {
                    typeChecker(num, Number);
                }
            }, `validating multiple numbers: [${numericSamples.join(', ')}]`);

            // Adding a negative test case for BigInt if it's not considered a standard Number.
            // This implicitly tests the typeChecker's behavior for BigInt.
            const bigNumber = 9007199254740991n;
            assertionTool.throws(() => {
                typeChecker(bigNumber, Number);
            }, /Type mismatch/, "BigInt should explicitly fail when checked against standard Number type.");
        });

        testBehavior("Recognizing an Array Structure", function() {
            const listData = [1, 'a', {
                b: 2
            }];
            expectNoException(() => {
                typeChecker(listData, Array);
            }, `validating array: ${JSON.stringify(listData)}`);
        });

        testBehavior("Recognizing a Plain Object Structure", function() {
            const complexObject = {
                id: 1,
                name: 'Test'
            };
            expectNoException(() => {
                typeChecker(complexObject, Object);
            }, `validating object: ${JSON.stringify(complexObject)}`);
        });

        testBehavior("Validation Against Multiple Permitted Types", function() {
            const allowedTypes = [String, Number, Boolean];
            const testValue = true; // This should pass for Boolean
            expectNoException(() => {
                typeChecker(testValue, allowedTypes);
            }, `validating ${testValue} against [${allowedTypes.map(t => t.name).join(', ')}]`);

            const anotherTestValue = 12345; // This should pass for Number
            expectNoException(() => {
                typeChecker(anotherTestValue, allowedTypes);
            }, `validating ${anotherTestValue} against [${allowedTypes.map(t => t.name).join(', ')}]`);
        });

        testBehavior("Validation of Custom Class Instances", function() {
            // A specific class definition for testing.
            const CustomEntityKind = function() {
                this.propertyA = 10 * 0.2; // Changed expression
                this.isInitialized = true;
            };

            const firstInstance = new CustomEntityKind();
            expectNoException(() => {
                typeChecker(firstInstance, CustomEntityKind);
            }, "validating the first instance of CustomEntityKind");

            const secondInstance = new CustomEntityKind(); // Create another instance.
            expectNoException(() => {
                typeChecker(secondInstance, CustomEntityKind);
            }, "validating a subsequent instance of CustomEntityKind");
        });
    });

    // --- Test Cases for Failed Type Validations (Expected to Throw Errors) ---
    specificationGroup("Failed Type Validations (Error Expected)", function() {
        testBehavior("String Type Mismatch Scenarios", function() {
            const badStringInputs = [null, undefined, 123, [], {}];
            for (const input of badStringInputs) {
                assertionTool.throws(() => {
                    typeChecker(input, String);
                }, /Type mismatch/, `Expected error for non-string input: ${JSON.stringify(input)}`);
            }
        });

        testBehavior("Number Type Mismatch Scenarios", function() {
            const badNumberInputs = [
                'not-a-number', [], {}, null, undefined
            ];
            for (const input of badNumberInputs) {
                assertionTool.throws(() => {
                    typeChecker(input, Number);
                }, /Type mismatch/, `Expected error for non-number input: ${JSON.stringify(input)}`);
            }
        });

        testBehavior("Array Type Mismatch Scenarios", function() {
            const badArrayInputs = [
                'a string', 123, {}, null, undefined
            ];
            for (const input of badArrayInputs) {
                assertionTool.throws(() => {
                    typeChecker(input, Array);
                }, /Type mismatch/, `Expected error for non-array input: ${JSON.stringify(input)}`);
            }
        });

        testBehavior("Object Type Mismatch Scenarios", function() {
            const badObjectInputs = [
                [], 'a string', 123, null, undefined
            ]; // An array is not a plain object.
            for (const input of badObjectInputs) {
                assertionTool.throws(() => {
                    typeChecker(input, Object);
                }, /Type mismatch/, `Expected error for non-object input: ${JSON.stringify(input)}`);
            }
        });

        testBehavior("Multiple Types Mismatch Scenario", function() {
            const forbiddenValue = Symbol('unique');
            const allowedTypes = [String, Number];
            assertionTool.throws(() => {
                typeChecker(forbiddenValue, allowedTypes);
            }, /Type mismatch/, `Expected error for ${String(forbiddenValue)} not matching [${allowedTypes.map(t => t.name).join(', ')}]`);
        });

        testBehavior("Custom Class Instance Mismatch", function() {
            // Re-declaring the class here for self-containment, though it represents the same concept.
            const CustomEntityKind = function() {
                this.propertyA = 2;
            };
            const unrelatedObject = {}; // This is not an instance of CustomEntityKind.

            assertionTool.throws(() => {
                typeChecker(unrelatedObject, CustomEntityKind);
            }, /Type mismatch/, "Expected error for an unrelated object passed as CustomEntityKind.");
        });
    });

    // --- Tests for Configuration Options ---
    specificationGroup("Configuration Options Handling", function() {
        testBehavior("Handling 'required = false' for Optional Parameters", function() {
            const targetType = String;
            const optionalSetting = false;

            expectNoException(() => {
                typeChecker(null, targetType, optionalSetting);
                typeChecker(undefined, targetType, optionalSetting);
            }, `validating null/undefined with optional setting: ${optionalSetting}`);

            // A valid value should also pass when optional.
            const validOptionalValue = "some text";
            expectNoException(() => {
                typeChecker(validOptionalValue, targetType, optionalSetting);
            }, `validating a present value with optional setting: ${optionalSetting}`);
        });

        testBehavior("Handling 'required = \"optional\"' for Optional Parameters", function() {
            const targetType = Number;
            const optionalStringSetting = 'optional'; // Using string literal as option.

            expectNoException(() => {
                typeChecker(null, targetType, optionalStringSetting);
                typeChecker(undefined, targetType, optionalStringSetting);
            }, `validating null/undefined with optional string setting: "${optionalStringSetting}"`);
        });
    });

    // --- Tests for Global Module Settings ---
    specificationGroup("Global Module Settings", function() {
        let savedEnabledState; // Variable to preserve the original state of 'typeChecker.enabled'.

        // Setup hook: Save the current state before each test in this group.
        this.beforeEach(function() {
            savedEnabledState = typeChecker.enabled;
        });

        // Teardown hook: Restore the original state after each test in this group.
        this.afterEach(function() {
            typeChecker.enabled = savedEnabledState;
        });

        testBehavior("Toggle Enabled/Disabled State", function() {
            typeChecker.enabled = false; // Temporarily disable validation.

            const valueToTest = 1999;
            const mismatchedTargetType = String;

            // When disabled, typeChecker should NOT throw, even for type mismatches.
            expectNoException(() => {
                typeChecker(valueToTest, mismatchedTargetType);
            }, "validation call while checker is explicitly disabled");

            typeChecker.enabled = true; // Re-enable for subsequent checks.

            // After re-enabling, the same mismatch SHOULD throw an error.
            assertionTool.throws(() => {
                typeChecker(valueToTest, mismatchedTargetType);
            }, /Type mismatch/, "Expected error after re-enabling type checker for a mismatch.");
        });
    });

    // --- Tests for the Direct 'examine' Method ---
    specificationGroup("Direct `examine` Method Functionality", function() {
        testBehavior("Return Values of `examine` Method", function() {
            const testPayload = 2024;
            const correctDataType = Number;
            const incorrectDataType = String;

            // `typeChecker.examine` is designed to return a boolean, not throw.
            expectNoException(() => {
                typeChecker.examine(testPayload, incorrectDataType);
            }, "examine method call with an incorrect type (should return false, not throw)");

            // Asserting the boolean return values.
            assertionTool.strictEqual(typeChecker.examine(testPayload, correctDataType), true,
                `examine(${testPayload}, ${correctDataType.name}) should yield true for correct type.`);
            assertionTool.strictEqual(typePayload, incorrectDataType), false,
                `examine(${testPayload}, ${incorrectDataType.name}) should yield false for incorrect type.`);

            // Test `examine` with optional parameters.
            assertionTool.strictEqual(typeChecker.examine(null, correctDataType, false), true,
                `examine(null, ${correctDataType.name}, false) should yield true.`);
            assertionTool.strictEqual(typeChecker.examine(undefined, correctDataType, 'optional'), true,
                `examine(undefined, ${correctDataType.name}, 'optional') should yield true.`);
            assertionTool.strictEqual(typeChecker.examine(null, correctDataType, true), false,
                `examine(null, ${correctDataType.name}, true) should yield false when explicitly required.`);
        });
    });

    // --- Additional Edge Case Validations ---
    specificationGroup("Edge Case and Additional Type Validations", function() {
        testBehavior("Boolean Type Checks", function() {
            expectNoException(() => {
                typeChecker(true, Boolean);
                typeChecker(false, Boolean);
            }, "validating primitive boolean values.");

            assertionTool.throws(() => {
                typeChecker(0, Boolean);
            }, /Type mismatch/, "Expected 0 to fail as Boolean.");
            assertionTool.throws(() => {
                typeChecker(1, Boolean);
            }, /Type mismatch/, "Expected 1 to fail as Boolean.");
            assertionTool.throws(() => {
                typeChecker('true', Boolean);
            }, /Type mismatch/, "Expected string 'true' to fail as Boolean.");
        });

        testBehavior("Undefined and Null with Strict Requirement", function() {
            const strictlyRequiredType = Object;
            // When 'required' is explicitly true, null/undefined should cause a failure.
            assertionTool.throws(() => {
                typeChecker(undefined, strictlyRequiredType, true);
            }, /Type mismatch/, "Undefined should fail when the type is strictly required.");
            assertionTool.throws(() => {
                typeChecker(null, strictlyRequiredType, true);
            }, /Type mismatch/, "Null should fail when the type is strictly required.");
        });
    });

});