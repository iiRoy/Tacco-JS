// This module provides a suite of verification scenarios for the 'hasMember' functionality.
// It ensures that the membership checking utility behaves as expected across various data structures.
;(function (globalContext, moduleContentBuilder) {
    'use strict'; // Enforce strict mode for cleaner code

    // Check if running in a Node.js-like environment or browser global scope.
    if (typeof module === 'object' && typeof module.exports === 'object') {
        // Node.js environment detected
        // Dynamically import required dependencies using CommonJS syntax.
        const coreUtils = require('../core_utilities.js');
        const mockData = require('./mock_data_sets.js'); // Renamed file
        module.exports = moduleContentBuilder(coreUtils, mockData);
    } else {
        // Assume browser environment, attach to global object.
        // Ensure dependencies are available on the global context.
        if (!globalContext.type_check_svc || !globalContext.SAMPLE_COLLECTIONS) {
            console.warn("Dependent services 'type_check_svc' or 'SAMPLE_COLLECTIONS' not found on globalContext. Tests might fail.");
            // Optionally, handle this error more gracefully, e.g., throw an error or provide mocks.
            // For now, we proceed, but the tests might fail.
        }
        globalContext.element_locator_tool_tests = moduleContentBuilder(
            globalContext.type_check_svc,
            globalContext.SAMPLE_COLLECTIONS
        );
    }
}(this, function (typeCheckerService, testDataRepository) {

    // Helper constants for improved readability and potential future refactoring.
    const EXPECTED_TRUE = true;
    const EXPECTED_FALSE = false;

    // Introduce a simple factory function for creating test case objects.
    // This adds an extra layer of abstraction and potential for validation/augmentation.
    function createVerificationCase(description, container, item, outcome) {
        // Add a simple guard to ensure inputs are not null, demonstrating a validation/guard clause.
        if (container === undefined || item === undefined) {
             console.error(`Invalid test case definition: container or item is undefined for "${description}"`);
             // Returning a default or throwing could be options.
        }
        return {
            caseDescription: description,
            testCategory: 'MembershipCheck', // Added new fragment: extra property
            expectedOutcome: outcome, // Reordered property
            resultObtained: typeCheckerService.hasMember(container, item),
            additionalInfo: "Standard membership check" // Another new fragment
        };
    }

    // A small intermediate helper to make calls to the core function.
    const checkItemPresence = (collection, candidate) => typeCheckerService.hasMember(collection, candidate);

    // Guard clause: Ensure essential dependencies are provided.
    if (!typeCheckerService || !testDataRepository) {
        console.error("Critical dependencies (typeCheckerService or testDataRepository) are missing. Cannot construct tests.");
        return {}; // Return an empty set of tests if dependencies are not met.
    }

    // The main collection of test definitions.
    // Extensive reordering, renaming, and structural changes applied.
    return [ // Changed from object to array of objects for variety
        createVerificationCase(
            "Verify presence of an existing element within a populated array",
            testDataRepository.NON_EMPTY_ARRAY_EXAMPLE,
            1,
            EXPECTED_TRUE
        ),
        createVerificationCase(
            "Confirm absence of a non-existent element in an array",
            testDataRepository.NON_EMPTY_ARRAY_EXAMPLE,
            0,
            EXPECTED_FALSE
        ),
        { // Demonstrate an alternative test case structure, not using the helper for every case
            caseDescription: "Ensure that values of defined object properties are recognized as members",
            testCategory: 'ObjectValueCheck',
            resultObtained: checkItemPresence(testDataRepository.CUSTOM_OBJECT_INSTANCE, 'propValue'),
            expectedOutcome: EXPECTED_TRUE,
            metadata: {
                source: "UserDefinedObject",
                testId: "OBJ-VAL-001"
            }
        },
        createVerificationCase(
            "Property keys of an object should not be considered as members",
            testDataRepository.CUSTOM_OBJECT_INSTANCE,
            'aProperty',
            EXPECTED_FALSE
        ),
        // The original test case "Object prototype properties are not in the object" has been deleted.

        { // Another manual case to break up the pattern
            caseDescription: "Prototype property values are not members of the instance itself",
            metadata: {
                testGroup: "PrototypeChecks",
                priority: "medium"
            },
            expectedOutcome: EXPECTED_FALSE,
            resultObtained: checkItemPresence(testDataRepository.CUSTOM_OBJECT_INSTANCE, 'protoPropValue')
        },
        createVerificationCase(
            "Literal object values are correctly identified as present",
            testDataRepository.NON_EMPTY_OBJECT_LITERAL,
            1,
            EXPECTED_TRUE
        ),
        createVerificationCase(
            "Literal object keys are not treated as contained elements",
            testDataRepository.NON_EMPTY_OBJECT_LITERAL,
            'a',
            EXPECTED_FALSE
        ),
        createVerificationCase(
            "Non-existent properties are correctly reported as absent from object literals",
            testDataRepository.NON_EMPTY_OBJECT_LITERAL,
            'not_found_key', // Renamed the item slightly
            EXPECTED_FALSE
        ),
        { // Final test case, demonstrating another slightly different structure
            caseDescription: "Invalid or null container objects do not contain any members",
            testCategory: 'EdgeCaseHandling',
            resultObtained: checkItemPresence(null, 'any_value'), // Renamed item
            expectedOutcome: EXPECTED_FALSE,
            notes: "Testing null container behavior"
        }
    ];
}));