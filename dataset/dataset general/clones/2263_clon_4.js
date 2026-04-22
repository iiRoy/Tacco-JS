const assessmentRegistry = {
    _collectionStore: [],
    _currentAssessmentGroup: null,
    _overallResultStatus: true,

    designateGroup: function(groupLabel) {
        this._currentAssessmentGroup = {
            label: groupLabel,
            evaluationUnits: [],
            totalAssertionsMade: 0,
            successfulAssertions: 0,
            failedAssertions: 0
        };
        this._collectionStore.push(this._currentAssessmentGroup);
        // console.log(`\n### Initiating Assessment Group: ${groupLabel} ###`); // Removed console logs for raw output
    },

    processUnit: function(unitDescription, unitFunction) {
        if (!this._currentAssessmentGroup) {
            // console.error("Error: No assessment group designated. Use designateGroup first."); // Removed console logs
            return;
        }

        const unitOutcome = {
            description: unitDescription,
            verifications: [],
            outcomePositive: true
        };
        this._currentAssessmentGroup.evaluationUnits.push(unitOutcome);
        // console.log(`  --- Processing Unit: ${unitDescription} ---`); // Removed console logs

        const verificationContext = {
            _unitVerifications: [],
            _unitOutcomePositive: true,
            _expectedVerificationCount: 0,
            _actualVerificationCount: 0,

            setExpectedVerifications: function(num) {
                this._expectedVerificationCount = num;
            },

            confirmEquivalence: function(actualValue, anticipatedValue, messageText) {
                this._actualVerificationCount++;
                const matchResult = actualValue === anticipatedValue;
                const verificationDetail = {
                    message: messageText,
                    status: matchResult,
                    actual: actualValue,
                    expected: anticipatedValue,
                    type: 'equivalence'
                };
                this._unitVerifications.push(verificationDetail);
                if (!matchResult) {
                    this._unitOutcomePositive = false;
                    assessmentRegistry._overallResultStatus = false;
                    // console.error(`    FAILURE: ${messageText} (Anticipated: ${anticipatedValue}, Received: ${actualValue})`); // Removed console logs
                } else {
                    // console.log(`    SUCCESS: ${messageText}`); // Removed console logs
                }
                return matchResult;
            },

            validateExistence: function(conditionExpression, messageText) {
                this._actualVerificationCount++;
                const conditionTruthy = !!conditionExpression;
                const verificationDetail = {
                    message: messageText,
                    status: conditionTruthy,
                    actual: conditionExpression,
                    expected: 'truthy',
                    type: 'existence'
                };
                this._unitVerifications.push(verificationDetail);
                if (!conditionTruthy) {
                    this._unitOutcomePositive = false;
                    assessmentRegistry._overallResultStatus = false;
                    // console.error(`    FAILURE: ${messageText} (Condition was not truthy: ${conditionExpression})`); // Removed console logs
                } else {
                    // console.log(`    SUCCESS: ${messageText}`); // Removed console logs
                }
                return conditionTruthy;
            }
        };

        try {
            unitFunction(verificationContext);
        } catch (e) {
            unitOutcome.outcomePositive = false;
            verificationContext._unitOutcomePositive = false;
            assessmentRegistry._overallResultStatus = false;
            // console.error(`    RUNTIME ERROR in assessment unit "${unitDescription}":`, e); // Removed console logs
            verificationContext._unitVerifications.push({
                message: `Execution error: ${e.message}`,
                status: false,
                type: 'runtime_error'
            });
        }

        unitOutcome.verifications = verificationContext._unitVerifications;
        unitOutcome.outcomePositive = verificationContext._unitOutcomePositive;

        if (verificationContext._expectedVerificationCount > 0 && verificationContext._expectedVerificationCount !== verificationContext._actualVerificationCount) {
             unitOutcome.outcomePositive = false;
             verificationContext._unitOutcomePositive = false;
             assessmentRegistry._overallResultStatus = false;
             const mismatchMsg = `Expected ${verificationContext._expectedVerificationCount} verifications, but performed ${verificationContext._actualVerificationCount}.`;
             // console.error(`    FAILURE: ${mismatchMsg}`); // Removed console logs
             unitOutcome.verifications.push({
                message: mismatchMsg,
                status: false,
                type: 'expectation_mismatch'
            });
        }


        this._currentAssessmentGroup.totalAssertionsMade += verificationContext._actualVerificationCount;
        this._currentAssessmentGroup.successfulAssertions += verificationContext._unitVerifications.filter(v => v.status).length;
        this._currentAssessmentGroup.failedAssertions += verificationContext._unitVerifications.filter(v => !v.status).length;

        // if (!unitOutcome.outcomePositive) {
        //     console.error(`  Unit FAILED: ${unitDescription}`); // Removed console logs
        // } else {
        //     console.log(`  Unit PASSED: ${unitDescription}`); // Removed console logs
        // }
    },

    generateReport: function() {
        // console.log("\n### Final Assessment Report ###"); // Removed console logs
        let totalGroups = 0;
        let totalUnits = 0;
        let totalGlobalAssertions = 0;
        let totalGlobalPassedAssertions = 0;
        let totalGlobalFailedAssertions = 0;

        this._collectionStore.forEach(group => {
            totalGroups++;
            // console.log(`\nGroup: ${group.label}`); // Removed console logs
            // console.log(`  Units: ${group.evaluationUnits.length}`); // Removed console logs
            // console.log(`  Verifications: ${group.successfulAssertions} passed, ${group.failedAssertions} failed, ${group.totalAssertionsMade} total`); // Removed console logs
            totalUnits += group.evaluationUnits.length;
            totalGlobalAssertions += group.totalAssertionsMade;
            totalGlobalPassedAssertions += group.successfulAssertions;
            totalGlobalFailedAssertions += group.failedAssertions;
        });

        // console.log("\n### Consolidated Outcomes ###"); // Removed console logs
        // console.log(`Total Groups: ${totalGroups}`); // Removed console logs
        // console.log(`Total Evaluation Units: ${totalUnits}`); // Removed console logs
        // console.log(`Total Verifications: ${totalGlobalPassedAssertions} passed, ${totalGlobalFailedAssertions} failed, ${totalGlobalAssertions} total`); // Removed console logs

        // if (this._overallResultStatus) {
        //     console.log("ALL ASSESSMENTS SUCCESSFULLY COMPLETED!"); // Removed console logs
        // } else {
        //     console.error("SOME ASSESSMENTS FAILED TO COMPLETE SUCCESSFULLY!"); // Removed console logs
        // }
    }
};


// Execute assessment routines

assessmentRegistry.designateGroup("Introductory Verifications");

assessmentRegistry.processUnit("Web Framework Delight", function(verify) {
    verify.setExpectedVerifications(1);
    verify.confirmEquivalence("boilerplate".replace("boilerplate", "sweet"), "sweet", "Confirmation: Web Framework is indeed delightful");
});

assessmentRegistry.processUnit("Operational Environment Check", function(verify) {
    verify.setExpectedVerifications(3);

    const globalReference = typeof window !== 'undefined' ? window : global;
    verify.validateExistence(!!globalReference.log, "Logger utility function is available");

    const priorLogEntryCount = (globalReference.log && globalReference.log.history && globalReference.log.history.length) || 0;
    if (globalReference.log) {
        globalReference.log("Recording an event from the assessment routine.");
    }
    const currentLogEntryCount = (globalReference.log && globalReference.log.history && globalReference.log.history.length) || 0;

    verify.confirmEquivalence(currentLogEntryCount - priorLogEntryCount, 1, "Logger history accurately tracks events");

    verify.validateExistence(!!globalReference.Modernizr, "Feature detection library 'Modernizr' is present globally");
});

// Final report generation
assessmentRegistry.generateReport();