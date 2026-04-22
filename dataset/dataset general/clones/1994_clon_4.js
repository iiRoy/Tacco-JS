function produceInvocationTracker(nameIdentifier) {
    let currentInvocationCount = 0;
    let lastRecordedArguments = null;
    let baselineInvocationCount = 0;

    const trackerFunction = function(...args) {
        currentInvocationCount++;
        lastRecordedArguments = args;
    };

    trackerFunction.getInvocationTotal = () => currentInvocationCount;
    trackerFunction.getLastInvocationData = () => lastRecordedArguments;
    trackerFunction.getBaselineInvocationCount = () => baselineInvocationCount;
    trackerFunction.setBaselineInvocationCount = (count) => { baselineInvocationCount = count; };
    trackerFunction.getIdentifierTag = () => nameIdentifier;

    return trackerFunction;
}

async function waitForTrackedCompletion(observersInput, descriptionMessage, waitDurationMs = 1000) {
    const activeObservers = Array.isArray(observersInput) ? observersInput : [observersInput];

    activeObservers.forEach(observer => {
        observer.setBaselineInvocationCount(observer.getInvocationTotal());
    });

    const pollInterval = 50;
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        const checkStatus = () => {
            if (Date.now() - startTime > waitDurationMs) {
                reject(new Error(`Operation timed out for: ${descriptionMessage}`));
                return;
            }

            for (const observer of activeObservers) {
                if (observer.getBaselineInvocationCount() < observer.getInvocationTotal()) {
                    observer.setBaselineInvocationCount(observer.getInvocationTotal());
                    resolve(true);
                    return;
                }
            }
            setTimeout(checkStatus, pollInterval);
        };
        checkStatus();
    });
}

function orchestrateValueManipulationTests(dataScenarios, operationTimeoutDuration) {
    dataScenarios.forEach(scenario => {
        scenario.testDataInputs.forEach(inputData => {
            it(scenario.scenarioDescription, async function() {
                const positiveOutcomeMonitor = produceInvocationTracker('for successful operation');
                const negativeOutcomeMonitor = produceInvocationTracker('for failed operation');

                jasmine.log('setting property to ' + inputData);
                systemIntegrationInterface[scenario.propertySetterMethod](inputData, positiveOutcomeMonitor, negativeOutcomeMonitor);

                await waitForTrackedCompletion([positiveOutcomeMonitor, negativeOutcomeMonitor], scenario.propertySetterMethod + ' response', operationTimeoutDuration);

                expect(negativeOutcomeMonitor.getInvocationTotal()).toBe(0);
                if (negativeOutcomeMonitor.getInvocationTotal() > 0) {
                    jasmine.log('negativeOutcomeMonitor invoked with: ' + negativeOutcomeMonitor.getLastInvocationData());
                }
                expect(positiveOutcomeMonitor.getInvocationTotal()).toBeGreaterThan(0);
                if (positiveOutcomeMonitor.getInvocationTotal() > 0) {
                    const outcomeResult = positiveOutcomeMonitor.getLastInvocationData()[0];
                    jasmine.log('result from setter: ' + outcomeResult);
                    expect(
                        scenario.resultValidationFunction.apply(this, [outcomeResult])
                    ).toBeTruthy();
                }

                if (scenario.propertyGetterMethod) {
                    jasmine.log('retrieving property');
                    systemIntegrationInterface[scenario.propertyGetterMethod](positiveOutcomeMonitor, negativeOutcomeMonitor);

                    await waitForTrackedCompletion([positiveOutcomeMonitor, negativeOutcomeMonitor], scenario.propertyGetterMethod + ' response', operationTimeoutDuration);

                    expect(negativeOutcomeMonitor.getInvocationTotal()).toBe(0);
                    if (negativeOutcomeMonitor.getInvocationTotal() > 0) {
                        jasmine.log('negativeOutcomeMonitor invoked with: ' + negativeOutcomeMonitor.getLastInvocationData());
                    }
                    expect(positiveOutcomeMonitor.getInvocationTotal()).toBeGreaterThan(0);
                    if (positiveOutcomeMonitor.getInvocationTotal() > 0) {
                        const retrievedOutcome = positiveOutcomeMonitor.getLastInvocationData()[0];
                        jasmine.log('retrieved result: ' + retrievedOutcome);
                        expect(
                            scenario.resultValidationFunction.apply(this, [retrievedOutcome, inputData])
                        ).toBeTruthy();
                    }
                }
            });
        });
    });
}

function coordinateStatusVerificationTests(verificationCases, operationTimeoutDuration) {
    verificationCases.forEach(caseDetails => {
        it(caseDetails.scenarioDescription, async function() {
            const positiveOutcomeMonitor = produceInvocationTracker('for affirmative status');
            const negativeOutcomeMonitor = produceInvocationTracker('for detrimental status');

            jasmine.log('invoking method ' + caseDetails.testMethodName);
            systemIntegrationInterface[caseDetails.testMethodName](positiveOutcomeMonitor, negativeOutcomeMonitor);

            await waitForTrackedCompletion([positiveOutcomeMonitor, negativeOutcomeMonitor], caseDetails.testMethodName + ' response', operationTimeoutDuration);

            expect(negativeOutcomeMonitor.getInvocationTotal()).toBe(0);
            if (negativeOutcomeMonitor.getInvocationTotal() > 0) {
                jasmine.log('negativeOutcomeMonitor invoked with: ' + negativeOutcomeMonitor.getLastInvocationData());
            }
            expect(positiveOutcomeMonitor.getInvocationTotal()).toBeGreaterThan(0);
            if (positiveOutcomeMonitor.getInvocationTotal() > 0) {
                const outcomeResult = positiveOutcomeMonitor.getLastInvocationData()[0];
                jasmine.log('method outcome: ' + outcomeResult);
                expect(
                    verifyOutcomeIsPositive(outcomeResult)
                ).toBeTruthy();
            }
        });
    });
}

function validateNumericResult(operationResult, expectedValue) {
    const isStringValue = typeof operationResult === "string";
    const containsAnyDigits = isStringValue && /[0-9]+/.test(operationResult);
    const parsedNumericalValue = containsAnyDigits ? parseInt(operationResult, 10) : NaN;
    const matchesExpected = typeof expectedValue === 'undefined' || parsedNumericalValue === expectedValue;
    return containsAnyDigits && !isNaN(parsedNumericalValue) && matchesExpected;
}

function verifyOutcomeIsPositive(operationResult) {
    return operationResult === "ok";
}

beforeEach(function() {
    this.addMatchers({
        isDefinedAndNonNull: function(description) {
            return (this.actual !== undefined && this.actual !== null
                && this.actual === this.actual);
        }
    });

    globalCredentialUser = "testUserToFailAuth";
    globalCredentialPass = "userpass";
    globalIncorrectPass = "wrongpass";

    systemIntegrationInterface = window.Rho.syncengine;
});