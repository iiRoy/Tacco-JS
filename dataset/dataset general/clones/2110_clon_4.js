const pathUtil = {
    currentDirectory: '/mock/test/directory',
    separator: '/',
    join: function(...segments) {
        return segments.filter(s => s !== '').join(this.separator);
    },
    resolve: function(...segments) {
        let fullPath = this.join(...segments);
        const parts = fullPath.split(this.separator);
        const resolvedParts = [];
        for (const part of parts) {
            if (part === '..') {
                if (resolvedParts.length > 0) {
                    resolvedParts.pop();
                }
            } else if (part !== '.' && part !== '') {
                resolvedParts.push(part);
            }
        }
        return this.separator + resolvedParts.join(this.separator);
    }
};

function pathConstructor(...segments) {
    return pathUtil.resolve(pathUtil.currentDirectory, pathUtil.join(...segments));
}

const expectedOutcomes = {
    helpPattern: /^\sUsage:/,
    invalidArgsPattern: /^Error: Invalid usage!\n?$/,
    invalidSvgPattern: /^Error: Unable to load file \(fail\): .*missing\.svg\n?$/,
    invalidDataPattern: /^Error: Invalid data file: .*missing\.json\n?$/,
    testSvgPattern: /^.*test.svg .*test.png png 100% 1x 0:0:16:16 16:16\n?$/,
    testJsonPattern: new RegExp(".*test.svg .*32h.png png 100% 2x 0:0:16:16 32:32\n"
        + ".*test.svg .*32w.png png 100% 2x 0:0:16:16 32:32\n"
        + ".*test.svg .*2.5x16.png png 100% 2.5x 0:0:16:16 40:40\n"
        + ".*test.svg .*16-16.png png 100% 1x 0:0:16:16 16:16\n"
        + ".*test.svg .*32-32.png png 100% 2x 0:0:16:16 32:32\n"
        + ".*test.svg .*64-32.png png 100% 4x 0:4:16:8 64:32\n"
        + ".*test.svg .*32-64.png png 100% 4x 4:0:8:16 32:64\n"
        + ".*test.svg .*64-32-pad.png png 100% 2x -8:0:32:16 64:32\n"
        + ".*test.svg .*32-64-pad.png png 100% 2x 0:-8:16:32 32:64\n"
        + ".*test.svg .*offset.png png 100% 4x 8:8:8:8 32:32\n"
        + ".*test.svg .*jpeg-low.jpg jpeg 1% 20x 0:0:16:16 320:320\n"
        + ".*test.svg .*jpeg-high.jpg jpeg 99% 20x 0:0:16:16 320:320\n"
        + ".*test.svg .*36h.png png 100% 2x -1:-1:18:18 36:36\n"
        + ".*test.svg .*36w.png png 100% 2x -1:-1:18:18 36:36\n"
        + ".*test.svg .*2.5x18.png png 100% 2.5x -1:-1:18:18 45:45\n"
        + ".*test.svg .*18-18.png png 100% 1x -1:-1:18:18 18:18\n")
};

const shellUtil = {
    launchExecutable: function(executablePath, argumentList, executionOptions, completionCallback) {
        setTimeout(() => {
            let currentError = null;
            let currentStdout = '';
            let currentStderr = '';

            const binaryLocation = pathConstructor('..', 'bin', 'index.js');

            if (executablePath !== binaryLocation) {
                currentError = new Error('Executable path mismatch');
                currentStderr = 'Error: Executable path mismatch\n';
            } else if (argumentList.length === 0 || argumentList.includes('help') || argumentList.includes('--help') || argumentList.includes('-h')) {
                currentStdout = ` Usage: svgexport <input> <output> [options]
   <input>   SVG source file or JSON configuration file
   <output>  Output file (e.g., image.png) or directory for multiple outputs
   [options] Additional options (e.g., width, height, format)
`;
            } else if (argumentList.includes('invalid')) {
                currentError = new Error('Invalid usage!');
                currentStderr = 'Error: Invalid usage!\n';
            } else if (argumentList.includes('missing.svg')) {
                currentError = new Error('Unable to load file (fail): ' + pathConstructor('missing.svg'));
                currentStderr = `Error: Unable to load file (fail): ${pathConstructor('missing.svg')}\n`;
            } else if (argumentList.includes('missing.json')) {
                currentError = new Error('Invalid data file: ' + pathConstructor('missing.json'));
                currentStderr = `Error: Invalid data file: ${pathConstructor('missing.json')}\n`;
            } else if (argumentList.includes('test.svg')) {
                currentStdout = `${pathConstructor('test.svg')} ${pathConstructor('exported', 'test.png')} png 100% 1x 0:0:16:16 16:16\n`;
            } else if (argumentList.includes('test.json')) {
                currentStdout = `
${pathConstructor('test.svg')} ${pathConstructor('exported', '32h.png')} png 100% 2x 0:0:16:16 32:32
${pathConstructor('test.svg')} ${pathConstructor('exported', '32w.png')} png 100% 2x 0:0:16:16 32:32
${pathConstructor('test.svg')} ${pathConstructor('exported', '2.5x16.png')} png 100% 2.5x 0:0:16:16 40:40
${pathConstructor('test.svg')} ${pathConstructor('exported', '16-16.png')} png 100% 1x 0:0:16:16 16:16
${pathConstructor('test.svg')} ${pathConstructor('exported', '32-32.png')} png 100% 2x 0:0:16:16 32:32
${pathConstructor('test.svg')} ${pathConstructor('exported', '64-32.png')} png 100% 4x 0:4:16:8 64:32
${pathConstructor('test.svg')} ${pathConstructor('exported', '32-64.png')} png 100% 4x 4:0:8:16 32:64
${pathConstructor('test.svg')} ${pathConstructor('exported', '64-32-pad.png')} png 100% 2x -8:0:32:16 64:32
${pathConstructor('test.svg')} ${pathConstructor('exported', '32-64-pad.png')} png 100% 2x 0:-8:16:32 32:64
${pathConstructor('test.svg')} ${pathConstructor('exported', 'offset.png')} png 100% 4x 8:8:8:8 32:32
${pathConstructor('test.svg')} ${pathConstructor('exported', 'jpeg-low.jpg')} jpeg 1% 20x 0:0:16:16 320:320
${pathConstructor('test.svg')} ${pathConstructor('exported', 'jpeg-high.jpg')} jpeg 99% 20x 0:0:16:16 320:320
${pathConstructor('test.svg')} ${pathConstructor('exported', '36h.png')} png 100% 2x -1:-1:18:18 36:36
${pathConstructor('test.svg')} ${pathConstructor('exported', '36w.png')} png 100% 2x -1:-1:18:18 36:36
${pathConstructor('test.svg')} ${pathConstructor('exported', '2.5x18.png')} png 100% 2.5x -1:-1:18:18 45:45
${pathConstructor('test.svg')} ${pathConstructor('exported', '18-18.png')} png 100% 1x -1:-1:18:18 18:18
`.trim() + '\n';
            } else {
                currentError = new Error('Unrecognized CLI command');
                currentStderr = 'Error: Unrecognized CLI command\n';
            }

            completionCallback(currentError, currentStdout, currentStderr);
        }, 50);
    }
};

const renderTool = {
    processData: function(inputConfiguration, completionHandler) {
        setTimeout(() => {
            let currentError = null;
            let inputIdentifier;
            if (typeof inputConfiguration === 'string') {
                inputIdentifier = inputConfiguration;
            } else if (inputConfiguration && inputConfiguration.input) {
                inputIdentifier = inputConfiguration.input;
            }

            if (inputIdentifier && inputIdentifier.includes('missing.svg')) {
                currentError = new Error(`Error: Unable to load file (fail): ${pathConstructor('missing.svg')}`);
            } else if (inputIdentifier && inputIdentifier.includes('missing.json')) {
                currentError = new Error(`Error: Invalid data file: ${pathConstructor('missing.json')}`);
            } else if (inputIdentifier && (inputIdentifier.includes('test.svg') || inputIdentifier.includes('test.json'))) {
                // No error for valid cases
            } else {
                currentError = new Error('Error: Unrecognized rendering input');
            }
            completionHandler(currentError);
        }, 50);
    }
};

const assertionLibrary = {
    totalTests: 0,
    failedTests: 0,
    issueLog: [],

    assertCondition: function(condition, message) {
        this.totalTests++;
        if (!condition) {
            this.failedTests++;
            this.issueLog.push(`FAIL: ${message}`);
            throw new Error(`Assertion Failed: ${message}`);
        }
    },

    assertPatternMatch: function(actual, pattern, message) {
        this.totalTests++;
        if (!pattern.test(actual)) {
            this.failedTests++;
            this.issueLog.push(`FAIL: ${message} - Expected "${actual}" to match "${pattern.source}"`);
            throw new Error(`Assertion Failed: ${message}`);
        }
    },

    assertErrorMatch: function(error, pattern, message = 'Error should match pattern') {
        this.totalTests++;
        if (!error || !pattern.test(error.message || error.toString())) {
            this.failedTests++;
            this.issueLog.push(`FAIL: ${message} - Expected error "${error ? (error.message || error.toString()) : 'no error'}" to match "${pattern.source}"`);
            throw new Error(`Assertion Failed: ${message}`);
        }
    },

    assertNoErrors: function(error, message = 'No error expected') {
        this.totalTests++;
        if (error) {
            this.failedTests++;
            this.issueLog.push(`FAIL: ${message} - Received error: ${error.message || error.toString()}`);
            throw new Error(`Assertion Failed: ${message}`);
        }
    },

    generateSummary: function() {
        return `Overall tests: ${this.totalTests}, Failures: ${this.failedTests}`;
    }
};

function executeCommandLine(argumentArray, outcomeDetails, completionCallback) {
    shellUtil.launchExecutable(
        pathConstructor('..', 'bin', 'index.js'),
        argumentArray,
        { currentWorkingDir: pathUtil.currentDirectory },
        (err, stdOut, stdErr) => {
            try {
                if (!err) {
                    if (outcomeDetails.stderr) {
                        assertionLibrary.assertPatternMatch(stdErr.toString(), outcomeDetails.stderr, `CLI stderr for ${argumentArray.join(' ')}`);
                    }
                    if (outcomeDetails.stdout) {
                        assertionLibrary.assertPatternMatch(stdOut.toString(), outcomeDetails.stdout, `CLI stdout for ${argumentArray.join(' ')}`);
                    }
                }
                if (outcomeDetails.done) { // This is the original 'done' callback
                    outcomeDetails.done(err);
                }
                completionCallback(err); // Resolve or reject the promise for test runner
            } catch (assertionError) {
                completionCallback(assertionError); // Pass assertion errors back
            }
        }
    );
}

const testRunner = {
    testGroups: [],
    runAll: async function() {
        console.log('Initiating Test Execution...');
        for (const testGroup of this.testGroups) {
            console.log(`\nProcessing Group: ${testGroup.groupTitle}`);
            const groupTimeout = testGroup.timeLimit || 5000;

            for (const individualTest of testGroup.testCases) {
                console.log(`  Executing: ${individualTest.caseName}`);
                try {
                    const testPromise = new Promise((resolve, reject) => {
                        const testCompletion = (err) => {
                            if (err) reject(err);
                            else resolve();
                        };
                        try {
                            individualTest.action(testCompletion);
                        } catch (e) {
                            reject(e);
                        }
                    });

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error(`Test case timed out after ${groupTimeout}ms`)), groupTimeout)
                    );

                    await Promise.race([testPromise, timeoutPromise]);
                    console.log(`    [✓] ${individualTest.caseName}`);
                } catch (e) {
                    console.log(`    [✗] ${individualTest.caseName} - ${e.message}`);
                    assertionLibrary.issueLog.push(`GLOBAL FAILURE: ${testGroup.groupTitle} - ${individualTest.caseName} - ${e.message}`);
                    assertionLibrary.failedTests++;
                }
            }
        }
        console.log('\nTest Execution Concluded.');
        const summary = assertionLibrary.generateSummary();
        console.log(summary);
        if (assertionLibrary.failedTests > 0) {
            console.error('\nDetected Failures:');
            assertionLibrary.issueLog.forEach(msg => console.error(msg));
            // throw new Error('Tests did not pass'); // For a real CI environment
        }
    },
    addGroup: function(title, limit, cases) {
        this.testGroups.push({
            groupTitle: title,
            timeLimit: limit,
            testCases: cases
        });
    }
};

testRunner.addGroup('Rendering Engine', 5000, [
    {
        caseName: 'missing svg source',
        action: function(complete) {
            renderTool.processData({
                "input" : pathConstructor('missing.svg'),
                "output" : pathConstructor('exported', 'missing.png')
            }, function(err) {
                assertionLibrary.assertErrorMatch(err, expectedOutcomes.invalidSvgPattern);
                complete();
            });
        }
    },
    {
        caseName: 'invalid data file source',
        action: function(complete) {
            renderTool.processData(pathConstructor('missing.json'), function(err) {
                assertionLibrary.assertErrorMatch(err, expectedOutcomes.invalidDataPattern);
                complete();
            });
        }
    },
    {
        caseName: 'valid svg source',
        action: function(complete) {
            renderTool.processData({
                "input" : pathConstructor('test.svg'),
                "output" : pathConstructor('exported', 'test.png')
            }, function(err) {
                assertionLibrary.assertNoErrors(err);
                complete();
            });
        }
    },
    {
        caseName: 'valid json source',
        action: function(complete) {
            renderTool.processData(pathConstructor('test.json'), function(err) {
                assertionLibrary.assertNoErrors(err);
                complete();
            });
        }
    }
]);

testRunner.addGroup('Command Line Interface', 5000, [
    {
        caseName: 'no arguments',
        action: function(complete) {
            executeCommandLine([], {
                stderr : /^$/,
                stdout : expectedOutcomes.helpPattern,
                done : complete
            }, complete);
        }
    },
    {
        caseName: 'help argument',
        action: function(complete) {
            executeCommandLine([ 'help' ], {
                stderr : /^$/,
                stdout : expectedOutcomes.helpPattern,
                done : complete
            }, complete);
        }
    },
    {
        caseName: '--help argument',
        action: function(complete) {
            executeCommandLine([ '--help' ], {
                stderr : /^$/,
                stdout : expectedOutcomes.helpPattern,
                done : complete
            }, complete);
        }
    },
    {
        caseName: '-h argument',
        action: function(complete) {
            executeCommandLine([ '-h' ], {
                stderr : /^$/,
                stdout : expectedOutcomes.helpPattern,
                done : complete
            }, complete);
        }
    },
    {
        caseName: 'invalid arguments',
        action: function(complete) {
            executeCommandLine([ 'invalid' ], {
                stderr : expectedOutcomes.invalidArgsPattern,
                stdout : /^$/,
                done : complete
            }, complete);
        }
    },
    {
        caseName: 'missing svg via cli',
        action: function(complete) {
            executeCommandLine([ 'missing.svg', pathUtil.join('exported', 'missing.png') ], {
                stderr : expectedOutcomes.invalidSvgPattern,
                stdout : /^$/,
                done : complete
            }, complete);
        }
    },
    {
        caseName: 'invalid data file via cli',
        action: function(complete) {
            executeCommandLine([ 'missing.json' ], {
                stderr : expectedOutcomes.invalidDataPattern,
                stdout : /^$/,
                done : complete
            }, complete);
        }
    },
    {
        caseName: 'valid svg via cli',
        action: function(complete) {
            executeCommandLine([ 'test.svg', pathUtil.join('exported', 'test.png') ], {
                stderr : /^$/,
                stdout : expectedOutcomes.testSvgPattern,
                done : complete
            }, complete);
        }
    },
    {
        caseName: 'valid json via cli',
        action: function(complete) {
            executeCommandLine([ 'test.json' ], {
                stderr : /^$/,
                stdout : expectedOutcomes.testJsonPattern,
                done : complete
            }, complete);
        }
    }
]);

// Start the test execution
testRunner.runAll();