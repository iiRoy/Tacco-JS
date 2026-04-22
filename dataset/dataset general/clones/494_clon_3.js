var assert = require('chai').assert; // Utilize Chai's assert style for variety
var Persona = require('../../models/user'); // Renamed model from User to Persona

// Global test variables for persistent state across tests:
var ORIGINAL_PERSONAS_LIST;
var PERSONA_ALPHA, PERSONA_BETA, PERSONA_GAMMA, PERSONA_DELTA;

// --- Utility Functions for Assertions ---

/**
 * Validates if a given object is a legitimate Persona model instance.
 * If an expected Persona data object is also provided, it ensures the object's
 * core properties (like ID and name) match the expected values.
 * @param {object} candidateObj - The object to validate as a Persona.
 * @param {object} [expectedPersonaData] - Optional: An object representing the expected Persona's data.
 */
function validatePersonaObject(candidateObj, expectedPersonaData) {
    assert.isObject(candidateObj, 'Expected input to be an object for Persona validation.');
    assert.instanceOf(candidateObj, Persona, 'Expected object to be an instance of Persona model.');

    if (expectedPersonaData) {
        // Ensure core attributes match the anticipated values.
        const keyProps = ['id', 'name'];
        for (const propName of keyProps) {
            assert.strictEqual(candidateObj[propName], expectedPersonaData[propName],
                `Property '${propName}' of validated persona should match expected data.`);
        }
    }
}

/**
 * Confirms that a specific Persona is present within a given collection of Personas.
 * It also asserts that the Persona appears exactly once and its details are correct.
 * @param {Array<object>} personaCollection - The array of Persona objects to search within.
 * @param {object} targetPersona - The Persona object expected to be found.
 */
function verifyCollectionIncludesPersona(personaCollection, targetPersona) {
    assert.isArray(personaCollection, 'Expected a collection (array) of personas.');
    let foundMatch = false;

    for (const currentPersona of personaCollection) {
        if (currentPersona.id === targetPersona.id) {
            assert.isFalse(foundMatch, 'Persona found more than once in the collection!');
            validatePersonaObject(currentPersona, targetPersona);
            foundMatch = true;
        }
    }
    assert.isTrue(foundMatch, `Target Persona with ID ${targetPersona.id} was not found in the collection.`);
}

/**
 * Confirms that a specific Persona is absent from a given collection of Personas.
 * @param {Array<object>} personaCollection - The array of Persona objects to search within.
 * @param {object} unwantedPersona - The Persona object expected to be absent.
 */
function verifyCollectionExcludesPersona(personaCollection, unwantedPersona) {
    assert.isArray(personaCollection, 'Expected a collection (array) of personas.');
    for (const currentPersona of personaCollection) {
        assert.notStrictEqual(currentPersona.id, unwantedPersona.id,
            `Unwanted Persona with ID ${unwantedPersona.id} was unexpectedly found in the collection.`);
    }
}

/**
 * Fetches a Persona's social connections (following and others) and validates them
 * against expected lists. This function orchestrates several assertions.
 * @param {object} currentPersona - The Persona whose social graph is being checked.
 * @param {Array<object>} expectedFollowed - List of Personas currentPersona should be following.
 * @param {Array<object>} expectedUnfollowedOthers - List of Personas currentPersona should NOT be following, but should be listed as 'others'.
 * @param {Function} completionHandler - Callback (err, actualFollowed, actualOthers) when checks are complete.
 */
function checkPersonaSocialGraph(currentPersona, expectedFollowed, expectedUnfollowedOthers, completionHandler) {
    currentPersona.retrieveSocialConnections((opError, actualFollowed, actualOthers) => {
        if (opError) {
            return completionHandler(opError);
        }

        // --- Validate 'followed' list ---
        assert.isArray(actualFollowed, 'Actual "followed" list should be an array.');
        assert.lengthOf(actualFollowed, expectedFollowed.length, 'Actual "followed" count mismatch.');
        for (const expFollowedPersona of expectedFollowed) {
            verifyCollectionIncludesPersona(actualFollowed, expFollowedPersona);
        }
        for (const expOtherPersona of expectedUnfollowedOthers) {
            verifyCollectionExcludesPersona(actualFollowed, expOtherPersona);
        }

        // --- Validate 'others' list ---
        assert.isArray(actualOthers, 'Actual "others" list should be an array.');
        for (const expOtherPersona of expectedUnfollowedOthers) {
            verifyCollectionIncludesPersona(actualOthers, expOtherPersona);
        }
        for (const expFollowedPersona of expectedFollowed) {
            verifyCollectionExcludesPersona(actualOthers, expFollowedPersona);
        }

        // Neither list should include the Persona itself.
        verifyCollectionExcludesPersona(actualFollowed, currentPersona);
        verifyCollectionExcludesPersona(actualOthers, currentPersona);

        return completionHandler(null, actualFollowed, actualOthers);
    });
}

// --- Test Suites ---

suite('Persona Model Operations:', function () {

    // --- Basic Persona Management (CRUD-like) ---

    testCase('Retrieve initial set of personas', function (done) {
        Persona.fetchAll((opError, currentPersonas) => {
            if (opError) return done(opError);

            assert.isArray(currentPersonas, 'Initial retrieval should return an array.');
            currentPersonas.forEach(personaItem => {
                validatePersonaObject(personaItem); // Only validate structure, no specific data yet.
            });

            ORIGINAL_PERSONAS_LIST = currentPersonas; // Store for later comparison.
            done();
        });
    });

    testCase('Register a new persona: Alpha', function (done) {
        const alphaName = 'Alpha User Identifier';
        Persona.registerNew({ personaName: alphaName }, (opError, newPersona) => {
            if (opError) return done(opError);

            validatePersonaObject(newPersona);
            assert.isNumber(newPersona.id, 'New persona should have a numeric ID.');
            assert.strictEqual(newPersona.name, alphaName, 'New persona\'s name should match input.');

            PERSONA_ALPHA = newPersona;
            done();
        });
    });

    testCase('Locate persona Alpha by its identifier', function (done) {
        Persona.locateById(PERSONA_ALPHA.id, (opError, foundPersona) => {
            if (opError) return done(opError);
            validatePersonaObject(foundPersona, PERSONA_ALPHA);
            done();
        });
    });

    testCase('Re-list all personas; Alpha should be present', function (done) {
        Persona.fetchAll((opError, updatedPersonas) => {
            if (opError) return done(opError);

            // The order is not guaranteed, so we check for length and inclusion.
            assert.isArray(updatedPersonas, 'Updated persona list should be an array.');
            assert.lengthOf(updatedPersonas, ORIGINAL_PERSONAS_LIST.length + 1,
                'Persona list length should increment by one after adding Alpha.');
            verifyCollectionIncludesPersona(updatedPersonas, PERSONA_ALPHA);

            done();
        });
    });

    testCase('Modify persona Alpha details', function (done) {
        const originalName = PERSONA_ALPHA.name;
        PERSONA_ALPHA.name = `(Modified) ${originalName}`; // Prepend instead of append.
        PERSONA_ALPHA.persistChanges((opError) => {
            done(opError); // Pass error or null.
        });
    });

    testCase('Retrieve persona Alpha again to confirm modification', function (done) {
        Persona.locateById(PERSONA_ALPHA.id, (opError, fetchedPersona) => {
            if (opError) return done(opError);
            validatePersonaObject(fetchedPersona, PERSONA_ALPHA);
            done();
        });
    });

    testCase('Decommission persona Alpha', function (done) {
        // Add a guard to ensure persona exists before attempting deletion.
        if (!PERSONA_ALPHA || !PERSONA_ALPHA.id) {
            return done(new Error('Persona Alpha was not properly initialized for deletion.'));
        }
        PERSONA_ALPHA.removeRecord((opError) => {
            done(opError);
        });
    });

    testCase('Verify persona Alpha\'s absence after decommissioning', function (done) {
        Persona.locateById(PERSONA_ALPHA.id, (opError, absentPersona) => {
            assert.notExists(absentPersona, 'Persona Alpha should no longer exist after deletion.');
            assert.isObject(opError, 'Expected an error object when fetching a deleted persona.');
            assert.instanceOf(opError, Error, 'Error for missing persona should be an instance of Error.');
            assert.include(opError.message, 'not found', 'Error message should indicate persona not found.');
            done();
        });
    });

    testCase('Re-list all personas; should revert to initial state length', function (done) {
        Persona.fetchAll((opError, finalPersonas) => {
            if (opError) return done(opError);

            assert.isArray(finalPersonas, 'Final persona list should be an array.');
            assert.lengthOf(finalPersonas, ORIGINAL_PERSONAS_LIST.length,
                'Persona list length should be back to initial count after Alpha\'s removal.');
            verifyCollectionExcludesPersona(finalPersonas, PERSONA_ALPHA);

            done();
        });
    });

    // --- Two-Persona Social Graph Interactions ---

    testCase('Establish personas Beta and Gamma concurrently', function (done) {
        const betaName = 'Beta Connections';
        const gammaName = 'Gamma Socializer';
        let completionCount = 0;
        const expectedCreations = 2;

        const processNewPersona = (opError, newPersona) => {
            if (opError) return done(opError);

            validatePersonaObject(newPersona);

            // Assign personas based on their generated names.
            if (newPersona.name === betaName) {
                PERSONA_BETA = newPersona;
            } else if (newPersona.name === gammaName) {
                PERSONA_GAMMA = newPersona;
            } else {
                return done(new Error(`Unexpected persona name received: ${newPersona.name}`));
            }

            completionCount++;
            if (completionCount === expectedCreations) {
                assert.exists(PERSONA_BETA, 'Persona Beta must be created.');
                assert.exists(PERSONA_GAMMA, 'Persona Gamma must be created.');
                done();
            }
        };

        Persona.registerNew({ personaName: betaName }, processNewPersona);
        Persona.registerNew({ personaName: gammaName }, processNewPersona);
    });

    testCase('Examine Beta\'s initial social graph (no connections)', function (done) {
        checkPersonaSocialGraph(PERSONA_BETA, [], [PERSONA_GAMMA], (opError, followed, others) => {
            if (opError) return done(opError);
            // Additional check for 'others' count, considering initial users.
            assert.lengthOf(others, ORIGINAL_PERSONAS_LIST.length + 1,
                'Beta\'s "others" count should include Gamma plus initial users.');
            done();
        });
    });

    testCase('Examine Gamma\'s initial social graph (no connections)', function (done) {
        checkPersonaSocialGraph(PERSONA_GAMMA, [], [PERSONA_BETA], (opError, followed, others) => {
            if (opError) return done(opError);
            // Additional check for 'others' count.
            assert.lengthOf(others, ORIGINAL_PERSONAS_LIST.length + 1,
                'Gamma\'s "others" count should include Beta plus initial users.');
            done();
        });
    });

    testCase('Beta initiates connection with Gamma', function (done) {
        PERSONA_BETA.initiateConnection(PERSONA_GAMMA, (opError) => {
            // Optional: Log the action or perform a quick sanity check.
            console.log(`Persona Beta is now connecting with Gamma.`);
            done(opError);
        });
    });

    testCase('Beta attempts to connect with Gamma redundantly (idempotency check)', function (done) {
        PERSONA_BETA.initiateConnection(PERSONA_GAMMA, (opError) => {
            // No error should occur, indicating idempotency.
            assert.isNotOk(opError, 'Redundant connection attempt should not yield an error.');
            done();
        });
    });

    testCase('Re-examine Beta\'s social graph: should now follow Gamma', function (done) {
        checkPersonaSocialGraph(PERSONA_BETA, [PERSONA_GAMMA], [], done);
    });

    testCase('Re-examine Gamma\'s social graph: Beta should appear as an "other"', function (done) {
        checkPersonaSocialGraph(PERSONA_GAMMA, [], [PERSONA_BETA], done);
    });

    testCase('Beta terminates connection with Gamma', function (done) {
        PERSONA_BETA.terminateConnection(PERSONA_GAMMA, (opError) => {
            done(opError);
        });
    });

    testCase('Beta attempts to disconnect from Gamma redundantly (idempotency check)', function (done) {
        PERSONA_BETA.terminateConnection(PERSONA_GAMMA, (opError) => {
            assert.isNotOk(opError, 'Redundant disconnection attempt should not yield an error.');
            done();
        });
    });

    testCase('Final check of Beta\'s social graph: no longer following Gamma', function (done) {
        checkPersonaSocialGraph(PERSONA_BETA, [], [PERSONA_GAMMA], done);
    });

    testCase('Final check of Gamma\'s social graph: Beta should be back in "others"', function (done) {
        checkPersonaSocialGraph(PERSONA_GAMMA, [], [PERSONA_BETA], done);
    });

    // --- Complex Social Graph with Deletions ---

    testCase('Register a new persona: Delta', function (done) {
        const deltaName = 'Delta Coordinator';
        Persona.registerNew({ personaName: deltaName }, (opError, newPersona) => {
            if (opError) return done(opError);

            validatePersonaObject(newPersona);
            assert.strictEqual(newPersona.name, deltaName, 'Delta persona name mismatch.');

            PERSONA_DELTA = newPersona;
            done();
        });
    });

    testCase('Establish complex connections: Beta follows Gamma, Gamma follows Delta', function (done) {
        let pendingOperations = 2;

        const onConnectComplete = (opError) => {
            if (opError) return done(opError);
            pendingOperations--;
            if (pendingOperations === 0) {
                done();
            }
        };

        PERSONA_BETA.initiateConnection(PERSONA_GAMMA, onConnectComplete);
        PERSONA_GAMMA.initiateConnection(PERSONA_DELTA, onConnectComplete);
    });

    testCase('Validate all personas\' social graphs after complex connections', function (done) {
        let pendingChecks = 3;

        const onGraphCheckComplete = (opError) => {
            if (opError) return done(opError);
            pendingChecks--;
            if (pendingChecks === 0) {
                done();
            }
        };

        checkPersonaSocialGraph(PERSONA_BETA, [PERSONA_GAMMA], [PERSONA_DELTA], onGraphCheckComplete);
        checkPersonaSocialGraph(PERSONA_GAMMA, [PERSONA_DELTA], [PERSONA_BETA], onGraphCheckComplete);
        checkPersonaSocialGraph(PERSONA_DELTA, [], [PERSONA_BETA, PERSONA_GAMMA], onGraphCheckComplete);
    });

    testCase('Decommission persona Beta', function (done) {
        PERSONA_BETA.removeRecord((opError) => {
            done(opError);
        });
    });

    testCase('Validate Gamma and Delta social graphs after Beta\'s removal', function (done) {
        let pendingChecks = 2;

        const onGraphCheckComplete = (opError) => {
            if (opError) return done(opError);
            pendingChecks--;
            if (pendingChecks === 0) {
                done();
            }
        };
        // Beta was following Gamma, so Gamma should no longer be followed by Beta.
        // Gamma was following Delta. Delta was not following anyone.
        checkPersonaSocialGraph(PERSONA_GAMMA, [PERSONA_DELTA], [], onGraphCheckComplete); // Beta should be gone from 'others'
        checkPersonaSocialGraph(PERSONA_DELTA, [], [PERSONA_GAMMA], onGraphCheckComplete); // Beta should be gone from 'others'
    });

    testCase('Decommission persona Delta', function (done) {
        PERSONA_DELTA.removeRecord((opError) => {
            done(opError);
        });
    });

    testCase('Validate Gamma\'s social graph after Delta\'s removal', function (done) {
        // Gamma was following Delta. Delta is gone. So Gamma should follow no one.
        checkPersonaSocialGraph(PERSONA_GAMMA, [], [], done);
    });

    testCase('Decommission persona Gamma', function (done) {
        PERSONA_GAMMA.removeRecord((opError) => {
            done(opError);
        });
    });

});