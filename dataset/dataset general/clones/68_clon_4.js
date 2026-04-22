const verifier = (function() {
    const reportCollection = [];

    const verifyNoException = (actionFunc, description = 'should not raise an issue') => {
        try {
            actionFunc();
            reportCollection.push({ status: 'PASS', description: description });
        } catch (e) {
            reportCollection.push({ status: 'FAIL', description: description, error: e.message });
        }
    };

    const verifyException = (actionFunc, description = 'should raise an issue') => {
        try {
            actionFunc();
            reportCollection.push({ status: 'FAIL', description: description, error: 'Anticipated an issue, but none occurred.' });
        } catch (e) {
            reportCollection.push({ status: 'PASS', description: description });
        }
    };

    const verifyEquality = (actualValue, expectedValue, description = 'should match expected value') => {
        if (actualValue === expectedValue) {
            reportCollection.push({ status: 'PASS', description: description });
        } else {
            reportCollection.push({ status: 'FAIL', description: description, error: `Anticipated ${expectedValue}, received ${actualValue}` });
        }
    };

    const generateReport = () => {
        console.log('\n--- Verification Summary ---');
        let totalEntries = reportCollection.length;
        let successfulEntries = 0;
        reportCollection.forEach(entry => {
            if (entry.status === 'PASS') {
                successfulEntries++;
                console.log(`✅ ${entry.description}`);
            } else {
                console.error(`❌ ${entry.description} - Issue: ${entry.error}`);
            }
        });
        console.log(`\nOutcome: ${successfulEntries}/${totalEntries} verifications passed.`);
        if (successfulEntries !== totalEntries) {
            console.error('Some verifications FAILED!');
        } else {
            console.log('All verifications PASSED!');
        }
        return successfulEntries === totalEntries;
    };

    return {
        verifyNoException,
        verifyException,
        verifyEquality,
        generateReport
    };
})();

const validator = (function() {
    let currentActivationStatus = true;
    const kindAssessors = new Map();

    const isAbsent = (value) => value === null || value === undefined;

    kindAssessors.set(String, (item) => typeof item === 'string');
    kindAssessors.set(Number, (item) => typeof item === 'number' && !Number.isNaN(item));
    kindAssessors.set(Array, (item) => Array.isArray(item));
    kindAssessors.set(Object, (item) => typeof item === 'object' && item !== null && !Array.isArray(item));

    const generalInstanceAssessor = (item, kindConstructor) => item instanceof kindConstructor;

    const performVerification = (targetValue, expectedKind, requirementParameter) => {
        if (!currentActivationStatus) {
            return;
        }

        if (isAbsent(targetValue)) {
            const isOptional = requirementParameter === false || requirementParameter === 'optional';
            if (!isOptional) {
                throw new Error('Value is mandatory but missing.');
            }
            return;
        }

        let kindMatches = false;

        if (Array.isArray(expectedKind)) {
            kindMatches = expectedKind.some(singleKind => {
                const assessor = kindAssessors.get(singleKind) || generalInstanceAssessor;
                return assessor(targetValue, singleKind);
            });
        } else {
            const assessor = kindAssessors.get(expectedKind) || generalInstanceAssessor;
            kindMatches = assessor(targetValue, expectedKind);
        }

        if (!kindMatches) {
            throw new Error(`Value does not align with anticipated kind(s).`);
        }
    };

    const mainValidationRoutine = (targetValue, expectedKind, requirementParameter) => {
        performVerification(targetValue, expectedKind, requirementParameter);
    };

    mainValidationRoutine.activate = (status) => {
        currentActivationStatus = status;
    };

    mainValidationRoutine.evaluate = (targetValue, expectedKind) => {
        try {
            performVerification(targetValue, expectedKind, true);
            return true;
        } catch (e) {
            return false;
        }
    };

    return mainValidationRoutine;
})();

const testRunner = (function(assertionUtil, kindValidator) {
    let currentTestSuiteLabel = '';

    const createSuite = (suiteLabel, suiteAction) => {
        currentTestSuiteLabel = suiteLabel;
        console.log(`\n--- Initiating Test Group: ${suiteLabel} ---`);
        suiteAction();
    };

    const addCase = (caseLabel, caseAction) => {
        console.log(`  Scenario: ${caseLabel}`);
        caseAction(assertionUtil, kindValidator);
    };

    return {
        createSuite,
        addCase
    };
})(verifier, validator);

testRunner.createSuite("Validation System Operations", function() {

    testRunner.createSuite("Acceptance Scenarios", function() {
        testRunner.addCase("Textual Item", (assertUtil, valUtil) => {
            assertUtil.verifyNoException(() => {
                valUtil('identifier', String);
            }, "should approve a string item");
        });

        testRunner.addCase("Numerical Item", (assertUtil, valUtil) => {
            assertUtil.verifyNoException(() => {
                valUtil(1, Number);
            }, "should approve a positive number");
            assertUtil.verifyNoException(() => {
                valUtil(0, Number);
            }, "should approve zero");
            assertUtil.verifyNoException(() => {
                valUtil(-1, Number);
            }, "should approve a negative number");
        });

        testRunner.addCase("Collection Item", (assertUtil, valUtil) => {
            assertUtil.verifyNoException(() => {
                valUtil([], Array);
            }, "should approve an array");
        });

        testRunner.addCase("Structure Item", (assertUtil, valUtil) => {
            assertUtil.verifyNoException(() => {
                valUtil({}, Object);
            }, "should approve a plain object");
        });

        testRunner.addCase("Compound Kinds", (assertUtil, valUtil) => {
            assertUtil.verifyNoException(() => {
                valUtil(1, [String, Number]);
            }, "should approve a number for string or number kinds");
        });

        testRunner.addCase("Defined Kind", (assertUtil, valUtil) => {
            var SpecialKind = function() {
                this.property = 2 * true;
            };
            var entity = new SpecialKind();
            assertUtil.verifyNoException(() => {
                valUtil(entity, SpecialKind);
            }, "should approve an instance of a custom defined kind");
        });
    });

    testRunner.createSuite("Rejection Scenarios", function() {
        testRunner.addCase("Textual Mismatch", (assertUtil, valUtil) => {
            assertUtil.verifyException(() => {
                valUtil([], String);
            }, "should disapprove an array for string kind");
        });

        testRunner.addCase("Numerical Mismatch", (assertUtil, valUtil) => {
            assertUtil.verifyException(() => {
                valUtil([], Number);
            }, "should disapprove an array for number kind");
            assertUtil.verifyException(() => {
                valUtil(NaN, Number);
            }, "should disapprove NaN for number kind");
        });

        testRunner.addCase("Collection Mismatch", (assertUtil, valUtil) => {
            assertUtil.verifyException(() => {
                valUtil('', Array);
            }, "should disapprove a string for array kind");
        });

        testRunner.addCase("Structure Mismatch", (assertUtil, valUtil) => {
            assertUtil.verifyException(() => {
                valUtil([], Object);
            }, "should disapprove an array for plain object kind");
        });

        testRunner.addCase("Compound Mismatch", (assertUtil, valUtil) => {
            assertUtil.verifyException(() => {
                valUtil([], [String, Number]);
            }, "should disapprove an array for string or number kinds");
        });

        testRunner.addCase("Defined Kind Mismatch", (assertUtil, valUtil) => {
            var SpecialKind = function() {
                this.property = 2 * true;
            };
            assertUtil.verifyException(() => {
                valUtil([], SpecialKind);
            }, "should disapprove an array for custom defined kind");
        });
    });

    testRunner.createSuite("Configuration Parameters", function() {
        testRunner.addCase("Non-Mandatory Flag (false)", (assertUtil, valUtil) => {
            assertUtil.verifyNoException(() => {
                valUtil(null, String, false);
                valUtil(undefined, String, false);
            }, "should approve null/undefined when requirement is false");
        });

        testRunner.addCase("Non-Mandatory Flag ('optional')", (assertUtil, valUtil) => {
            assertUtil.verifyNoException(() => {
                valUtil(null, String, 'optional');
                valUtil(undefined, String, 'optional');
            }, "should approve null/undefined when requirement is 'optional'");
        });
    });

    testRunner.createSuite("Control Switches", function() {
        testRunner.addCase("Activation Status", (assertUtil, valUtil) => {
            valUtil.activate(false);
            assertUtil.verifyNoException(() => {
                valUtil(1999, String);
            }, "should not raise an issue when validator is inactive");
            valUtil.activate(true);
        });
    });

    testRunner.createSuite("Evaluation Function", function() {
        testRunner.addCase("Return Values", (assertUtil, valUtil) => {
            assertUtil.verifyNoException(() => {
                valUtil.evaluate(1999, String);
            }, "evaluate function itself should not raise an issue for kind mismatch");

            assertUtil.verifyEquality(valUtil.evaluate(1999, Number), true, "should yield true for matching kind");
            assertUtil.verifyEquality(valUtil.evaluate(1999, String), false, "should yield false for mismatching kind");
        });
    });
});

verifier.generateReport();