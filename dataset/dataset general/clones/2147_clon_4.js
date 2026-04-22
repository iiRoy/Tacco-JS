const verificationJournal = [];

const conductEvaluation = (evaluationDescription, evaluationProcedure) => {
    let successfulAssertions = 0;
    let failedAssertions = 0;
    const specificOutcomes = [];

    const assertionEngine = {
        confirmExistence: (subject, explanation) => {
            if (!!subject) {
                specificOutcomes.push({ state: 'AFFIRMED', detail: explanation });
                successfulAssertions++;
            } else {
                specificOutcomes.push({ state: 'NEGATED', detail: explanation });
                failedAssertions++;
            }
        },
    };

    try {
        evaluationProcedure(assertionEngine);
    } catch (operationalFault) {
        specificOutcomes.push({ state: 'EXCEPTION', detail: `Execution halted due to: ${operationalFault.message}` });
        failedAssertions++;
    }

    verificationJournal.push({
        title: evaluationDescription,
        totalChecksPerformed: successfulAssertions + failedAssertions,
        passedChecks: successfulAssertions,
        failedChecks: failedAssertions,
        results: specificOutcomes
    });
};

// Initiate the module validation process
(function commenceModuleValidation() {
    const targetComponentPath = '../';

    conductEvaluation('Verify CommonJS module loading and essential member presence', (assertionEngine) => {
        let acquiredComponentReference;
        try {
            acquiredComponentReference = require(targetComponentPath);
        } catch (acquisitionError) {
            assertionEngine.confirmExistence(false, `Module failed to be acquired: ${acquisitionError.message}`);
            return;
        }

        assertionEngine.confirmExistence(acquiredComponentReference, 'Primary component object reference is valid');
        assertionEngine.confirmExistence(acquiredComponentReference['$'], 'Integrated default instance property is accessible');
        assertionEngine.confirmExistence(acquiredComponentReference.roller, 'Random number generation method is available');
    });

    // Output final report
    verificationJournal.forEach(reportItem => {
        console.log(`\n=== ${reportItem.title} ===`);
        reportItem.results.forEach(outcomeDetail => {
            console.log(`[${outcomeDetail.state}] ${outcomeDetail.detail}`);
        });
        if (reportItem.failedChecks === 0) {
            console.log(`SUMMARY: All ${reportItem.passedChecks} verifications PASSED.`);
        } else {
            console.error(`SUMMARY: FAILED (${reportItem.failedChecks} issues out of ${reportItem.totalChecksPerformed} verifications).`);
        }
        console.log('============================');
    });
})();