const assertionProvider = require('chai'); // Retaining `require` as it's a global, not an identifier defined in the original code.
const fileSystemOps = require('fs'); // Renamed from `fs`
const DataVault = require('./index.js'); // Renamed from `Hexastore`

let dataLedgerInstance; // Renamed from `db`

// Custom assertion object to replace `chai.assert`
const validationAgent = {
    // Reimplementation of `assert.equal`
    verifyEquality: (actual, expected, message) => {
        if (actual !== expected) {
            throw new Error(message || `Expected ${JSON.stringify(actual)} to be strictly equal to ${JSON.stringify(expected)}`);
        }
    },
    // Reimplementation of `assert.deepEqual`
    verifyDeepEquality: (actual, expected, message) => {
        try {
            require('node:assert').deepStrictEqual(actual, expected, message);
        } catch (e) {
            throw new Error(message || e.message);
        }
    },
    // Reimplementation of `assert.doesNotThrow`
    verifyNoThrownError: (operationFunction, message) => {
        try {
            operationFunction();
        } catch (e) {
            throw new Error(message || `Operation unexpectedly generated an error: ${e.message}`);
        }
    },
    // Internal helper for fuzzy element comparison (mimicking `chai-fuzzy` behavior for observed usage)
    _fuzzyElementMatch: (val1, val2) => {
        // For primitive types (string, number, boolean, null, undefined), use loose equality to handle '1' == 1
        if (typeof val1 !== 'object' || val1 === null || typeof val2 !== 'object' || val2 === null) {
            return val1 == val2;
        }
        // For objects/arrays, use deep strict equality as observed in test cases
        try {
            require('node:assert').deepStrictEqual(val1, val2);
            return true;
        } catch (e) {
            return false;
        }
    },
    // Internal helper for deep fuzzy array comparison
    _deepFuzzyArrayMatch: (arr1, arr2) => {
        if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (!validationAgent._fuzzyElementMatch(arr1[i], arr2[i])) {
                return false;
            }
        }
        return true;
    },
    // Reimplementation of `assert.containOneLike`
    verifyCollectionContainsLike: (collection, targetItem, message) => {
        if (!Array.isArray(collection)) {
            throw new Error("Collection for verifyCollectionContainsLike must be an array.");
        }
        let foundMatch = false;
        for (const element of collection) {
            if (validationAgent._deepFuzzyArrayMatch(element, targetItem)) {
                foundMatch = true;
                break;
            }
        }
        if (!foundMatch) {
            throw new Error(message || `Expected collection to contain an element like ${JSON.stringify(targetItem)}`);
        }
    }
};

// Custom test runner structure (replacing Mocha's `describe`/`it`/`beforeEach`/`before`/`after`)
const testExecutionEngine = {
    allTestGroups: [],
    currentActiveGroup: null,

    defineGroup: function(groupName, setupFunction) {
        const previousGroup = this.currentActiveGroup;
        this.currentActiveGroup = {
            name: groupName,
            scenarios: [],
            preScenarioHooks: [],
            preGroupHooks: [],
            postGroupHooks: []
        };
        this.allTestGroups.push(this.currentActiveGroup);
        setupFunction();
        this.currentActiveGroup = previousGroup;
    },

    defineScenario: function(scenarioName, testFunction) {
        if (!this.currentActiveGroup) {
            throw new Error("Scenario must be defined within a test group.");
        }
        this.currentActiveGroup.scenarios.push({ name: scenarioName, run: testFunction });
    },

    addPreScenarioHook: function(hookFunction) {
        if (!this.currentActiveGroup) {
            throw new Error("Pre-scenario hook must be defined within a test group.");
        }
        this.currentActiveGroup.preScenarioHooks.push(hookFunction);
    },

    addPreGroupHook: function(hookFunction) {
        if (!this.currentActiveGroup) {
            throw new Error("Pre-group hook must be defined within a test group.");
        }
        this.currentActiveGroup.preGroupHooks.push(hookFunction);
    },

    addPostGroupHook: function(hookFunction) {
        if (!this.currentActiveGroup) {
            throw new Error("Post-group hook must be defined within a test group.");
        }
        this.currentActiveGroup.postGroupHooks.push(hookFunction);
    },

    // Main execution logic
    runAll: async function() {
        console.log("Starting test run...");
        let totalPassed = 0;
        let totalFailed = 0;

        for (const group of this.allTestGroups) {
            console.log(`\n--- Test Group: ${group.name} ---`);
            try {
                for (const hook of group.preGroupHooks) {
                    await new Promise((resolve, reject) => {
                        const done = (err) => err ? reject(err) : resolve();
                        const result = hook(done);
                        if (result instanceof Promise) result.then(resolve).catch(reject);
                        else if (hook.length === 0) resolve(); // Synchronous hook
                    });
                }

                for (const scenario of group.scenarios) {
                    for (const hook of group.preScenarioHooks) {
                        await new Promise((resolve, reject) => {
                            const done = (err) => err ? reject(err) : resolve();
                            const result = hook(done);
                            if (result instanceof Promise) result.then(resolve).catch(reject);
                            else if (hook.length === 0) resolve(); // Synchronous hook
                        });
                    }

                    try {
                        console.log(`  Running scenario: ${scenario.name}`);
                        await new Promise((resolve, reject) => {
                            const done = (err) => err ? reject(err) : resolve();
                            const result = scenario.run(done);
                            if (result instanceof Promise) result.then(resolve).catch(reject);
                            else if (scenario.run.length === 0) resolve(); // Synchronous test
                        });
                        console.log(`  ✓ Passed: ${scenario.name}`);
                        totalPassed++;
                    } catch (error) {
                        console.error(`  ✗ Failed: ${scenario.name}`);
                        console.error(`    Error: ${error.message}`);
                        totalFailed++;
                    }
                }

                for (const hook of group.postGroupHooks) {
                    await new Promise((resolve, reject) => {
                        const done = (err) => err ? reject(err) : resolve();
                        const result = hook(done);
                        if (result instanceof Promise) result.then(resolve).catch(reject);
                        else if (hook.length === 0) resolve(); // Synchronous hook
                    });
                }
            } catch (groupError) {
                console.error(`\n!!! Group Setup/Teardown Failed for ${group.name} !!!`);
                console.error(`    Error: ${groupError.message}`);
                totalFailed++;
            }
        }

        console.log(`\n--- Test Run Summary ---`);
        console.log(`Total Scenarios: ${totalPassed + totalFailed}`);
        console.log(`Successful: ${totalPassed}`);
        console.log(`Failed: ${totalFailed}`);

        if (totalFailed > 0) {
            process.exit(1);
        }
    }
};


// Test definitions using the custom runner
testExecutionEngine.defineGroup('InitializationProcedure', function() {
    testExecutionEngine.defineScenario('constructs new data ledger', function() {
        validationAgent.verifyNoThrownError(function() {
            dataLedgerInstance = new DataVault();
        });
    });
    testExecutionEngine.defineScenario('new data ledger starts empty', function() {
        validationAgent.verifyEquality(0, dataLedgerInstance.size());
    });
});

testExecutionEngine.defineGroup('CreationMechanism', function() {
    testExecutionEngine.addPreScenarioHook(function() {
        dataLedgerInstance.clear();
    });

    testExecutionEngine.defineGroup('depositOperations', function() {
        testExecutionEngine.defineScenario('deposit single entry', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.put(['hello world', 'is', 'sentence']);
            });
            validationAgent.verifyEquality(1, dataLedgerInstance.size());
        });
        testExecutionEngine.defineScenario('deposit multiple entries', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.putAll([
                    ['hey', 'hey', 'ho'],
                    ['hey', 'hay', 'ho'],
                    ['hi', 'hey', 'ha'],
                    ['hi', 'hey', 'hon']
                ]);
            });
            validationAgent.verifyEquality(4, dataLedgerInstance.size());
        });
    });

    testExecutionEngine.defineGroup('insertOperations', function() {
        testExecutionEngine.defineScenario('insertSPO_record', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.addSPO({
                    'a': {
                        'b': {
                            'c': true
                        }
                    }
                });
            });
            validationAgent.verifyEquality(1, dataLedgerInstance.size());
            validationAgent.verifyDeepEquality(dataLedgerInstance.getSPO(), {
                'a': {
                    'b': {
                        'c': true
                    }
                }
            });
        });
        testExecutionEngine.defineScenario('insertSOP_record', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.addSOP({
                    'aa': {
                        'bb': {
                            'cc': true
                        }
                    }
                });
            });
            validationAgent.verifyEquality(1, dataLedgerInstance.size());
            validationAgent.verifyDeepEquality(dataLedgerInstance.getSOP(), {
                'aa': {
                    'bb': {
                        'cc': true
                    }
                }
            });
        });
        testExecutionEngine.defineScenario('insertOSP_record', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.addOSP({
                    'aaa': {
                        'bbb': {
                            'ccc': true
                        }
                    }
                });
            });
            validationAgent.verifyEquality(1, dataLedgerInstance.size());
            validationAgent.verifyDeepEquality(dataLedgerInstance.getOSP(), {
                'aaa': {
                    'bbb': {
                        'ccc': true
                    }
                }
            });
        });
        testExecutionEngine.defineScenario('insertOPS_record', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.addOPS({
                    'aaaa': {
                        'bbbb': {
                            'cccc': true
                        }
                    }
                });
            });
            validationAgent.verifyEquality(1, dataLedgerInstance.size());
            validationAgent.verifyDeepEquality(dataLedgerInstance.getOPS(), {
                'aaaa': {
                    'bbbb': {
                        'cccc': true
                    }
                }
            });
        });
        testExecutionEngine.defineScenario('insertPSO_record', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.addPSO({
                    'aaaaa': {
                        'bbbbb': {
                            'ccccc': true
                        }
                    }
                });
            });
            validationAgent.verifyEquality(1, dataLedgerInstance.size());
            validationAgent.verifyDeepEquality(dataLedgerInstance.getPSO(), {
                'aaaaa': {
                    'bbbbb': {
                        'ccccc': true
                    }
                }
            });
        });
        testExecutionEngine.defineScenario('insertPOS_record', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.addPOS({
                    'aaaaaa': {
                        'bbbbbb': {
                            'cccccc': true
                        }
                    }
                });
            });
            validationAgent.verifyEquality(1, dataLedgerInstance.size());
            validationAgent.verifyDeepEquality(dataLedgerInstance.getPOS(), {
                'aaaaaa': {
                    'bbbbbb': {
                        'cccccc': true
                    }
                }
            });
        });
    });

    testExecutionEngine.defineGroup('insertJavaScriptObject', function() {
        testExecutionEngine.defineScenario('insertJSObjectAsPath_method', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.addJSObjectAsPath({
                    know: "joe",
                    lol: {
                        wow: "hab"
                    },
                    a: 1
                }, "bob");
            });
            validationAgent.verifyEquality(4, dataLedgerInstance.size());
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ['bob', 'know', 'joe', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ['bob', 'a', '1', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ['bob/lol', 'wow', 'hab', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ['bob', 'lol', 'bob/lol', true]);
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.addJSObjectAsPath({
                    a: {
                        b: 1
                    }
                }, "bob", ">");
            });
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ['bob', 'a', 'bob>a', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ['bob>a', 'b', '1', true]);
        });
        testExecutionEngine.defineScenario('insertJSObjectAsJSON_method', function() {
            let addedIdentifier;
            validationAgent.verifyNoThrownError(function() {
                addedIdentifier = dataLedgerInstance.addJSObjectAsJSON({
                    know: "joe",
                    lol: {
                        wow: "hab"
                    },
                    a: 1
                });
            });
            validationAgent.verifyEquality(4, dataLedgerInstance.size());
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), [addedIdentifier, 'know', 'joe', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), [addedIdentifier, 'a', '1', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), [addedIdentifier, 'lol', '{"wow":"hab"}', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ['{"wow":"hab"}', 'wow', 'hab', true]);
        });
        testExecutionEngine.defineScenario('insertJSObjectAsUUID_method', function() {
            let generatedUUID;
            validationAgent.verifyNoThrownError(function() {
                generatedUUID = dataLedgerInstance.addJSObjectAsUUID({
                    know: "joe",
                    lol: {
                        wow: "hab"
                    },
                    a: 1
                });
            });
            validationAgent.verifyEquality(4, dataLedgerInstance.size());
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), [generatedUUID, 'know', 'joe', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), [generatedUUID, 'a', '1', true]);
        });
    });

    testExecutionEngine.defineGroup('duplicationOperations', function() {
        testExecutionEngine.addPreScenarioHook(function() {
            dataLedgerInstance.clear();
            dataLedgerInstance.putAll([
                ['hey', 'hey', 'ho'],
                ['hey', 'hay', 'ha'],
                ['hi', 'hey', 'ha'],
                ['hi', 'hey', 'hon']
            ]);
        });
        testExecutionEngine.defineScenario('duplicateSubject', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.copySubject("hey", "bobie");
            });
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ["bobie", 'hey', 'ho', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ["bobie", 'hay', 'ha', true]);
        });
        testExecutionEngine.defineScenario('duplicatePredicate', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.copyPredicate("hey", "bo");
            });
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ["hey", 'bo', 'ho', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ["hi", 'bo', 'ha', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ["hi", 'bo', 'hon', true]);
        });
        testExecutionEngine.defineScenario('duplicateObject', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.copyObject("ha", "lid");
            });
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ["hey", 'hay', 'lid', true]);
            validationAgent.verifyCollectionContainsLike(dataLedgerInstance.all(), ["hi", 'hey', 'lid', true]);
        });
    });
});

testExecutionEngine.defineGroup('RetrievalMechanism', function() {
    testExecutionEngine.addPreGroupHook(function() {
        dataLedgerInstance.clear();
        dataLedgerInstance.addSPO({
            'a': {
                'b': {
                    'c': true
                }
            }
        });
    });
    testExecutionEngine.defineGroup('queryOperations', function() {
        testExecutionEngine.defineScenario('queryXXX_method', function() {
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryXXX(['a', 'b', 'c']));
        });
        testExecutionEngine.defineScenario('querySXX_method', function() {
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.querySXX(['a', 'b', 'c']));
        });
        testExecutionEngine.defineScenario('queryXPX_method', function() {
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryXPX(['a', 'b', 'c']));
        });
        testExecutionEngine.defineScenario('queryXXO_method', function() {
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryXXO(['a', 'b', 'c']));
        });
        testExecutionEngine.defineScenario('querySPX_method', function() {
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.querySPX(['a', 'b', 'c']));
        });
        testExecutionEngine.defineScenario('querySXO_method', function() {
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.querySXO(['a', 'b', 'c']));
        });
        testExecutionEngine.defineScenario('queryXPO_method', function() {
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryXPO(['a', 'b', 'c']));
        });
        testExecutionEngine.defineScenario('querySPO_method', function() {
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.querySPO(['a', 'b', 'c']));
        });
        testExecutionEngine.defineScenario('queryDispatcher_method', function() {
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryDispatch(['a', 'b', 'c']));
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryDispatch([
                ['a'], 'b', 'c'
            ]));
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryDispatch(['a', ['b'], 'c']));
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryDispatch([
                ['a'],
                ['b'], 'c'
            ]));
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryDispatch(['a', 'b', ['c']]));
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryDispatch([
                ['a'], 'b', ['c']
            ]));
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryDispatch(['a', ['b'],
                ['c']
            ]));
            validationAgent.verifyDeepEquality([
                ['a', 'b', 'c', true]
            ], dataLedgerInstance.queryDispatch([
                ['a'],
                ['b'],
                ['c']
            ]));
        });
    });

    testExecutionEngine.defineGroup('searchOperations', function() {
        testExecutionEngine.addPreGroupHook(function(done) {
            dataLedgerInstance.importNt("smalltestdataset", done);
        });
        testExecutionEngine.defineScenario('multiple search with filter', function() {
            validationAgent.verifyEquality(72,
                dataLedgerInstance
                .search([
                    ["<bizer/bsbm/v01/instances/ProductType1>", ["predicate"],
                        ["object"]
                    ],
                    [
                        ["similar"],
                        ["predicate"],
                        ["object"]
                    ]
                ])
                .filter(function(match) {
                    return match.object2 !== match.object;
                }).length);
        });
        testExecutionEngine.defineScenario('precise search', function() {
            validationAgent.verifyEquality('<bizer/bsbm/v01/instances/StandardizationInstitution1>',
                dataLedgerInstance.search([
                    ["<bizer/bsbm/v01/instances/ProductType1>", "<dc/elements/1.1/publisher>", ["publisher"]]
                ])[0].publisher);
        });
    });
});


testExecutionEngine.defineGroup('ModificationOperations', function() {
    // This group is empty in the original, so it remains empty.
});

testExecutionEngine.defineGroup('DataImportExport', function() {
    testExecutionEngine.addPreGroupHook(function() {
        dataLedgerInstance.clear();
        dataLedgerInstance.addSPO({
            'aaa': {
                'bbb': {
                    'ccc': true
                }
            }
        });
    });
    testExecutionEngine.addPostGroupHook(function() {
        // Clean up files, suppressing errors if they don't exist
        try { fileSystemOps.unlinkSync("hexastoretest1.zip"); } catch (e) {}
        try { fileSystemOps.unlinkSync("hexastoretest1.nt"); } catch (e) {}
        try { fileSystemOps.unlinkSync("hexastoretest1.json"); } catch (e) {}
    });
    testExecutionEngine.defineScenario('json_format', function() {
        validationAgent.verifyNoThrownError(function() {
            dataLedgerInstance.exportJSON('hexastoretest1');
            dataLedgerInstance.clear();
            dataLedgerInstance.importJSON('hexastoretest1');
        });
        validationAgent.verifyEquality(1, dataLedgerInstance.size());
        validationAgent.verifyDeepEquality(dataLedgerInstance.getSPO(), {
            'aaa': {
                'bbb': {
                    'ccc': true
                }
            }
        });
    });
    testExecutionEngine.defineScenario('zip_archive', function() {
        validationAgent.verifyNoThrownError(function() {
            dataLedgerInstance.exportZip('hexastoretest1');
            dataLedgerInstance.clear();
            dataLedgerInstance.importZip('hexastoretest1');
        });
        validationAgent.verifyEquality(1, dataLedgerInstance.size());
        validationAgent.verifyDeepEquality(dataLedgerInstance.getSPO(), {
            'aaa': {
                'bbb': {
                    'ccc': true
                }
            }
        });
    });
    testExecutionEngine.defineScenario('ntriples_format', function(done) {
        validationAgent.verifyNoThrownError(function() {
            dataLedgerInstance.exportNt('hexastoretest1');
            dataLedgerInstance.clear();
            dataLedgerInstance.importNt('hexastoretest1', function() {
                validationAgent.verifyEquality(1, dataLedgerInstance.size());
                validationAgent.verifyDeepEquality(dataLedgerInstance.getSPO(), {
                    'aaa': {
                        'bbb': {
                            'ccc': true
                        }
                    }
                });
                done();
            });
        });
    });
});


testExecutionEngine.defineGroup('DeletionOperations', function() {
    testExecutionEngine.defineGroup('purgeMechanism', function() {
        testExecutionEngine.defineScenario('purge data store', function() {
            validationAgent.verifyNoThrownError(function() {
                dataLedgerInstance.clear();
            });
        });
        testExecutionEngine.defineScenario('purged data ledger is empty', function() {
            validationAgent.verifyEquality(0, dataLedgerInstance.size());
        });
    });
});


// Cloned Geometry2D object, renamed and restructured
const SpatialRelationshipProcessor = {
    universalTripleQuery: null,
    subjectObjectQuery: null,
    subjectPredicateQuery: null,
    predicateObjectQuery: null,
    subjectSpecificQuery: null,
    predicateSpecificQuery: null,
    objectSpecificQuery: null,
    subjectPredicateObjectQuery: function(inputElement) {
        const sub = inputElement[0];
        const pred = inputElement[1];
        const obj = inputElement[2];
        let outcomes = [];
        switch (pred) {
            case "inside":
                // These functions (geomParse, inside) are expected to be available by the Hexastore library.
                // For a Type IV clone of the test file, their invocation pattern is preserved.
                // Placeholder definitions are added for a runnable standalone file, assuming Hexastore provides actual implementations.
                const geometryParser = (val) => val; // Placeholder for `geomParse`
                const checkInside = (g1, g2) => true; // Placeholder for `inside`

                if (checkInside(geometryParser(sub), geometryParser(obj))) {
                    outcomes.push([sub, pred, obj, true]);
                }
                break;
        }
        return outcomes;
    }
};

// Cloned Identity object, renamed and restructured
const EquivalenceProcessor = {
    universalTripleQuery: (filterData) => null,
    subjectObjectQuery: (filterData) => [
        [filterData[0], "equivalentTo", filterData[0], true]
    ],
    subjectPredicateQuery: (filterData) => [
        [filterData[0], "equivalentTo", filterData[0], true]
    ],
    predicateObjectQuery: (filterData) => [
        [filterData[1], "equivalentTo", filterData[1], true]
    ],
    subjectSpecificQuery: (filterData) => [
        [filterData[0], "equivalentTo", filterData[0], true]
    ],
    predicateSpecificQuery: (filterData) => null,
    objectSpecificQuery: (filterData) => [
        [filterData[2], "equivalentTo", filterData[2], true]
    ],
    subjectPredicateObjectQuery: (filterData) => [
        [filterData[0], "equivalentTo", filterData[0], true]
    ]
};

// Execute all tests
testExecutionEngine.runAll();