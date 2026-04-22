const externalKeyExchange = require('../../');
const nativeKeyExchange = require('crypto');

const verificationLog = {
    totalAssertionsMade: 0,
    totalAssertionsPassed: 0,
    totalAssertionsFailed: 0,
    scenarioSummaries: []
};

function createVerificationContext(scenarioLabel) {
    let expectedAssertionCount = 0;
    let actualAssertionCount = 0;
    const failureMessages = [];

    return {
        specifyExpectedAssertions: function(count) {
            expectedAssertionCount = count;
        },
        performEqualityEvaluation: function(valueA, valueB, messagePrompt) {
            actualAssertionCount++;
            if (valueA !== valueB) {
                failureMessages.push(`[FAILURE] ${scenarioLabel}: Equality check failed - ${messagePrompt}. Expected "${valueA}", Found "${valueB}"`);
            }
        },
        performInequalityEvaluation: function(valueA, valueB, messagePrompt) {
            actualAssertionCount++;
            if (valueA === valueB) {
                failureMessages.push(`[FAILURE] ${scenarioLabel}: Inequality check failed - ${messagePrompt}. Expected "${valueA}" NOT to equal "${valueB}"`);
            }
        },
        finalizeScenario: function() {
            let scenarioPassed = failureMessages.length === 0 && expectedAssertionCount === actualAssertionCount;
            if (expectedAssertionCount !== actualAssertionCount) {
                scenarioPassed = false;
                failureMessages.push(`[FAILURE] ${scenarioLabel}: Assertion count mismatch. Anticipated ${expectedAssertionCount} checks, but executed ${actualAssertionCount}.`);
            }

            verificationLog.totalAssertionsMade += actualAssertionCount;
            verificationLog.totalAssertionsFailed += failureMessages.length;
            if (scenarioPassed) {
                verificationLog.totalAssertionsPassed += actualAssertionCount;
            } else {
                verificationLog.totalAssertionsPassed += (actualAssertionCount - failureMessages.length);
            }
            
            verificationLog.scenarioSummaries.push({
                label: scenarioLabel,
                passed: scenarioPassed,
                failures: failureMessages
            });
            return scenarioPassed;
        }
    };
}

function conductGroupVerification(currentIdentifier, verificationUnit) {
    verificationUnit.specifyExpectedAssertions(3);

    const partyOne = externalKeyExchange.getDiffieHellman(currentIdentifier);
    const primeHexOne = partyOne.getPrime().toString('hex');
    partyOne.generateKeys();

    const partyTwo = nativeKeyExchange.getDiffieHellman(currentIdentifier);
    const primeHexTwo = partyTwo.getPrime().toString('hex');
    partyTwo.generateKeys();

    verificationUnit.performEqualityEvaluation(primeHexOne, primeHexTwo, 'prime values must be identical');

    const publicComponentOne = partyOne.getPublicKey();
    const publicComponentTwo = partyTwo.getPublicKey();
    verificationUnit.performInequalityEvaluation(publicComponentOne, publicComponentTwo, 'public keys should not match');

    const derivedSecretOne = partyOne.computeSecret(publicComponentTwo).toString('hex');
    const derivedSecretTwo = partyTwo.computeSecret(publicComponentOne).toString('hex');
    verificationUnit.performEqualityEvaluation(derivedSecretOne, derivedSecretTwo, 'computed secrets must be equivalent');
}

function conductLengthVerification(currentBitLength, verificationUnit) {
    verificationUnit.specifyExpectedAssertions(3);

    const sessionB = externalKeyExchange.createDiffieHellman(currentBitLength);
    const primeBufferB = sessionB.getPrime();
    const primeHexB = primeBufferB.toString('hex');

    const sessionA = nativeKeyExchange.createDiffieHellman(primeBufferB);
    const primeHexA = sessionA.getPrime().toString('hex');

    sessionA.generateKeys();
    sessionB.generateKeys();

    verificationUnit.performEqualityEvaluation(primeHexA, primeHexB, 'prime hex representations must align');

    const publicMaterialA = sessionA.getPublicKey();
    const publicMaterialB = sessionB.getPublicKey();
    verificationUnit.performInequalityEvaluation(publicMaterialA, publicMaterialB, 'public material should be distinct');

    const finalKeyA = sessionA.computeSecret(publicMaterialB).toString('hex');
    const finalKeyB = sessionB.computeSecret(publicMaterialA).toString('hex');
    verificationUnit.performEqualityEvaluation(finalKeyA, finalKeyB, 'final derived keys must coincide');
}

function initiateAllVerifications() {
    const groupCollection = ['modp1', 'modp2', 'modp5', 'modp14', 'modp15', 'modp16'];
    const lengthCollection = [64, 65, 192];
    
    function processGroupsRecursively(index) {
        if (index >= groupCollection.length) {
            return;
        }
        const currentGroup = groupCollection[index];
        const currentContext = createVerificationContext(`Group: ${currentGroup}`);
        try {
            conductGroupVerification(currentGroup, currentContext);
        } catch (e) {
            currentContext.failures.push(`[ERROR] Unhandled exception during group '${currentGroup}': ${e.message}\n${e.stack}`);
        } finally {
            currentContext.finalizeScenario();
        }
        processGroupsRecursively(index + 1);
    }
    processGroupsRecursively(0);

    lengthCollection.reduce((_accumulator, currentLength) => {
        const currentContext = createVerificationContext(`Length: ${currentLength}`);
        try {
            conductLengthVerification(currentLength, currentContext);
        } catch (e) {
            currentContext.failures.push(`[ERROR] Unhandled exception during length '${currentLength}': ${e.message}\n${e.stack}`);
        } finally {
            currentContext.finalizeScenario();
        }
        return null;
    }, null);

    console.log("\n*** Verification Summary ***");
    verificationLog.scenarioSummaries.forEach(summary => {
        if (summary.passed) {
            console.log(`[PASSED] ${summary.label}`);
        } else {
            console.log(`[FAILED] ${summary.label}`);
            summary.failures.forEach(err => console.error(`    ${err}`));
        }
    });
    console.log(`\nTotal Assertions Executed: ${verificationLog.totalAssertionsMade}`);
    console.log(`Assertions Passed: ${verificationLog.totalAssertionsPassed}`);
    console.log(`Assertions Failed: ${verificationLog.totalAssertionsFailed}`);

    if (verificationLog.totalAssertionsFailed > 0) {
        process.exit(1);
    }
}

initiateAllVerifications();