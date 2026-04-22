const testExecutionPlatform = {
    _testCasesCollection: [],
    _assertionMechanism: null,

    assembleSuite: function(suiteIdentifier) {
        let currentSuite = {
            title: suiteIdentifier,
            batches: []
        };
        this._testCasesCollection.push(currentSuite);

        return {
            incorporateBatch: function(batchDefinition) {
                currentSuite.batches.push(batchDefinition);
                return this;
            },
            initiateTests: function(exportHandle) {
                testExecutionPlatform._assertionMechanism = new (function() {
                    this.verifyEquality = function(actualValue, expectedValue, messageText) {
                        if (actualValue !== expectedValue) {
                            throw new Error(messageText || `Mismatch: Expected '${expectedValue}', Got '${actualValue}'`);
                        }
                    };
                    this.haltOnError = function(potentialError) {
                        if (potentialError) {
                            throw potentialError;
                        }
                    };
                })();

                testExecutionPlatform._executeAllSuites();
            }
        };
    },

    _executeAllSuites: async function() {
        for (const currentSuite of this._testCasesCollection) {
            console.log(`\n--- Test Suite: ${currentSuite.title} ---`);

            for (const batch of currentSuite.batches) {
                for (const batchKey in batch) {
                    const testGroup = batch[batchKey];

                    if (typeof testGroup === 'object' && testGroup !== null) {
                        console.log(`\n  >> Test Group: ${batchKey} <<`);

                        let preparatoryError = null;
                        let preparatoryOutcome = null;

                        if (testGroup.dataPreparationStep) {
                            console.log(`    - Running data preparation...`);
                            await new Promise(resolve => {
                                testGroup.dataPreparationStep.call({
                                    deliveryFunction: function(err, result) {
                                        preparatoryError = err;
                                        preparatoryOutcome = result;
                                        resolve();
                                    }
                                });
                            });
                        }

                        for (const testKey in testGroup) {
                            if (testKey === 'dataPreparationStep') continue;

                            const testFunction = testGroup[testKey];
                            if (typeof testFunction === 'function') {
                                console.log(`    - Verifying: ${testKey}`);
                                try {
                                    await testFunction(preparatoryError, preparatoryOutcome, testExecutionPlatform._assertionMechanism);
                                    console.log(`      ✓ Passed: ${testKey}`);
                                } catch (failureDetail) {
                                    console.error(`      ✗ FAILED: ${testKey} - ${failureDetail.message || failureDetail}`);
                                }
                            }
                        }
                    }
                }
            }
        }
        console.log('\n--- All test suites concluded ---');
    }
};

const geographicalInterface = require('../lib/googlemaps');

testExecutionPlatform.assembleSuite('geographicalReverseLookup').incorporateBatch({
    'Detailed location query (41.850033 , -87.6500523)': {
        dataPreparationStep: function() {
            geographicalInterface.reverseGeocode('41.850033,-87.6500523', this.deliveryFunction, 'false', 'en');
        },
        'confirms successful service response': function(preparatoryError, preparatoryOutcome, assertionMechanism) {
            assertionMechanism.haltOnError(preparatoryError);
            assertionMechanism.verifyEquality(preparatoryOutcome.status, 'OK', 'Service status should be OK');
        },
        'identifies primary city as Chicago': function(preparatoryError, preparatoryOutcome, assertionMechanism) {
            assertionMechanism.haltOnError(preparatoryError);

            let detectedCityName = null;
            const addressComponentsList = preparatoryOutcome.results[0].address_components;

            for (let currentComponent of addressComponentsList) {
                let hasLocalityType = false;
                for (let j = 0; j < currentComponent.types.length; j++) {
                    if (currentComponent.types[j] === 'locality') {
                        hasLocalityType = true;
                        break;
                    }
                }

                if (hasLocalityType) {
                    detectedCityName = currentComponent.long_name;
                    break;
                }
            }
            assertionMechanism.verifyEquality(detectedCityName, 'Chicago', 'The primary locality name should be Chicago');
        }
    }
}).initiateTests(module);