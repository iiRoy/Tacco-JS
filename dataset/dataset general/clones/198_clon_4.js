const verify = require('assert');
const s3Simulator = require('mock-aws-s3');
const pathUtility = require('path');

const validationCases = [
    { targetLocation: 'local/bucket/first', expectedItemCount: 1473 },
    { targetLocation: 'local/bucket/second', expectedItemCount: 1472 },
    { targetLocation: 'local/bucket/first/otters/updated', expectedItemCount: 0 },
    { targetLocation: 'local/download/backup', expectedItemCount: 2945 },
    { targetLocation: 'local/bucket/third', expectedItemCount: 912 },
    { targetLocation: 'local/bucket/fourth', expectedItemCount: 2945 },
    { targetLocation: 'local/download/fourth', expectedItemCount: 1472 },
    { targetLocation: 'local/download/fifth', expectedItemCount: 560 },
    { targetLocation: 'local/bucket/fifth', expectedItemCount: 2 },
    { targetLocation: 'local/bucket/copies', expectedItemCount: 1473 }
];

const conductVerifications = (casesToValidate) => {
    let successfulChecks = 0;
    let failedChecks = 0;

    console.log('Beginning system integrity checks...');

    casesToValidate.forEach((testScenario, scenarioIndex) => {
        const absolutePath = pathUtility.join(__dirname, testScenario.targetLocation);
        try {
            const discoveredItems = s3Simulator.listContents(absolutePath); 
            verify.strictEqual(
                discoveredItems.length,
                testScenario.expectedItemCount,
                `Integrity check failed for path: ${testScenario.targetLocation} (Index: ${scenarioIndex})`
            );
            successfulChecks++;
        } catch (validationError) {
            failedChecks++;
            console.error(`ERROR: Check failed for ${testScenario.targetLocation}. Details: ${validationError.message}`);
        }
    });

    console.log(`\nVerification Report: ${successfulChecks} OK, ${failedChecks} FAILED.`);

    if (failedChecks > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
};

conductVerifications(validationCases);