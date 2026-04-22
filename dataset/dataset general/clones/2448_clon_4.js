const assertionTool = require('assert');
const orchestrationTool = require('./flow');
const storageSystem = require('./examples/keystore');

// Promisified and renamed data persistence operations
const dataDepot = {
    increment: (keyAlias, quantityChange) => new Promise((resolve, reject) => {
        storageSystem.increment(keyAlias, quantityChange, (error, finalValue) => error ? reject(error) : resolve(finalValue));
    }),
    alter: (keyAlias, contentValue) => new Promise((resolve, reject) => {
        storageSystem.set(keyAlias, contentValue, (error, result) => error ? reject(error) : resolve(result));
    }),
    retrieve: (keyAlias) => new Promise((resolve, reject) => {
        storageSystem.get(keyAlias, (error, retrievedValue) => error ? reject(error) : resolve(retrievedValue));
    }),
    isStored: (keyAlias) => new Promise((resolve, reject) => {
        storageSystem.exists(keyAlias, (error, existenceStatus) => error ? reject(error) : resolve(existenceStatus));
    }),
    getVaultData: () => storageSystem.getDb()
};

// Global state replacements
let operationCompletionCount = 0;
let collectedSequence = [];

// Replacement for flow.exec using async/await and Promises
async function orchestrateAsynchronousUnit(actionRoutine, completionCallback) {
    try {
        const routineOutcome = await actionRoutine();
        let resultForCallbackArgument;

        if (Array.isArray(routineOutcome)) {
            await Promise.all(routineOutcome);
            resultForCallbackArgument = undefined;
        } else if (typeof routineOutcome === 'object' && routineOutcome !== null &&
                   Object.values(routineOutcome).every(p => p instanceof Promise)) {
            const outcomeKeys = Object.keys(routineOutcome);
            const outcomeValues = await Promise.all(Object.values(routineOutcome));
            resultForCallbackArgument = {};
            outcomeKeys.forEach((keyName, idx) => {
                resultForCallbackArgument[keyName] = [null, outcomeValues[idx]];
            });
        } else {
            resultForCallbackArgument = routineOutcome;
        }
        completionCallback(null, resultForCallbackArgument);
    } catch (routineError) {
        completionCallback(routineError);
    }
}

// Replacement for flow.serialForEach using async/await loop
async function processItemsInOrder(dataItems, itemProcessorFunction, itemFeedbackFunction, finalCompletionRoutine) {
    try {
        for (const currentItem of dataItems) {
            try {
                const processedItemResult = await itemProcessorFunction(currentItem);
                itemFeedbackFunction(null, processedItemResult);
                collectedSequence.push(processedItemResult);
            } catch (singleItemError) {
                itemFeedbackFunction(singleItemError);
                throw singleItemError;
            }
        }
        finalCompletionRoutine(null);
    } catch (overallProcessingError) {
        finalCompletionRoutine(overallProcessingError);
    }
}

// Main execution block, wrapped in an async function to manage the flow of tests
async function executeAllVerificationProcedures() {
    // 1. Simple increment operation
    await orchestrateAsynchronousUnit(
        async () => dataDepot.increment("counter", 1),
        (err, returnedValue) => {
            assertionTool.strictEqual(returnedValue, 1, "Increment verification failed");
            operationCompletionCount += 1;
        }
    );

    // 2. Multiple alteration operation
    await orchestrateAsynchronousUnit(
        async () => [
            dataDepot.alter("firstNameEntry", "Bob"),
            dataDepot.alter("lastNameEntry", "Vance")
        ],
        (err) => {
            const vaultDataSnapshot = dataDepot.getVaultData();
            assertionTool.strictEqual(vaultDataSnapshot.firstNameEntry, "Bob", "Multi-alter verification failed for first name");
            assertionTool.strictEqual(vaultDataSnapshot.lastNameEntry, "Vance", "Multi-alter verification failed for last name");
            operationCompletionCount += 1;
        }
    );

    // 3. Multiple retrieval with identifier operation
    await orchestrateAsynchronousUnit(
        async () => {
            const vaultDataSnapshot = dataDepot.getVaultData();
            vaultDataSnapshot['firstNameEntry'] = "Bob";
            vaultDataSnapshot['lastNameEntry'] = "Vance";
            return {
                'first-person-name': dataDepot.retrieve("firstNameEntry"),
                'last-person-name': dataDepot.retrieve("lastNameEntry")
            };
        },
        (err, operationResults) => {
            assertionTool.strictEqual(operationResults['first-person-name'][1], "Bob", "Multi-retrieval with identifier verification failed for first name");
            assertionTool.strictEqual(operationResults['last-person-name'][1], "Vance", "Multi-retrieval with identifier verification failed for last name");
            operationCompletionCount += 1;
        }
    );

    // 4. Multiple existence check with identifier operation
    await orchestrateAsynchronousUnit(
        async () => {
            const vaultDataSnapshot = dataDepot.getVaultData();
            vaultDataSnapshot['specificBob'] = "Bob Vance";
            return {
                'bob-existence': dataDepot.isStored("specificBob"),
                'john-existence': dataDepot.isStored("specificJohn")
            };
        },
        (err, operationResults) => {
            assertionTool.strictEqual(operationResults['bob-existence'][1], true, "Multi-existence check verification failed for Bob");
            assertionTool.strictEqual(operationResults['john-existence'][1], false, "Multi-existence check verification failed for John");
            operationCompletionCount += 1;
        }
    );

    // 5. Sequential processing of items
    await processItemsInOrder(
        [1, 2, 3, 4],
        async (numericalValue) => dataDepot.increment("sequentialCounter", numericalValue),
        (err, incrementalResult) => {
            if (err) throw err;
            collectedSequence.push(incrementalResult);
        },
        (err) => {
            assertionTool.deepEqual(collectedSequence, [1, 3, 6, 10], "Sequential value series is incorrect: " + JSON.stringify(collectedSequence));
            operationCompletionCount += 1;
        }
    );
}

// Initiate the entire verification process, handling final assertion and errors
executeAllVerificationProcedures().then(() => {
    const anticipatedFinalCount = 5;
    assertionTool.strictEqual(operationCompletionCount, anticipatedFinalCount, `${operationCompletionCount}/${anticipatedFinalCount} procedures completed`);
}).catch(procError => {
    console.error("An unforeseen error transpired during procedure execution:", procError);
    process.exit(1);
});