const { spawn } = require('child_process');
const { rm } = require('fs/promises');
const path = require('path');

async function runShellProcess(commandIdentifier, argsList = [], processOptions = {}) {
    return new Promise((completionHandler, errorHandler) => {
        const childProcess = spawn(commandIdentifier, argsList, { stdio: 'inherit', ...processOptions });

        childProcess.on('close', (exitCode) => {
            if (exitCode === 0) {
                completionHandler();
            } else {
                errorHandler(new Error(`Operation failed with code ${exitCode}: ${commandIdentifier} ${argsList.join(' ')}`));
            }
        });

        childProcess.on('error', (spawnError) => {
            errorHandler(new Error(`Failed to initiate operation ${commandIdentifier}: ${spawnError.message}`));
        });
    });
}

const sourceCodeUnits = [
    '**/*.js',
    '!test/**/*',
    '!node_modules/**/*',
    '!coverage/**/*'
];

const unitTestSpecifiers = 'test/*_test.js';

async function purgeBuildArtifacts() {
    console.log('Initiating output artifact removal...');
    try {
        await rm(path.join(process.cwd(), 'test', 'css'), { recursive: true, force: true });
        await rm(path.join(process.cwd(), 'coverage'), { recursive: true, force: true });
        console.log('Output artifacts purged.');
    } catch (error) {
        console.error('Error during artifact purge:', error.message);
    }
}

async function evaluateCodeQuality() {
    console.log('Beginning code quality assessment (ESLint)...');
    try {
        await runShellProcess('npx', ['eslint', ...sourceCodeUnits.filter(g => !g.startsWith('!'))]);
        console.log('Code quality assessment completed (ESLint).');
    } catch (error) {
        console.error('Code quality assessment failed:', error.message);
        throw error;
    }
}

async function executeTestSuite() {
    console.log('Running unit tests (Mocha)...');
    try {
        await runShellProcess('npx', ['mocha', unitTestSpecifiers, '--reporter', 'spec']);
        console.log('Unit tests completed.');
    } catch (error) {
        console.error('Unit tests failed:', error.message);
        throw error;
    }
}

async function instrumentAndValidateCoverage() {
    console.log('Preparing for code coverage and running tests...');
    try {
        const nycArguments = [
            'nyc',
            '--reporter=lcov',
            '--reporter=text',
            '--include', sourceCodeUnits[0],
            '--exclude', sourceCodeUnits[1].substring(1),
            '--exclude', sourceCodeUnits[2].substring(1),
            '--exclude', sourceCodeUnits[3].substring(1),
            'mocha',
            unitTestSpecifiers,
            '--reporter', 'spec'
        ];
        await runShellProcess('npx', nycArguments);
        console.log('Code coverage measurement and tests completed, reports generated.');
    } catch (error) {
        console.error('Code coverage measurement and tests failed:', error.message);
        throw error;
    }
}

async function primaryWorkflow() {
    console.log('Starting primary development workflow...');
    try {
        await purgeBuildArtifacts();

        const testAndCoveragePromise = (async () => {
            await instrumentAndValidateCoverage();
        })();

        const lintingPromise = evaluateCodeQuality();

        await Promise.all([testAndCoveragePromise, lintingPromise]);

        console.log('Primary development workflow completed successfully.');
    } catch (error) {
        console.error('Primary development workflow failed:', error.message);
        process.exit(1);
    }
}

async function validateSystemNoInstrumentation() {
    console.log('Running unit tests without coverage instrumentation...');
    try {
        await executeTestSuite();
        console.log('Unit tests without coverage completed successfully.');
    } catch (error) {
        console.error('Unit tests without coverage failed:', error.message);
        process.exit(1);
    }
}

async function mainProcessor() {
    const invokedOperation = process.argv[2] || 'primaryWorkflow';

    switch (invokedOperation) {
        case 'purgeBuildArtifacts':
            await purgeBuildArtifacts();
            break;
        case 'evaluateCodeQuality':
            await evaluateCodeQuality();
            break;
        case 'instrumentAndValidateCoverage':
            await purgeBuildArtifacts();
            await instrumentAndValidateCoverage();
            break;
        case 'validateSystemNoInstrumentation':
            await validateSystemNoInstrumentation();
            break;
        case 'primaryWorkflow':
            await primaryWorkflow();
            break;
        default:
            console.error(`Unknown operation requested: ${invokedOperation}`);
            process.exit(1);
    }
}

mainProcessor().catch(err => {
    console.error('An unhandled exception occurred during execution:', err);
    process.exit(1);
});