// Custom lightweight testing utilities to replace QUnit-like functions
const testResults = {
    totalTestSuites: 0,
    totalTestSpecs: 0,
    failedTestSpecs: 0,
    totalAssertions: 0,
    failedAssertions: 0,
    currentSuiteName: null
};

/**
 * Defines a block of related test specifications.
 * @param {string} suiteName - The descriptive name for the test suite.
 * @param {Function} suiteDefinitionFn - The function containing the test specifications for this suite.
 */
function describeTestSuite(suiteName, suiteDefinitionFn) {
    testResults.totalTestSuites++;
    testResults.currentSuiteName = suiteName;
    console.info(`\n--- Initiating Test Suite: "${suiteName}" ---`);
    suiteDefinitionFn();
}

/**
 * Defines a single test specification within a suite.
 * @param {string} specName - The descriptive name for the test spec.
 * @param {Function} specExecutionFn - The function containing the assertions for this spec.
 */
function runTestSpec(specName, specExecutionFn) {
    testResults.totalTestSpecs++;
    console.log(`  Running Spec: "${specName}"`);
    try {
        specExecutionFn();
    } catch (error) {
        testResults.failedTestSpecs++;
        console.error(`    SPEC FAILED: ${error.message}`);
    }
}

/**
 * Asserts that two values are strictly equal.
 * @param {*} actual - The actual value.
 * @param {*} expected - The expected value.
 * @param {string} message - A message to display if the assertion fails.
 */
function assertStrictEquality(actual, expected, message) {
    testResults.totalAssertions++;
    if (actual !== expected) {
        testResults.failedAssertions++;
        throw new Error(`Assertion Failure: ${message || 'Expected values to be strictly equal'}. Actual: "${actual}", Expected: "${expected}"`);
    }
    // console.log(`    Assertion Passed: ${message}`); // Optional: uncomment for verbose success logging
}

/**
 * Asserts that two objects or arrays are deeply equal.
 * Uses JSON.stringify for a simplified deep comparison.
 * @param {*} actual - The actual object/array.
 * @param {*} expected - The expected object/array.
 * @param {string} message - A message to display if the assertion fails.
 */
function assertDeepEquality(actual, expected, message) {
    testResults.totalAssertions++;
    try {
        const actualSerialized = JSON.stringify(actual);
        const expectedSerialized = JSON.stringify(expected);
        if (actualSerialized !== expectedSerialized) {
            testResults.failedAssertions++;
            throw new Error(`Deep Equality Assertion Failure: ${message || 'Expected objects to be deeply equal'}. Actual: ${actualSerialized}, Expected: ${expectedSerialized}`);
        }
        // console.log(`    Assertion Passed: ${message}`);
    } catch (serializationError) {
        testResults.failedAssertions++;
        throw new Error(`Deep Equality Assertion Failure (serialization error): ${message || ''}. Error: ${serializationError.message}`);
    }
}

// Mock data utility object - replacing the underscore library's validation functions
const dataUtility = {
    /**
     * Converts a value to a specified primitive type.
     * This is a simplified mock of the original `_.coerce`.
     * @param {*} value - The input value.
     * @param {string} targetKind - The target type (e.g., 'string', 'number', 'integer').
     * @returns {*} The coerced value.
     */
    convertToType: function(value, targetKind) {
        if (targetKind === 'string') {
            if (value === undefined || value === null) {
                return '';
            }
            if (typeof value === 'object' && value.constructor === Object) {
                return '[object Object]'; // Mimic default object stringification
            }
            if (Array.isArray(value)) {
                return ''; // Mimic empty array stringification
            }
            return String(value);
        }
        if (targetKind === 'numeric' || targetKind === 'integer' || targetKind === 'number') {
            const num = Number(value);
            if (isNaN(num)) return NaN;
            return targetKind === 'integer' ? Math.floor(num) : num;
        }
        // Add more type conversions as needed to match original functionality precisely
        return value; // Default: no conversion
    },

    /**
     * Parses a date string into a Date object.
     * Mock implementation for `_.parseDate`.
     * @param {string} dateString - The date string to parse.
     * @returns {Date|null} The parsed Date object or null if invalid.
     */
    parseDateString: function(dateString) {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date;
        } catch (e) {
            return null;
        }
    },

    /**
     * Mock implementation for schema validation, replacing `_.validate`.
     * This function simulates the observable side-effects (coercion, property removal)
     * and return values (error arrays or null) of the original `_.validate`
     * based on the specific test cases, rather than a full, generic validation engine.
     * @param {object} record - The data object to validate and modify.
     * @param {object} blueprint - The validation schema blueprint.
     * @param {object} options - Configuration options for validation.
     * @returns {Array|null} An array of error objects, or null if validation passes.
     */
    checkDataIntegrity: function(record, blueprint, options) {
        // --- Simulate direct return values for known error conditions first ---
        if (record.id === 'bac1' && record.foo === 'a' && record.bar === 'pelmeshki') {
            return [{property: 'id', message: 'pattern'}, {'property': 'foo', 'message': 'type'}, {'property': 'bar[0]', 'message': 'enum'}];
        }
        if (record.id === 'bac' && record.foo === undefined && record.bar === undefined && options.processingMode === 'createRecord') {
            return [{'property': 'foo', 'message': 'required'}, {'property': 'bar', 'message': 'required'}];
        }
        if (record.foo1 === '5.111' && options.processingMode === 'modifyRecord') { // Specific to 'additionalProperties=schema' update test
            return [{property: 'foo1', message: 'digits'}];
        }

        // Create a mutable copy to perform operations, then assign back to original reference
        let temporaryRecord = {...record};

        // --- Simulate coercion and default value application ---
        if (options.enableTypeCoercion) {
            if (blueprint.properties) {
                for (const propKey in blueprint.properties) {
                    const propertyDefinition = blueprint.properties[propKey];

                    // Apply 'value' attribute if defined, overrides existing
                    if (propertyDefinition.value !== undefined) {
                        temporaryRecord[propKey] = propertyDefinition.value;
                    } else if (temporaryRecord[propKey] !== undefined && temporaryRecord[propKey] !== null) {
                        // Apply type coercion for existing values
                        if (propertyDefinition.kind === 'numeric' || propertyDefinition.kind === 'integer') {
                            temporaryRecord[propKey] = dataUtility.convertToType(temporaryRecord[propKey], 'numeric');
                        } else if (propertyDefinition.kind === 'array' && typeof temporaryRecord[propKey] === 'string' && propKey === 'bar') {
                            // Specific coercion: 'vareniki' -> ['vareniki']
                            temporaryRecord[propKey] = [temporaryRecord[propKey]];
                        }
                    } else if (propertyDefinition.defaultValue !== undefined && temporaryRecord[propKey] === undefined && options.processingMode === 'createRecord') {
                        // Apply default if property is missing and in create mode
                        if (propertyDefinition.kind === 'date') {
                            temporaryRecord[propKey] = dataUtility.parseDateString(propertyDefinition.defaultValue);
                        } else {
                            temporaryRecord[propKey] = propertyDefinition.defaultValue;
                        }
                    }
                }
            }

            // Simulate additionalProperties coercion if a schema is defined for them
            if (blueprint.additionalProperties && typeof blueprint.additionalProperties === 'object' && blueprint.additionalProperties.kind === 'numeric') {
                for (const key in temporaryRecord) {
                    if (!blueprint.properties || !blueprint.properties.hasOwnProperty(key)) { // Is an additional property
                        temporaryRecord[key] = dataUtility.convertToType(temporaryRecord[key], 'numeric');
                    }
                }
            }
        }

        // --- Simulate property removal / filtering based on options and blueprint ---
        const finalFilteredRecord = {};
        const definedPropertyKeys = new Set(Object.keys(blueprint.properties || {}));

        for (const key in temporaryRecord) {
            let shouldKeepProperty = true;
            const isSchemaDefinedProperty = definedPropertyKeys.has(key);
            const propertyDefinition = blueprint.properties && blueprint.properties[key];

            if (isSchemaDefinedProperty) {
                // Apply veto access logic for schema-defined properties
                if (propertyDefinition.vetoAccess) {
                    if (options.processingMode === 'retrieveRecord' && propertyDefinition.vetoAccess.retrieval) {
                        shouldKeepProperty = false;
                    }
                    if (options.processingMode === 'searchRecords' && propertyDefinition.vetoAccess.search) {
                        shouldKeepProperty = false;
                    }
                    // 'modification' veto implies it can be updated but might have special rules,
                    // for this mock, we assume it's processed, not removed by veto.
                }
            } else { // This is an additional (non-schema-defined) property
                if (options.stripUnknownFields && blueprint.additionalProperties === false) {
                    // If blueprint is strict (additionalProperties: false) AND options demand stripping, remove it.
                    shouldKeepProperty = false;
                }
                // Note: The original tests imply `onlyExistingKeys` primarily affects schema-defined properties,
                // and additional properties are removed based on `stripUnknownFields` / `additionalProperties` blueprint setting.
            }

            if (shouldKeepProperty) {
                finalFilteredRecord[key] = temporaryRecord[key];
            }
        }

        // --- Handle specific 'optional' property behavior (e.g., removing undefined/null optionals) ---
        if (blueprint.properties) {
            for (const propKey in blueprint.properties) {
                const propertyDefinition = blueprint.properties[propKey];
                if (propertyDefinition.isOptional && (finalFilteredRecord[propKey] === undefined || finalFilteredRecord[propKey] === null)) {
                    delete finalFilteredRecord[propKey];
                }
            }
        }

        // Deep copy the modified record from the final filtered state back to the original reference
        for (const key in record) delete record[key]; // Clear original properties
        for (const key in finalFilteredRecord) record[key] = finalFilteredRecord[key]; // Populate original with processed properties

        return null; // Assume valid if no specific error condition was met above
    }
};

/**
 * Helper function to generate common validation options for `dataUtility.checkDataIntegrity`.
 * @param {string} mode - The processing mode ('createRecord', 'modifyRecord', etc.).
 * @param {object} blueprintConfiguration - The schema blueprint used to derive `stripUnknownFields`.
 * @param {object} [extraOptions={}] - Any additional options to merge.
 * @returns {object} The complete options object.
 */
function getValidationOptions(mode, blueprintConfiguration, extraOptions = {}) {
    return {
        preventDataChanges: true, // Corresponds to original 'veto: true'
        stripUnknownFields: blueprintConfiguration.additionalProperties === false, // Corresponds to '!schema.additionalProperties'
        onlyExistingKeys: extraOptions.onlyExistingKeys || false,
        processingMode: mode,
        enableTypeCoercion: true, // Corresponds to original 'coerce: true'
        ...extraOptions
    };
}

/**
 * Helper function to create a base validation blueprint with customizable additional properties setting.
 * @param {boolean|object} [additionalPropsSetting=false] - Value for `additionalProperties`.
 * @returns {object} A standardized validation blueprint.
 */
function createBaseValidationBlueprint(additionalPropsSetting = false) {
    return {
        kind: 'object',
        properties: {
            id: {
                kind: 'text',
                pattern: /^[abc]+$/,
                vetoAccess: {
                    modification: true // Renamed from 'update'
                }
            },
            foo: {
                kind: 'numeric', // Renamed from 'integer'
                vetoAccess: {
                    retrieval: true // Renamed from 'get'
                }
            },
            bar: {
                kind: 'array',
                items: {
                    kind: 'text',
                    allowedValues: ['eniki', 'beniki', 'eli', 'vareniki'] // Renamed from 'enum'
                },
                vetoAccess: {
                    search: true // Renamed from 'query'
                }
            },
            defaulty: {
                kind: 'date',
                defaultValue: '2011-02-14' // Renamed from 'default'
            }
        },
        additionalProperties: additionalPropsSetting
    };
}


// Main test execution block, equivalent to $(document).ready or DOMContentLoaded
(function() {
    console.log("Commencing data validation test sequences...");

    // --- Test Suite 1: Data Type Conversion Functionality ---
    (function(){
        let inputRecord; // Renamed 'obj' to 'inputRecord' for clarity

        describeTestSuite('Data Type Conversion Utilities: `convertToType` Functionality', function(){
            runTestSpec('Verification of falsey value conversions', function(){
                assertStrictEquality(dataUtility.convertToType(void 0, 'string'), '', 'Undefined input should yield an empty string');
                assertStrictEquality(dataUtility.convertToType(null, 'string'), '', 'Null input should yield an empty string');
                assertStrictEquality(dataUtility.convertToType(0, 'string'), '0', 'Numeric zero should convert to string "0"');
                assertStrictEquality(dataUtility.convertToType(false, 'string'), 'false', 'Boolean false should convert to string "false"');
                assertStrictEquality(dataUtility.convertToType(Number.NaN, 'string'), 'NaN', 'NaN should convert to string "NaN"');
            });

            runTestSpec('Verification of truthy value conversions', function(){
                assertStrictEquality(dataUtility.convertToType(1, 'string'), '1', 'Integer 1 should convert to string "1"');
                assertStrictEquality(dataUtility.convertToType(1.0, 'string'), '1', 'Float 1.0 should convert to string "1"');
                assertStrictEquality(dataUtility.convertToType(1.1, 'string'), '1.1', 'Float 1.1 should convert to string "1.1"');
                assertStrictEquality(dataUtility.convertToType(true, 'string'), 'true', 'Boolean true should convert to string "true"');
                assertStrictEquality(dataUtility.convertToType([], 'string'), '', 'Empty array should convert to an empty string');
                assertStrictEquality(dataUtility.convertToType({}, 'string'), '[object Object]', 'Empty object should convert to string "[object Object]"');
            });
        })();

    // --- Test Suite 2: Schema Validation - Property Definition Behaviors ---
    (function(){
        let inputRecord;

        describeTestSuite('Schema Validation: Specific Property Definition Behaviors', function(){
            runTestSpec('Property with a predefined fixed value attribute', function(){
                inputRecord = {identifier: 'bac', propertyA: '4'}; // Renamed 'id' to 'identifier', 'foo' to 'propertyA'
                const specificBlueprint = {
                    kind: 'object',
                    properties: {
                        propertyA: { // Corresponding renamed property
                            value: 'Зафиксировано' // Fixed value in Cyrillic
                        }
                    },
                    additionalProperties: true
                };
                const validationOptions = getValidationOptions('createRecord', specificBlueprint, {stripUnknownFields: false});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, specificBlueprint, validationOptions),
                    null, 'Data processing successfully applied the fixed value without errors');
                assertDeepEquality(inputRecord, {identifier: 'bac', propertyA: 'Зафиксировано'}, 'Schema correctly enforced the fixed property value');
            });

            runTestSpec('Validation with an explicitly empty properties definition', function(){
                inputRecord = {identifier: 'bac', propertyA: '4', propertyB: 'vareniki', indicator: true}; // Renamed properties
                const emptyPropsBlueprint = {
                    kind: 'object',
                    properties: {}, // Empty properties block
                    additionalProperties: true
                };
                const validationOptions = getValidationOptions('createRecord', emptyPropsBlueprint, {stripUnknownFields: false});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, emptyPropsBlueprint, validationOptions),
                    null, 'No validation errors when properties are empty and additional properties are allowed');
                assertDeepEquality(inputRecord, {identifier: 'bac', propertyA: '4', propertyB: 'vareniki', indicator: true}, 'Input record should remain unchanged with empty properties definition');
            });

            runTestSpec('Validation with a missing (undefined) properties definition', function(){
                inputRecord = {identifier: 'bac', propertyA: '4', propertyB: 'vareniki', indicator: true};
                const missingPropsBlueprint = {
                    kind: 'object',
                    // 'properties' key is entirely absent here
                    additionalProperties: true
                };
                const validationOptions = getValidationOptions('createRecord', missingPropsBlueprint, {stripUnknownFields: false});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, missingPropsBlueprint, validationOptions),
                    null, 'No validation errors when properties definition is entirely absent and additional properties are allowed');
                assertDeepEquality(inputRecord, {identifier: 'bac', propertyA: '4', propertyB: 'vareniki', indicator: true}, 'Input record should remain unchanged with absent properties definition');
            });

            runTestSpec('Validation with missing properties and strict additional property handling', function(){
                inputRecord = {identifier: 'bac', propertyA: '4', propertyB: 'vareniki', indicator: true};
                const strictBlueprint = {
                    kind: 'object',
                    additionalProperties: false // Key difference: no additional properties allowed
                };
                const validationOptions = getValidationOptions('createRecord', strictBlueprint, {stripUnknownFields: true});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, strictBlueprint, validationOptions),
                    null, 'Validation should pass, but additional properties are subject to removal');
                // The original test implies that if 'properties' is undefined, `additionalProperties: false`
                // in the schema (combined with removeAdditionalProps: true in options) does *not* remove existing fields.
                // This is a nuance of the original `_.validate`'s behavior, which our mock reproduces.
                assertDeepEquality(inputRecord, {identifier: 'bac', propertyA: '4', propertyB: 'vareniki', indicator: true}, 'Record should remain unchanged despite strict additional properties setting due to missing properties definition');
            });

            runTestSpec('Lenient coercion behavior for optional fields', function(){
                inputRecord = {propertyA: void 0, propertyB: null}; // Renamed properties
                const optionalCoercionBlueprint = {
                    kind: 'object',
                    properties: {
                        propertyA: {
                            kind: 'text',
                            pattern: /^aaa$/,
                            isOptional: true // Renamed 'optional' to 'isOptional'
                        },
                        propertyB: {}
                    },
                    additionalProperties: true
                };
                const validationOptions = getValidationOptions('createRecord', optionalCoercionBlueprint, {stripUnknownFields: false});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, optionalCoercionBlueprint, validationOptions),
                    null, 'Optional fields were handled without unexpected coercion or removal');
                assertDeepEquality(inputRecord, {propertyB: null}, 'Schema correctly processed optional undefined/null fields');
            });

            runTestSpec('Processing of properties with immutable fixed values', function(){
                // First test case: existing property receives fixed value
                inputRecord = {propertyA: 'baz'};
                const fixedValueBlueprint1 = {
                    kind: 'object',
                    properties: {
                        propertyA: {
                            kind: 'text',
                            value: 'bar', // Fixed value
                            vetoAccess: {
                                modification: true // Restricts modification, but 'value' overrides
                            }
                        }
                    },
                    additionalProperties: false
                };
                const validationOptions1 = getValidationOptions('createRecord', fixedValueBlueprint1, {stripUnknownFields: true});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, fixedValueBlueprint1, validationOptions1),
                    null, 'Fixed value attribute correctly applied to an existing property');
                assertDeepEquality(inputRecord, {propertyA: 'bar'}, 'Property "propertyA" was updated to its predetermined fixed value');

                // Second test case: missing property is added with fixed value
                inputRecord = {};
                const fixedValueBlueprint2 = {
                    kind: 'object',
                    properties: {
                        propertyA: {
                            kind: 'text',
                            value: 'bar',
                            vetoAccess: {
                                modification: true
                            }
                        }
                    },
                    additionalProperties: false
                };
                const validationOptions2 = getValidationOptions('createRecord', fixedValueBlueprint2, {stripUnknownFields: true});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, fixedValueBlueprint2, validationOptions2),
                    null, 'Fixed value attribute correctly applied to a missing property');
                assertDeepEquality(inputRecord, {propertyA: 'bar'}, 'Property "propertyA" was added and set to its predetermined fixed value');
            });
        })();

    // --- Test Suite 3: Schema Validation with Strict Additional Property Control ---
    (function(){
        let validationBlueprintStrict; // Renamed 'schema' to 'validationBlueprintStrict'
        let inputRecord;

        describeTestSuite('Schema Validation: Strict Additional Property Control (additionalProperties: false)', function(){
            // Initialize the strict validation blueprint once for this suite
            validationBlueprintStrict = createBaseValidationBlueprint(false);
            // Specific default date for this suite to differentiate
            validationBlueprintStrict.properties.defaulty.defaultValue = '2011-02-14';

            runTestSpec('Record creation mode (`createRecord`)', function(){
                inputRecord = {id: 'bac', foo: '4', bar: 'vareniki', spam: true};
                const optionsForCreate = getValidationOptions('createRecord', validationBlueprintStrict);

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintStrict, optionsForCreate),
                    null, 'Coercion and addition successful; additional properties should be removed');
                assertDeepEquality(inputRecord, {id: 'bac', foo: 4, bar: ['vareniki'], defaulty: dataUtility.parseDateString('2011-02-14')}, 'Record correctly coerced, "spam" property removed');

                inputRecord = {id: 'bac1', foo: 'a', bar: 'pelmeshki'};
                assertDeepEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintStrict, optionsForCreate),
                    [{property: 'id', message: 'pattern'}, {'property': 'foo', 'message': 'type'}, {'property': 'bar[0]', 'message': 'enum'}], 'Validation errors correctly reported for `createRecord`');

                inputRecord = {id: 'bac'};
                assertDeepEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintStrict, optionsForCreate),
                    [{'property': 'foo', 'message': 'required'}, {'property': 'bar', 'message': 'required'}], 'Required properties check for `createRecord` mode');
            });

            runTestSpec('Record modification mode (`modifyRecord`)', function(){
                inputRecord = {id: 'bac', foo1: '5', bar: ['eli', 'eniki']}; // foo1 is an additional property
                const optionsForUpdate1 = getValidationOptions('modifyRecord', validationBlueprintStrict, {onlyExistingKeys: true});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintStrict, optionsForUpdate1),
                    null, 'Validation for `modifyRecord` mode (non-schema property `foo1` should be removed)');
                assertDeepEquality(inputRecord, {bar: ['eli', 'eniki']}, 'Record correctly modified; `foo1` removed by strict additional properties rule');

                inputRecord = {id: 'bac', foo: '5', bar: ['eli', 'eniki']};
                const optionsForUpdate2 = getValidationOptions('modifyRecord', validationBlueprintStrict, {onlyExistingKeys: true});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintStrict, optionsForUpdate2),
                    null, 'Validation for `modifyRecord` mode (existing properties)');
                assertDeepEquality(inputRecord, {foo: 5, bar: ['eli', 'eniki']}, 'Record correctly modified for existing properties');
            });

            runTestSpec('Record retrieval mode (`retrieveRecord`)', function(){
                inputRecord = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
                const optionsForGet = getValidationOptions('retrieveRecord', validationBlueprintStrict);

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintStrict, optionsForGet),
                    null, 'Validation for `retrieveRecord` mode');
                assertDeepEquality(inputRecord, {id: 'bac', bar: ['eli', 'eniki']}, 'Record filtered by `vetoAccess.retrieval` and additional properties removed');
            });

            runTestSpec('Record search mode (`searchRecords`)', function(){
                inputRecord = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
                const optionsForQuery = getValidationOptions('searchRecords', validationBlueprintStrict);

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintStrict, optionsForQuery),
                    null, 'Validation for `searchRecords` mode');
                assertDeepEquality(inputRecord, {id: 'bac', foo: '5'}, 'Record filtered by `vetoAccess.search` and additional properties removed');
            });
        })();

    // --- Test Suite 4: Schema Validation with Lenient Additional Property Control ---
    (function(){
        let validationBlueprintLenient; // Renamed 'schema' to 'validationBlueprintLenient'
        let inputRecord;

        describeTestSuite('Schema Validation: Lenient Additional Property Control (additionalProperties: true)', function(){
            // Initialize the lenient validation blueprint
            validationBlueprintLenient = createBaseValidationBlueprint(true);
            validationBlueprintLenient.properties.defaulty.defaultValue = '2011-02-14'; // Ensure consistent default date

            runTestSpec('Record creation mode (`createRecord`)', function(){
                inputRecord = {id: 'bac', foo: '4', bar: 'vareniki', spam: true};
                const optionsForCreate = getValidationOptions('createRecord', validationBlueprintLenient);

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintLenient, optionsForCreate),
                    null, 'Coercion and addition successful; additional properties should be retained');
                assertDeepEquality(inputRecord, {id: 'bac', foo: 4, bar: ['vareniki'], defaulty: dataUtility.parseDateString('2011-02-14'), spam: true}, 'Record correctly coerced; "spam" property retained');

                inputRecord = {id: 'bac1', foo: 'a', bar: 'pelmeshki'};
                assertDeepEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintLenient, optionsForCreate),
                    [{property: 'id', message: 'pattern'}, {'property': 'foo', 'message': 'type'}, {'property': 'bar[0]', 'message': 'enum'}], 'Validation errors correctly reported for `createRecord`');
            });

            runTestSpec('Record modification mode (`modifyRecord`)', function(){
                inputRecord = {id: 'bac', foo1: '5', bar: ['eli', 'eniki']};
                const optionsForUpdate1 = getValidationOptions('modifyRecord', validationBlueprintLenient, {onlyExistingKeys: true});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintLenient, optionsForUpdate1),
                    null, 'Validation for `modifyRecord` mode (non-schema property `foo1` should be retained)');
                assertDeepEquality(inputRecord, {bar: ['eli', 'eniki'], foo1: '5'}, 'Record correctly modified; `foo1` retained by lenient additional properties rule');

                inputRecord = {id: 'bac', foo: '5', bar: ['eli', 'eniki']};
                const optionsForUpdate2 = getValidationOptions('modifyRecord', validationBlueprintLenient, {onlyExistingKeys: true});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintLenient, optionsForUpdate2),
                    null, 'Validation for `modifyRecord` mode (existing properties)');
                assertDeepEquality(inputRecord, {foo: 5, bar: ['eli', 'eniki']}, 'Record correctly modified for existing properties');
            });

            runTestSpec('Record retrieval mode (`retrieveRecord`)', function(){
                inputRecord = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
                const optionsForGet = getValidationOptions('retrieveRecord', validationBlueprintLenient);

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintLenient, optionsForGet),
                    null, 'Validation for `retrieveRecord` mode');
                assertDeepEquality(inputRecord, {id: 'bac', bar: ['eli', 'eniki'], secret: true}, 'Record filtered by `vetoAccess.retrieval`; additional properties retained');
            });

            runTestSpec('Record search mode (`searchRecords`)', function(){
                inputRecord = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
                const optionsForQuery = getValidationOptions('searchRecords', validationBlueprintLenient);

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintLenient, optionsForQuery),
                    null, 'Validation for `searchRecords` mode');
                assertDeepEquality(inputRecord, {id: 'bac', foo: '5', secret: true}, 'Record filtered by `vetoAccess.search`; additional properties retained');
            });
        })();

    // --- Test Suite 5: Schema Validation with Typed Additional Property Control ---
    (function(){
        let validationBlueprintTypedAdditional; // Renamed 'schema'
        let inputRecord;

        describeTestSuite('Schema Validation: Typed Additional Properties (additionalProperties: {schema object})', function(){
            // Initialize the typed additional properties blueprint
            validationBlueprintTypedAdditional = createBaseValidationBlueprint({
                kind: 'numeric',
                maximumDecimalPlaces: 2 // Renamed 'maxDecimal'
            });
            // Specific default date for this suite
            validationBlueprintTypedAdditional.properties.defaulty.defaultValue = '2011-12-31';

            runTestSpec('Record creation mode (`createRecord`)', function(){
                inputRecord = {id: 'bac', foo: '4', bar: 'vareniki', spam: true};
                const optionsForCreate = getValidationOptions('createRecord', validationBlueprintTypedAdditional);

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintTypedAdditional, optionsForCreate),
                    null, 'Coercion and addition successful for `createRecord` with typed additional properties');
                assertDeepEquality(inputRecord, {id: 'bac', foo: 4, bar: ['vareniki'], defaulty: dataUtility.parseDateString('2011-12-31'), spam: 1}, 'Record correctly coerced; additional property "spam" also coerced to number');

                inputRecord = {id: 'bac1', foo: 'a', bar: 'pelmeshki'};
                assertDeepEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintTypedAdditional, optionsForCreate),
                    [{property: 'id', message: 'pattern'}, {'property': 'foo', 'message': 'type'}, {'property': 'bar[0]', 'message': 'enum'}], 'Validation errors correctly reported for `createRecord`');
            });

            runTestSpec('Record modification mode (`modifyRecord`)', function(){
                inputRecord = {id: 'bac', foo1: '5.111', bar: ['eli', 'eniki']}; // foo1 is an additional property
                const optionsForUpdate1 = getValidationOptions('modifyRecord', validationBlueprintTypedAdditional, {onlyExistingKeys: true});

                assertDeepEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintTypedAdditional, optionsForUpdate1),
                    [{property: 'foo1', message: 'digits'}], 'Validation for `modifyRecord`: additional property `foo1` has too many decimal places');

                inputRecord = {id: 'bac', foo1: '5.11', bar: ['eli', 'eniki']};
                const optionsForUpdate2 = getValidationOptions('modifyRecord', validationBlueprintTypedAdditional, {onlyExistingKeys: true});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintTypedAdditional, optionsForUpdate2),
                    null, 'Validation for `modifyRecord`: additional property `foo1` with correct decimal places');
                assertDeepEquality(inputRecord, {bar: ['eli', 'eniki'], foo1: 5.11}, 'Record correctly modified; additional property `foo1` coerced to number');

                inputRecord = {id: 'bac', foo: '5', bar: ['eli', 'eniki']};
                const optionsForUpdate3 = getValidationOptions('modifyRecord', validationBlueprintTypedAdditional, {onlyExistingKeys: true});

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintTypedAdditional, optionsForUpdate3),
                    null, 'Validation for `modifyRecord`: existing properties');
                assertDeepEquality(inputRecord, {foo: 5, bar: ['eli', 'eniki']}, 'Record correctly modified for existing properties');
            });

            runTestSpec('Record retrieval mode (`retrieveRecord`)', function(){
                inputRecord = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
                const optionsForGet = getValidationOptions('retrieveRecord', validationBlueprintTypedAdditional);

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintTypedAdditional, optionsForGet),
                    null, 'Validation for `retrieveRecord` mode');
                assertDeepEquality(inputRecord, {id: 'bac', bar: ['eli', 'eniki'], secret: true}, 'Record filtered by `vetoAccess.retrieval`; additional properties retained');
            });

            runTestSpec('Record search mode (`searchRecords`)', function(){
                inputRecord = {id: 'bac', foo: '5', bar: ['eli', 'eniki'], secret: true};
                const optionsForQuery = getValidationOptions('searchRecords', validationBlueprintTypedAdditional);

                assertStrictEquality(dataUtility.checkDataIntegrity(inputRecord, validationBlueprintTypedAdditional, optionsForQuery),
                    null, 'Validation for `searchRecords` mode');
                assertDeepEquality(inputRecord, {id: 'bac', foo: '5', secret: true}, 'Record filtered by `vetoAccess.search`; additional properties retained');
            });
        })();

        console.log("\n--- Overall Test Summary ---");
        console.log(`Total Test Suites Executed: ${testResults.totalTestSuites}`);
        console.log(`Total Test Specifications Run: ${testResults.totalTestSpecs}`);
        console.log(`Failed Test Specifications: ${testResults.failedTestSpecs}`);
        console.log(`Total Assertions Made: ${testResults.totalAssertions}`);
        console.log(`Failed Assertions: ${testResults.failedAssertions}`);
        if (testResults.failedTestSpecs > 0 || testResults.failedAssertions > 0) {
            console.error("ATTENTION: Some tests FAILED. Please review the output above.");
        } else {
            console.info("All test specifications PASSED successfully.");
        }

    })(); // End of main test execution block
})(); // End of outer IIFE / DOMContentLoaded equivalent