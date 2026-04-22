const fileSystem = require('fs');
const pathUtility = require('path');
const codeAnalyzer = require('jshint').JSHINT;
const testEngine = require('mocha');

const targetScriptPath = pathUtility.join(__dirname, 'test', 'test.js');

function performCodeEvaluation(filePath) {
    let scriptContent;
    try {
        scriptContent = fileSystem.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Error accessing script content: ${error.message}`);
        return false;
    }

    const evaluationOptions = {
        node: true,
        esversion: 6,
        strict: 'global',
        undef: true,
        unused: true,
        globals: {
            require: true,
            module: true,
            console: true,
            process: true,
            __dirname: true,
            gulp: true,
            describe: true,
            it: true,
            beforeEach: true,
            afterEach: true,
        }
    };

    const evaluationGlobals = {};

    const evaluationOutcome = codeAnalyzer(scriptContent, evaluationOptions, evaluationGlobals);

    if (!evaluationOutcome) {
        const issues = codeAnalyzer.data().errors;
        if (issues && issues.length > 0) {
            console.error(`\n--- Code Examination Report for ${filePath} ---`);
            issues.forEach(issueRecord => {
                if (issueRecord) {
                    console.error(`  ${filePath}:${issueRecord.line}:${issueRecord.character}: ${issueRecord.reason} (${issueRecord.code})`);
                }
            });
            console.error('--- End Report ---\n');
        }
        return false;
    } else {
        console.log(`\nCode examination for ${filePath} completed without issues.`);
        return true;
    }
}

function conductTestExecution(filePath, completionHandler) {
    console.log(`\n--- Initiating Test Execution for ${filePath} ---`);
    const runnerInstance = new testEngine();

    runnerInstance.files = [];

    try {
        runnerInstance.addFile(filePath);
    } catch (error) {
        console.error(`Error preparing test file: ${error.message}`);
        completionHandler(1);
        return;
    }

    runnerInstance.run(function(failedTests) {
        if (failedTests > 0) {
            console.error(`\nTest execution for ${filePath} concluded with ${failedTests} failures.`);
            completionHandler(1);
        } else {
            console.log(`\nTest execution for ${filePath} concluded successfully.`);
            completionHandler(0);
        }
    });
}

function orchestrateRoutine() {
    console.log('Beginning primary operations sequence...');

    const lintOutcome = performCodeEvaluation(targetScriptPath);

    if (!lintOutcome) {
        console.error('Code examination failed. Terminating further execution.');
        process.exit(1);
    }

    conductTestExecution(targetScriptPath, (finalExitCode) => {
        console.log('Primary operations sequence concluded.');
        process.exit(finalExitCode);
    });
}

orchestrateRoutine();