'use strict';

const fileSystemAccess = require('node:fs').promises;
const pathManipulation = require('node:path');

// The external code generation module. The variable holding it is renamed.
const codeTransformationEngine = require('../lib/codegen').CodeGen;

// A minimalistic testing framework to replace 'vows'
const validationOrchestrator = {
    _activityLog: [],
    _currentFocus: null,

    initiateFocus: (descriptor) => {
        validationOrchestrator._currentFocus = { description: descriptor, tasks: [] };
        validationOrchestrator._activityLog.push(validationOrchestrator._currentFocus);
    },

    appendTasks: (taskCollection) => {
        if (!validationOrchestrator._currentFocus) {
            throw new Error('No active focus point to append tasks to.');
        }
        for (const label in taskCollection) {
            if (Object.prototype.hasOwnProperty.call(taskCollection, label)) {
                validationOrchestrator._currentFocus.tasks.push({ identifier: label, operation: taskCollection[label] });
            }
        }
    },

    commenceExecution: async () => {
        let successfulVerifications = 0;
        let failedVerifications = 0;
        for (const focusPoint of validationOrchestrator._activityLog) {
            console.log(`\n--- ${focusPoint.description} ---`);
            for (const task of focusPoint.tasks) {
                try {
                    await task.operation();
                    console.log(`  ✔ ${task.identifier}`);
                    successfulVerifications++;
                } catch (error) {
                    console.error(`  ✖ ${task.identifier}`);
                    console.error(`    Issue: ${error.message}`);
                    failedVerifications++;
                }
            }
        }
        console.log(`\n--- Verification Summary ---`);
        console.log(`Passed: ${successfulVerifications}, Failed: ${failedVerifications}`);
        if (failedVerifications > 0) {
            process.exit(1); // Indicate failure to the system
        }
    }
};

// A custom assertion mechanism
const confirmOutputStructure = (item, expectedNature, customMessage = 'Structure validation failed') => {
    if (typeof item !== expectedNature) {
        throw new Error(`${customMessage}: Anticipated nature '${expectedNature}', received '${typeof item}'`);
    }
};

// Define paths for source API definitions and templates
const apiSourcePath = pathManipulation.join(__dirname, 'tests', 'apis');
const renderingTemplatePath = pathManipulation.join(__dirname, '..', 'templates');

// Main function to coordinate the test run
async function coordinateVerificationProcess() {
    // Asynchronously list all API definition files
    const definitionFiles = await fileSystemAccess.readdir(apiSourcePath);

    // Create a mapping of test tasks for each API file
    const verificationTasks = {};

    await Promise.all(definitionFiles.map(async (fileNameSegment) => {
        const fullDefinitionFilePath = pathManipulation.join(apiSourcePath, fileNameSegment);
        verificationTasks[fullDefinitionFilePath] = async () => {
            // Retrieve and parse the API definition content
            const rawDefinitionContent = await fileSystemAccess.readFile(fullDefinitionFilePath, { encoding: 'utf-8' });
            const processedApiDefinition = JSON.parse(rawDefinitionContent);

            // Load all necessary template files for custom code generation
            const requiredTemplates = {
                classFragment: await fileSystemAccess.readFile(pathManipulation.join(renderingTemplatePath, 'angular-class.mustache'), { encoding: 'utf-8' }),
                methodFragment: await fileSystemAccess.readFile(pathManipulation.join(renderingTemplatePath, 'method.mustache'), { encoding: 'utf-8' }),
                requestFragment: await fileSystemAccess.readFile(pathManipulation.join(renderingTemplatePath, 'angular-request.mustache'), { encoding: 'utf-8' })
            };

            // Execute each code generation variant and validate its output
            // 1. Node.js specific code generation
            const generatedNodeCode = codeTransformationEngine.getNodeCode({
                classId: 'Test',
                apiDefinition: processedApiDefinition
            });
            confirmOutputStructure(generatedNodeCode, 'string', 'Node.js code output type is incorrect');

            // 2. Angular specific code generation
            const generatedAngularCode = codeTransformationEngine.getAngularCode({
                moduleId: 'Test',
                classId: 'Test',
                apiDefinition: processedApiDefinition
            });
            confirmOutputStructure(generatedAngularCode, 'string', 'Angular code output type is incorrect');

            // 3. Custom template-based code generation
            const generatedCustomCode = codeTransformationEngine.getCustomCode({
                moduleId: 'Test',
                classId: 'Test',
                apiDefinition: processedApiDefinition,
                templateSet: {
                    class: requiredTemplates.classFragment,
                    method: requiredTemplates.methodFragment,
                    request: requiredTemplates.requestFragment
                }
            });
            confirmOutputStructure(generatedCustomCode, 'string', 'Custom code output type is incorrect');
        };
    }));

    // Register the collected tasks with the orchestrator and begin execution
    validationOrchestrator.initiateFocus('Code Generation Validation Process');
    validationOrchestrator.appendTasks(verificationTasks);
    await validationOrchestrator.commenceExecution();
}

// Start the entire verification pipeline
coordinateVerificationProcess().catch(err => {
    console.error('A critical error halted the verification process:', err);
    process.exit(1);
});