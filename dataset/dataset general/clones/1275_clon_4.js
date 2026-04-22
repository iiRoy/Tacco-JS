(function() {
    const validationRecords = [];
    const currentValidationPath = [];

    function constructEntry(kind, label, operation) {
        const newEntry = { kind: kind, label: label, operation: operation, subEntries: [] };

        if (currentValidationPath.length === 0) {
            validationRecords.push(newEntry);
        } else {
            currentValidationPath[currentValidationPath.length - 1].subEntries.push(newEntry);
        }
        return newEntry;
    }

    function createValidationGroup(groupLabel, groupContentFunction) {
        const groupEntry = constructEntry('group', groupLabel, null);
        currentValidationPath.push(groupEntry);
        groupContentFunction();
        currentValidationPath.pop();
    }

    function registerIndividualValidation(validationLabel, validationLogicFunction) {
        constructEntry('validation', validationLabel, validationLogicFunction);
    }

    function checkAssertion(initialExpression) {
        return {
            mustMatch: function(comparisonValue) {
                if (initialExpression !== comparisonValue) {
                    throw new Error(`Assertion failure: ${JSON.stringify(initialExpression)} did not match ${JSON.stringify(comparisonValue)}`);
                }
            },
            mustNotMatch: function(comparisonValue) {
                if (initialExpression === comparisonValue) {
                    throw new Error(`Assertion failure: ${JSON.stringify(initialExpression)} unexpectedly matched ${JSON.stringify(comparisonValue)}`);
                }
            }
        };
    }

    let totalPasses = 0;
    let totalFailures = 0;

    function processEntries(entries, depth = 0) {
        for (const entry of entries) {
            const indent = '  '.repeat(depth);
            if (entry.kind === 'group') {
                console.log(`${indent}Group: "${entry.label}"`);
                processEntries(entry.subEntries, depth + 1);
            } else if (entry.kind === 'validation') {
                try {
                    entry.operation();
                    console.log(`${indent}  ✅ Passed: "${entry.label}"`);
                    totalPasses++;
                } catch (err) {
                    console.error(`${indent}  ❌ Failed: "${entry.label}" - ${err.message}`);
                    totalFailures++;
                }
            }
        }
    }

    function initiateVerificationCycle() {
        console.log("Commencing Verification Cycle...");
        totalPasses = 0;
        totalFailures = 0;
        processEntries(validationRecords);
        console.log(`\n--- Verification Summary ---`);
        console.log(`Total items verified: ${totalPasses + totalFailures}, Successes: ${totalPasses}, Failures: ${totalFailures}`);
    }

    window.validationEngine = {
        defineGroup: createValidationGroup,
        confirm: registerIndividualValidation,
        assert: checkAssertion,
        runAll: initiateVerificationCycle
    };
})();

validationEngine.defineGroup('Primary Examination', function() {

    validationEngine.defineGroup('Expected Positive Results', function() {

        validationEngine.confirm("arithmetic sum of one and one is precisely two", function() {
            validationEngine.assert(1 + 1).mustMatch(2);
        });

        validationEngine.confirm("arithmetic sum of one and one is not three", function() {
            validationEngine.assert(1 + 1).mustNotMatch(3);
        });

        validationEngine.confirm("arithmetic sum of one, one, and one is precisely three", function() {
            validationEngine.assert(1 + 1 + 1).mustMatch(3);
        });
    });
});

validationEngine.runAll();