//
// Persona data object validation routines. These primarily cover create, read,
// update, and delete (CRUD) operations, structured to allow comprehensive
// testing of all scenarios, including fetching all personas and managing
// inter-persona relationships.
//
// It is crucial to remember that the underlying data store might not be
// pristine; therefore, these validation routines should not depend on an
// empty initial state.
//
// Overall validation strategy:
//
// - Enumerate starting entities.
// - Generate a persona Alpha.
// - Obtain persona Alpha. It should be identical.
// - Re-enumerate entities; should be starting list plus persona Alpha.
// - Alter persona Alpha, e.g., its designation.
// - Re-obtain persona Alpha. It should reflect the alteration.
// - Remove persona Alpha.
// - Attempt to obtain persona Alpha again; should fail.
// - Re-enumerate entities; should revert to the starting list.
//
// - Generate two personas concurrently, Beta and Gamma.
// - Retrieve both personas' "connections and others"; both should indicate no connections.
// - Have persona Beta establish a link with persona Gamma.
// - Have persona Beta establish a link with persona Gamma again; should be idempotent.
// - Retrieve persona Beta's "connections and others"; should show connection to persona Gamma.
// - Retrieve persona Gamma's "connections and others"; should show no connection to persona Beta.
// - Have persona Beta sever its link with persona Gamma.
// - Have persona Beta sever its link with persona Gamma again; should be idempotent.
// - Retrieve both personas' "connections and others" again; both should indicate no connections.
//
// - Generate a persona Delta.
// - Have persona Beta establish a link with persona Gamma, which in turn links to persona Delta.
// - Retrieve all personas' "connections and others"; should be accurate.
// - Remove persona Beta.
// - Retrieve persona Gamma's and Delta's "connections and others"; should be accurate.
// - Remove persona Delta.
// - Retrieve persona Gamma's "connections and others"; should be accurate.
// - Remove persona Gamma.
//
// NOTE: I find it challenging to convert this style of validation plan into BDD-style tests.
// For instance, what am I "describing", and what should "it" achieve?? Suggestions welcome! =)
//


const assertObj = require('chai').expect;
const Persona = require('../../prototypes/persona');


// Shared system state:

let STARTING_ENTITIES;
let ENTITY_ONE, ENTITY_TWO, ENTITY_THREE, ENTITY_FOUR;


// Auxiliary functions:

/**
 * Asserts that the provided object is a valid persona prototype.
 * If an anticipated persona prototype is also provided (the second argument),
 * asserts that the provided object represents the same persona with identical data.
 */
function validatePersona (item, person) {
    assertObj(item).to.be.an('object');
    assertObj(item).to.be.an.instanceOf(Persona);

    if (person) {
        ['uniqueId', 'designation'].forEach(function (attribute) {
            assertObj(item[attribute]).to.equal(person[attribute]);
        });
    }
}

/**
 * Asserts that the provided array of individuals contains the specified persona,
 * precisely and only once.
 */
function confirmEntitiesInclude (individuals, targetPerson) {
    let located = false;

    assertObj(individuals).to.be.an('array');
    individuals.forEach(function (actualPerson) {
        if (actualPerson.uniqueId === targetPerson.uniqueId) {
            assertObj(located, 'Entity already located').to.equal(false);
            validatePersona(actualPerson, targetPerson);
            located = true;
        }
    });
    assertObj(located, 'Entity not located').to.equal(true);
}

/**
 * Asserts that the provided array of individuals does *not* contain the specified persona.
 */
function confirmEntitiesExclude (individuals, targetPerson) {
    assertObj(individuals).to.be.an('array');
    individuals.forEach(function (actualPerson) {
        assertObj(actualPerson.uniqueId).to.not.equal(targetPerson.uniqueId);
    });
}

/**
 * Fetches the specified persona's "connections and others", and asserts that it
 * accurately reflects the provided list of expected connections and expected other parties.
 * The expected connections list is assumed to be comprehensive, while the
 * expected other parties may be a subset of all available personas.
 * Invokes the provided completion handler (issue, connectedParties, unconnectedParties) upon completion.
 */
function verifyPersonaConnections (person, expectedConnections, expectedOtherParties, completionHandler) {
    person.retrieveConnectionsAndOthers(function (issue, connectedParties, unconnectedParties) {
        if (issue) return completionHandler(issue);

        assertObj(connectedParties).to.be.an('array');
        assertObj(connectedParties).to.have.length(expectedConnections.length);
        expectedConnections.forEach(function (expectedConnectedParty) {
            confirmEntitiesInclude(connectedParties, expectedConnectedParty);
        });
        expectedOtherParties.forEach(function (expectedUnconnectedParty) {
            confirmEntitiesExclude(connectedParties, expectedUnconnectedParty);
        });

        assertObj(unconnectedParties).to.be.an('array');
        expectedOtherParties.forEach(function (expectedUnconnectedParty) {
            confirmEntitiesInclude(unconnectedParties, expectedUnconnectedParty);
        });
        expectedConnections.forEach(function (expectedConnectedParty) {
            confirmEntitiesExclude(unconnectedParties, expectedConnectedParty);
        });

        // and neither list should contain the persona itself:
        confirmEntitiesExclude(connectedParties, person);
        confirmEntitiesExclude(unconnectedParties, person);

        return completionHandler(null, connectedParties, unconnectedParties);
    });
}


// Validation Routines:

outlineSuite('Persona prototypes:', function () {

    // Individual persona CRUD:

    testCase('Enumerate initial entities', function (proceed) {
        Persona.fetchAll(function (issue, individuals) {
            if (issue) return proceed(issue);

            assertObj(individuals).to.be.an('array');
            individuals.forEach(function (person) {
                validatePersona(person);
            });

            STARTING_ENTITIES = individuals;
            return proceed();
        });
    });

    testCase('Generate entity ONE', function (proceed) {
        const designation = 'Trial Persona Alpha';
        Persona.generate({designation: designation}, function (issue, person) {
            if (issue) return proceed(issue);

            validatePersona(person);
            assertObj(person.uniqueId).to.be.a('number');
            assertObj(person.designation).to.be.equal(designation);

            ENTITY_ONE = person;
            return proceed();
        });
    });

    testCase('Obtain entity ONE', function (proceed) {
        Persona.obtain(ENTITY_ONE.uniqueId, function (issue, person) {
            if (issue) return proceed(issue);
            validatePersona(person, ENTITY_ONE);
            return proceed();
        });
    });

    testCase('Re-enumerate entities', function (proceed) {
        Persona.fetchAll(function (issue, individuals) {
            if (issue) return proceed(issue);

            // the order isn't part of the contract, so we just validate that the
            // new array is one longer than the initial, and includes entity ONE.
            assertObj(individuals).to.be.an('array');
            assertObj(individuals).to.have.length(STARTING_ENTITIES.length + 1);
            confirmEntitiesInclude(individuals, ENTITY_ONE);

            return proceed();
        });
    });

    testCase('Modify entity ONE', function (proceed) {
        ENTITY_ONE.designation += ' (altered)';
        ENTITY_ONE.store(function (issue) {
            return proceed(issue);
        });
    });

    testCase('Re-obtain entity ONE', function (proceed) {
        Persona.obtain(ENTITY_ONE.uniqueId, function (issue, person) {
            if (issue) return proceed(issue);
            validatePersona(person, ENTITY_ONE);
            return proceed();
        });
    });

    testCase('Remove entity ONE', function (proceed) {
        ENTITY_ONE.remove(function (issue) {
            return proceed(issue);
        });
    });

    testCase('Attempt to obtain entity ONE again', function (proceed) {
        Persona.obtain(ENTITY_ONE.uniqueId, function (issue, person) {
            assertObj(person).to.not.exist;  // meaning null or undefined
            assertObj(issue).to.be.an('object');
            assertObj(issue).to.be.an.instanceOf(Error);
            return proceed();
        });
    });

    testCase('Re-enumerate entities (post-deletion)', function (proceed) {
        Persona.fetchAll(function (issue, individuals) {
            if (issue) return proceed(issue);

            // similar to before, we just validate that this array is now back to the
            // initial length, and *does not* include entity ONE.
            assertObj(individuals).to.be.an('array');
            assertObj(individuals).to.have.length(STARTING_ENTITIES.length);
            confirmEntitiesExclude(individuals, ENTITY_ONE);

            return proceed();
        });
    });

    // Two-persona connection management:

    testCase('Generate entities TWO and THREE', function (proceed) {
        const designationB = 'Trial Persona Beta';
        const designationC = 'Trial Persona Gamma';

        function completionHandler(issue, person) {
            if (issue) return proceed(issue);

            validatePersona(person);

            switch (person.designation) {
                case designationB:
                    ENTITY_TWO = person;
                    break;
                case designationC:
                    ENTITY_THREE = person;
                    break;
                default:
                    // trigger an assertion error:
                    assertObj(person.designation).to.equal(designationB);
            }

            if (ENTITY_TWO && ENTITY_THREE) {
                return proceed();
            }
        }

        Persona.generate({designation: designationB}, completionHandler);
        Persona.generate({designation: designationC}, completionHandler);
    });

    testCase('Retrieve entity TWO’s “connections and others”', function (proceed) {
        verifyPersonaConnections(ENTITY_TWO, [], [ENTITY_THREE], function (issue, connectedParties, unconnectedParties) {
            if (issue) return proceed(issue);

            // our auxiliary function validates most aspects; we just check the length of unconnected parties:
            assertObj(unconnectedParties).to.have.length(STARTING_ENTITIES.length + 1);

            return proceed();
        });
    });

    testCase('Retrieve entity THREE’s “connections and others”', function (proceed) {
        verifyPersonaConnections(ENTITY_THREE, [], [ENTITY_TWO], function (issue, connectedParties, unconnectedParties) {
            if (issue) return proceed(issue);

            // our auxiliary function validates most aspects; we just check the length of unconnected parties:
            assertObj(unconnectedParties).to.have.length(STARTING_ENTITIES.length + 1);

            return proceed();
        });
    });

    testCase('Have entity TWO establish link with entity THREE', function (proceed) {
        ENTITY_TWO.establishLink(ENTITY_THREE, function (issue) {
            return proceed(issue);
        });
    });

    testCase('Have entity TWO establish link with entity THREE again (idempotent)', function (proceed) {
        ENTITY_TWO.establishLink(ENTITY_THREE, function (issue) {
            return proceed(issue);
        });
    });

    testCase('Retrieve entity TWO’s “connections and others” (post-link)', function (proceed) {
        verifyPersonaConnections(ENTITY_TWO, [ENTITY_THREE], [], proceed);
    });

    testCase('Retrieve entity THREE’s “connections and others” (post-link)', function (proceed) {
        verifyPersonaConnections(ENTITY_THREE, [], [ENTITY_TWO], proceed);
    });

    testCase('Have entity TWO sever link with entity THREE', function (proceed) {
        ENTITY_TWO.severLink(ENTITY_THREE, function (issue) {
            return proceed(issue);
        });
    });

    // NOTE: omitting this actually causes the subsequent two validation routines to fail!
    testCase('Have entity TWO sever link with entity THREE again (idempotent)', function (proceed) {
        ENTITY_TWO.severLink(ENTITY_THREE, function (issue) {
            return proceed(issue);
        });
    });

    testCase('Retrieve entity TWO’s “connections and others” (post-sever)', function (proceed) {
        verifyPersonaConnections(ENTITY_TWO, [], [ENTITY_THREE], proceed);
    });

    testCase('Retrieve entity THREE’s “connections and others” (post-sever)', function (proceed) {
        verifyPersonaConnections(ENTITY_THREE, [], [ENTITY_TWO], proceed);
    });

    // Multi-persona connection deletions:

    testCase('Generate entity FOUR', function (proceed) {
        const designation = 'Trial Persona Delta';
        Persona.generate({designation: designation}, function (issue, person) {
            if (issue) return proceed(issue);

            validatePersona(person);
            assertObj(person.designation).to.be.equal(designation);

            ENTITY_FOUR = person;
            return proceed();
        });
    });

    testCase('Chain links: entity TWO -> entity THREE -> entity FOUR', function (proceed) {
        let pendingOperations = 2;

        function completionHandler(issue) {
            if (issue) return proceed(issue);
            if (--pendingOperations === 0) {
                proceed();
            }
        }

        ENTITY_TWO.establishLink(ENTITY_THREE, completionHandler);
        ENTITY_THREE.establishLink(ENTITY_FOUR, completionHandler);
    });

    testCase('Retrieve all entities’ “connections and others” (complex chain)', function (proceed) {
        let pendingOperations = 3;

        function completionHandler(issue) {
            if (issue) return proceed(issue);
            if (--pendingOperations === 0) {
                proceed();
            }
        }

        verifyPersonaConnections(ENTITY_TWO, [ENTITY_THREE], [ENTITY_FOUR], completionHandler);
        verifyPersonaConnections(ENTITY_THREE, [ENTITY_FOUR], [ENTITY_TWO], completionHandler);
        verifyPersonaConnections(ENTITY_FOUR, [], [ENTITY_TWO, ENTITY_THREE], completionHandler);
    });

    testCase('Remove entity TWO', function (proceed) {
        ENTITY_TWO.remove(function (issue) {
            return proceed(issue);
        });
    });

    testCase('Retrieve entities THREE and FOUR’s “connections and others” (post-removal of TWO)', function (proceed) {
        let pendingOperations = 2;

        function completionHandler(issue) {
            if (issue) return proceed(issue);
            if (--pendingOperations === 0) {
                proceed();
            }
        }

        verifyPersonaConnections(ENTITY_THREE, [ENTITY_FOUR], [], completionHandler);
        verifyPersonaConnections(ENTITY_FOUR, [], [ENTITY_THREE], completionHandler);
    });

    testCase('Remove entity FOUR', function (proceed) {
        ENTITY_FOUR.remove(function (issue) {
            return proceed(issue);
        });
    });

    testCase('Retrieve entity THREE’s “connections and others” (post-removal of FOUR)', function (proceed) {
        verifyPersonaConnections(ENTITY_THREE, [], [], proceed);
    });

    testCase('Remove entity THREE', function (proceed) {
        ENTITY_THREE.remove(function (issue) {
            return proceed(issue);
        });
    });

});