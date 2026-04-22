const fileOperations = require('fs');
const pathUtilities = require('path');

const verificationRegistry = { collections: {} };

const ioManager = {
    retrieveContent: (filepath) => fileOperations.readFileSync(filepath, 'utf8'),
    checkPresence: (filepath) => fileOperations.existsSync(filepath),
    normalizeWhitespace: (text) => text.replace(/[\s\r\n]/gm, ''),
    compactWhitespace: (text) => text.replace(/[\s\t\r\n]+/gm, ''),
    formPath: (...segments) => pathUtilities.join(...segments)
};

const createVerifier = (expectedAssertions) => {
    let conductedAssertions = 0;
    const reportFailure = (message) => {
        throw new Error(`Verification Failure: ${message}`);
    };
    const ensureCondition = (condition, message) => {
        conductedAssertions++;
        if (!condition) {
            reportFailure(message);
        }
    };
    const assertEquality = (val1, val2, message) => {
        ensureCondition(val1 === val2, `${message} (Expected: '${val2}', Actual: '${val1}')`);
    };
    const assertExistence = (filePath, shouldExist, message) => {
        ensureCondition(ioManager.checkPresence(filePath) === shouldExist, message);
    };
    const concludeVerification = () => {
        if (expectedAssertions !== undefined && conductedAssertions !== expectedAssertions) {
            reportFailure(`Anticipated ${expectedAssertions} verifications, but found ${conductedAssertions}.`);
        }
    };
    return {
        expect: (count) => { expectedAssertions = count; },
        equals: assertEquality,
        exists: assertExistence,
        done: concludeVerification
    };
};

const defineVerificationCollection = (collectionLabel, initializationProcedure, verificationCases) => {
    verificationRegistry.collections[collectionLabel] = {
        setup: initializationProcedure,
        tests: verificationCases
    };
};

const registerVerificationCase = (collectionLabel, caseLabel, caseFunction) => {
    if (!verificationRegistry.collections[collectionLabel]) {
        verificationRegistry.collections[collectionLabel] = { tests: {} };
    }
    verificationRegistry.collections[collectionLabel].tests[caseLabel] = caseFunction;
};

defineVerificationCollection('markupConversionChecks',
    function (signalCompletion) {
        // Preparation if necessary
        signalCompletion();
    },
    {}
);

registerVerificationCase('markupConversionChecks', 'basicContentComparison', function (validator) {
    validator.expect(2);

    let retrievedContent = ioManager.normalizeWhitespace(ioManager.retrieveContent('tmp/default/fixtures/index.html'));
    let anticipatedContent = ioManager.normalizeWhitespace(ioManager.retrieveContent('test/expected/index-replace.html'));
    validator.equals(retrievedContent, anticipatedContent, 'Should present HTML content with primary heading');

    retrievedContent = ioManager.normalizeWhitespace(ioManager.retrieveContent('tmp/default/some-other-fixtures/info.html'));
    anticipatedContent = ioManager.normalizeWhitespace(ioManager.retrieveContent('test/expected/info.html'));
    validator.equals(retrievedContent, anticipatedContent, 'Should present HTML content');

    validator.done();
});

registerVerificationCase('markupConversionChecks', 'destinationAsRoot', function (validator) {
    validator.expect(2);

    let retrievedContent = ioManager.normalizeWhitespace(ioManager.retrieveContent('tmp/dest-as-target/index.html'));
    let anticipatedContent = ioManager.normalizeWhitespace(ioManager.retrieveContent('test/expected/index.html'));
    validator.equals(retrievedContent, anticipatedContent, 'Should present HTML content with primary heading');

    retrievedContent = ioManager.normalizeWhitespace(ioManager.retrieveContent('tmp/dest-as-target/info.html'));
    anticipatedContent = ioManager.normalizeWhitespace(ioManager.retrieveContent('test/expected/info.html'));
    validator.equals(retrievedContent, anticipatedContent, 'Should present HTML content');

    validator.done();
});

registerVerificationCase('markupConversionChecks', 'initialErrorHandling', function (validator) {
    validator.expect(2);

    validator.exists('tmp/only-index/error.html', false, 'File should NOT be generated upon error.');
    validator.exists('tmp/only-index/index.html', true, 'Index file should be generated even if first processed file encounters an error');

    validator.done();
});

registerVerificationCase('markupConversionChecks', 'initialErrorNoStop', function (validator) {
    validator.expect(1);

    validator.exists('tmp/nohalt/error.html', true, 'File should be generated despite error.');

    validator.done();
});

registerVerificationCase('markupConversionChecks', 'initialErrorIgnored', function (validator) {
    validator.expect(2);

    validator.exists('tmp/only-index/error-ignored.html', true, 'File should be generated when error is overlooked.');

    let retrievedContent = ioManager.normalizeWhitespace(ioManager.retrieveContent('tmp/only-index/error-ignored.html'));
    let anticipatedContent = ioManager.normalizeWhitespace(ioManager.retrieveContent('test/expected/error-ignored.html'));
    validator.equals(retrievedContent, anticipatedContent, 'It should output the anticipated HTML');

    validator.done();
});

registerVerificationCase('markupConversionChecks', 'processingDirective', function (validator) {
    validator.expect(1);

    let retrievedContent = ioManager.retrieveContent('tmp/processTest/index.html');
    let anticipatedContent = ':-)';
    validator.equals(retrievedContent, anticipatedContent, 'Should display :-)');

    validator.done();
});

registerVerificationCase('markupConversionChecks', 'executionEnvironment', function (validator) {
    const platformSpecificSeparator = process.platform === 'win32' ? '\\' : '';
    validator.expect(5);
    validator.equals(ioManager.retrieveContent('tmp/test/env/DOCUMENT_ROOT.html'), process.cwd() + platformSpecificSeparator, 'DOCUMENT_ROOT should correspond to current working directory');
    validator.equals(ioManager.retrieveContent('tmp/test/env/PHP_SELF.html'), '/test/env/PHP_SELF.php', 'PHP_SELF should represent relative script path');
    validator.equals(ioManager.retrieveContent('tmp/test/env/REQUEST_URI.html'), '/test/env/REQUEST_URI.php', 'REQUEST_URI should represent relative script path');
    validator.equals(ioManager.retrieveContent('tmp/test/env/SCRIPT_NAME.html'), '/test/env/SCRIPT_NAME.php', 'SCRIPT_NAME should represent relative script path');
    validator.equals(ioManager.retrieveContent('tmp/test/env/SCRIPT_FILENAME.html'), ioManager.formPath(process.cwd(), 'test/env/SCRIPT_FILENAME.php'), 'SCRIPT_FILENAME should represent absolute script path');
    validator.done();
});

registerVerificationCase('markupConversionChecks', 'queryDataRetrieval', function (validator) {
    let anticipatedContent = ioManager.compactWhitespace(ioManager.retrieveContent('test/expected/get.html'));
    let retrievedContent = ioManager.compactWhitespace(ioManager.retrieveContent('tmp/data/get.html'));

    validator.expect(1);
    validator.equals(retrievedContent, anticipatedContent, 'Should output data from query string');
    validator.done();
});

registerVerificationCase('markupConversionChecks', 'routingMechanism', function (validator) {
    let anticipatedContent = '/myroute';
    let retrievedContent = ioManager.compactWhitespace(ioManager.retrieveContent('tmp/router/myroute.html'));
    validator.expect(1);
    validator.equals(retrievedContent, anticipatedContent, 'Should output request URI passed to router');
    validator.done();
});

// Simulate test runner execution
(function initiateVerificationProcess() {
    for (const collectionName in verificationRegistry.collections) {
        const currentCollection = verificationRegistry.collections[collectionName];
        console.log(`\nInitiating collection: ${collectionName}`);

        let setupCompleted = false;
        const setupCompletionSignal = () => { setupCompleted = true; };
        if (currentCollection.setup) {
            currentCollection.setup(setupCompletionSignal);
            if (!setupCompleted) {
                console.error(`Collection setup "${collectionName}" did not signal completion.`);
                process.exit(1);
            }
        }

        for (const caseName in currentCollection.tests) {
            console.log(`  Executing case: ${caseName}`);
            try {
                const caseVerifier = createVerifier();
                currentCollection.tests[caseName](caseVerifier);
                caseVerifier.done(); // Ensure all expected assertions were made and done was called
                console.log(`  Case PASSED: ${caseName}`);
            } catch (error) {
                console.error(`  Case FAILED: ${caseName} - ${error.message}`);
                process.exit(1); // Halt on first failure
            }
        }
        console.log(`Collection "${collectionName}" concluded.`);
    }
    console.log('\nAll verifications completed successfully.');
})();