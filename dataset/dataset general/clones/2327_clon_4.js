const { strict: checkValue } = require('assert');
const { spawn: runExternal } = require('child_process');
const { existsSync: doesExist, rmSync: deletePath, mkdirSync: makePath } = require('fs');

// --- Custom Test Runner ---
const testContainers = [];
let activeContainer = null;

function defineContainer(containerName, containerSetup) {
    const priorContainer = activeContainer;
    activeContainer = { designation: containerName, cases: [], setupHooks: [] };
    testContainers.push(activeContainer);
    containerSetup();
    activeContainer = priorContainer;
}

function defineCase(caseDescription, caseImplementation) {
    if (!activeContainer) {
        throw new Error("Test cases must be defined within a container.");
    }
    activeContainer.cases.push({ description: caseDescription, implementation: caseImplementation });
}

function beforeAllInContainer(hookFunction) {
    if (!activeContainer) {
        throw new Error("Setup hooks must be defined within a container.");
    }
    activeContainer.setupHooks.push(hookFunction);
}

async function runAllContainers() {
    for (const container of testContainers) {
        console.log(`\nContainer: ${container.designation}`);
        for (const hook of container.setupHooks) {
            await hook();
        }
        for (const testCase of container.cases) {
            try {
                let completionResolver;
                const completionPromise = new Promise(resolve => { completionResolver = resolve; });

                const isCallbackExpected = testCase.implementation.length === 1;
                let result;

                if (isCallbackExpected) {
                    result = testCase.implementation(completionResolver);
                } else {
                    result = testCase.implementation();
                }

                if (result instanceof Promise) {
                    await result;
                } else if (isCallbackExpected) {
                    await completionPromise;
                }
                console.log(`  ✔ ${testCase.description}`);
            } catch (error) {
                console.error(`  ✖ ${testCase.description}`);
                console.error(error);
                process.exit(1);
            }
        }
    }
    console.log("\nAll containers executed successfully!");
}

// --- Utility Functions ---

const commandMap = new Map([
    ['create', 'create'], ['remove', 'remove'], ['generate', 'create'], ['g', 'create'],
    ['console', 'console'], ['c', 'console'], ['server', 'server'], ['s', 'server'],
    ['init', 'init'], ['new', 'init'], ['help', 'help'], ['info', 'info']
]);

function obtainCanonicalCommand(inputAlias) {
    return commandMap.get(inputAlias) || inputAlias;
}

function invokeTool(mainCommand, ...restArgs) {
    const operationCompletion = restArgs.pop(); // The last argument is always the callback
    const executionArgs = [mainCommand, ...restArgs, '--output-directory', 'tmp'];

    const subprocessHandle = runExternal('./bin/tower', executionArgs);
    let capturedOutput = '';
    let capturedError = '';

    subprocessHandle.stdout.setEncoding('utf-8');
    subprocessHandle.stdout.on('data', (dataChunk) => {
        capturedOutput += dataChunk;
    });

    subprocessHandle.stderr.setEncoding('utf-8');
    subprocessHandle.stderr.on('data', (dataChunk) => {
        capturedError += dataChunk;
    });

    subprocessHandle.on('close', (exitCode) => {
        operationCompletion(capturedError ? new Error(capturedError) : null, capturedOutput);
    });

    subprocessHandle.on('error', (processError) => {
        operationCompletion(processError, null);
    });
}

function establishTestWorkspace() {
    const workspacePath = 'tmp';
    if (doesExist(workspacePath)) {
        deletePath(workspacePath, { recursive: true, force: true });
    }
    makePath(workspacePath);
}

// --- Test Definitions ---

defineContainer('application-interface', function() {
    beforeAllInContainer(establishTestWorkspace);

    defineCase('should resolve command aliases', function() {
        checkValue('create' === obtainCanonicalCommand('create'));
        checkValue('remove' === obtainCanonicalCommand('remove'));
        checkValue('create' === obtainCanonicalCommand('generate'));
        checkValue('create' === obtainCanonicalCommand('g'));
        checkValue('console' === obtainCanonicalCommand('console'));
        checkValue('console' === obtainCanonicalCommand('c'));
        checkValue('server' === obtainCanonicalCommand('server'));
        checkValue('server' === obtainCanonicalCommand('s'));
        checkValue('init' === obtainCanonicalCommand('init'));
        checkValue('init' === obtainCanonicalCommand('new'));
        checkValue('help' === obtainCanonicalCommand('help'));
        checkValue('info' === obtainCanonicalCommand('info'));
    });

    defineCase('should display version on `tool -v`', function(completion) {
        invokeTool('-v', function(issue, outcome) {
            checkValue('0.5.0' === outcome.trim());
            completion();
        });
    });

    defineContainer('information-display', function() {
        defineCase('should print system information', function(completion) {
            invokeTool('info', function(issue, outcome) {
                checkValue(!issue);
                completion();
            });
        });
    });

    defineContainer('new-project', function() {
        defineCase('should scaffold a new application', function(completion) {
            invokeTool('new', 'app1', function(issue, outcome) {
                checkValue(!issue);
                checkValue(doesExist('tmp/app1/app.js'));
                checkValue(doesExist('tmp/app1/README.md'));
                completion();
            });
        });
    });

    defineContainer('code-generation', function() {
        defineCase('should trigger the generator logic', function(completion) {
            completion(); // This test remains a placeholder as in original
        });
    });
});

// Execute all defined test containers
runAllContainers();