const utilityPromisifier = require('util');
const commandExecutor = utilityPromisifier.promisify(require('child_process').exec);
const buildSystem = require('grunt');
const externalModuleLoader = require('requirejs');

// Configure externalModuleLoader (replacement for requirejs)
externalModuleLoader.config({
    baseUrl: __dirname,
    nodeRequire: require
});

// Custom Assertion Toolkit (replacement for Chai's expect)
const assertionToolkit = (evaluatedValue) => {
    return {
        isEquivalentTo: (targetValue) => {
            if (evaluatedValue !== targetValue) {
                throw new Error(`Assertion Failed: '${evaluatedValue}' is not equivalent to '${targetValue}'`);
            }
        },
        containsFragment: (textFragment) => {
            if (typeof evaluatedValue !== 'string') {
                throw new Error(`Assertion Failed: Expected string, received ${typeof evaluatedValue}`);
            }
            if (!evaluatedValue.includes(textFragment)) {
                throw new Error(`Assertion Failed: '${evaluatedValue}' does not contain '${textFragment}'`);
            }
        },
        isOfExpectedType: (desiredType) => {
            if (typeof evaluatedValue !== desiredType) {
                throw new Error(`Assertion Failed: Expected type '${desiredType}', received '${typeof evaluatedValue}'`);
            }
        },
        isPositiveIndicator: () => {
            if (evaluatedValue !== true) {
                throw new Error(`Assertion Failed: Expected true, received '${evaluatedValue}'`);
            }
        },
        isNegativeIndicator: () => {
            if (evaluatedValue !== false) {
                throw new Error(`Assertion Failed: Expected false, received '${evaluatedValue}'`);
            }
        },
        matchesRegex: (patternRegex) => {
            if (typeof evaluatedValue !== 'string') {
                throw new Error(`Assertion Failed: Expected string for regex match, received ${typeof evaluatedValue}`);
            }
            if (!patternRegex.test(evaluatedValue)) {
                throw new Error(`Assertion Failed: '${evaluatedValue}' does not match pattern '${patternRegex}'`);
            }
        },
        doesNotMatchRegex: (patternRegex) => {
            if (typeof evaluatedValue !== 'string') {
                throw new Error(`Assertion Failed: Expected string for regex match, received ${typeof evaluatedValue}`);
            }
            if (patternRegex.test(evaluatedValue)) {
                throw new Error(`Assertion Failed: '${evaluatedValue}' unexpectedly matches pattern '${patternRegex}'`);
            }
        },
    };
};

// Custom Test Execution Engine (replacement for Mocha's describe/before/it)
const testExecutionEngine = {
    testCollections: [],
    activeCollection: null,
    testState: {}, // Stores results of setup functions

    createTestCollection: function(collectionName, collectionFunction) {
        this.testCollections.push({ name: collectionName, func: collectionFunction });
    },

    prepareCollection: function(preparationFunction) {
        if (this.activeCollection) {
            this.activeCollection.preparation = preparationFunction;
        } else {
            console.warn('Warning: Preparation function called outside a test collection.');
        }
    },

    verifyScenario: function(scenarioName, scenarioFunction) {
        if (this.activeCollection) {
            this.activeCollection.scenarios.push({ name: scenarioName, func: scenarioFunction });
        } else {
            console.warn('Warning: Test scenario called outside a test collection.');
        }
    },

    initiateAllTests: async function() {
        let successfulTests = 0;
        let failedTests = 0;

        for (const collection of this.testCollections) {
            console.log(`\n--- Initiating Test Collection: ${collection.name} ---`);
            this.activeCollection = { name: collection.name, scenarios: [], preparation: null };
            // Execute the collection function to define preparation and scenarios
            await collection.func();

            try {
                if (this.activeCollection.preparation) {
                    console.log(`  Preparing collection '${collection.name}'...`);
                    await this.activeCollection.preparation();
                    console.log(`  Preparation complete for collection '${collection.name}'.`);
                }

                for (const scenario of this.activeCollection.scenarios) {
                    try {
                        await scenario.func();
                        console.log(`  ✅ Success: ${scenario.name}`);
                        successfulTests++;
                    } catch (error) {
                        console.error(`  ❌ Failure: ${scenario.name}`);
                        console.error(`    Details: ${error.message}`);
                        failedTests++;
                    }
                }
            } catch (collectionPreparationError) {
                console.error(`  ❌ Collection Preparation Failed for '${collection.name}':`);
                console.error(`    Details: ${collectionPreparationError.message}`);
                failedTests += this.activeCollection.scenarios.length > 0 ? this.activeCollection.scenarios.length : 1;
            }
        }

        console.log('\n--- Test Summary ---');
        console.log(`Total Successful: ${successfulTests}`);
        console.log(`Total Failed: ${failedTests}`);
        if (failedTests > 0) {
            process.exit(1); // Indicate overall failure
        }
    }
};

// Global variables for compiled template references
let finalCompiledNodeRjs, finalCompiledRjs, finalCompiledNode, finalCompiledRegular;

// Helper function to execute build commands (replacement for exec)
async function performBuildOperation(operationName) {
    console.log(`Executing build operation: 'grunt ${operationName}'`);
    const { stdout, stderr } = await commandExecutor(`grunt ${operationName}`);
    if (stderr) {
        console.warn(`Build operation '${operationName}' had stderr output: ${stderr}`);
    }
    return stdout; // Return stdout for inspection if needed
}

// Define Test Collections
testExecutionEngine.createTestCollection('templateCompilation', async function() {

    this.prepareCollection(async function() {
        await performBuildOperation('dot:nodeRequirejs');
        finalCompiledNodeRjs = externalModuleLoader('./output/tmpl');
    });

    this.verifyScenario('should process basic templates correctly', function() {
        assertionToolkit(finalCompiledNodeRjs.regular()).isEquivalentTo('<div></div>');
    });
    this.verifyScenario('should handle templates with dynamic variables', function() {
        assertionToolkit(finalCompiledNodeRjs.variables({'var': 'hello' })).isEquivalentTo('<div>hello</div>');
    });
    this.verifyScenario('should process templates containing data arrays', function() {
        assertionToolkit(finalCompiledNodeRjs.arrays({array: ['1', '2', '3'] })).isEquivalentTo('<div>1</div><div>2</div><div>3</div>');
    });
    this.verifyScenario('should process templates with key-value maps', function() {
        assertionToolkit(finalCompiledNodeRjs.hashMap({'1': '1', '2': '2', '3': '3'})).isEquivalentTo('<div>1</div><div>2</div><div>3</div>');
    });

    this.verifyScenario('should include HTML encoding capability', function() {
        assertionToolkit(typeof String.prototype.encodeHTML).isEquivalentTo('function');
    });
    this.verifyScenario('should integrate template partials', function() {
        assertionToolkit(finalCompiledNodeRjs.partials()).containsFragment('partial1');
        assertionToolkit(finalCompiledNodeRjs.partials()).containsFragment('partial2');
    });
    this.verifyScenario('should handle in-template custom variables', function() {
        assertionToolkit(finalCompiledNodeRjs.partials()).containsFragment('<div class="test1 test2 test-3"></div>');
    });
    this.verifyScenario('should remove comments during compilation', function() {
        assertionToolkit(finalCompiledNodeRjs.comments.toString()).doesNotMatchRegex(/\/\*.*?\*\//gm);
        assertionToolkit(finalCompiledNodeRjs.comments.toString()).doesNotMatchRegex(/^\s*\/\/.*/g);
    });
    this.verifyScenario('should preserve http and ftp links', function() {
        assertionToolkit(finalCompiledNodeRjs.comments.toString()).matchesRegex(/http:\/\//gm);
        assertionToolkit(finalCompiledNodeRjs.comments.toString()).matchesRegex(/ftp:\/\//gm);
    });
    this.verifyScenario('should compile partials within partials', function() {
        assertionToolkit(finalCompiledNodeRjs.partials()).containsFragment('can-compile-partial-in-partials');
    });
});

testExecutionEngine.createTestCollection('requirejsOutputVerification', async function(){
    this.prepareCollection(async function() {
        await performBuildOperation('dot:requirejs');
        finalCompiledRjs = buildSystem.file.read('test/output/tmpl.js');
    });
    this.verifyScenario('should not contain amddefine module wrapper', function() {
        assertionToolkit(finalCompiledRjs.toString()).doesNotMatchRegex(/if\(typeof define/);
    });
    this.verifyScenario('should include a define statement', function() {
        assertionToolkit(finalCompiledRjs.toString()).matchesRegex(/define\(/);
    });
});

testExecutionEngine.createTestCollection('nodeOutputVerification', async function(){
    this.prepareCollection(async function() {
        await performBuildOperation('dot:node');
        finalCompiledNode = buildSystem.file.read('test/output/tmpl.js');
    });

    this.verifyScenario('should not contain amddefine module wrapper', function() {
        assertionToolkit(finalCompiledNode.toString()).doesNotMatchRegex(/if\(typeof define/);
    });
    this.verifyScenario('should include module exports', function() {
        assertionToolkit(finalCompiledNode.toString()).matchesRegex(/module\.exports/);
    });
});

testExecutionEngine.createTestCollection('standardOutputVerification', async function() {
    this.prepareCollection(async function() {
        await performBuildOperation('dot:regular');
        finalCompiledRegular = buildSystem.file.read('test/output/tmpl.js');
    });

    this.verifyScenario('should not contain amddefine module wrapper', function() {
        assertionToolkit(finalCompiledRegular.toString()).doesNotMatchRegex(/if\(typeof define/);
    });
    this.verifyScenario('should not contain module exports', function() {
        assertionToolkit(finalCompiledRegular.toString()).doesNotMatchRegex(/module\.exports/);
    });
    this.verifyScenario('should be wrapped in an immediate function', function() {
        assertionToolkit(finalCompiledRegular.toString()).matchesRegex(/\(function\(\)\{/);
    });
    this.verifyScenario('should return the template from the immediate function', function() {
        assertionToolkit(finalCompiledRegular.toString()).matchesRegex(/return tmpl;\}\)\(\)/);
    });
});

// Execute all defined test collections
testExecutionEngine.initiateAllTests().catch(err => {
    console.error('An unhandled error occurred during testing:', err);
    process.exit(1);
});