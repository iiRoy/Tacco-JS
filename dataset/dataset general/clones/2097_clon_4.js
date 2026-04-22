const StatisticalAnalysisEngine = require('../confidence.js');

const AssertionUtility = {
    affirm: (evaluation, message = 'Affirmation failed.') => {
        if (!evaluation) {
            throw new Error(message);
        }
    },
    deny: (evaluation, message = 'Denial failed (condition was true).') => {
        if (evaluation) {
            throw new Error(message);
        }
    },
    compareExact: (actual, expected, message = 'Values are not strictly equal.') => {
        if (actual !== expected) {
            throw new Error(`${message} Expected: '${expected}', Actual: '${actual}'`);
        }
    },
    compareStructural: (actual, expected, message = 'Objects are not deeply equal.') => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message} Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
        }
    },
    anticipateError: (func, expectedErrorType, message = 'Function did not throw the anticipated error.') => {
        let errorEncountered = false;
        try {
            func();
        } catch (e) {
            if (e instanceof expectedErrorType) {
                errorEncountered = true;
            } else {
                throw new Error(`Function threw an error of unexpected type: ${e.constructor.name}, expected ${expectedErrorType.name}.`);
            }
        }
        if (!errorEncountered) {
            throw new Error(message);
        }
    },
    anticipateNoErrors: (func, message = 'Function threw an unexpected error.') => {
        try {
            func();
        } catch (e) {
            throw new Error(`${message} Error details: ${e.message}`);
        }
    }
};

const executeScenarioGroup = (groupTitle, scenarioCollection) => {
    console.log(`\n--- ${groupTitle} ---`);
    for (const scenarioName in scenarioCollection) {
        if (Object.hasOwnProperty.call(scenarioCollection, scenarioName)) {
            try {
                scenarioCollection[scenarioName](AssertionUtility);
                console.log(`  ✅ ${scenarioName}`);
            } catch (error) {
                console.error(`  ❌ ${scenarioName}`);
                console.error(`    Details: ${error.message}`);
                process.exit(1);
            }
        }
    }
};

executeScenarioGroup('Element Appending Operations', {
    'Improperly shaped element causes rejection': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        verify.anticipateError(() => {
            statisticalEngine.addVariant({
                elementIdentifier: 'Alpha',
                elementLabel: 'Element Alpha',
                successfulEvents: 1356,
            });
        }, Error, 'Element description lacked the required "totalEvents" property.');
    },

    'Properly shaped element appends successfully': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Beta',
            elementLabel: 'Element Beta',
            successfulEvents: 3000,
            totalEvents: 3000
        });

        verify.affirm(statisticalEngine._variants.hasOwnProperty('Beta'), 'Element Beta was not registered internally.');
    },

    'Element without specified label appends with default label': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Gamma',
            successfulEvents: 3000,
            totalEvents: 3000
        });

        const registeredID = 'Gamma';

        verify.affirm(statisticalEngine._variants.hasOwnProperty('Gamma'), 'Element Gamma was not registered internally.');
        verify.compareExact(statisticalEngine._variants[registeredID].name, 'Variant Gamma', 'The default label should be "Variant Gamma".');
    },

    'Attempt to append element with existing identifier is rejected': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Delta',
            elementLabel: 'Element Delta',
            successfulEvents: 3000,
            totalEvents: 3000
        });

        verify.affirm(statisticalEngine._variants.hasOwnProperty('Delta'), 'Initial Element Delta registration failed.');

        verify.anticipateError(() => {
            statisticalEngine.addVariant({
                elementIdentifier: 'Delta',
                elementLabel: 'Another Delta',
                successfulEvents: 3000,
                totalEvents: 3000
            });
        }, Error, 'Adding an element with a duplicate identifier should fail.');
    },
});

executeScenarioGroup('Element Presence Verification', {
    'Confirm presence of a specific element': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();

        verify.compareExact(statisticalEngine.variantExists('Alpha'), false, 'Element Alpha should initially not exist.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Alpha',
            elementLabel: 'Element Alpha',
            successfulEvents: 1356,
            totalEvents: 3150
        });

        verify.compareExact(statisticalEngine.variantExists('Alpha'), true, 'Element Alpha should now exist after being added.');
    },
});

executeScenarioGroup('Element Retrieval Operations', {
    'Retrieves specific element if it is present': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Echo',
            elementLabel: 'Element Echo',
            successfulEvents: 1356,
            totalEvents: 3150
        });

        verify.anticipateError(() => {
            statisticalEngine.getVariant('Foxtrot');
        }, Error, 'Attempting to retrieve non-existent element Foxtrot should have thrown an error.');

        verify.anticipateNoErrors(() => {
            statisticalEngine.getVariant('Echo');
        }, 'Retrieving existing element Echo should not have thrown an error.');
    },
});

executeScenarioGroup('Overall Element Presence Check', {
    'Verify if any elements are registered': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        verify.compareExact(statisticalEngine.hasVariants(statisticalEngine._variants), false, 'Internal registry should initially be empty.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Golf',
            elementLabel: 'Element Golf',
            successfulEvents: 3000,
            totalEvents: 3000
        });

        verify.compareExact(statisticalEngine.hasVariants(statisticalEngine._variants), true, 'Internal registry should now contain elements.');
    },
});

executeScenarioGroup('Outcome Determination', {
    'No elements registered yields error': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        verify.anticipateError(() => {
            statisticalEngine.getResult();
        }, Error, 'Calling getResult with no registered elements should throw an error.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Hotel',
            elementLabel: 'Element Hotel',
            successfulEvents: 1356,
            totalEvents: 3150
        });
        statisticalEngine.addVariant({
            elementIdentifier: 'India',
            elementLabel: 'Element India',
            successfulEvents: 1356,
            totalEvents: 3150
        });

        verify.anticipateNoErrors(() => {
            statisticalEngine.getResult();
        }, 'Calling getResult with registered elements should not throw an error.');
    },

    'Fewer than 100 total events in an element': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Juliett',
            elementLabel: 'Element Juliett',
            successfulEvents: 20,
            totalEvents: 50
        });

        let outcomeReport = statisticalEngine.getResult();

        verify.compareExact(outcomeReport.hasWinner, false, 'There should not be a victor.');
        verify.compareExact(outcomeReport.hasEnoughData, false, 'There should not be sufficient data.');
        verify.compareExact(outcomeReport.winnerID, null, 'There should be no victor identifier.');
        verify.compareExact(outcomeReport.winnerName, null, 'There should be no victor label.');
        verify.compareExact(outcomeReport.confidencePercent, null, 'There should be no certainty percentage.');
        verify.compareExact(outcomeReport.confidenceInterval, null, 'There should be no certainty range.');
        verify.compareExact(outcomeReport.readable, 'There is not enough data to determine a conclusive result.', 'Descriptive output should indicate insufficient data.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Kilo',
            elementLabel: 'Element Kilo',
            successfulEvents: 800,
            totalEvents: 1000
        });

        outcomeReport = statisticalEngine.getResult();

        verify.compareExact(outcomeReport.hasWinner, false, 'There should not be a victor.');
        verify.compareExact(outcomeReport.hasEnoughData, false, 'There should not be sufficient data.');
        verify.compareExact(outcomeReport.winnerID, null, 'There should be no victor identifier.');
        verify.compareExact(outcomeReport.winnerName, null, 'There should be no victor label.');
        verify.compareExact(outcomeReport.confidencePercent, null, 'There should be no certainty percentage.');
        verify.compareExact(outcomeReport.confidenceInterval, null, 'There should be no certainty range.');
        verify.compareExact(outcomeReport.readable, 'There is not enough data to determine a conclusive result.', 'Descriptive output should indicate insufficient data.');
    },

    'More than 100 total events but still insufficient data': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Lima',
            elementLabel: 'Element Lima',
            successfulEvents: 20,
            totalEvents: 101
        });

        let outcomeReport = statisticalEngine.getResult();

        verify.compareExact(outcomeReport.hasWinner, false, 'There should not be a victor.');
        verify.compareExact(outcomeReport.hasEnoughData, false, 'There should not be sufficient data.');
        verify.compareExact(outcomeReport.winnerID, null, 'There should be no victor identifier.');
        verify.compareExact(outcomeReport.winnerName, null, 'There should be no victor label.');
        verify.compareExact(outcomeReport.confidencePercent, null, 'There should be no certainty percentage.');
        verify.compareExact(outcomeReport.confidenceInterval, null, 'There should be no certainty range.');
        verify.compareExact(outcomeReport.readable, 'There is not enough data to determine a conclusive result.', 'Descriptive output should indicate insufficient data.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Mike',
            elementLabel: 'Element Mike',
            successfulEvents: 25,
            totalEvents: 101
        });

        outcomeReport = statisticalEngine.getResult();

        verify.compareExact(outcomeReport.hasWinner, false, 'There should not be a victor.');
        verify.compareExact(outcomeReport.hasEnoughData, false, 'There should not be sufficient data.');
        verify.compareExact(outcomeReport.winnerID, null, 'There should be no victor identifier.');
        verify.compareExact(outcomeReport.winnerName, null, 'There should be no victor label.');
        verify.compareExact(outcomeReport.confidencePercent, null, 'There should be no certainty percentage.');
        verify.compareExact(outcomeReport.confidenceInterval, null, 'There should be no certainty range.');
        verify.compareExact(outcomeReport.readable, 'There is not enough data to determine a conclusive result.', 'Descriptive output should indicate insufficient data.');
    },

    'Sufficient data but no conclusive victor': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        statisticalEngine.addVariant({
            elementIdentifier: 'November',
            elementLabel: 'Element November',
            successfulEvents: 200,
            totalEvents: 3150
        });
        statisticalEngine.addVariant({
            elementIdentifier: 'Oscar',
            elementLabel: 'Element Oscar',
            successfulEvents: 201,
            totalEvents: 3150
        });

        const outcomeReport = statisticalEngine.getResult();

        verify.compareExact(outcomeReport.hasWinner, false, 'There should not be a victor.');
        verify.compareExact(outcomeReport.hasEnoughData, true, 'There should be sufficient data.');
        verify.compareExact(outcomeReport.winnerID, null, 'There should be no victor identifier.');
        verify.compareExact(outcomeReport.winnerName, null, 'There should be no victor label.');
        verify.compareExact(outcomeReport.confidencePercent, 95.00, 'Certainty percentage should be 95.00.');
        verify.compareExact(outcomeReport.confidenceInterval, null, 'No certainty range expected.');
        verify.compareExact(outcomeReport.readable, 'There is no winner, the results are too close.', 'Descriptive output should indicate close results.');
    },

    'Sufficient data and a definite victor': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Papa',
            elementLabel: 'Element Papa',
            successfulEvents: 800,
            totalEvents: 3150
        });
        statisticalEngine.addVariant({
            elementIdentifier: 'Quebec',
            elementLabel: 'Element Quebec',
            successfulEvents: 200,
            totalEvents: 3150
        });

        const outcomeReport = statisticalEngine.getResult();

        let anticipatedDescription = 'With 95.00% confidence, the true population parameter of the';
        anticipatedDescription += ' "Element Papa" variant will fall between 23.88% and 26.92%.';

        verify.compareExact(outcomeReport.hasWinner, true, 'There should be a victor.');
        verify.compareExact(outcomeReport.hasEnoughData, true, 'There should be sufficient data.');
        verify.compareExact(outcomeReport.winnerID, 'Papa', 'Papa should be the victor identifier.');
        verify.compareExact(outcomeReport.winnerName, 'Element Papa', 'Element Papa should be the victor label.');
        verify.compareExact(outcomeReport.confidencePercent, 95.00, 'Certainty percentage should be 95.00.');
        verify.compareStructural(outcomeReport.confidenceInterval, {
            min: 23.88,
            max: 26.92
        }, 'Certainty range should not overlap.');
        verify.compareExact(outcomeReport.readable, anticipatedDescription, 'The descriptive output should match the victor message.');
    },
});

executeScenarioGroup('Certainty Range Analysis', {
    'Examine sufficient data with no conclusive victor': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Romeo',
            elementLabel: 'Element Romeo',
            successfulEvents: 1500,
            totalEvents: 3000
        });

        statisticalEngine.addVariant({
            elementIdentifier: 'Sierra',
            elementLabel: 'Element Sierra',
            successfulEvents: 1501,
            totalEvents: 3000
        });

        const inputCertaintyRanges = {};

        inputCertaintyRanges['Romeo'] = {
            min: 0.4821077297881646,
            max: 0.5178922702118354
        };
        inputCertaintyRanges['Sierra'] = {
            min: 0.48244106709755835,
            max: 0.5182255995691082
        };

        const analysisResult = statisticalEngine.analyzeConfidenceIntervals(inputCertaintyRanges);

        verify.compareExact(analysisResult.hasWinner, false, 'There should not be a victor.');
        verify.compareExact(analysisResult.hasEnoughData, true, 'There should be sufficient data.');
        verify.compareExact(analysisResult.winnerID, null, 'There should be no victor identifier.');
        verify.compareExact(analysisResult.winnerName, null, 'There should be no victor label.');
        verify.compareExact(analysisResult.confidencePercent, 95.00, 'Certainty percentage should be 95.00.');
        verify.compareExact(analysisResult.confidenceInterval, null, 'No certainty range expected.');
        verify.compareExact(analysisResult.readable, 'There is no winner, the results are too close.', 'Descriptive output should indicate close results.');
    },

    'Examine sufficient data with a clear victor': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        statisticalEngine.addVariant({
            elementIdentifier: 'Tango',
            elementLabel: 'Element Tango',
            successfulEvents: 1500,
            totalEvents: 3000
        });

        statisticalEngine.addVariant({
            elementIdentifier: 'Uniform',
            elementLabel: 'Element Uniform',
            successfulEvents: 2500,
            totalEvents: 3000
        });

        const inputCertaintyRanges = {};

        inputCertaintyRanges['Tango'] = {
            min: 0.4821077297881646,
            max: 0.5178922702118354
        };
        inputCertaintyRanges['Uniform'] = {
            min: 0.8199972225115139,
            max: 0.8466694441551529
        };

        let descriptionForVictor = 'With 95.00% confidence, the true population parameter of the';
        descriptionForVictor += ' "Element Uniform" variant will fall between 82% and 84.67%.';

        const analysisResult = statisticalEngine.analyzeConfidenceIntervals(inputCertaintyRanges);

        verify.compareExact(analysisResult.hasWinner, true, 'There should be a victor.');
        verify.compareExact(analysisResult.hasEnoughData, true, 'There should be sufficient data.');
        verify.compareExact(analysisResult.winnerID, 'Uniform', 'Uniform should be the victor identifier.');
        verify.compareExact(analysisResult.winnerName, 'Element Uniform', 'Element Uniform should be the victor label.');
        verify.compareExact(analysisResult.confidencePercent, 95.00, 'Certainty percentage should be 95.00.');
        verify.compareStructural(analysisResult.confidenceInterval, {
            min: 82,
            max: 84.67
        }, 'Certainty range should not overlap.');
        verify.compareExact(analysisResult.readable, descriptionForVictor, 'The descriptive output should match the victor message.');
    },
});

executeScenarioGroup('Collection Ordering Functionality', {
    'Order a collection from greatest to least': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        const measurementCollection = [];

        measurementCollection.push({
            identifier: 'Alpha',
            valueMetric: 0.654
        });
        measurementCollection.push({
            identifier: 'Beta',
            valueMetric: 0.987
        });
        measurementCollection.push({
            identifier: 'Gamma',
            valueMetric: 0.765
        });
        measurementCollection.push({
            identifier: 'Delta',
            valueMetric: 0.876
        });

        const orderedMeasurements = statisticalEngine.sortList(measurementCollection);

        verify.compareExact(orderedMeasurements[0].identifier, 'Beta', '0.987 should be the greatest value.');
        verify.compareExact(orderedMeasurements[1].identifier, 'Delta', '0.876 should be the second greatest value.');
        verify.compareExact(orderedMeasurements[2].identifier, 'Gamma', '0.765 should be the third greatest value.');
        verify.compareExact(orderedMeasurements[3].identifier, 'Alpha', '0.654 should be the least value.');
    },
});

executeScenarioGroup('Minimum Observation Count Determination', {
    'Rate is zero': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        statisticalEngine.addVariant({
            elementIdentifier: 'Victor',
            elementLabel: 'Element Victor',
            successfulEvents: 0,
            totalEvents: 50
        });

        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        verify.compareExact(statisticalEngine.getRequiredSampleSize('Victor'), 100, "If success rate is 0, the minimum observation count should be 100.");
    },

    'Rate is one': (verify) => {
        const statisticalEngine = new StatisticalAnalysisEngine();
        statisticalEngine.addVariant({
            elementIdentifier: 'Whiskey',
            elementLabel: 'Element Whiskey',
            successfulEvents: 101,
            totalEvents: 101
        });

        verify.affirm(!!statisticalEngine, 'Statistical engine instance should be valid.');

        verify.compareExact(statisticalEngine.getRequiredSampleSize('Whiskey'), 100, "If success rate is 1, the minimum observation count should be 100.");
    },
});