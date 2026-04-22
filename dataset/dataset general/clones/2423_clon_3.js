'use strict';

// Core utility module imports for testing and file operations
const verifier = require('assert');
const oath = require('vows');
const fileSystemOps = require('fs');
const advancedFS = require('final-fs');
const path = require('path');

// Custom code generation utility import
const CodeSynthesizer = require('../lib/codegen').CodeGen;

// --- Helper Functions and Constants for Test Setup ---

/**
 * A specialized assertion helper to verify the type of a value.
 * @param {*} valueToCheck - The value whose type needs to be verified.
 * @param {string} expectedType - The string representation of the expected type (e.g., 'string', 'number').
 * @param {string} [assertionMessage='Type assertion failed'] - An optional message for the assertion.
 */
function confirmType(valueToCheck, expectedType, assertionMessage = 'Type assertion failed') {
    if (typeof valueToCheck !== expectedType) {
        verifier.fail(`Expected type '${expectedType}', but received '${typeof valueToCheck}'. ${assertionMessage}`);
    }
    verifier.ok(typeof valueToCheck === expectedType, assertionMessage);
}

// Centralized base directory for template files
const TEMPLATE_BASE_DIR = path.join(__dirname, '..', 'templates');

// --- Main Test Suite Definition Object ---

let testSuiteDefinitions = {};

// Define the directory where API specification files are located
const apiSourceDirectory = 'tests/apis';

// Read all file names from the API specification directory
const apiSourceFiles = advancedFS.readdirSync(apiSourceDirectory);

// --- Pre-check: Ensure API files exist ---
if (apiSourceFiles.length === 0) {
    console.warn(`[Warning]: No API specification files found in '${apiSourceDirectory}'. Test suite will be empty.`);
} else {
    console.log(`[Info]: Found ${apiSourceFiles.length} API specification files for testing.`);
}

// Iterate through each API specification file to dynamically create test cases
apiSourceFiles.forEach((fileNameEntry) => {
    // Construct the absolute path for the current API definition file
    const currentApiPath = path.join(apiSourceDirectory, fileNameEntry);

    // Log the current file being processed for test definition
    console.debug(`[Debug]: Preparing test case for API spec: ${currentApiPath}`);

    // Define a test function for the current API file
    testSuiteDefinitions[currentApiPath] = function() {
        // Read the raw content of the API specification file
        const rawApiSpecContent = fileSystemOps.readFileSync(currentApiPath, { encoding: 'utf-8' });

        // Parse the raw content from JSON string into a JavaScript object
        const apiSpecData = JSON.parse(rawApiSpecContent);

        // --- Scenario 1: Generate Node.js compatible client code ---
        let generatedOutput = CodeSynthesizer.produceNodeJsCode({
            targetComponentName: 'ApplicationAPI', // Renamed className
            apiSpec: apiSpecData // Renamed swagger
        });
        confirmType(generatedOutput, 'string', 'Node.js code generation should always return a string.');

        // --- Scenario 2: Generate Angular.js compatible client code ---
        generatedOutput = CodeSynthesizer.produceAngularJsCode({
            componentNamespace: 'ClientServices', // Renamed moduleName
            targetComponentName: 'ApplicationAPI', // Renamed className
            apiSpec: apiSpecData
        });
        confirmType(generatedOutput, 'string', 'Angular.js code generation should always return a string.');

        // --- Scenario 3: Generate custom code using specific template files ---

        // Load individual template files into separate variables for clarity and reusability
        const componentTemplateContent = fileSystemOps.readFileSync(
            path.join(TEMPLATE_BASE_DIR, 'angular-class.mustache'),
            'utf-8'
        );
        const operationTemplateContent = fileSystemOps.readFileSync(
            path.join(TEMPLATE_BASE_DIR, 'method.mustache'),
            'utf-8'
        );
        const invocationTemplateContent = fileSystemOps.readFileSync(
            path.join(TEMPLATE_BASE_DIR, 'angular-request.mustache'),
            'utf-8'
        );

        generatedOutput = CodeSynthesizer.produceTailoredCode({
            componentNamespace: 'ClientServices', // Renamed moduleName
            targetComponentName: 'ApplicationAPI', // Renamed className
            apiSpec: apiSpecData,
            renderingTemplates: { // Renamed template object key
                componentTemplate: componentTemplateContent, // Renamed 'class' key
                operationTemplate: operationTemplateContent, // Renamed 'method' key
                invocationTemplate: invocationTemplateContent // Renamed 'request' key
            }
        });
        confirmType(generatedOutput, 'string', 'Custom code generation with templates must return a string.');
    };
});

// --- Vows Test Runner Integration ---

// Describe the overall test suite and add the dynamically generated batch of tests
oath.describe('Automated Code Generation Verification').addBatch(testSuiteDefinitions).export(module);