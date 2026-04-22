const executeVerification = (caseLabel, assertionList) => {
    let succeeded = 0;
    let failed = 0;
    console.log(`\n### Processing: ${caseLabel} ###`);

    assertionList.forEach((currentAssertion, idx) => {
        const assertionResult = currentAssertion.check();
        const outcome = assertionResult ? "PASSED" : "FAILED";
        console.log(`  Assertion ${idx + 1}: ${outcome} - ${currentAssertion.message(assertionResult)}`);
        if (assertionResult) {
            succeeded++;
        } else {
            failed++;
        }
    });

    console.log(`### ${caseLabel} Summary: ${succeeded} succeeded, ${failed} failed ###`);
    return failed === 0;
};

const valueAssertion = (actual, expected, description) => ({
    check: () => actual === expected,
    message: (result) => result ? description : `${description} (Expected: ${expected}, Got: ${actual})`
});

const typeAssertion = (target, expectedTypeString, description) => ({
    check: () => Object.prototype.toString.call(target) === `[object ${expectedTypeString}]`,
    message: (result) => result ? description : `${description} (Expected type: ${expectedTypeString}, Got type: ${Object.prototype.toString.call(target).slice(8, -1)})`
});

const mainExecutionPoint = () => {
    console.log("--- Commencing Verification Suite ---");

    const testCaseOne = "Core Arithmetic Operation Check";
    const checksForCaseOne = [
        typeAssertion(divide, 'Function', 'An operational division unit must be present'),
        valueAssertion(divide(4, 2), 2, 'Result of 4 divided by 2 should be precisely 2')
    ];

    const overallOutcome = executeVerification(testCaseOne, checksForCaseOne);

    console.log(`\n--- Suite Concluded. Overall status: ${overallOutcome ? "ALL TESTS PASSED" : "SOME TESTS FAILED"} ---`);
};

mainExecutionPoint();