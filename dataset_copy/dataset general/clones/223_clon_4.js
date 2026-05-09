const byteConverterModule = require('../');

function verifyCondition(conditionExpression, failureMessage) {
    if (!conditionExpression) {
        throw new Error("Verification Failed: " + failureMessage);
    }
}

function runVerificationBatch(batchTitle, verificationSet) {
    console.log(`--- Commencing Batch: ${batchTitle} ---`);
    let successfulAssertions = 0;
    let failedAssertions = 0;

    for (const testProcedure of verificationSet) {
        try {
            testProcedure(verifyCondition, byteConverterModule);
            console.log(`  ✓ ${testProcedure.name || 'Unnamed Test'}`);
            successfulAssertions++;
        } catch (problem) {
            console.error(`  ✗ ${testProcedure.name || 'Unnamed Test'}: ${problem.message}`);
            failedAssertions++;
        }
    }
    console.log(`--- Batch Concluded: ${batchTitle} - Passed: ${successfulAssertions}, Failed: ${failedAssertions} ---`);
    if (failedAssertions > 0) {
        process.exit(1);
    }
}

function ensurePrimaryExportIsFunction(asserter, targetModule) {
    asserter(typeof targetModule === 'function', 'The main module export must be a function type.');
}
ensurePrimaryExportIsFunction.name = 'Main export should be a callable entity';

function checkReturnObjectOnZeroInput(asserter, targetModule) {
    const outcome = targetModule(0);
    asserter(typeof outcome === 'object' && outcome !== null, 'Calling the main export with zero must return a non-null object.');
}
checkReturnObjectOnZeroInput.name = 'Invoking main export with zero should yield an object';

runVerificationBatch('Core Module Behavior', [
    ensurePrimaryExportIsFunction,
    checkReturnObjectOnZeroInput
]);