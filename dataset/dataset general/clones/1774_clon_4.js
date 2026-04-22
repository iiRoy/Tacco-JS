'use strict';

const fileSystem = require('path');
const processCommander = require('child_process');
const utility = require('util');

const runExternalCommand = utility.promisify(processCommander.exec);

const executionConfiguration = {
    currentWorkingDirectory: fileSystem.join(__dirname, '..')
};

let overallSuccessCount = 0;
let overallFailureCount = 0;
let totalAssertionsChecked = 0;

function reportAssertion(condition, description) {
    totalAssertionsChecked++;
    if (condition) {
        console.log(`  ✓ ${description}`);
        overallSuccessCount++;
    } else {
        console.error(`  ✗ ${description} (FAILED)`);
        overallFailureCount++;
    }
}

async function executeValidationTask(taskTitle, taskCommand, expectedOutcomes) {
    console.log(`\nRunning task: "${taskTitle}"`);
    try {
        const { stdout: outputContent, stderr: errorContent } = await runExternalCommand(taskCommand, executionConfiguration);

        expectedOutcomes.forEach(outcome => {
            if (outcome.type === 'presence') {
                reportAssertion(
                    outputContent.includes(outcome.value),
                    outcome.description
                );
            } else if (outcome.type === 'absence') {
                reportAssertion(
                    !outputContent.includes(outcome.value),
                    outcome.description
                );
            }
        });

    } catch (commandError) {
        console.error(`  ✗ Command failed for "${taskTitle}": ${commandError.message}`);
        overallFailureCount++;
    }
}

const validationRoutines = [
    {
        name: 'standard_configuration',
        cmd: 'grunt htmlangular:default_options',
        checks: [
            { type: 'presence', value: '6 files passed validation', description: 'confirms standard files pass' }
        ]
    },
    {
        name: 'standard_configuration_parallel',
        cmd: 'grunt htmlangular:default_options_concurrent',
        checks: [
            { type: 'presence', value: '6 files passed validation', description: 'confirms concurrent files pass' }
        ]
    },
    {
        name: 'unwrapped_elements',
        cmd: 'grunt htmlangular:missing_wrapping',
        checks: [
            { type: 'presence', value: 'Stray start tag tr', description: 'detects unwrapped starting <tr>' },
            { type: 'presence', value: 'Stray start tag td', description: 'detects unwrapped starting <td>' },
            { type: 'presence', value: 'Stray end tag td', description: 'detects unwrapped ending <td>' },
            { type: 'presence', value: 'Stray end tag tr', description: 'detects unwrapped ending <tr>' }
        ]
    },
    {
        name: 'undefined_custom_elements',
        cmd: 'grunt htmlangular:missing_custom_tags',
        checks: [
            { type: 'presence', value: 'Element custom-tag not allowed', description: 'identifies unknown custom tag' }
        ]
    },
    {
        name: 'undefined_custom_attributes',
        cmd: 'grunt htmlangular:missing_custom_attrs',
        checks: [
            { type: 'presence', value: 'Attribute fixed-div-label not allowed', description: 'identifies unknown custom attribute' }
        ]
    },
    {
        name: 'template_file_without_extension',
        cmd: 'grunt htmlangular:template_missing_extension',
        checks: [
            { type: 'presence', value: 'Element head is missing a required instance of child element title', description: 'recognizes template as HTML' }
        ]
    },
    {
        name: 'unclosed_element',
        cmd: 'grunt htmlangular:missing_closing_tag',
        checks: [
            { type: 'presence', value: 'Unclosed element div', description: 'detects unclosed div' }
        ]
    },
    {
        name: 'incorrectly_closed_element',
        cmd: 'grunt htmlangular:improperly_closed_tag',
        checks: [
            { type: 'presence', value: 'Self-closing syntax (/>) used on a non-void HTML element', description: 'finds self-closed span' },
            { type: 'presence', value: 'Unclosed element span', description: 'finds unclosed span' }
        ]
    },
    {
        name: 'improperly_structured_nesting',
        cmd: 'grunt htmlangular:improperly_nested_tags',
        checks: [
            { type: 'presence', value: 'End tag b violates nesting rules', description: 'detects <b> closed prematurely' },
            { type: 'presence', value: 'No i element in scope but a i end tag seen', description: 'detects <i> closed too late' }
        ]
    },
    {
        name: 'invalid_angular_syntax',
        cmd: 'grunt htmlangular:improper_angular_operator',
        checks: [
            { type: 'presence', value: '& did not start a character reference. (& probably should have been escaped as &amp;.)', description: 'detects && in expression' }
        ]
    },
    {
        name: 'invalid_angular_syntax_permissive',
        cmd: 'grunt htmlangular:improper_angular_operator_relaxed',
        checks: [
            { type: 'absence', value: '& did not start a character reference. (& probably should have been escaped as &amp;.)', description: 'permissive mode ignores error' }
        ]
    }
];

async function commenceAllValidations() {
    for (const routine of validationRoutines) {
        await executeValidationTask(routine.name, routine.cmd, routine.checks);
    }

    console.log(`\n--- Validation Summary ---`);
    console.log(`Total assertions evaluated: ${totalAssertionsChecked}`);
    console.log(`Assertions passed: ${overallSuccessCount}`);
    console.log(`Assertions failed: ${overallFailureCount}`);

    if (overallFailureCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

commenceAllValidations();