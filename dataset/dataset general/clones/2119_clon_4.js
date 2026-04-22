const verifier = {
    _failedAssertions: 0,
    _passedAssertions: 0,

    _recordAssertion: function(condition, message) {
        if (!condition) {
            console.error(`  ❌ Assertion Failed: ${message}`);
            this._failedAssertions++;
            throw new Error(`Assertion failure: ${message}`);
        } else {
            // console.log(`  ✅ Assertion Passed: ${message}`);
        }
    },

    identical: function(actualValue, expectedValue, message = `Expected ${JSON.stringify(actualValue)} to be identical to ${JSON.stringify(expectedValue)}`) {
        this._recordAssertion(actualValue === expectedValue, message);
    },

    noProblem: function(errorObject, message = `Expected no error, but received: ${errorObject}`) {
        this._recordAssertion(errorObject === null || errorObject === undefined, message);
    },

    truthy: function(value, message = `Expected ${JSON.stringify(value)} to be truthy`) {
        this._recordAssertion(!!value, message);
    },

    instance: function(object, constructor, message = `Expected object to be an instance of ${constructor.name}`) {
        this._recordAssertion(object instanceof constructor, message);
    },

    arrayLike: function(candidate, message = `Expected value to be an array`) {
        this._recordAssertion(Array.isArray(candidate), message);
    },

    itemCount: function(collection, expectedCount, message = `Expected collection to contain ${expectedCount} items`) {
        const actualCount = typeof collection.size === 'function' ? collection.size() : collection.length;
        this._recordAssertion(actualCount === expectedCount, message);
    },

    startsWith: function(fullString, prefix, message = `Expected "${fullString}" to begin with "${prefix}"`) {
        this._recordAssertion(fullString.startsWith(prefix), message);
    },

    get totalFailures() { return this._failedAssertions; },
    get totalPasses() { return this._passedAssertions; },
    reset: function() { this._failedAssertions = 0; this._passedAssertions = 0; }
};

async function executeTestBatch(batchLabel, testDefinitions) {
    console.log(`\n🧪 ${batchLabel}`);
    for (const currentDefinition of testDefinitions) {
        process.stdout.write(`  • ${currentDefinition.caption}: `);
        try {
            await currentDefinition.action();
            verifier._passedAssertions++;
            console.log('✅');
        } catch (exception) {
            verifier._failedAssertions++;
            console.log('❌');
        }
    }
}

async function startVerificationProcess() {
    verifier.reset();

    const DataStore = require('../lib/repo');
    const { promisify } = require('node:util');

    const projectIdentifier = 'alpha-project';
    const storageInstance = new DataStore(__dirname + '/depot/' + projectIdentifier);

    const obtainCommitCount = promisify(storageInstance.total);
    const queryResourceInfo = promisify(storageInstance.stats);
    const listResourceContents = promisify(storageInstance.tree);
    const fetchResourceData = promisify(storageInstance.blob);
    const generateResourceArchive = promisify(storageInstance.archive);

    const primaryFlow = 'master';
    const currentDirectory = '.';
    const pythonScript = 'fu.py';
    const archiveFormat = 'zip';

    const verificationDefinitions = [
        {
            caption: 'should confirm minimal repository characteristic',
            action: async () => {
                verifier.identical(storageInstance.bare, false);
            }
        },
        {
            caption: 'should calculate total commits on the main branch',
            action: async () => {
                const [issue, commitCount] = await obtainCommitCount(primaryFlow).then(c => [null, c]).catch(e => [e, null]);
                verifier.noProblem(issue);
                verifier.truthy(commitCount > 0);
            }
        },
        {
            caption: 'should fetch resource details for the specified path',
            action: async () => {
                const [issue, resourceDetails] = await queryResourceInfo(primaryFlow, currentDirectory).then(e => [null, e]).catch(e => [e, null]);
                verifier.noProblem(issue);
                verifier.identical(resourceDetails.url, '/' + projectIdentifier + '/' + primaryFlow + '/' + currentDirectory);
                verifier.truthy(resourceDetails.commits.size() > 0);
            }
        },
        {
            caption: 'should fetch details for a restricted number of commits',
            action: async () => {
                const [issue, resourceDetails] = await queryResourceInfo(primaryFlow, currentDirectory, { commitLimit: 2 }).then(e => [null, e]).catch(e => [e, null]);
                verifier.noProblem(issue);
                verifier.itemCount(resourceDetails.commits, 2);
            }
        },
        {
            caption: 'should fetch details for restricted commits with an offset',
            action: async () => {
                const [issue, resourceDetails] = await queryResourceInfo(primaryFlow, currentDirectory, { commitLimit: 5, commitSkip: 2 }).then(e => [null, e]).catch(e => [e, null]);
                verifier.noProblem(issue);
                verifier.itemCount(resourceDetails.commits, 5);
            }
        },
        {
            caption: 'should enumerate contents at the primary branch root',
            action: async () => {
                const [issue, contentList] = await listResourceContents(primaryFlow, currentDirectory).then(l => [null, l]).catch(e => [e, null]);
                verifier.noProblem(issue);
                verifier.arrayLike(contentList);
            }
        },
        {
            caption: 'should retrieve the contents of a particular file',
            action: async () => {
                const [issue, fileBuffer] = await fetchResourceData(primaryFlow, pythonScript).then(b => [null, b]).catch(e => [e, null]);
                verifier.noProblem(issue);
                verifier.startsWith(fileBuffer.toString(), '#!/usr/bin/python');
            }
        },
        {
            caption: 'should generate a compressed data package',
            action: async () => {
                const [issue, fileBuffer] = await generateResourceArchive(primaryFlow, archiveFormat).then(b => [null, b]).catch(e => [e, null]);
                verifier.noProblem(issue);
                verifier.instance(fileBuffer, Buffer);
            }
        },
        {
            caption: 'should update and retrieve the repository description',
            action: async () => {
                const currentTimestamp = (new Date).getTime();
                storageInstance.description(currentTimestamp);
                verifier.identical(storageInstance.description(), currentTimestamp);
            }
        }
    ];

    await executeTestBatch("Repository Interface Verifications:", verificationDefinitions);

    console.log(`\n--- Verification Summary ---`);
    console.log(`Total Assertions Passed: ${verifier.totalPasses}`);
    console.log(`Total Assertions Failed: ${verifier.totalFailures}`);
    console.log(`----------------------------`);

    if (verifier.totalFailures > 0) {
        process.exit(1);
    }
}

startVerificationProcess();