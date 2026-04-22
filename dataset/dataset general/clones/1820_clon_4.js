function assessResult(actualValue, anticipatedValue, caseDescription) {
    if (actualValue === anticipatedValue) {
        console.log(`✅ Passed: ${caseDescription}`);
    } else {
        console.error(`❌ Failed: ${caseDescription}`);
        console.error(`   Acquired:   "${actualValue}"`);
        console.error(`   Anticipated: "${anticipatedValue}"`);
    }
}

function processVerificationSet(setName, targetFunctionReference) {
    let currentAssertionIndex = 0;
    let successfulAssertionCount = 0;

    console.log(`\n--- Starting Verification Set: ${setName} ---`);

    const scenarioDefinitions = [
        {
            parameters: [123],
            expectedOutcome: '$123.00',
            scenarioNote: 'Positive whole number conversion'
        },
        {
            parameters: [123.45],
            expectedOutcome: '$123.45',
            scenarioNote: 'Positive decimal number conversion'
        },
        {
            parameters: [12345.67],
            expectedOutcome: '$12,345.67',
            scenarioNote: 'Larger positive decimal with grouping'
        },
        {
            parameters: [-123],
            expectedOutcome: '$-123.00',
            scenarioNote: 'Negative whole number conversion'
        },
        {
            parameters: [-123.45],
            expectedOutcome: '$-123.45',
            scenarioNote: 'Negative decimal number conversion'
        },
        {
            parameters: [-12345.67],
            expectedOutcome: '$-12,345.67',
            scenarioNote: 'Larger negative decimal with grouping'
        },
        {
            parameters: [5318008, "$", 0],
            expectedOutcome: '$5,318,008',
            scenarioNote: 'Zero decimal precision override'
        }
    ];

    scenarioDefinitions.forEach(currentScenario => {
        currentAssertionIndex++;
        const derivedResult = targetFunctionReference(...currentScenario.parameters);
        assessResult(derivedResult, currentScenario.expectedOutcome, currentScenario.scenarioNote);
        if (derivedResult === currentScenario.expectedOutcome) {
            successfulAssertionCount++;
        }
    });

    console.log(`--- Verification Set: ${setName} Concluded ---`);
    console.log(`${successfulAssertionCount}/${currentAssertionIndex} assertions passed.`);
}

// This line assumes 'currencyProcessor' is a globally available object
// with a 'valuePresentation' method, equivalent to the original 'accounting.formatMoney'.
processVerificationSet('Monetary Value Presentation Logic', currencyProcessor.valuePresentation);